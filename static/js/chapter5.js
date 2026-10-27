/* ============================================================
   第5章 统计量及其分布 — 交互脚本
   ------------------------------------------------------------
   5.1 抽样模拟器：从（偏斜的）总体反复抽样，观察 x̄ 的分布
   5.2 三大抽样分布：χ² / t / F 的密度曲线与自由度关系
   纯 Canvas 2D 绘制，不依赖第三方可视化库
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 数学工具 ---------------- */
  var LANCZOS = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7
  ];

  // log Γ(z)（Lanczos 近似，z > 0 精度足够绘图）
  function logGamma(z) {
    if (z < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
    }
    z -= 1;
    var x = 0.99999999999980993;
    for (var i = 0; i < LANCZOS.length; i++) {
      x += LANCZOS[i] / (z + i + 1);
    }
    var t = z + 7.5;
    return (
      0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
    );
  }

  function normalPdf(x, mu, sd) {
    var z = (x - mu) / sd;
    return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
  }

  function chiPdf(x, k) {
    if (x <= 0) return 0;
    var h = k / 2;
    return Math.exp((h - 1) * Math.log(x) - x / 2 - h * Math.LN2 - logGamma(h));
  }

  function tPdf(x, v) {
    var c = Math.exp(
      logGamma((v + 1) / 2) - logGamma(v / 2) - 0.5 * Math.log(v * Math.PI)
    );
    return c * Math.pow(1 + (x * x) / v, -(v + 1) / 2);
  }

  function fPdf(x, d1, d2) {
    if (x <= 0) return 0;
    var lb = logGamma(d1 / 2) + logGamma(d2 / 2) - logGamma((d1 + d2) / 2);
    var t1 = d1 * Math.log(d1 * x);
    var t2 = d2 * Math.log(d2);
    var t3 = (d1 + d2) * Math.log(d1 * x + d2);
    return Math.exp(0.5 * (t1 + t2 - t3) - lb) / x;
  }

  // Box-Muller 标准正态
  function randNormal() {
    var u = 0;
    var v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* ---------------- 画布工具 ---------------- */
  function fitCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (!w || !h) {
      w = parseFloat(canvas.getAttribute("width")) || 600;
      h = parseFloat(canvas.getAttribute("height")) || 400;
    }
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function fmtTick(v) {
    if (Math.abs(v) < 1e-9) return "0";
    if (Math.abs(v) >= 1000) return Math.round(v).toString();
    if (Math.abs(v - Math.round(v)) < 1e-6) return Math.round(v).toString();
    if (Math.abs(v) >= 10) return v.toFixed(0);
    if (Math.abs(v) >= 1) return v.toFixed(1);
    return v.toFixed(2);
  }

  // 把跨度对齐到 1/2/5×10^k 的「整刻度」
  function niceStep(range, targetTicks) {
    var raw = range / Math.max(1, targetTicks);
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step;
    if (norm <= 1) step = 1;
    else if (norm <= 2) step = 2;
    else if (norm <= 5) step = 5;
    else step = 10;
    return step * mag;
  }

  /* ---------------- 5.1 抽样模拟器 ---------------- */
  var BINS = 41;
  var HALF_SPAN_SE = 5; // 横轴范围 = μ ± 5·SE

  var samp = {
    pop: "exponential",
    n: 5,
    mu: 1000,
    counts: [],
    means: [],
    trials: 0,
    seCache: 0
  };

  function popSigma() {
    // 指数分布（均值 1000）的 σ 等于均值；正态总体固定 σ=250
    return samp.pop === "normal" ? 250 : 1000;
  }

  function currentSE() {
    return popSigma() / Math.sqrt(samp.n);
  }

  function resetSamp() {
    samp.counts = [];
    for (var i = 0; i < BINS; i++) samp.counts.push(0);
    samp.means = [];
    samp.trials = 0;
    samp.seCache = currentSE();
  }

  function drawOneFromPopulation() {
    if (samp.pop === "normal") {
      return samp.mu + 250 * randNormal();
    }
    // 指数分布：均值 μ=1000 ⇒ 速率 λ=1/1000
    var u = Math.random();
    while (u === 0) u = Math.random();
    return -samp.mu * Math.log(u);
  }

  function oneTrial() {
    var sum = 0;
    for (var i = 0; i < samp.n; i++) sum += drawOneFromPopulation();
    var mean = sum / samp.n;
    samp.trials += 1;
    samp.means.push(mean);

    var se = samp.seCache || currentSE();
    var lo = samp.mu - HALF_SPAN_SE * se;
    var binW = (2 * HALF_SPAN_SE * se) / BINS;
    var idx = Math.floor((mean - lo) / binW);
    if (idx < 0) idx = 0;
    if (idx >= BINS) idx = BINS - 1;
    samp.counts[idx] += 1;
    return mean;
  }

  function drawSampling() {
    var canvas = document.getElementById("ch5-sampling");
    if (!canvas) return;
    var c = fitCanvas(canvas);
    var ctx = c.ctx;
    var w = c.w;
    var h = c.h;
    var pad = { l: 46, r: 14, t: 18, b: 38 };
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;

    var se = samp.seCache || currentSE();
    var lo = samp.mu - HALF_SPAN_SE * se;
    var hi = samp.mu + HALF_SPAN_SE * se;
    var binW = (hi - lo) / BINS;

    // 纵轴上限：柱高 与 σ/√n 理论曲线峰值（换算成计数）取大者
    var maxCount = 1;
    for (var i = 0; i < BINS; i++) {
      if (samp.counts[i] > maxCount) maxCount = samp.counts[i];
    }
    var curvePeakCount =
      samp.trials > 0
        ? normalPdf(samp.mu, samp.mu, se) * samp.trials * binW
        : 1;
    var yMax = Math.max(maxCount, curvePeakCount) * 1.18;

    function sx(v) {
      return pad.l + ((v - lo) / (hi - lo)) * plotW;
    }
    function sy(v) {
      return pad.t + plotH - (v / yMax) * plotH;
    }

    // 网格 + 坐标轴
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    for (var g = 1; g <= 4; g++) {
      var gy = pad.t + (plotH * g) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(pad.l + plotW, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t + plotH + 0.5);
    ctx.lineTo(pad.l + plotW, pad.t + plotH + 0.5);
    ctx.stroke();

    // 直方图
    for (var b = 0; b < BINS; b++) {
      if (samp.counts[b] <= 0) continue;
      var x0 = sx(lo + b * binW);
      var x1 = sx(lo + (b + 1) * binW);
      var y0 = sy(samp.counts[b]);
      var barW = Math.max(1, x1 - x0 - 1);
      var grad = ctx.createLinearGradient(0, y0, 0, pad.t + plotH);
      grad.addColorStop(0, "rgba(34,211,238,0.85)");
      grad.addColorStop(1, "rgba(34,211,238,0.25)");
      ctx.fillStyle = grad;
      ctx.fillRect(x0, y0, barW, pad.t + plotH - y0);
    }

    // 理论曲线 N(μ, SE²) 换算为期望计数
    if (samp.trials > 0) {
      ctx.beginPath();
      var started = false;
      for (var px = 0; px <= plotW; px += 2) {
        var xv = lo + (px / plotW) * (hi - lo);
        var expected = normalPdf(xv, samp.mu, se) * samp.trials * binW;
        var py = sy(expected);
        if (!started) {
          ctx.moveTo(pad.l + px, py);
          started = true;
        } else {
          ctx.lineTo(pad.l + px, py);
        }
      }
      ctx.strokeStyle = "#f472b6";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // μ 参考线
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx(samp.mu), pad.t);
    ctx.lineTo(sx(samp.mu), pad.t + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // 横轴刻度
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    for (var k = 0; k <= 4; k++) {
      var xv2 = lo + ((hi - lo) * k) / 4;
      ctx.fillText(fmtTick(xv2), sx(xv2), pad.t + plotH + 16);
    }
    ctx.textAlign = "left";
    ctx.fillText("x̄ 的取值（小时）", pad.l, h - 6);
    ctx.textAlign = "right";
    ctx.fillText("频数", pad.l - 8, pad.t + 4);

    // 图例
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(34,211,238,0.9)";
    ctx.fillRect(pad.l + 6, pad.t + 4, 10, 10);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("实测频数", pad.l + 22, pad.t + 13);
    ctx.fillStyle = "#f472b6";
    ctx.fillRect(pad.l + 96, pad.t + 4, 14, 3);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("理论 N(μ, σ²/n)", pad.l + 116, pad.t + 13);

    if (samp.trials === 0) {
      ctx.fillStyle = "rgba(226,232,240,0.55)";
      ctx.textAlign = "center";
      ctx.font = "13px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        "点击右侧「抽 1 次」或「抽 200 次」开始模拟",
        pad.l + plotW / 2,
        pad.t + plotH / 2
      );
    }
    updateSampStats();
  }

  function updateSampStats() {
    var m = samp.trials;
    var meanEl = document.getElementById("v-mean");
    var sdEl = document.getElementById("v-sd-obs");
    var seEl = document.getElementById("v-se");
    var mEl = document.getElementById("v-trials");
    if (mEl) mEl.textContent = m;
    if (seEl) seEl.textContent = currentSE().toFixed(1);

    if (m === 0) {
      if (meanEl) meanEl.textContent = "—";
      if (sdEl) sdEl.textContent = "—";
      return;
    }
    var sum = 0;
    for (var i = 0; i < m; i++) sum += samp.means[i];
    var avg = sum / m;
    if (meanEl) meanEl.textContent = avg.toFixed(1);
    if (m < 2) {
      if (sdEl) sdEl.textContent = "—";
      return;
    }
    var ss = 0;
    for (var j = 0; j < m; j++) {
      var d = samp.means[j] - avg;
      ss += d * d;
    }
    if (sdEl) sdEl.textContent = Math.sqrt(ss / (m - 1)).toFixed(1);
  }

  /* ---------------- 5.2 分布曲线通用绘制 ---------------- */
  function drawDensity(canvas, opts) {
    if (!canvas) return;
    var c = fitCanvas(canvas);
    var ctx = c.ctx;
    var w = c.w;
    var h = c.h;
    var pad = { l: 10, r: 12, t: 14, b: 26 };
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;
    var xMax = opts.xMax;
    var curves = opts.curves;

    // 自适应纵轴
    var yMax = 0;
    var ci;
    for (ci = 0; ci < curves.length; ci++) {
      for (var s = 0; s <= plotW; s += 2) {
        var xv = (s / plotW) * xMax;
        var yv = curves[ci].fn(xv);
        if (isFinite(yv) && yv > yMax) yMax = yv;
      }
    }
    if (yMax <= 0) yMax = 1;
    yMax *= 1.15;

    function sx(v) {
      return pad.l + (v / xMax) * plotW;
    }
    function sy(v) {
      return pad.t + plotH - (v / yMax) * plotH;
    }

    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    for (var g = 1; g <= 3; g++) {
      var gy = pad.t + (plotH * g) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(pad.l + plotW, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t + plotH + 0.5);
    ctx.lineTo(pad.l + plotW, pad.t + plotH + 0.5);
    ctx.stroke();

    for (ci = 0; ci < curves.length; ci++) {
      var cur = curves[ci];
      ctx.beginPath();
      ctx.moveTo(sx(0), sy(0));
      for (var px = 0; px <= plotW; px += 1.5) {
        var x = (px / plotW) * xMax;
        ctx.lineTo(sx(x), sy(cur.fn(x)));
      }
      ctx.lineTo(sx(xMax), sy(0));
      if (cur.fill) {
        ctx.fillStyle = cur.fill;
        ctx.fill();
      }
      ctx.beginPath();
      for (var px2 = 0; px2 <= plotW; px2 += 1.5) {
        var x2 = (px2 / plotW) * xMax;
        var yy = sy(cur.fn(x2));
        if (px2 === 0) ctx.moveTo(sx(x2), yy);
        else ctx.lineTo(sx(x2), yy);
      }
      ctx.strokeStyle = cur.color;
      ctx.lineWidth = cur.width || 2;
      if (cur.dash) ctx.setLineDash(cur.dash);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 横轴刻度
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    var step = niceStep(xMax, 4);
    for (var k = 0; k * step <= xMax + 1e-9; k++) {
      var tv = k * step;
      ctx.fillText(fmtTick(tv), sx(tv), pad.t + plotH + 14);
    }
    ctx.textAlign = "right";
    ctx.fillText(fmtTick(yMax), pad.l + plotW, pad.t + 8);
  }

  /* ---------------- 各分布的重绘入口 ---------------- */
  function drawChi() {
    var df = parseInt(document.getElementById("sl-chi").value, 10);
    var e = document.getElementById("v-chi-df");
    if (e) e.textContent = df;
    var e1 = document.getElementById("v-chi-e");
    if (e1) e1.textContent = df.toFixed(1);
    var e2 = document.getElementById("v-chi-v");
    if (e2) e2.textContent = (2 * df).toFixed(1);
    var xMax = Math.max(12, df * 2.6);
    drawDensity(document.getElementById("ch5-chi"), {
      xMax: xMax,
      curves: [
        {
          fn: function (x) {
            return chiPdf(x, df);
          },
          color: "#a78bfa",
          fill: "rgba(167,139,250,0.16)"
        }
      ]
    });
  }

  function drawT() {
    var df = parseInt(document.getElementById("sl-t").value, 10);
    var e = document.getElementById("v-t-df");
    if (e) e.textContent = df;
    var xMax = 6;
    drawDensity(document.getElementById("ch5-t"), {
      xMax: xMax,
      curves: [
        {
          fn: function (x) {
            return tPdf(x, df);
          },
          color: "#22d3ee",
          fill: "rgba(34,211,238,0.14)"
        },
        {
          fn: function (x) {
            return normalPdf(x, 0, 1);
          },
          color: "rgba(148,163,184,0.75)",
          width: 1.4,
          dash: [4, 4]
        }
      ]
    });
  }

  function drawF() {
    var d1 = parseInt(document.getElementById("sl-f1").value, 10);
    var d2 = parseInt(document.getElementById("sl-f2").value, 10);
    var e = document.getElementById("v-f-df");
    if (e) e.textContent = d1 + ", " + d2;
    var xMax = Math.max(3.5, Math.min(12, 3 * (d2 / Math.max(1, d2 - 2))));
    if (d2 <= 4) xMax = 8;
    drawDensity(document.getElementById("ch5-f"), {
      xMax: xMax,
      curves: [
        {
          fn: function (x) {
            return fPdf(x, d1, d2);
          },
          color: "#22c55e",
          fill: "rgba(34,197,94,0.14)"
        }
      ]
    });
  }

  /* ---------------- 事件绑定 ---------------- */
  function bindSampling() {
    var slN = document.getElementById("sl-n");
    var vN = document.getElementById("v-n");
    if (slN) {
      slN.addEventListener("input", function () {
        samp.n = parseInt(slN.value, 10);
        if (vN) vN.textContent = samp.n;
        resetSamp();
        drawSampling();
      });
    }

    var switchWrap = document.getElementById("pop-switch");
    if (switchWrap) {
      switchWrap.addEventListener("click", function (ev) {
        var btn = ev.target.closest ? ev.target.closest(".seg-btn") : null;
        if (!btn) return;
        var pop = btn.getAttribute("data-pop");
        if (!pop || pop === samp.pop) return;
        samp.pop = pop;
        var all = switchWrap.querySelectorAll(".seg-btn");
        for (var i = 0; i < all.length; i++) {
          all[i].classList.toggle("seg-btn-active", all[i] === btn);
        }
        resetSamp();
        drawSampling();
      });
    }

    var b1 = document.getElementById("btn-sample1");
    if (b1) {
      b1.addEventListener("click", function () {
        oneTrial();
        drawSampling();
      });
    }

    var b200 = document.getElementById("btn-sample200");
    if (b200) {
      b200.addEventListener("click", function () {
        for (var i = 0; i < 200; i++) oneTrial();
        drawSampling();
      });
    }

    var bReset = document.getElementById("btn-reset");
    if (bReset) {
      bReset.addEventListener("click", function () {
        resetSamp();
        drawSampling();
      });
    }
  }

  function bindDistributions() {
    var chi = document.getElementById("sl-chi");
    if (chi) chi.addEventListener("input", drawChi);
    var t = document.getElementById("sl-t");
    if (t) t.addEventListener("input", drawT);
    var f1 = document.getElementById("sl-f1");
    if (f1) f1.addEventListener("input", drawF);
    var f2 = document.getElementById("sl-f2");
    if (f2) f2.addEventListener("input", drawF);
  }

  function redrawAll() {
    drawSampling();
    drawChi();
    drawT();
    drawF();
  }

  function boot() {
    resetSamp();
    bindSampling();
    bindDistributions();
    redrawAll();

    var timer = null;
    window.addEventListener("resize", function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(redrawAll, 160);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
