// chapter1 页面交互脚本（骰子频率模拟 + 条件概率计算器）
// 统一抽取到独立文件，便于在其他页面复用或维护

(function () {
  /**
   * 柏林噪声背景动画：在低分辨率网格上生成噪声并缩放绘制到全屏
   * - 深色系 HSL 映射，随时间缓慢变换色相与明暗
   * - 自适应性能与可见性暂停，避免卡顿
   */
  function setupPerlinBackground() {
    const canvas = document.getElementById("bg-noise");
    if (!canvas || !canvas.getContext) {
      document.body.style.background =
        "linear-gradient(180deg, #0b1220, #121725)";
      return;
    }
    const ctx = canvas.getContext("2d");

    // 目标分辨率（低采样）
    const baseW = 320;
    const baseH = 180;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    let vw = 0,
      vh = 0,
      imgData = null,
      buf8 = null;

    // 预计算 HSL→RGB LUT（根据亮度 L 映射）
    let hue = 235; // 初始色相（深蓝紫）
    const sat = 50; // 饱和度百分比
    const L_MIN = 6,
      L_MAX = 18; // 明暗范围（深色系）
    let lut = buildLUT(hue, sat);

    // 柏林噪声实现
    const perm = buildPermutationTable();
    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function lerp(a, b, t) {
      return a + t * (b - a);
    }
    function grad(hash, x, y) {
      const h = hash & 3;
      const u = h & 1 ? x : y;
      const v = h & 2 ? y : x;
      return (h & 1 ? -u : u) + (h & 2 ? -v : v);
    }
    function noise2(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = fade(xf);
      const v = fade(yf);
      const aa = perm[perm[X] + Y];
      const ab = perm[perm[X] + Y + 1];
      const ba = perm[perm[X + 1] + Y];
      const bb = perm[perm[X + 1] + Y + 1];
      const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
      const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
      return lerp(x1, x2, v); // -1..1
    }

    // 动画控制
    let t0 = performance.now();
    let running = true;
    let frameSkip = 0; // 动态降帧计数器

    function resize() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      canvas.style.width = vw + "px";
      canvas.style.height = vh + "px";
      imgData = ctx.createImageData(baseW, baseH);
      buf8 = imgData.data;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    function buildPermutationTable() {
      const p = new Uint8Array(512);
      const seed = 1337;
      const arr = new Uint8Array(256);
      for (let i = 0; i < 256; i++) arr[i] = i;
      // Fisher–Yates 洗牌（固定种子）
      let s = seed;
      for (let i = 255; i > 0; i--) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        const j = s % (i + 1);
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
      for (let i = 0; i < 512; i++) p[i] = arr[i & 255];
      return p;
    }

    function hslToRgb(h, s, l) {
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const hp = h / 60;
      const x = c * (1 - Math.abs((hp % 2) - 1));
      let r = 0,
        g = 0,
        b = 0;
      if (hp >= 0 && hp < 1) {
        r = c;
        g = x;
      } else if (hp < 2) {
        r = x;
        g = c;
      } else if (hp < 3) {
        g = c;
        b = x;
      } else if (hp < 4) {
        g = x;
        b = c;
      } else if (hp < 5) {
        r = x;
        b = c;
      } else {
        r = c;
        b = x;
      }
      const m = l - c / 2;
      return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255),
      ];
    }

    function buildLUT(h, s) {
      const table = new Array(256);
      for (let i = 0; i < 256; i++) {
        const l = L_MIN + ((L_MAX - L_MIN) * i) / 255;
        table[i] = hslToRgb(h, s, l);
      }
      return table;
    }

    function renderFrame(now) {
      if (!running) return;
      const dt = now - t0;
      const slow = dt * 0.0002; // 色相缓变速度
      const z = dt * 0.0004; // 时间相位，控制明暗变化

      // 动态降帧：每渲染一次跳过下一帧（在较低设备上）
      if (frameSkip > 0) {
        frameSkip--;
        requestAnimationFrame(renderFrame);
        return;
      }

      // 每隔一段时间更新 LUT，实现 HSL 色相自然过渡
      hue = 230 + 40 * (0.5 + 0.5 * Math.sin(slow));
      lut = buildLUT(hue, sat);

      const scale = 0.012; // 空间频率（越小越平滑）
      let ptr = 0;
      for (let y = 0; y < baseH; y++) {
        for (let x = 0; x < baseW; x++) {
          // 将时间作为第三维偏移，形成柔和的动态
          const v = noise2(x * scale, y * scale + z);
          // 映射到 0..255
          const idx = Math.max(
            0,
            Math.min(255, Math.round((v + 1) * 0.5 * 255))
          );
          const c = lut[idx];
          buf8[ptr++] = c[0];
          buf8[ptr++] = c[1];
          buf8[ptr++] = c[2];
          buf8[ptr++] = 255;
        }
      }
      imgData.data.set(buf8);
      // 将低分辨率图像缩放绘制到全屏
      const off = document.createElement("canvas");
      off.width = baseW;
      off.height = baseH;
      const ofx = off.getContext("2d");
      ofx.putImageData(imgData, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, 0, 0, baseW, baseH, 0, 0, canvas.width, canvas.height);

      // 简单性能监测：若每帧耗时过长则临时降帧
      const end = performance.now();
      const cost = end - now;
      if (cost > 20) frameSkip = 1;

      requestAnimationFrame(renderFrame);
    }

    function start() {
      resize();
      t0 = performance.now();
      running = true;
      requestAnimationFrame(renderFrame);
    }
    function stop() {
      running = false;
    }
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    start();
  }

  /**
   * 标题栏与跳转按钮：
   * - 从 NAV_CONFIG.sectionLinks 渲染按钮
   * - 为同页锚点提供平滑滚动
   */
  function setupTitleBar() {
    const container = document.getElementById("hero-links");
    const links = (window.NAV_CONFIG && window.NAV_CONFIG.sectionLinks) || [];
    if (!container || !links || links.length === 0) return;
    container.innerHTML = "";
    links.forEach(function (item) {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      a.className =
        "px-4 py-2 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 transition-colors";
      a.addEventListener("click", function (e) {
        if (item.href && item.href.startsWith("#")) {
          e.preventDefault();
          const target = document.querySelector(item.href);
          if (target)
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      container.appendChild(a);
    });
  }

  function setupDice() {
    const rollBtn = document.getElementById("dice-roll");
    const resetBtn = document.getElementById("dice-reset");
    const totalEl = document.getElementById("dice-total");
    const lastEl = document.getElementById("dice-last");
    const countEls = [1, 2, 3, 4, 5, 6].map((n) =>
      document.getElementById("dice-count-" + n)
    );
    if (
      !rollBtn ||
      !resetBtn ||
      !totalEl ||
      !lastEl ||
      countEls.some((el) => !el)
    )
      return;
    let counts = [0, 0, 0, 0, 0, 0];
    let total = 0;
    function update() {
      totalEl.textContent = String(total);
      countEls.forEach((el, i) => {
        el.textContent = String(counts[i]);
      });
    }
    function roll() {
      const v = Math.floor(Math.random() * 6) + 1;
      lastEl.textContent = String(v);
      counts[v - 1] += 1;
      total += 1;
      update();
    }
    function reset() {
      counts = [0, 0, 0, 0, 0, 0];
      total = 0;
      lastEl.textContent = "-";
      update();
    }
    rollBtn.addEventListener("click", roll);
    resetBtn.addEventListener("click", reset);
    update();
  }

  function setupConditionalProbability() {
    const pAB = document.getElementById("pAB");
    const pB = document.getElementById("pB");
    const pA = document.getElementById("pA");
    const btn = document.getElementById("cond-calc");
    const out = document.getElementById("cond-result");
    const ind = document.getElementById("ind-result");
    if (!btn || !out || !ind || !pAB || !pB) return;
    function calc() {
      const AB = parseFloat(pAB.value || "");
      const B = parseFloat(pB.value || "");
      const A = parseFloat((pA && pA.value) || "");
      if (!isFinite(AB) || !isFinite(B) || B <= 0) {
        out.textContent = "请输入有效的 P(A∩B) 与 P(B)>0";
        ind.textContent = "";
        return;
      }
      const cond = AB / B;
      out.textContent = "P(A|B) ≈ " + cond.toFixed(4);
      if (isFinite(A)) {
        const indp = Math.abs(cond - A) < 1e-6;
        ind.textContent =
          "独立性判断：" + (indp ? "A 与 B 近似独立" : "不独立");
      }
    }
    btn.addEventListener("click", calc);
  }

  function setupVennSandbox() {
    const canvas = document.getElementById("venn-canvas");
    const paInput = document.getElementById("venn-pa");
    const pbInput = document.getElementById("venn-pb");
    const ovInput = document.getElementById("venn-overlap");
    const indChk = document.getElementById("venn-independent");
    const unionEl = document.getElementById("v-union");
    const interEl = document.getElementById("v-intersection");
    const caEl = document.getElementById("v-complement-a");
    const cbEl = document.getElementById("v-complement-b");
    const themeBtns = document.querySelectorAll("[data-theme]");
    if (!canvas || !paInput || !pbInput || !ovInput || !indChk) return;
    const ctx = canvas.getContext("2d");
    let vennDPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    function getViewSize() {
      const rect = canvas.getBoundingClientRect();
      return { W: rect.width, H: rect.height };
    }
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      vennDPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = Math.floor(rect.width * vennDPR);
      canvas.height = Math.floor(rect.height * vennDPR);
      ctx.setTransform(vennDPR, 0, 0, vennDPR, 0, 0);
    }
    let labelA = "事件 A";
    let labelB = "事件 B";
    resizeCanvas();
    let ax = getViewSize().W * 0.4;
    let ay = getViewSize().H * 0.5;
    let bx = getViewSize().W * 0.6;
    let by = getViewSize().H * 0.5;
    let rA = 60;
    let rB = 70;
    let hasDragged = false;
    const margin = 16;
    function circleIntersectionArea(r1, r2, d) {
      if (d >= r1 + r2) return 0;
      if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
      const a1 = Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
      const a2 = Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
      const s =
        r1 * r1 * a1 +
        r2 * r2 * a2 -
        0.5 * Math.sin(a1 * 2) * r1 * r1 -
        0.5 * Math.sin(a2 * 2) * r2 * r2;
      return s;
    }
    function solveDistance(r1, r2, target) {
      const maxI = Math.PI * Math.min(r1, r2) ** 2;
      const t = Math.max(0, Math.min(maxI, target));
      let lo = Math.abs(r1 - r2);
      let hi = r1 + r2;
      for (let i = 0; i < 25; i++) {
        const mid = (lo + hi) / 2;
        const a = circleIntersectionArea(r1, r2, mid);
        if (a > t) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    function recalcRadii() {
      const pa = Math.max(0, Math.min(1, parseInt(paInput.value, 10) / 100));
      const pb = Math.max(0, Math.min(1, parseInt(pbInput.value, 10) / 100));
      const view = getViewSize();
      const S = view.W * view.H;
      rA = Math.sqrt((pa * S) / Math.PI) * 0.7;
      rB = Math.sqrt((pb * S) / Math.PI) * 0.7;
    }
    function layoutFromControls() {
      const pa = Math.max(0, Math.min(1, parseInt(paInput.value, 10) / 100));
      const pb = Math.max(0, Math.min(1, parseInt(pbInput.value, 10) / 100));
      const ov = Math.max(0, Math.min(1, parseInt(ovInput.value, 10) / 100));
      recalcRadii();
      if (!hasDragged) {
        const view = getViewSize();
        const S = view.W * view.H;
        let pInt = indChk.checked ? pa * pb : Math.min(pa, pb) * ov;
        pInt = Math.max(0, Math.min(Math.min(pa, pb), pInt));
        const targetArea = pInt * S;
        const d = solveDistance(rA, rB, targetArea);
        const cx = view.W / 2;
        const cy = view.H / 2;
        ax = cx - d / 2;
        ay = cy;
        bx = cx + d / 2;
        by = cy;
        ax = Math.max(margin + rA, Math.min(view.W - margin - rA, ax));
        ay = Math.max(margin + rA, Math.min(view.H - margin - rA, ay));
        bx = Math.max(margin + rB, Math.min(view.W - margin - rB, bx));
        by = Math.max(margin + rB, Math.min(view.H - margin - rB, by));
      }
    }
    function draw() {
      const pa = Math.max(0, Math.min(1, parseInt(paInput.value, 10) / 100));
      const pb = Math.max(0, Math.min(1, parseInt(pbInput.value, 10) / 100));
      recalcRadii();
      const view = getViewSize();
      const W = view.W;
      const H = view.H;
      const S = W * H;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, 0, W, H);
      function rr(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
      }
      rr(margin, margin, W - margin * 2, H - margin * 2, 12);
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "14px Roboto, system-ui";
      ctx.textAlign = "left";
      ctx.fillText("全集 U", margin + 8, margin + 18);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,243,255,0.35)";
      ctx.beginPath();
      ctx.arc(ax, ay, rA, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(191,0,255,0.35)";
      ctx.beginPath();
      ctx.arc(bx, by, rB, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "16px Roboto, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(labelA, ax, ay - rA - 10);
      ctx.fillText(labelB, bx, by - rB - 10);
      const dNow = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
      const areaInt = circleIntersectionArea(rA, rB, dNow);
      const pInt = Math.max(0, Math.min(1, areaInt / S));
      if (dNow < rA + rB) {
        let ix = (ax + bx) / 2;
        let iy = (ay + by) / 2;
        if (dNow > 1e-6) {
          const a = (rA * rA - rB * rB + dNow * dNow) / (2 * dNow);
          ix = ax + (a * (bx - ax)) / dNow;
          iy = ay + (a * (by - ay)) / dNow;
        }
        ctx.fillStyle = "#e5e7eb";
        ctx.font = "14px Roboto, system-ui";
        ctx.textAlign = "center";
        ctx.fillText(labelA + " ∩ " + labelB, ix, iy);
      }
      const pUnion = Math.max(0, Math.min(1, pa + pb - pInt));
      const pCompA = Math.max(0, Math.min(1, 1 - pa));
      const pCompB = Math.max(0, Math.min(1, 1 - pb));
      unionEl.textContent = pUnion.toFixed(2);
      interEl.textContent = pInt.toFixed(2);
      caEl.textContent = pCompA.toFixed(2);
      cbEl.textContent = pCompB.toFixed(2);
    }
    paInput.addEventListener("input", function () {
      layoutFromControls();
      draw();
    });
    pbInput.addEventListener("input", function () {
      layoutFromControls();
      draw();
    });
    ovInput.addEventListener("input", function () {
      hasDragged = false;
      layoutFromControls();
      draw();
    });
    indChk.addEventListener("change", function () {
      const pa = Math.max(0, Math.min(1, parseInt(paInput.value, 10) / 100));
      const pb = Math.max(0, Math.min(1, parseInt(pbInput.value, 10) / 100));
      recalcRadii();
      if (indChk.checked) {
        const view = getViewSize();
        const S = view.W * view.H;
        const targetArea = pa * pb * S;
        const d = solveDistance(rA, rB, targetArea);
        const angle = Math.atan2(by - ay, bx - ax) || 0;
        bx = ax + Math.cos(angle) * d;
        by = ay + Math.sin(angle) * d;
        bx = Math.max(margin + rB, Math.min(view.W - margin - rB, bx));
        by = Math.max(margin + rB, Math.min(view.H - margin - rB, by));
      }
      draw();
    });
    themeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const t = btn.getAttribute("data-theme");
        if (t === "default") {
          labelA = "事件 A";
          labelB = "事件 B";
        } else if (t === "social") {
          labelA = "吃瓜";
          labelB = "发弹幕";
        } else if (t === "interaction") {
          labelA = "点赞";
          labelB = "收藏";
        }
        draw();
      });
    });
    function toCanvasPoint(e) {
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      return { x: x - rect.left, y: y - rect.top };
    }
    let dragging = null;
    function clampCenters() {
      const view = getViewSize();
      ax = Math.max(margin + rA, Math.min(view.W - margin - rA, ax));
      ay = Math.max(margin + rA, Math.min(view.H - margin - rA, ay));
      bx = Math.max(margin + rB, Math.min(view.W - margin - rB, bx));
      by = Math.max(margin + rB, Math.min(view.H - margin - rB, by));
    }
    function onDown(e) {
      const p = toCanvasPoint(e);
      const da = Math.hypot(p.x - ax, p.y - ay);
      const db = Math.hypot(p.x - bx, p.y - by);
      if (da <= rA) dragging = "A";
      else if (db <= rB) dragging = "B";
      hasDragged = true;
      if (dragging) e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const p = toCanvasPoint(e);
      if (dragging === "A") {
        ax = p.x;
        ay = p.y;
        clampCenters();
        if (indChk.checked) {
          const pa = Math.max(
            0,
            Math.min(1, parseInt(paInput.value, 10) / 100)
          );
          const pb = Math.max(
            0,
            Math.min(1, parseInt(pbInput.value, 10) / 100)
          );
          recalcRadii();
          const view = getViewSize();
          const S = view.W * view.H;
          const d = solveDistance(rA, rB, pa * pb * S);
          const angle = Math.atan2(by - ay, bx - ax) || 0;
          bx = ax + Math.cos(angle) * d;
          by = ay + Math.sin(angle) * d;
          clampCenters();
        }
      } else if (dragging === "B") {
        bx = p.x;
        by = p.y;
        clampCenters();
        if (indChk.checked) {
          const pa = Math.max(
            0,
            Math.min(1, parseInt(paInput.value, 10) / 100)
          );
          const pb = Math.max(
            0,
            Math.min(1, parseInt(pbInput.value, 10) / 100)
          );
          recalcRadii();
          const view = getViewSize();
          const S = view.W * view.H;
          const d = solveDistance(rA, rB, pa * pb * S);
          const angle = Math.atan2(ay - by, ax - bx) || 0;
          ax = bx + Math.cos(angle) * d;
          ay = by + Math.sin(angle) * d;
          clampCenters();
        }
      }
      draw();
      e.preventDefault();
    }
    function onUp() {
      dragging = null;
    }
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    layoutFromControls();
    draw();
    window.addEventListener("resize", function () {
      resizeCanvas();
      layoutFromControls();
      draw();
    });
  }

  function setupCritExperiment() {
    const bar = document.getElementById("crit-bar");
    const line = document.getElementById("crit-line");
    const pInput = document.getElementById("crit-p");
    const nInput = document.getElementById("crit-n");
    const onceBtn = document.getElementById("crit-once");
    const b100Btn = document.getElementById("crit-100");
    const b1000Btn = document.getElementById("crit-1000");
    const resetBtn = document.getElementById("crit-reset");
    const theoryEl = document.getElementById("crit-theory");
    const freqEl = document.getElementById("crit-freq");
    const errEl = document.getElementById("crit-error");
    const trialsEl = document.getElementById("crit-trials");
    if (!bar || !line || !pInput || !nInput) return;
    const bctx = bar.getContext("2d");
    const lctx = line.getContext("2d");
    function resizeCanvas(c, ctx) {
      const rect = c.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      c.width = Math.floor(rect.width * dpr);
      c.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function getSize(c) {
      const r = c.getBoundingClientRect();
      return { W: r.width, H: r.height };
    }
    resizeCanvas(bar, bctx);
    resizeCanvas(line, lctx);
    let p = parseInt(pInput.value, 10) / 100;
    let n = parseInt(nInput.value, 10);
    let hist = new Array(n + 1).fill(0);
    let totalRuns = 0;
    let conv = [];
    function theo() {
      return 1 - Math.pow(1 - p, n);
    }
    function updateStats() {
      const t = theo();
      const f = totalRuns === 0 ? 0 : conv[conv.length - 1][1];
      theoryEl.textContent = t.toFixed(4);
      freqEl.textContent = f.toFixed(4);
      errEl.textContent = Math.abs(f - t).toFixed(4);
      trialsEl.textContent = String(totalRuns);
    }
    function drawBar() {
      const s = getSize(bar);
      bctx.clearRect(0, 0, s.W, s.H);
      const pad = 28;
      const W = s.W - pad * 2;
      const H = s.H - pad * 2;
      const maxCount = Math.max(1, ...hist);
      const bw = W / (n + 1);
      bctx.fillStyle = "rgba(255,255,255,0.06)";
      bctx.fillRect(0, 0, s.W, s.H);
      bctx.strokeStyle = "rgba(255,255,255,0.2)";
      bctx.beginPath();
      bctx.moveTo(pad, s.H - pad);
      bctx.lineTo(s.W - pad, s.H - pad);
      bctx.moveTo(pad, pad);
      bctx.lineTo(pad, s.H - pad);
      bctx.stroke();
      bctx.fillStyle = "#e5e7eb";
      bctx.font = "12px Roboto, system-ui";
      bctx.textAlign = "left";
      bctx.fillText("X: 命中次数 k", pad + 6, s.H - pad + 32);
      bctx.fillText("Y: 相对频率", pad + 6, pad - 12);
      for (let k = 0; k <= n; k++) {
        const h = (hist[k] / maxCount) * H;
        const x = pad + k * bw + bw * 0.1;
        const y = s.H - pad - h;
        const w = bw * 0.8;
        bctx.fillStyle = "rgba(0,243,255,0.35)";
        bctx.fillRect(x, y, w, h);
      }
      bctx.fillStyle = "#e5e7eb";
      bctx.font = "12px Roboto, system-ui";
      bctx.textAlign = "center";
      for (let k = 0; k <= n; k += Math.max(1, Math.floor(n / 10))) {
        const x = pad + k * bw + bw / 2;
        bctx.fillText(String(k), x, s.H - pad + 14);
      }
      for (let i = 0; i <= 5; i++) {
        const y = s.H - pad - (i / 5) * H;
        const v = i / 5;
        bctx.strokeStyle = "rgba(255,255,255,0.2)";
        bctx.beginPath();
        bctx.moveTo(pad - 4, y);
        bctx.lineTo(pad, y);
        bctx.stroke();
        bctx.textAlign = "right";
        bctx.fillText(v.toFixed(2), pad - 6, y + 4);
      }
    }
    function drawLine() {
      const s = getSize(line);
      lctx.clearRect(0, 0, s.W, s.H);
      const pad = 28;
      const W = s.W - pad * 2;
      const H = s.H - pad * 2;
      lctx.fillStyle = "rgba(255,255,255,0.06)";
      lctx.fillRect(0, 0, s.W, s.H);
      lctx.strokeStyle = "rgba(255,255,255,0.2)";
      lctx.beginPath();
      lctx.moveTo(pad, s.H - pad);
      lctx.lineTo(s.W - pad, s.H - pad);
      lctx.moveTo(pad, pad);
      lctx.lineTo(pad, s.H - pad);
      lctx.stroke();
      const t = theo();
      let yMin = 0,
        yMax = 1;
      if (conv.length > 0) {
        let minObs = conv[0][1];
        let maxObs = conv[0][1];
        for (let i = 1; i < conv.length; i++) {
          const v = conv[i][1];
          if (v < minObs) minObs = v;
          if (v > maxObs) maxObs = v;
        }
        yMin = Math.min(minObs, t);
        yMax = Math.max(maxObs, t);
        const d = yMax - yMin;
        if (d < 0.05) {
          const mid = (yMin + yMax) / 2;
          yMin = Math.max(0, mid - 0.03);
          yMax = Math.min(1, mid + 0.03);
        } else {
          const m = d * 0.2;
          yMin = Math.max(0, yMin - m);
          yMax = Math.min(1, yMax + m);
        }
      }
      function yMap(val) {
        return s.H - pad - ((val - yMin) / Math.max(1e-6, yMax - yMin)) * H;
      }
      lctx.setLineDash([6, 4]);
      lctx.strokeStyle = "rgba(167,139,250,0.8)";
      lctx.beginPath();
      lctx.moveTo(pad, yMap(t));
      lctx.lineTo(s.W - pad, yMap(t));
      lctx.stroke();
      lctx.setLineDash([]);
      if (conv.length > 1) {
        const xMax = Math.max(1, totalRuns);
        lctx.strokeStyle = "rgba(0,243,255,0.9)";
        lctx.beginPath();
        for (let i = 0; i < conv.length; i++) {
          const x = pad + (conv[i][0] / xMax) * W;
          const y = yMap(conv[i][1]);
          if (i === 0) lctx.moveTo(x, y);
          else lctx.lineTo(x, y);
        }
        lctx.stroke();
      }
      const xMax = Math.max(1, totalRuns);
      lctx.fillStyle = "#e5e7eb";
      lctx.font = "12px Roboto, system-ui";
      for (let i = 0; i <= 5; i++) {
        const y = s.H - pad - (i / 5) * H;
        const v = yMin + (i / 5) * (yMax - yMin);
        lctx.strokeStyle = "rgba(255,255,255,0.2)";
        lctx.beginPath();
        lctx.moveTo(pad - 4, y);
        lctx.lineTo(pad, y);
        lctx.stroke();
        lctx.textAlign = "right";
        lctx.fillText(v.toFixed(2), pad - 6, y + 4);
      }
      for (let i = 0; i <= 5; i++) {
        const x = pad + (i / 5) * W;
        const vx = Math.round((i / 5) * xMax);
        lctx.strokeStyle = "rgba(255,255,255,0.2)";
        lctx.beginPath();
        lctx.moveTo(x, s.H - pad);
        lctx.lineTo(x, s.H - pad + 4);
        lctx.stroke();
        lctx.textAlign = "center";
        lctx.fillText(String(vx), x, s.H - pad + 16);
      }
      lctx.textAlign = "left";
      lctx.fillText("X: 试验次数", pad + 6, s.H - pad + 32);
      lctx.fillText("Y: ≥1命中频率", pad + 6, pad - 12);
    }
    function runTrials(m) {
      for (let i = 0; i < m; i++) {
        let hits = 0;
        for (let j = 0; j < n; j++) {
          if (Math.random() < p) hits++;
        }
        hist[hits]++;
        totalRuns++;
        const ind = hits > 0 ? 1 : 0;
        const prev =
          conv.length === 0 ? 0 : conv[conv.length - 1][1] * (totalRuns - 1);
        const cur = (prev + ind) / totalRuns;
        conv.push([totalRuns, cur]);
      }
      updateStats();
      drawBar();
      drawLine();
    }
    function resetAll() {
      p = parseInt(pInput.value, 10) / 100;
      n = parseInt(nInput.value, 10);
      hist = new Array(n + 1).fill(0);
      totalRuns = 0;
      conv = [];
      updateStats();
      drawBar();
      drawLine();
    }
    pInput.addEventListener("input", function () {
      resetAll();
    });
    nInput.addEventListener("input", function () {
      resetAll();
    });
    if (onceBtn)
      onceBtn.addEventListener("click", function () {
        runTrials(1);
      });
    if (b100Btn)
      b100Btn.addEventListener("click", function () {
        runTrials(100);
      });
    if (b1000Btn)
      b1000Btn.addEventListener("click", function () {
        runTrials(1000);
      });
    if (resetBtn)
      resetBtn.addEventListener("click", function () {
        resetAll();
      });
    window.addEventListener("resize", function () {
      resizeCanvas(bar, bctx);
      resizeCanvas(line, lctx);
      drawBar();
      drawLine();
    });
    resetAll();
  }

  function setupGachaLab() {
    const line = document.getElementById("gacha-line");
    const bar = document.getElementById("gacha-bar");
    const p5Input = document.getElementById("gacha-p5");
    const p4Input = document.getElementById("gacha-p4");
    const pity5Input = document.getElementById("gacha-pity5");
    const pity4Input = document.getElementById("gacha-pity4");
    const featuredInput = document.getElementById("gacha-featured");
    const nInput = document.getElementById("gacha-n");
    const costInput = document.getElementById("gacha-cost");
    const p5Val = document.getElementById("gacha-p5-val");
    const p4Val = document.getElementById("gacha-p4-val");
    const pity5Val = document.getElementById("gacha-pity5-val");
    const pity4Val = document.getElementById("gacha-pity4-val");
    const featuredVal = document.getElementById("gacha-featured-val");
    const nVal = document.getElementById("gacha-n-val");
    const costVal = document.getElementById("gacha-cost-val");
    const modelBtns = [];
    const run1 = document.getElementById("gacha-run-1");
    const run100 = document.getElementById("gacha-run-100");
    const run1000 = document.getElementById("gacha-run-1000");
    const singleBtn = document.getElementById("gacha-single");
    const tenBtn = document.getElementById("gacha-ten");
    const resetBtn = document.getElementById("gacha-reset");
    const theoryEl = document.getElementById("gacha-theory");
    const freqEl = document.getElementById("gacha-freq");
    const expEl = document.getElementById("gacha-exp");
    const costEl = document.getElementById("gacha-cost-view");
    const luckEl = document.getElementById("gacha-luck");
    const formulaBoxEl = document.getElementById("gacha-formula");
    const logTableEl = document.getElementById("gacha-log-table");
    const sum4El = document.getElementById("gacha-sum4");
    const sum5El = document.getElementById("gacha-sum5");
    const countEl = document.getElementById("gacha-count");
    const pity4El = document.getElementById("gacha-pity4");
    const pity5El = document.getElementById("gacha-pity5");
    const daEl = document.getElementById("gacha-da");
    const tabExp = document.getElementById("gacha-tab-experience");
    const tabExpt = document.getElementById("gacha-tab-experiment");
    const tabTheory = document.getElementById("gacha-tab-theory");
    const paramHeader = document.getElementById("gacha-param-header");
    const paramContent = document.getElementById("gacha-param-content");
    const paramChevron = document.getElementById("gacha-param-chevron");
    const paramSummary = document.getElementById("gacha-param-summary");
    const paramSummaryItems = document.getElementById(
      "gacha-param-summary-items"
    );
    const paramSave = document.getElementById("gacha-param-save");

    // 新增仪表盘元素引用
    const avgCost5StarExpEl = document.getElementById(
      "gacha-avg-cost-5star-exp"
    );
    const avgCost5StarTheoryEl = document.getElementById(
      "gacha-avg-cost-5star-theory"
    );
    const avgCostFeaturedExpEl = document.getElementById(
      "gacha-avg-cost-featured-exp"
    );
    const avgCostFeaturedTheoryEl = document.getElementById(
      "gacha-avg-cost-featured-theory"
    );
    const totalExperimentsEl = document.getElementById(
      "gacha-total-experiments"
    );
    const successRateEl = document.getElementById("gacha-success-rate");
    const maxCostEl = document.getElementById("gacha-max-cost");
    const minCostEl = document.getElementById("gacha-min-cost");
    const costStdEl = document.getElementById("gacha-cost-std");
    const medianCostEl = document.getElementById("gacha-median-cost");
    const softPityRateEl = document.getElementById("gacha-soft-pity-rate");
    const hardPityRateEl = document.getElementById("gacha-hard-pity-rate");
    const avgPityCountEl = document.getElementById("gacha-avg-pity-count");
    const missRateEl = document.getElementById("gacha-miss-rate");
    if (
      !p5Input ||
      !p4Input ||
      !pity5Input ||
      !pity4Input ||
      !featuredInput ||
      !nInput ||
      !costInput
    )
      return;
    const lctx = line ? line.getContext("2d") : null;
    const bctx = bar ? bar.getContext("2d") : null;
    let currentMode = "experience";
    let theoryLock = { left: null, right: null };
    function resizeCanvas(c, ctx) {
      const rect = c.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      c.width = Math.floor(rect.width * dpr);
      c.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function getSize(c) {
      const r = c.getBoundingClientRect();
      return { W: r.width, H: r.height };
    }
    function getMetrics(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        rect: { w: r.width, h: r.height },
        client: { w: el.clientWidth, h: el.clientHeight },
        scroll: { w: el.scrollWidth, h: el.scrollHeight },
        styles: {
          flexGrow: cs.flexGrow,
          flexShrink: cs.flexShrink,
          flexBasis: cs.flexBasis,
          overflowX: cs.overflowX,
          overflowY: cs.overflowY,
        },
        needsXScroll: el.scrollWidth > el.clientWidth,
        needsYScroll: el.scrollHeight > el.clientHeight,
      };
    }
    function enforceTheoryRatio() {
      const vp = document.getElementById("theory-video-panel");
      const ep = document.getElementById("theory-explain-panel");
      const container = document.querySelector(".mode-theory-only > div.flex");
      if (!vp || !ep || !container || currentMode !== "theory") return;
      const cs = window.getComputedStyle(container);
      const gap = parseFloat(cs.columnGap) || 0;
      const cw = container.clientWidth || 0;
      const avail = Math.max(0, cw - gap);
      const left = Math.round((avail * 2) / 3);
      const right = avail - left;
      theoryLock.left = left;
      theoryLock.right = right;
      vp.style.flex = "0 0 auto";
      ep.style.flex = "0 0 auto";
      vp.style.width = left + "px";
      ep.style.width = right + "px";
      vp.style.minWidth = "0";
      ep.style.minWidth = "0";
    }
    function applyLockedTheoryWidths() {
      const vp = document.getElementById("theory-video-panel");
      const ep = document.getElementById("theory-explain-panel");
      if (!vp || !ep) return;
      if (theoryLock.left == null || theoryLock.right == null) return;
      vp.style.flex = "0 0 auto";
      ep.style.flex = "0 0 auto";
      vp.style.width = theoryLock.left + "px";
      ep.style.width = theoryLock.right + "px";
      vp.style.minWidth = "0";
      ep.style.minWidth = "0";
    }
    function logPanelState(label) {
      const vp = document.getElementById("theory-video-panel");
      const ep = document.getElementById("theory-explain-panel");
      const f = document.getElementById("gacha-formula");
      const codeEl = document.querySelector("#gacha-formula .code-py");
      const v = getMetrics(vp);
      const e = getMetrics(ep);
      const fo = getMetrics(f);
      const co = getMetrics(codeEl);
      const ratio =
        v && e && e.rect.w > 0 ? +(v.rect.w / e.rect.w).toFixed(3) : null;
      console.log("panel-state", {
        label,
        ratio,
        videoW: v ? Math.round(v.rect.w) : null,
        explainW: e ? Math.round(e.rect.w) : null,
        vFlex: v ? v.styles.flexBasis : null,
        eFlex: e ? e.styles.flexBasis : null,
        formulaScrollX: fo ? fo.needsXScroll : null,
        formulaScrollY: fo ? fo.needsYScroll : null,
        codeScrollX: co ? co.needsXScroll : null,
        codeScrollY: co ? co.needsYScroll : null,
      });
    }
    function setTabActive(mode) {
      if (tabExp) tabExp.classList.toggle("active", mode === "experience");
      if (tabExpt) tabExpt.classList.toggle("active", mode === "experiment");
      if (tabTheory) tabTheory.classList.toggle("active", mode === "theory");
    }
    function setOpsVisibilityForMode(mode) {
      if (singleBtn)
        singleBtn.classList.toggle("hidden", mode !== "experience");
      if (tenBtn) tenBtn.classList.toggle("hidden", mode !== "experience");
      if (run1) run1.classList.toggle("hidden", mode !== "experiment");
      if (run100) run100.classList.toggle("hidden", mode !== "experiment");
      if (run1000) run1000.classList.toggle("hidden", mode !== "experiment");
    }
    function switchMode(mode) {
      currentMode = mode;
      setTabActive(mode);
      const expOnly = document.querySelectorAll(".mode-experience-only");
      const exptOnly = document.querySelectorAll(".mode-experiment-only");
      const theoryOnly = document.querySelectorAll(".mode-theory-only");
      const hideInTheory = document.querySelectorAll(".mode-hide-in-theory");
      expOnly.forEach((el) =>
        el.classList.toggle("hidden", mode !== "experience")
      );
      exptOnly.forEach((el) =>
        el.classList.toggle("hidden", mode !== "experiment")
      );
      theoryOnly.forEach((el) =>
        el.classList.toggle("hidden", mode !== "theory")
      );
      hideInTheory.forEach((el) =>
        el.classList.toggle("hidden", mode === "theory")
      );
      setOpsVisibilityForMode(mode);
      renderAll();
      setTimeout(() => logPanelState("switchMode:" + mode), 50);
      if (mode === "theory") {
        enforceTheoryRatio();
      }

      // 当切换到理论模式时，重新渲染公式
      if (mode === "theory") {
        setTimeout(() => {
          const formulaEl = document.getElementById("gacha-formula");
          if (formulaEl && typeof renderMathInElement !== "undefined") {
            renderMathInElement(formulaEl, {
              delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
              ],
              throwOnError: false,
            });
          }
        }, 100);
      }
    }
    function renderAll() {
      updateCharts();
      updateFormulaBox();
    }
    if (line && lctx) resizeCanvas(line, lctx);
    if (bar && bctx) resizeCanvas(bar, bctx);
    let model = "genshin";
    let conv4 = [];
    let conv5 = [];
    let totalRuns = 0;
    let histIntervals4 = [];
    let histIntervals5 = [];
    let histTrials4 = [];
    let histTrials5 = [];
    let gCount = 0;
    let pity4 = 0;
    let pity5 = 0;
    let daBaodi = 90;
    let starCounts = { 3: 0, 4: 0, 5: 0 };
    let lastRareCount4 = 0;
    let lastRareCount5 = 0;
    let guaranteedLimited = false;
    let rareView = "4plus";
    let pitySeries5 = [];
    let pitySeries4 = [];
    function simulateTrialGenshin(n, p5, p4, k5, k4) {
      let c5 = 0;
      let c4 = 0;
      let first4 = 0;
      let first5 = 0;
      for (let t = 1; t <= n; t++) {
        c5++;
        c4++;
        let star = 3;
        const r = Math.random();
        if (c5 >= k5) star = 5;
        else if (c4 >= k4) star = 4;
        else if (r <= p5) star = 5;
        else if (r <= p5 + p4) star = 4;
        if (star === 5) {
          if (!first5) first5 = t;
          c5 = 0;
          c4 = 0;
          if (!first4) first4 = t;
        } else if (star === 4) {
          if (!first4) first4 = t;
          c4 = 0;
        }
      }
      return { first4, first5 };
    }
    function theoryProb(n, p5, p4) {
      const p = Math.max(0, Math.min(1, p5 + p4));
      return 1 - Math.pow(1 - p, n);
    }
    function expectedDrawsApprox(n, p5, p4) {
      const p = Math.max(1e-6, Math.min(1, p5 + p4));
      return Math.min(n, 1 / p);
    }
    function probSeries(n, p5, p4, k5, k4) {
      const out = new Array(n);
      for (let t = 1; t <= n; t++) {
        out[t - 1] =
          t >= k5 ? 1 : t >= k4 ? 1 : Math.max(0, Math.min(1, p5 + p4));
      }
      return out;
    }
    function luckLabel(hits, n) {
      if (hits === 0 && n >= 60) return "终极大非酋";
      if (hits === 0) return "非酋";
      if (hits <= 1 && n >= 90) return "小非酋";
      if (hits >= 3) return "欧皇";
      if (hits >= 5) return "万里挑一的欧皇";
      return "普通人";
    }
    let starsChart = null;
    let pityChart = null;
    let histChart = null;
    let probChart = null;
    let convChart = null;
    let sessionsChart = null;
    let sessionResults4 = [];
    let sessionResults5 = [];

    // 新增统计数据存储
    let experimentStats = {
      costs5Star: [],
      costsFeatured: [],
      pityCountsWhen5Star: [],
      softPityTriggers: 0,
      hardPityTriggers: 0,
      missedFeatured: 0,
      totalExperiments: 0,
    };
    function initCharts() {
      if (typeof Chart === "undefined") return;
      const starsEl = document.getElementById("gacha-stars");
      const pityEl = document.getElementById("gacha-pity");
      const histEl = document.getElementById("gacha-hist");
      const probEl = document.getElementById("gacha-prob");
      const convEl = document.getElementById("gacha-conv");
      const sessionsEl = document.getElementById("gacha-sessions");
      if (starsEl && !starsChart) {
        starsChart = new Chart(starsEl.getContext("2d"), {
          type: "bar",
          data: {
            labels: ["3★", "4★", "5★"],
            datasets: [
              {
                label: "次数",
                data: [0, 0, 0],
                backgroundColor: [
                  "rgba(255,255,255,0.35)",
                  "rgba(167,139,250,0.7)",
                  "rgba(245,158,11,0.7)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: "#e5e7eb" } },
              y: {
                beginAtZero: true,
                ticks: { color: "#e5e7eb" },
                grid: { color: "rgba(255,255,255,0.1)" },
              },
            },
            plugins: { legend: { labels: { color: "#e5e7eb" } } },
          },
        });
      }
      if (pityEl && !pityChart) {
        pityChart = new Chart(pityEl.getContext("2d"), {
          type: "line",
          data: {
            labels: [],
            datasets: [
              {
                label: "5★保底剩余",
                data: [],
                borderColor: "rgba(0,243,255,1)",
                backgroundColor: "rgba(0,243,255,0.2)",
                tension: 0.3,
              },
              {
                label: "4★保底剩余",
                data: [],
                borderColor: "rgba(167,139,250,1)",
                backgroundColor: "rgba(167,139,250,0.15)",
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: "#e5e7eb" } },
              y: {
                beginAtZero: true,
                ticks: { color: "#e5e7eb" },
                grid: { color: "rgba(255,255,255,0.1)" },
              },
            },
            plugins: { legend: { labels: { color: "#e5e7eb" } } },
          },
        });
      }
      if (histEl && !histChart) {
        histChart = new Chart(histEl.getContext("2d"), {
          type: "bar",
          data: {
            labels: [],
            datasets: [
              {
                label: "首次命中≥4★抽数分布",
                data: [],
                backgroundColor: "rgba(0,243,255,0.35)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: "#e5e7eb", maxTicksLimit: 10 } },
              y: {
                beginAtZero: true,
                ticks: { color: "#e5e7eb" },
                grid: { color: "rgba(255,255,255,0.1)" },
              },
            },
            plugins: { legend: { labels: { color: "#e5e7eb" } } },
          },
        });
      }
      if (convEl && !convChart) {
        convChart = new Chart(convEl.getContext("2d"), {
          type: "line",
          data: {
            labels: [],
            datasets: [
              {
                label: "观察命中率",
                data: [],
                borderColor: "rgba(0,243,255,1)",
                backgroundColor: "rgba(0,243,255,0.2)",
                tension: 0.3,
              },
              {
                label: "时序理论",
                data: [],
                borderColor: "rgba(167,139,250,1)",
                borderDash: [6, 4],
                tension: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: "#e5e7eb" } },
              y: {
                beginAtZero: true,
                ticks: { color: "#e5e7eb" },
                grid: { color: "rgba(255,255,255,0.1)" },
              },
            },
            plugins: { legend: { labels: { color: "#e5e7eb" } } },
          },
        });
      }
      if (sessionsEl && !sessionsChart) {
        sessionsChart = new Chart(sessionsEl.getContext("2d"), {
          type: "bar",
          data: {
            labels: [],
            datasets: [
              {
                label: "批次命中(1/0)",
                data: [],
                backgroundColor: "rgba(0,243,255,0.35)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: "#e5e7eb", maxTicksLimit: 12 } },
              y: {
                beginAtZero: true,
                max: 1,
                ticks: { color: "#e5e7eb" },
                grid: { color: "rgba(255,255,255,0.1)" },
              },
            },
            plugins: { legend: { labels: { color: "#e5e7eb" } } },
          },
        });
      }
      if (probEl && !probChart) {
        probChart = new Chart(probEl.getContext("2d"), {
          type: "line",
          data: {
            labels: [],
            datasets: [
              {
                label: "单次概率 p_t",
                data: [],
                borderColor: "rgba(255,255,255,0.7)",
                backgroundColor: "rgba(255,255,255,0.15)",
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: "#e5e7eb" } },
              y: {
                beginAtZero: true,
                max: 1,
                ticks: { color: "#e5e7eb" },
                grid: { color: "rgba(255,255,255,0.1)" },
              },
            },
            plugins: { legend: { labels: { color: "#e5e7eb" } } },
          },
        });
      }
    }
    function updateCharts() {
      if (typeof Chart === "undefined") return;
      initCharts();
      const n = parseInt(nInput.value, 10);
      const p5 = parseFloat(p5Input.value) / 100;
      const p4 = parseFloat(p4Input.value) / 100;
      const k5 = parseInt(pity5Input.value, 10);
      const k4 = parseInt(pity4Input.value, 10);
      const sch = probSeries(n, p5, p4, k5, k4);
      const tProb = theoryProb(n, p5, p4);
      if (probChart) {
        probChart.data.labels = sch.map((_, i) => String(i + 1));
        probChart.data.datasets[0].data = sch;
        probChart.update();
      }
      if (pityChart) {
        pityChart.options.scales.y.max = Math.max(
          parseInt(pity5Input.value, 10) || 0,
          parseInt(pity4Input.value, 10) || 0
        );
        pityChart.data.labels = pitySeries5.map((_, i) => String(i + 1));
        pityChart.data.datasets[0].data = pitySeries5;
        pityChart.data.datasets[1].data = pitySeries4;
        pityChart.update();
      }
      if (convChart) {
        function seqProb4() {
          const series = probSeries(n, p5, p4, k5, k4);
          let prod = 1;
          for (let i = 0; i < series.length; i++) prod *= 1 - series[i];
          return 1 - prod;
        }
        function seqProb5() {
          const series5 = new Array(n)
            .fill(0)
            .map((_, i) => (i + 1 >= k5 ? 1 : p5));
          let prod = 1;
          for (let i = 0; i < series5.length; i++) prod *= 1 - series5[i];
          return 1 - prod;
        }
        const labels = (rareView === "5only" ? conv5 : conv4).map((x) =>
          String(x[0])
        );
        convChart.data.labels = labels;
        convChart.data.datasets[0].data = (
          rareView === "5only" ? conv5 : conv4
        ).map((x) => x[1]);
        convChart.data.datasets[1].data = labels.map(() =>
          rareView === "5only" ? seqProb5() : seqProb4()
        );
        convChart.update();
      }
      if (sessionsChart) {
        const src = rareView === "5only" ? sessionResults5 : sessionResults4;
        sessionsChart.data.labels = src.map((_, i) => String(i + 1));
        sessionsChart.data.datasets[0].label =
          rareView === "5only" ? "批次命中5★(1/0)" : "批次命中≥4★(1/0)";
        sessionsChart.data.datasets[0].data = src;
        sessionsChart.update();
      }
      if (histChart) {
        const source =
          currentMode === "experiment"
            ? rareView === "5only"
              ? histTrials5
              : histTrials4
            : rareView === "5only"
            ? histIntervals5
            : histIntervals4;
        const bins = source.slice(1);
        histChart.options.scales.x.ticks.maxTicksLimit = Math.min(
          12,
          bins.length || 12
        );
        histChart.data.labels = bins.map((_, i) => String(i + 1));
        histChart.data.datasets[0].label =
          currentMode === "experiment"
            ? rareView === "5only"
              ? "首次命中5★抽数分布"
              : "首次命中≥4★抽数分布"
            : rareView === "5only"
            ? "体验：两次5★间隔分布"
            : "体验：两次≥4★间隔分布";
        histChart.data.datasets[0].data = bins;
        histChart.update();
      }
      updateStarsTable();
    }
    function updateStarsTable() {
      const tbody = document.getElementById("gacha-stars-table");
      if (!tbody) return;
      const total = Math.max(1, gCount);
      const p5 = parseFloat(p5Input.value) / 100;
      const p4 = parseFloat(p4Input.value) / 100;
      const p3 = Math.max(0, 1 - (p5 + p4));
      const costUnit = parseInt(costInput.value, 10) || 0;
      const spent = gCount * costUnit;
      const targets = [
        { name: "游戏月卡", price: 68 },
        { name: "黑神话悟空", price: 168 },
        { name: "机械键盘", price: 499 },
        { name: "27寸显示器", price: 999 },
        { name: "中端手机", price: 1999 },
        { name: "轻薄本", price: 3999 },
        { name: "电竞显示器", price: 5999 },
        { name: "高端手机", price: 9999 },
        { name: "游戏台式机", price: 19999 },
        { name: "专业相机", price: 49999 },
        { name: "高端电视与家庭影院", price: 99999 },
        { name: "高端工作站", price: 199999 },
        { name: "新能源车首付", price: 300000 },
      ];
      const reached = targets.filter((t) => spent >= t.price);
      const evalRow = reached.length
        ? `<tr><td class="p-2" colspan="4">已消费${spent}元，相当于全款购买${
            reached[reached.length - 1].name
          }</td></tr>`
        : "";
      const rows = [
        { key: 3, label: "3★", theo: p3 },
        { key: 4, label: "4★", theo: p4 },
        { key: 5, label: "5★", theo: p5 },
      ];
      const html = rows
        .map((r) => {
          const cnt = starCounts[r.key] || 0;
          const prob = (cnt / total).toFixed(4);
          const cls = r.key === 5 ? "jin" : r.key === 4 ? "zhi" : "";
          const theo = (r.theo || 0).toFixed(4);
          return `<tr class="${cls}"><td class="p-2">${r.label}</td><td class="p-2">${cnt}</td><td class="p-2">${prob}</td><td class="p-2">${theo}</td></tr>`;
        })
        .join("");
      tbody.innerHTML = html + evalRow;
    }
    function computeExpectedCounts(n, trials) {
      const p5 = parseFloat(p5Input.value) / 100;
      const p4 = parseFloat(p4Input.value) / 100;
      const k5 = parseInt(pity5Input.value, 10);
      const k4 = parseInt(pity4Input.value, 10);
      let e4 = 0;
      let e5 = 0;
      const T = Math.max(16, Math.min(512, trials || 128));
      for (let i = 0; i < T; i++) {
        let c5 = 0;
        let c4 = 0;
        let cnt4 = 0;
        let cnt5 = 0;
        for (let t = 1; t <= n; t++) {
          c5++;
          c4++;
          let star = 3;
          const r = Math.random();
          if (c5 >= k5) star = 5;
          else if (c4 >= k4) star = 4;
          else if (r <= p5) star = 5;
          else if (r <= p5 + p4) star = 4;
          if (star === 5) {
            cnt5++;
            c5 = 0;
            c4 = 0;
          } else if (star === 4) {
            cnt4++;
            c4 = 0;
          }
        }
        e4 += cnt4;
        e5 += cnt5;
      }
      return { e4: e4 / T, e5: e5 / T };
    }
    function updateLuck() {
      if (!luckEl) return;
      if (gCount < 5) {
        luckEl.textContent = "—";
        return;
      }
      const exp = computeExpectedCounts(gCount, 128);
      const a4 = starCounts[4] || 0;
      const a5 = starCounts[5] || 0;
      const r4 = exp.e4 > 0 ? a4 / exp.e4 : a4 > 0 ? 1 : 0;
      const r5 = exp.e5 > 0 ? a5 / exp.e5 : a5 > 0 ? 1 : 0;
      let tag = "普通人";
      if (r5 >= 1.8 || (r5 >= 1.5 && r4 >= 1.3)) tag = "万里挑一的欧皇";
      else if (r5 >= 1.2 || r4 >= 1.2) tag = "欧皇";
      else if (
        r5 <= 0.2 ||
        (a5 === 0 && gCount >= parseInt(pity5Input.value, 10) * 2)
      )
        tag = "终极大非酋";
      else if (r5 <= 0.6 || r4 <= 0.8) tag = "非酋";
      luckEl.textContent = tag;
    }
    function drawLine() {
      const s = getSize(line);
      lctx.clearRect(0, 0, s.W, s.H);
      const pad = 28;
      const W = s.W - pad * 2;
      const H = s.H - pad * 2;
      lctx.fillStyle = "rgba(255,255,255,0.06)";
      lctx.fillRect(0, 0, s.W, s.H);
      lctx.strokeStyle = "rgba(255,255,255,0.2)";
      lctx.beginPath();
      lctx.moveTo(pad, s.H - pad);
      lctx.lineTo(s.W - pad, s.H - pad);
      lctx.moveTo(pad, pad);
      lctx.lineTo(pad, s.H - pad);
      lctx.stroke();
      const n = parseInt(nInput.value, 10);
      const p0 = parseFloat(p0Input.value) / 100;
      const alpha = parseFloat(alphaInput.value) / 100;
      const k = parseInt(kInput.value, 10);
      const pmax = parseFloat(pmaxInput.value) / 100;
      const tProb = theoryProb(n, p0, alpha, k, pmax);
      let yMin = 0,
        yMax = 1;
      if (conv.length > 0) {
        let minObs = conv[0][1];
        let maxObs = conv[0][1];
        for (let i = 1; i < conv.length; i++) {
          const v = conv[i][1];
          if (v < minObs) minObs = v;
          if (v > maxObs) maxObs = v;
        }
        yMin = Math.min(minObs, tProb);
        yMax = Math.max(maxObs, tProb);
        const d = yMax - yMin;
        if (d < 0.05) {
          const mid = (yMin + yMax) / 2;
          yMin = Math.max(0, mid - 0.03);
          yMax = Math.min(1, mid + 0.03);
        } else {
          const m = d * 0.2;
          yMin = Math.max(0, yMin - m);
          yMax = Math.min(1, yMax + m);
        }
      }
      function yMap(val) {
        return s.H - pad - ((val - yMin) / Math.max(1e-6, yMax - yMin)) * H;
      }
      lctx.setLineDash([6, 4]);
      lctx.strokeStyle = "rgba(167,139,250,0.8)";
      lctx.beginPath();
      lctx.moveTo(pad, yMap(tProb));
      lctx.lineTo(s.W - pad, yMap(tProb));
      lctx.stroke();
      lctx.setLineDash([]);
      if (conv.length > 1) {
        const xMax = Math.max(1, totalRuns);
        lctx.strokeStyle = "rgba(0,243,255,0.9)";
        lctx.beginPath();
        for (let i = 0; i < conv.length; i++) {
          const x = pad + (conv[i][0] / xMax) * W;
          const y = yMap(conv[i][1]);
          if (i === 0) lctx.moveTo(x, y);
          else lctx.lineTo(x, y);
        }
        lctx.stroke();
      }
      const xMax = Math.max(1, totalRuns);
      lctx.fillStyle = "#e5e7eb";
      lctx.font = "12px Roboto, system-ui";
      for (let i = 0; i <= 5; i++) {
        const y = s.H - pad - (i / 5) * H;
        const v = yMin + (i / 5) * (yMax - yMin);
        lctx.strokeStyle = "rgba(255,255,255,0.2)";
        lctx.beginPath();
        lctx.moveTo(pad - 4, y);
        lctx.lineTo(pad, y);
        lctx.stroke();
        lctx.textAlign = "right";
        lctx.fillText(v.toFixed(2), pad - 6, y + 4);
      }
      for (let i = 0; i <= 5; i++) {
        const x = pad + (i / 5) * W;
        const vx = Math.round((i / 5) * xMax);
        lctx.strokeStyle = "rgba(255,255,255,0.2)";
        lctx.beginPath();
        lctx.moveTo(x, s.H - pad);
        lctx.lineTo(x, s.H - pad + 4);
        lctx.stroke();
        lctx.textAlign = "center";
        lctx.fillText(String(vx), x, s.H - pad + 16);
      }
      lctx.textAlign = "left";
      lctx.fillText("X: 试验次数", pad + 6, s.H - pad - 8);
      lctx.fillText("Y: ≥1稀有命中频率", pad + 6, pad + 16);
    }
    function drawBar() {
      const s = getSize(bar);
      bctx.clearRect(0, 0, s.W, s.H);
      const pad = 28;
      const W = s.W - pad * 2;
      const H = s.H - pad * 2;
      const maxCount = Math.max(1, ...hist);
      const bw = W / Math.max(1, hist.length);
      bctx.fillStyle = "rgba(255,255,255,0.06)";
      bctx.fillRect(0, 0, s.W, s.H);
      bctx.strokeStyle = "rgba(255,255,255,0.2)";
      bctx.beginPath();
      bctx.moveTo(pad, s.H - pad);
      bctx.lineTo(s.W - pad, s.H - pad);
      bctx.moveTo(pad, pad);
      bctx.lineTo(pad, s.H - pad);
      bctx.stroke();
      for (let k = 0; k < hist.length; k++) {
        const h = (hist[k] / maxCount) * H;
        const x = pad + k * bw + bw * 0.1;
        const y = s.H - pad - h;
        const w = bw * 0.8;
        bctx.fillStyle = "rgba(0,243,255,0.35)";
        bctx.fillRect(x, y, w, h);
      }
      bctx.fillStyle = "#e5e7eb";
      bctx.font = "12px Roboto, system-ui";
      bctx.textAlign = "center";
      for (
        let k = 0;
        k < hist.length;
        k += Math.max(1, Math.floor(hist.length / 10))
      ) {
        const x = pad + k * bw + bw / 2;
        bctx.fillText(String(k), x, s.H - pad + 14);
      }
      for (let i = 0; i <= 5; i++) {
        const y = s.H - pad - (i / 5) * H;
        const v = i / 5;
        bctx.strokeStyle = "rgba(255,255,255,0.2)";
        bctx.beginPath();
        bctx.moveTo(pad - 4, y);
        bctx.lineTo(pad, y);
        bctx.stroke();
        bctx.textAlign = "right";
        bctx.fillText(v.toFixed(2), pad - 6, y + 4);
      }
      bctx.textAlign = "left";
      bctx.fillText("X: 本次试验稀有命中次数", pad + 6, s.H - pad - 8);
      bctx.fillText("Y: 相对频率", pad + 6, pad + 16);
    }
    function runOneSession() {
      const n = parseInt(nInput.value, 10);
      const p5 = parseFloat(p5Input.value) / 100;
      const p4 = parseFloat(p4Input.value) / 100;
      const k5 = parseInt(pity5Input.value, 10);
      const k4 = parseInt(pity4Input.value, 10);
      const res = simulateTrialGenshin(n, p5, p4, k5, k4);
      const first4 = res.first4;
      const first5 = res.first5;
      totalRuns++;
      const prev4 =
        conv4.length === 0 ? 0 : conv4[conv4.length - 1][1] * (totalRuns - 1);
      const prev5 =
        conv5.length === 0 ? 0 : conv5[conv5.length - 1][1] * (totalRuns - 1);
      const cur4 = (prev4 + (first4 > 0 ? 1 : 0)) / totalRuns;
      const cur5 = (prev5 + (first5 > 0 ? 1 : 0)) / totalRuns;
      conv4.push([totalRuns, cur4]);
      conv5.push([totalRuns, cur5]);
      const costUnit = parseInt(costInput.value, 10);
      const totalCost = n * costUnit;
      function seqProb4() {
        const series = probSeries(n, p5, p4, k5, k4);
        let prod = 1;
        for (let i = 0; i < series.length; i++) prod *= 1 - series[i];
        return 1 - prod;
      }
      function seqProb5() {
        const series5 = new Array(n)
          .fill(0)
          .map((_, i) => (i + 1 >= k5 ? 1 : p5));
        let prod = 1;
        for (let i = 0; i < series5.length; i++) prod *= 1 - series5[i];
        return 1 - prod;
      }
      const tProbView = rareView === "5only" ? seqProb5() : seqProb4();
      const curView = rareView === "5only" ? cur5 : cur4;
      theoryEl.textContent = tProbView.toFixed(4);
      freqEl.textContent = curView.toFixed(4);
      expEl.textContent = expectedDrawsApprox(n, p5, p4).toFixed(2);
      costEl.textContent = "¥" + totalCost;
      if (first4 > 0) {
        while (histTrials4.length <= first4) histTrials4.push(0);
        histTrials4[first4] = (histTrials4[first4] || 0) + 1;
      }
      if (first5 > 0) {
        while (histTrials5.length <= first5) histTrials5.push(0);
        histTrials5[first5] = (histTrials5[first5] || 0) + 1;
      }
      sessionResults4.push(first4 > 0 ? 1 : 0);
      sessionResults5.push(first5 > 0 ? 1 : 0);
      if (sessionResults4.length > 200)
        sessionResults4 = sessionResults4.slice(sessionResults4.length - 200);
      if (sessionResults5.length > 200)
        sessionResults5 = sessionResults5.slice(sessionResults5.length - 200);

      // 收集实验统计数据
      experimentStats.totalExperiments++;

      if (first5 > 0) {
        const cost5Star = first5 * costUnit;
        experimentStats.costs5Star.push(cost5Star);
        experimentStats.pityCountsWhen5Star.push(first5);

        // 检查是否触发软保底或硬保底
        if (first5 >= 75 && first5 < k5) {
          experimentStats.softPityTriggers++;
        } else if (first5 >= k5) {
          experimentStats.hardPityTriggers++;
        }

        // 模拟限定角色获取（正确的50/50机制）
        const featuredRate = parseFloat(featuredInput.value) / 100;

        // 检查是否处于大保底状态
        if (typeof experimentStats.isGuaranteed === "undefined") {
          experimentStats.isGuaranteed = false;
        }

        let isFeatured;
        if (experimentStats.isGuaranteed) {
          // 大保底状态：必定获得限定
          isFeatured = true;
          experimentStats.isGuaranteed = false; // 重置大保底状态
        } else {
          // 小保底状态：按概率判断
          isFeatured = Math.random() < featuredRate;
          if (!isFeatured) {
            experimentStats.isGuaranteed = true; // 歪了，下次进入大保底
            experimentStats.missedFeatured++;
          }
        }

        if (isFeatured) {
          // 获得限定角色
          experimentStats.costsFeatured.push(cost5Star);
        }
      }

      updateCharts();
      updateExperimentDashboard();
    }
    function runBatch(m) {
      const chunk = Math.min(100, m);
      let done = 0;
      function step() {
        const c = Math.min(chunk, m - done);
        for (let i = 0; i < c; i++) runOneSession();
        done += c;
        if (done < m) setTimeout(step, 0);
      }
      step();
    }

    function appendLogEntry() {
      gCount++;
      const p5 = parseFloat(p5Input.value) / 100;
      const p4 = parseFloat(p4Input.value) / 100;
      const k5 = parseInt(pity5Input.value, 10);
      const k4 = parseInt(pity4Input.value, 10);
      let star = 3;
      const r = Math.random();
      const p5Counter = k5 - (typeof daBaodi === "number" ? daBaodi : k5);
      const p4Counter =
        typeof appendLogEntry.p4Counter === "number"
          ? appendLogEntry.p4Counter
          : 0;
      const nextP5Counter = p5Counter + 1;
      const nextP4Counter = p4Counter + 1;
      if (nextP5Counter >= k5) star = 5;
      else if (nextP4Counter >= k4) star = 4;
      else if (r <= p5) star = 5;
      else if (r <= p5 + p4) star = 4;
      if (star === 5) {
        pity5++;
        daBaodi = k5;
        appendLogEntry.p4Counter = 0;
      } else if (star === 4) {
        pity4++;
        daBaodi = Math.max(0, (typeof daBaodi === "number" ? daBaodi : k5) - 1);
        appendLogEntry.p4Counter = 0;
      } else {
        daBaodi = Math.max(0, (typeof daBaodi === "number" ? daBaodi : k5) - 1);
        appendLogEntry.p4Counter = nextP4Counter;
      }
      starCounts[star] = (starCounts[star] || 0) + 1;
      const hit = star >= 4 ? "是" : "否";
      if (logTableEl) {
        const tr = document.createElement("tr");
        tr.className = star === 5 ? "jin" : star === 4 ? "zhi" : "";
        tr.innerHTML = `<td class="p-2">${gCount}</td><td class="p-2">${star}★</td><td class="p-2">${hit}</td><td class="p-2">${r.toFixed(
          6
        )}</td>`;
        logTableEl.appendChild(tr);
      }
      if (star === 4 && sum4El) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td class="p-2">${gCount}</td><td class="p-2">4★</td><td class="p-2">命中</td>`;
        sum4El.appendChild(tr);
      }
      if (star === 5 && sum5El) {
        const featured = parseFloat(featuredInput.value) / 100;
        const limited = guaranteedLimited || Math.random() < featured;
        guaranteedLimited = limited ? false : true;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td class="p-2">${gCount}</td><td class="p-2">5★</td><td class="p-2">${
          limited ? "是" : "否"
        }</td>`;
        sum5El.appendChild(tr);
      }
      if (star >= 4) {
        const delta4 = lastRareCount4 > 0 ? gCount - lastRareCount4 : gCount;
        if (delta4 > 0) {
          while (histIntervals4.length <= delta4) histIntervals4.push(0);
          histIntervals4[delta4] = (histIntervals4[delta4] || 0) + 1;
          lastRareCount4 = gCount;
        }
      }
      if (star === 5) {
        const delta5 = lastRareCount5 > 0 ? gCount - lastRareCount5 : gCount;
        if (delta5 > 0) {
          while (histIntervals5.length <= delta5) histIntervals5.push(0);
          histIntervals5[delta5] = (histIntervals5[delta5] || 0) + 1;
          lastRareCount5 = gCount;
        }
      }
      pitySeries5.push(Math.max(0, daBaodi));
      pitySeries4.push(Math.max(0, k4 - (appendLogEntry.p4Counter || 0)));
      if (pitySeries5.length > 200) {
        pitySeries5 = pitySeries5.slice(pitySeries5.length - 200);
        pitySeries4 = pitySeries4.slice(pitySeries4.length - 200);
      }
      if (countEl) countEl.textContent = String(gCount);
      if (pity4El) pity4El.textContent = String(pity4);
      if (pity5El) pity5El.textContent = String(pity5);
      if (daEl) daEl.textContent = String(daBaodi);
      updateCharts();
      updateLuck();
    }
    function resetLogsAndState() {
      gCount = 0;
      pity4 = 0;
      pity5 = 0;
      daBaodi = parseInt(pity5Input.value, 10) || 90;
      starCounts = { 3: 0, 4: 0, 5: 0 };
      lastRareCount4 = 0;
      lastRareCount5 = 0;
      guaranteedLimited = false;
      appendLogEntry.p4Counter = 0;
      pitySeries5 = [];
      pitySeries4 = [];
      if (logTableEl) logTableEl.innerHTML = "";
      if (sum4El) sum4El.innerHTML = "";
      if (sum5El) sum5El.innerHTML = "";
      if (countEl) countEl.textContent = "0";
      if (pity4El) pity4El.textContent = "0";
      if (pity5El) pity5El.textContent = "0";
      if (daEl) daEl.textContent = String(parseInt(pity5Input.value, 10) || 90);
      updateCharts();
      luckEl.textContent = "—";
    }
    function updateAll() {
      conv4 = [];
      conv5 = [];
      totalRuns = 0;
      histIntervals4 = [];
      histIntervals5 = [];
      histTrials4 = [];
      histTrials5 = [];
      lastRareCount4 = 0;
      lastRareCount5 = 0;
      guaranteedLimited = false;
      pitySeries5 = [];
      pitySeries4 = [];
      sessionResults4 = [];
      sessionResults5 = [];
      theoryEl.textContent = "0.0000";
      freqEl.textContent = "0.0000";
      expEl.textContent = "0";
      costEl.textContent = "¥0";
      luckEl.textContent = "—";

      // 重置实验统计数据
      experimentStats = {
        costs5Star: [],
        costsFeatured: [],
        pityCountsWhen5Star: [],
        softPityTriggers: 0,
        hardPityTriggers: 0,
        missedFeatured: 0,
        totalExperiments: 0,
        isGuaranteed: false,
      };
      updateExperimentDashboard();
      if (p5Val) p5Val.textContent = parseFloat(p5Input.value) + "%";
      if (p4Val) p4Val.textContent = parseFloat(p4Input.value) + "%";
      if (pity5Val) pity5Val.textContent = parseInt(pity5Input.value, 10);
      if (pity4Val) pity4Val.textContent = parseInt(pity4Input.value, 10);
      if (featuredVal)
        featuredVal.textContent =
          Math.round(parseFloat(featuredInput.value)) + "%";
      if (nVal) nVal.textContent = parseInt(nInput.value, 10);
      if (costVal) costVal.textContent = "¥" + parseInt(costInput.value, 10);
      updateCharts();
      updateFormulaBox();
      updateParamSummary();
    }

    function updateParamSummary() {
      if (!paramSummaryItems) return;
      const p5 = parseFloat(p5Input.value);
      const p4 = parseFloat(p4Input.value);
      const k5 = parseInt(pity5Input.value, 10);
      const k4 = parseInt(pity4Input.value, 10);
      const featured = Math.round(parseFloat(featuredInput.value));
      const n = parseInt(nInput.value, 10);
      const cost = parseInt(costInput.value, 10);
      const modelName = "Genshin式";
      paramSummaryItems.innerHTML = `
        <span class="param-val">模型=${modelName}</span>
        <span class="param-val">p5=${p5}%</span>
        <span class="param-val">p4=${p4}%</span>
        <span class="param-val">5★保底=${k5}</span>
        <span class="param-val">4★保底=${k4}</span>
        <span class="param-val">限定概率=${featured}%</span>
        <span class="param-val">N=${n}</span>
        <span class="param-val">价格=¥${cost}</span>
      `;
    }

    function toggleParamPanel() {
      if (!paramContent || !paramSummary) return;
      const hidden = paramContent.classList.contains("hidden");
      if (hidden) {
        paramContent.classList.remove("hidden");
        paramSummary.classList.add("hidden");
        if (paramChevron) paramChevron.style.transform = "rotate(180deg)";
      } else {
        paramContent.classList.add("hidden");
        updateParamSummary();
        paramSummary.classList.remove("hidden");
        if (paramChevron) paramChevron.style.transform = "rotate(0deg)";
      }
    }

    // 计算理论上获得5★的期望抽数（考虑保底和软保底机制）
    function calculateTheoretical5StarCost(p5, k5, cost) {
      let expectedDraws = 0;
      let survivalProb = 1; // 到第i抽还没出5★的概率

      for (let i = 1; i <= k5; i++) {
        let currentProb = p5;

        // 软保底机制：从75抽开始概率递增（模拟原神机制）
        if (i >= 75 && i < k5) {
          // 软保底期间，概率逐渐增加
          const softPityBonus = (i - 74) * 0.06; // 每抽增加6%
          currentProb = Math.min(1, p5 + softPityBonus);
        } else if (i >= k5) {
          // 硬保底：第90抽必出
          currentProb = 1;
        }

        // 第i抽出5★的概率 = 前面没出 * 这抽出
        const probAtDraw = survivalProb * currentProb;
        expectedDraws += i * probAtDraw;

        // 更新存活概率（到下一抽还没出的概率）
        survivalProb *= 1 - currentProb;

        // 如果存活概率很小，可以提前结束
        if (survivalProb < 0.0001) break;
      }

      return expectedDraws * cost;
    }

    // 计算理论上获得限定5★的期望花费（考虑50/50和大保底机制）
    function calculateTheoreticalFeaturedCost(p5, k5, featuredRate, cost) {
      const base5StarCost = calculateTheoretical5StarCost(p5, k5, cost);

      // 正确的50/50机制建模：
      // 状态转移：小保底 -> (成功获得限定 | 歪了进入大保底) -> 大保底 -> 必定获得限定
      //
      // 从小保底状态开始的期望花费：
      // E = featuredRate * base5StarCost + (1 - featuredRate) * (base5StarCost + base5StarCost)
      // 第一项：直接获得限定的情况
      // 第二项：歪了之后还需要再抽一个5★的情况

      const expectedCostFromSmallPity =
        featuredRate * base5StarCost +
        (1 - featuredRate) * (base5StarCost + base5StarCost);

      return expectedCostFromSmallPity;
    }

    // 更新实验仪表盘
    function updateExperimentDashboard() {
      const cost = parseInt(costInput.value, 10);
      const p5 = parseFloat(p5Input.value) / 100;
      const k5 = parseInt(pity5Input.value, 10);
      const featuredRate = parseFloat(featuredInput.value) / 100;

      // 计算理论值 - 考虑保底机制
      const theory5StarCost = calculateTheoretical5StarCost(p5, k5, cost);
      const theoryFeaturedCost = calculateTheoreticalFeaturedCost(
        p5,
        k5,
        featuredRate,
        cost
      ); // 考虑50/50机制

      // 更新五星花费统计
      if (avgCost5StarTheoryEl) {
        avgCost5StarTheoryEl.textContent = `¥${Math.round(theory5StarCost)}`;
      }
      if (avgCostFeaturedTheoryEl) {
        avgCostFeaturedTheoryEl.textContent = `¥${Math.round(
          theoryFeaturedCost
        )}`;
      }

      // 实验数据统计
      const stats = experimentStats;
      if (totalExperimentsEl) {
        totalExperimentsEl.textContent = stats.totalExperiments.toString();
      }

      if (stats.costs5Star.length > 0) {
        const avg5Star =
          stats.costs5Star.reduce((a, b) => a + b, 0) / stats.costs5Star.length;
        const avgFeatured =
          stats.costsFeatured.length > 0
            ? stats.costsFeatured.reduce((a, b) => a + b, 0) /
              stats.costsFeatured.length
            : 0;

        if (avgCost5StarExpEl) {
          avgCost5StarExpEl.textContent = `¥${Math.round(avg5Star)}`;
        }
        if (avgCostFeaturedExpEl) {
          avgCostFeaturedExpEl.textContent = `¥${Math.round(avgFeatured)}`;
        }

        // 计算统计指标
        const sortedCosts = [...stats.costs5Star].sort((a, b) => a - b);
        const minCost = sortedCosts[0];
        const maxCost = sortedCosts[sortedCosts.length - 1];
        const medianCost = sortedCosts[Math.floor(sortedCosts.length / 2)];

        // 计算标准差
        const mean = avg5Star;
        const variance =
          stats.costs5Star.reduce(
            (acc, cost) => acc + Math.pow(cost - mean, 2),
            0
          ) / stats.costs5Star.length;
        const stdDev = Math.sqrt(variance);

        if (minCostEl) minCostEl.textContent = `¥${Math.round(minCost)}`;
        if (maxCostEl) maxCostEl.textContent = `¥${Math.round(maxCost)}`;
        if (medianCostEl)
          medianCostEl.textContent = `¥${Math.round(medianCost)}`;
        if (costStdEl) costStdEl.textContent = `¥${Math.round(stdDev)}`;

        // 成功率（获得至少一个5星的比例）
        const successRate =
          (stats.costs5Star.length / Math.max(1, stats.totalExperiments)) * 100;
        if (successRateEl)
          successRateEl.textContent = `${successRate.toFixed(1)}%`;

        // 保底统计
        if (stats.pityCountsWhen5Star.length > 0) {
          const avgPityCount =
            stats.pityCountsWhen5Star.reduce((a, b) => a + b, 0) /
            stats.pityCountsWhen5Star.length;
          if (avgPityCountEl)
            avgPityCountEl.textContent = Math.round(avgPityCount).toString();

          const softPityRate =
            (stats.softPityTriggers / stats.pityCountsWhen5Star.length) * 100;
          const hardPityRate =
            (stats.hardPityTriggers / stats.pityCountsWhen5Star.length) * 100;

          if (softPityRateEl)
            softPityRateEl.textContent = `${softPityRate.toFixed(1)}%`;
          if (hardPityRateEl)
            hardPityRateEl.textContent = `${hardPityRate.toFixed(1)}%`;
        }

        // 歪率统计
        const total5Stars = stats.costs5Star.length;
        const missRate =
          total5Stars > 0 ? (stats.missedFeatured / total5Stars) * 100 : 0;
        if (missRateEl) missRateEl.textContent = `${missRate.toFixed(1)}%`;
      } else {
        // 重置显示
        if (avgCost5StarExpEl) avgCost5StarExpEl.textContent = "¥0";
        if (avgCostFeaturedExpEl) avgCostFeaturedExpEl.textContent = "¥0";
        if (successRateEl) successRateEl.textContent = "0%";
        if (maxCostEl) maxCostEl.textContent = "¥0";
        if (minCostEl) minCostEl.textContent = "¥0";
        if (costStdEl) costStdEl.textContent = "¥0";
        if (medianCostEl) medianCostEl.textContent = "¥0";
        if (softPityRateEl) softPityRateEl.textContent = "0%";
        if (hardPityRateEl) hardPityRateEl.textContent = "0%";
        if (avgPityCountEl) avgPityCountEl.textContent = "0";
        if (missRateEl) missRateEl.textContent = "0%";
      }
    }
    function initFormulaBox(el, opts) {
      const box = document.createElement("div");
      const tabs = document.createElement("div");
      tabs.className = "flex gap-2 mb-2";
      const btnLatex = document.createElement("button");
      btnLatex.className =
        "px-2 py-1 rounded-md border border-white/15 bg-white/5";
      btnLatex.textContent = "公式";
      const btnCode = document.createElement("button");
      btnCode.className =
        "px-2 py-1 rounded-md border border-white/15 bg-white/5";
      btnCode.textContent = "代码";
      const copyBtn = document.createElement("button");
      copyBtn.className =
        "ml-auto px-2 py-1 rounded-md border border-white/15 bg-white/5";
      copyBtn.textContent = "复制";
      const content = document.createElement("div");
      content.className = "text-sm formula-scroll";
      tabs.appendChild(btnLatex);
      tabs.appendChild(btnCode);
      tabs.appendChild(copyBtn);
      box.appendChild(tabs);
      box.appendChild(content);
      el.innerHTML = "";
      el.appendChild(box);
      function setView(view) {
        if (view === "latex") {
          content.innerHTML = opts.latex;
          if (typeof renderMathInElement !== "undefined")
            renderMathInElement(content, {
              delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true },
              ],
            });
        } else {
          const pre = document.createElement("pre");
          pre.className = "code-py";
          function escapeHtml(s) {
            return s
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
          }
          function highlightPy(src) {
            const text = escapeHtml(src);
            let out = "";
            let i = 0;
            let state = "txt";
            let quote = "";
            let buf = "";
            function flush(type, s) {
              if (!s) return;
              if (type === "str")
                out += '<span class="py-str">' + s + "</span>";
              else if (type === "com")
                out += '<span class="py-com">' + s + "</span>";
              else out += s;
            }
            while (i < text.length) {
              const ch = text[i];
              const nch = i + 1 < text.length ? text[i + 1] : "";
              if (state === "txt") {
                if (ch === "\n") {
                  flush("txt", buf + "\n");
                  buf = "";
                  i++;
                  continue;
                }
                if (ch === "#") {
                  flush("txt", buf);
                  buf = "";
                  state = "com";
                  continue;
                }
                if (ch === '"' || ch === "'") {
                  flush("txt", buf);
                  buf = ch;
                  quote = ch;
                  state = "str";
                  i++;
                  continue;
                }
                buf += ch;
                i++;
              } else if (state === "str") {
                buf += ch;
                if (ch === "\\") {
                  if (nch) {
                    buf += nch;
                    i += 2;
                    continue;
                  }
                }
                if (ch === quote) {
                  flush("str", buf);
                  buf = "";
                  state = "txt";
                }
                i++;
              } else {
                if (ch === "\n") {
                  flush("com", buf);
                  buf = "";
                  state = "txt";
                  out += "\n";
                  i++;
                  continue;
                }
                buf += ch;
                i++;
              }
            }
            flush(
              state === "str" ? "str" : state === "com" ? "com" : "txt",
              buf
            );
            out = out.replace(
              /\b(True|False|None|and|or|not|if|elif|else|for|in|while|break|continue|return|def|class|import|from|as|with|try|except|finally|lambda|pass|raise|yield|global|nonlocal|assert|del|is)\b/g,
              '<span class="py-kw">$1</span>'
            );
            out = out.replace(
              /\b(\d+(?:\.\d+)?)\b/g,
              '<span class="py-num">$1</span>'
            );
            return out;
          }
          pre.innerHTML = highlightPy(opts.code);
          content.innerHTML = "";
          content.appendChild(pre);
        }
      }
      btnLatex.addEventListener("click", () => {
        logPanelState("latex:before");
        setView("latex");
        if (typeof renderMathInElement !== "undefined") {
          renderMathInElement(content, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true },
            ],
          });
        }
        setTimeout(() => logPanelState("latex:after"), 50);
        applyLockedTheoryWidths();
      });
      btnCode.addEventListener("click", () => {
        logPanelState("code:before");
        setView("code");
        setTimeout(() => logPanelState("code:after"), 50);
        applyLockedTheoryWidths();
      });
      copyBtn.addEventListener("click", () => {
        const txt = content.textContent || "";
        navigator.clipboard && navigator.clipboard.writeText(txt);
      });
      setView(opts.defaultView || "latex");
    }
    function updateFormulaBox() {
      // 在理论模式下不更新公式框，保持静态内容
      if (currentMode === "theory") {
        console.log("理论模式：跳过公式框更新，保持静态内容");
        return;
      }
      console.log("非理论模式：更新动态公式框");
      const n = parseInt(nInput.value, 10);
      const p5 = parseFloat(p5Input.value) / 100;
      const p4 = parseFloat(p4Input.value) / 100;
      const k5 = parseInt(pity5Input.value, 10);
      const k4 = parseInt(pity4Input.value, 10);
      const latex =
        "$$\\text{保底调度模型}\\\\" +
        "\\text{基础概率 }p_5,p_4;\\ \\text{保底阈值 }k_5,k_4.\\\\" +
        "p_t=\\begin{cases}1,& t\\ge k_5\\\\ 1,& t\\ge k_4\\\\ p_5+p_4,& t<k_4 \\end{cases},\\\\" +
        "\\text{时序理论命中： }P(\\ge 1)=1-\\prod_{t=1}^n(1-p_t).\\\\" +
        "\\text{首命中分布： }P(T=k)=p_k\\cdot\\prod_{t=1}^{k-1}(1-p_t).\\\\" +
        "\\text{期望抽数： }\\mathbb{E}[T]=\\sum_{k\\ge 1}P(T\\ge k).\\\\" +
        "\\text{成本期望（单价 }c\\text{）： }\\mathbb{E}[C]=c\\cdot\\mathbb{E}[T].$$";
      const code =
        "# sequential theory for >=4★\n" +
        "pt = [1 if (t+1)>=k5 or (t+1)>=k4 else (p5+p4) for t in range(n)]\n" +
        "P_ge1 = 1.0\n" +
        "for x in pt: P_ge1 *= (1 - x)\n" +
        "P_ge1 = 1 - P_ge1\n" +
        "# first-hit PMF\n" +
        "pmf = []\n" +
        "prod = 1.0\n" +
        "for k,x in enumerate(pt, start=1):\n" +
        "    pmf.append(prod * x)\n" +
        "    prod *= (1 - x)";
      initFormulaBox(formulaBoxEl, { latex, code, defaultView: "latex" });
    }

    function initVideoInterface() {
      const urlInput = document.getElementById("gacha-video-url");
      const loadBtn = document.getElementById("gacha-video-load");
      const slot = document.getElementById("gacha-video-slot");
      const saveNotesBtn = document.getElementById("save-notes");
      const notesTextarea = document.getElementById("theory-notes");

      if (!loadBtn || !urlInput || !slot) return;

      // 视频加载功能
      function loadVideo(url) {
        if (!url) return;

        // 清空当前内容
        slot.innerHTML = "";

        // 检测视频类型并处理
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
          // YouTube视频处理
          let videoId = "";
          if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
          } else if (url.includes("watch?v=")) {
            videoId = url.split("watch?v=")[1].split("&")[0];
          }
          if (videoId) {
            url = `https://www.youtube.com/embed/${videoId}`;
          }
        } else if (url.includes("bilibili.com")) {
          // Bilibili视频处理
          const bvMatch = url.match(/BV[a-zA-Z0-9]+/);
          if (bvMatch) {
            url = `https://player.bilibili.com/player.html?bvid=${bvMatch[0]}`;
          }
        }

        const wrap = document.createElement("div");
        wrap.style.position = "relative";
        wrap.style.paddingTop = "56.25%"; // 16:9
        wrap.style.width = "100%";

        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        wrap.appendChild(iframe);
        slot.appendChild(wrap);
      }

      // 加载视频按钮事件
      loadBtn.addEventListener("click", function () {
        const url = (urlInput.value || "").trim();
        loadVideo(url);
      });

      // 回车键加载视频
      urlInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          const url = (urlInput.value || "").trim();
          loadVideo(url);
        }
      });

      // 预设视频按钮
      const videoButtons = document.querySelectorAll("[data-video-type]");
      videoButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          const videoType = this.getAttribute("data-video-type");
          let videoUrl = "";

          // 预设视频URL（可以根据需要修改）
          switch (videoType) {
            case "intro":
              videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // 示例URL
              break;
            case "gacha":
              videoUrl = "https://www.bilibili.com/video/BV1xx411c7mu"; // 示例URL
              break;
            case "pity":
              videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // 示例URL
              break;
            case "probability":
              videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // 示例URL
              break;
          }

          if (videoUrl) {
            urlInput.value = videoUrl;
            loadVideo(videoUrl);
          }
        });
      });

      // 知识点导航
      const topicButtons = document.querySelectorAll("[data-topic]");
      topicButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          const topic = this.getAttribute("data-topic");
          updateFormulaForTopic(topic);

          // 高亮当前选中的知识点
          topicButtons.forEach((b) =>
            b.classList.remove("bg-neon-blue/20", "border-neon-blue")
          );
          this.classList.add("bg-neon-blue/20", "border-neon-blue");
        });
      });

      // 学习笔记保存功能
      if (saveNotesBtn && notesTextarea) {
        saveNotesBtn.addEventListener("click", function () {
          const notes = notesTextarea.value;
          localStorage.setItem("gacha-theory-notes", notes);

          // 显示保存成功提示
          const originalText = saveNotesBtn.textContent;
          saveNotesBtn.textContent = "已保存";
          saveNotesBtn.classList.add("bg-green-600");

          setTimeout(() => {
            saveNotesBtn.textContent = originalText;
            saveNotesBtn.classList.remove("bg-green-600");
          }, 1500);
        });

        // 加载已保存的笔记
        const savedNotes = localStorage.getItem("gacha-theory-notes");
        if (savedNotes) {
          notesTextarea.value = savedNotes;
        }
      }
    }
    function initTheoryFormulaBox() {
      const formulaEl = document.getElementById("gacha-formula");
      if (!formulaEl) return;
      if (typeof renderMathInElement === "undefined") return;
      renderMathInElement(formulaEl, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    }

    // 根据知识点更新公式显示
    function updateFormulaForTopic(topic) {
      const formulaEl = document.getElementById("gacha-formula");
      if (!formulaEl) return;

      let formulaContent = "";

      switch (topic) {
        case "basic-probability":
          formulaContent = `
            <div class="text-sm font-medium mb-2">基础概率公式</div>
            <div class="space-y-2 text-sm">
              <div>$$P(A) = \\frac{\\text{有利结果数}}{\\text{总结果数}}$$</div>
              <div>$$0 \\leq P(A) \\leq 1$$</div>
              <div>$$P(\\Omega) = 1$$（必然事件）</div>
              <div>$$P(\\emptyset) = 0$$（不可能事件）</div>
            </div>
          `;
          break;
        case "conditional-probability":
          formulaContent = `
            <div class="text-sm font-medium mb-2">条件概率公式</div>
            <div class="space-y-2 text-sm">
              <div>$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$</div>
              <div>$$P(A \\cap B) = P(A|B) \\cdot P(B)$$</div>
              <div class="text-xs text-gray-400 mt-2">其中 $$P(B) > 0$$</div>
            </div>
          `;
          break;
        case "independence":
          formulaContent = `
            <div class="text-sm font-medium mb-2">独立性</div>
            <div class="space-y-2 text-sm">
              <div>$$P(A \\cap B) = P(A) \\cdot P(B)$$</div>
              <div>$$P(A|B) = P(A)$$</div>
              <div>$$P(B|A) = P(B)$$</div>
              <div class="text-xs text-gray-400 mt-2">事件A和B相互独立</div>
            </div>
          `;
          break;
        case "gacha-mechanics":
          formulaContent = `
            <div class="text-sm font-medium mb-2">抽卡机制公式</div>
            <div class="space-y-2 text-sm">
              <div>$$P(\\text{至少一次}) = 1 - (1-p)^n$$</div>
              <div>$$E[X] = \\frac{1}{p}$$（几何分布期望）</div>
              <div>$$P(\\text{保底}) = 1$$（第k抽必出）</div>
              <div class="text-xs text-gray-400 mt-2">其中 $$p$$ 为单抽概率，$$n$$ 为抽取次数</div>
            </div>
          `;
          break;
        default:
          formulaContent = `
            <div class="text-center text-gray-400 text-sm">
              选择左侧知识点查看相关公式
            </div>
          `;
      }

      formulaEl.innerHTML = formulaContent;

      // 重新渲染LaTeX公式
      if (typeof renderMathInElement !== "undefined") {
        renderMathInElement(formulaEl, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      }
    }
    p5Input.addEventListener("input", updateAll);
    p4Input.addEventListener("input", updateAll);
    pity5Input.addEventListener("input", updateAll);
    pity4Input.addEventListener("input", updateAll);
    featuredInput.addEventListener("input", updateAll);
    nInput.addEventListener("input", updateAll);
    costInput.addEventListener("input", updateAll);
    if (run1) run1.addEventListener("click", () => runOneSession());
    function drawOnceExperience() {
      appendLogEntry();
    }
    function runTenExperience() {
      for (let i = 0; i < 10; i++) drawOnceExperience();
    }
    if (singleBtn)
      singleBtn.addEventListener("click", () => drawOnceExperience());
    if (tenBtn) tenBtn.addEventListener("click", () => runTenExperience());
    if (run100) run100.addEventListener("click", () => runBatch(100));
    if (run1000) run1000.addEventListener("click", () => runBatch(1000));
    const view4Btn = document.getElementById("gacha-view-4plus");
    const view5Btn = document.getElementById("gacha-view-5");
    function setRareView(v) {
      rareView = v;
      if (view4Btn) view4Btn.classList.toggle("active", v === "4plus");
      if (view5Btn) view5Btn.classList.toggle("active", v === "5only");
      updateCharts();
    }
    if (view4Btn)
      view4Btn.addEventListener("click", () => setRareView("4plus"));
    if (view5Btn)
      view5Btn.addEventListener("click", () => setRareView("5only"));
    if (resetBtn)
      resetBtn.addEventListener("click", () => {
        resetLogsAndState();
        updateAll();
      });
    if (tabExp)
      tabExp.addEventListener("click", () => switchMode("experience"));
    if (tabExpt)
      tabExpt.addEventListener("click", () => switchMode("experiment"));
    if (tabTheory)
      tabTheory.addEventListener("click", () => switchMode("theory"));
    if (paramHeader) paramHeader.addEventListener("click", toggleParamPanel);
    if (paramSave)
      paramSave.addEventListener("click", () => {
        if (!paramContent || !paramSummary) return;
        paramContent.classList.add("hidden");
        updateParamSummary();
        paramSummary.classList.remove("hidden");
        if (paramChevron) paramChevron.style.transform = "rotate(0deg)";
      });
    window.addEventListener("resize", () => {
      updateCharts();
      logPanelState("resize");
      enforceTheoryRatio();
    });
    updateAll();
    updateCharts();
    switchMode("experience");
    initVideoInterface();
    initTheoryFormulaBox();
  }

  function setupAmongUsAnalyzer() {
    const priorInput = document.getElementById("au-prior");
    const accInput = document.getElementById("au-accuracy");
    const priorVal = document.getElementById("au-prior-val");
    const accVal = document.getElementById("au-accuracy-val");
    const controls = document.getElementById("au-evidence-controls");
    const resultEl = document.getElementById("au-result");
    const vizEl = document.getElementById("among-us-viz");
    const formulaEl = document.getElementById("among-us-formula");
    const chartCanvas = document.getElementById("au-trend-chart");

    if (!priorInput || !accInput || !controls) return;

    let evidenceCount = 0;
    let history = []; // Store probability history
    let chartInstance = null;

    // Initialize Chart
    if (chartCanvas && typeof Chart !== "undefined") {
      chartInstance = new Chart(chartCanvas, {
        type: "line",
        data: {
          labels: ["初始"],
          datasets: [
            {
              label: "内鬼概率",
              data: [0.2],
              borderColor: "#00f3ff",
              backgroundColor: "rgba(0, 243, 255, 0.1)",
              borderWidth: 2,
              pointBackgroundColor: "#00f3ff",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: (ctx) => `${(ctx.raw * 100).toFixed(1)}%`,
              },
            },
          },
          scales: {
            y: {
              min: 0,
              max: 1,
              ticks: { color: "#9ca3af", callback: (v) => `${v * 100}%` },
              grid: { color: "rgba(255, 255, 255, 0.1)" },
            },
            x: {
              ticks: { color: "#9ca3af" },
              grid: { display: false },
            },
          },
        },
      });
    }

    const evidenceList = [
      "在电力室附近发现了尸体",
      "红色玩家在监控室挂机",
      "蓝色玩家没有做刷卡任务",
      "看到绿色玩家使用了管道",
      "氧气室警报没人去修",
      "黄色玩家在反应堆附近徘徊",
      "紫色玩家从医疗室出来",
      "有人关闭了通讯室设备",
      "餐厅发现血迹",
      "导航室任务进度条没涨",
      "黑色玩家试图关门",
      "白色玩家在走廊突然停下",
      "粉色玩家一直跟着我",
      "青色玩家假装做倒垃圾任务",
      "仓库里有奇怪的声音",
      "有人在管理室查看地图",
      "护盾室的灯光闪烁",
      "引擎室发现有人躲藏",
      "武器室开火动画显示异常",
      "投票环节有人一直带节奏",
    ];

    function showEvidenceBubble(text) {
      if (!vizEl) return;
      // Remove existing bubble if any
      const existing = vizEl.querySelector(".evidence-bubble");
      if (existing) existing.remove();

      const bubble = document.createElement("div");
      bubble.className = "evidence-bubble";
      bubble.innerHTML = `<i class="fa-solid fa-exclamation-circle text-neon-blue mr-2"></i>${text}`;
      vizEl.appendChild(bubble);

      // Auto remove after 2.5 seconds
      setTimeout(() => {
        bubble.classList.add("fade-out");
        setTimeout(() => {
          if (bubble.parentNode) bubble.remove();
        }, 500);
      }, 2500);
    }

    function update() {
      const prior = parseInt(priorInput.value) / 100;
      const acc = parseInt(accInput.value) / 100;

      if (priorVal) priorVal.textContent = Math.round(prior * 100) + "%";
      if (accVal) accVal.textContent = Math.round(acc * 100) + "%";

      const lr = acc / (1 - acc);
      const totalLR = Math.pow(lr, evidenceCount);
      const oddsPrior = prior / (1 - prior);
      const oddsPosterior = oddsPrior * totalLR;
      const posterior = oddsPosterior / (1 + oddsPosterior);

      if (resultEl) resultEl.textContent = (posterior * 100).toFixed(1) + "%";

      renderViz(prior, posterior);
      renderFormula(prior, acc, evidenceCount, posterior);

      // Update Chart
      if (chartInstance) {
        // If evidence count is 0, reset chart
        if (evidenceCount === 0) {
          chartInstance.data.labels = ["初始"];
          chartInstance.data.datasets[0].data = [prior];
        } else {
          // Rebuild history if needed, but for now simple push if count increases
          // Actually, since this update() is called on input change too, we need to be careful.
          // Let's just rebuild the array based on current params to be consistent
          const dataPoints = [prior];
          const labels = ["初始"];
          let currentOdds = prior / (1 - prior);
          for (let i = 1; i <= evidenceCount; i++) {
            currentOdds *= lr;
            const p = currentOdds / (1 + currentOdds);
            dataPoints.push(p);
            labels.push(`证据${i}`);
          }
          chartInstance.data.labels = labels;
          chartInstance.data.datasets[0].data = dataPoints;
        }
        chartInstance.update();
      }
    }

    function renderViz(prior, posterior) {
      if (!vizEl) return;
      const isHigh = posterior > 0.8;
      const color = isHigh
        ? "text-red-500"
        : posterior > 0.5
        ? "text-orange-400"
        : "text-gray-400";
      vizEl.innerHTML = `
         <div class="text-center transition-all duration-500 transform ${
           isHigh ? "scale-110" : "scale-100"
         }">
           <i class="fa-solid fa-user-astronaut text-8xl ${color} mb-4"></i>
           <div class="text-xl ${color} font-bold">${
        isHigh ? "内鬼确认！" : "身份存疑"
      }</div>
         </div>
       `;
    }

    function renderFormula(prior, acc, k, post) {
      if (!formulaEl) return;
      const latex = `$$ P(\\text{Imp}|${k}\\text{Ev}) = \\frac{${acc.toFixed(
        2
      )}^{${k}} \\times ${prior.toFixed(2)}}{P(E)} \\approx ${(
        post * 100
      ).toFixed(1)}\\% $$`;
      formulaEl.innerHTML = latex;
      if (typeof renderMathInElement !== "undefined") {
        renderMathInElement(formulaEl, {
          delimiters: [{ left: "$$", right: "$$", display: true }],
        });
      }
    }

    function addEvidence() {
      evidenceCount++;
      update();
      renderButtons();
      const text =
        evidenceList[Math.floor(Math.random() * evidenceList.length)];
      showEvidenceBubble(text);
    }

    function resetEvidence() {
      evidenceCount = 0;
      update();
      renderButtons();
    }

    function renderButtons() {
      controls.innerHTML = "";
      const addBtn = document.createElement("button");
      addBtn.className =
        "px-3 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20";
      addBtn.textContent = "+ 发现疑点";
      addBtn.onclick = addEvidence;
      controls.appendChild(addBtn);

      const resetBtn = document.createElement("button");
      resetBtn.className =
        "px-3 py-1 rounded border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10";
      resetBtn.textContent = "重置";
      resetBtn.onclick = resetEvidence;
      controls.appendChild(resetBtn);

      const countSpan = document.createElement("span");
      countSpan.className = "ml-2 text-sm text-gray-400 self-center";
      countSpan.textContent = `当前证据: ${evidenceCount} 条`;
      controls.appendChild(countSpan);
    }

    priorInput.addEventListener("input", update);
    accInput.addEventListener("input", update);
    renderButtons();
    update();
  }

  function setupBayesLab() {
    const scenarioSel = document.getElementById("bayes-scenario");
    const baseInput = document.getElementById("bayes-base");
    const sensInput = document.getElementById("bayes-sens");
    const specInput = document.getElementById("bayes-spec");
    const baseVal = document.getElementById("bayes-base-val");
    const sensVal = document.getElementById("bayes-sens-val");
    const specVal = document.getElementById("bayes-spec-val");

    const posRateEl = document.getElementById("bayes-pos-rate");
    const ppvEl = document.getElementById("bayes-ppv");
    const vizEl = document.getElementById("bayes-viz");
    const derivationEl = document.getElementById("bayes-derivation");
    const legendEl = document.getElementById("bayes-legend");

    function annotateDerivation() {
      if (!derivationEl) return;
      const root = derivationEl.querySelector(".katex-html");
      if (!root) return;
      function applyHints(color, hints) {
        const spans = root.querySelectorAll(`span[style*="color: ${color}"]`);
        spans.forEach((el) => {
          const t = (el.textContent || "").replace(/\s+/g, "");
          const hint = hints[t];
          if (hint) {
            el.setAttribute("title", hint);
            el.setAttribute("aria-label", hint);
            el.setAttribute("data-hint", hint);
          }
        });
      }
      applyHints("red", {
        D: "事件成立（患病）",
        "P(+|D)": "真阳性率（Sensitivity）",
        "P(D)": "事件基础概率（Base Rate）",
      });
      applyHints("green", {
        "¬D": "健康（非事件）",
        "P(¬D)": "健康的基础概率",
      });
      applyHints("purple", {
        "P(+|¬D)": "假阳性率（False Positive Rate）",
      });
    }

    if (!scenarioSel || !baseInput || !sensInput || !specInput) return;

    const scenarios = {
      medical: { base: 0.1, sens: 99, spec: 95 },
      security: { base: 1, sens: 95, spec: 90 },
      cheat: { base: 5, sens: 98, spec: 98 },
      custom: { base: 1, sens: 99, spec: 95 },
    };

    function setControls(s) {
      baseInput.value = s.base;
      sensInput.value = s.sens;
      specInput.value = s.spec;
      update();
    }

    scenarioSel.addEventListener("change", (e) => {
      const v = e.target.value;
      if (scenarios[v]) setControls(scenarios[v]);
    });

    function update() {
      const base = parseFloat(baseInput.value) / 100;
      const sens = parseFloat(sensInput.value) / 100;
      const spec = parseFloat(specInput.value) / 100;

      if (baseVal) baseVal.textContent = baseInput.value + "%";
      if (sensVal) sensVal.textContent = sensInput.value + "%";
      if (specVal) specVal.textContent = specInput.value + "%";

      const falsePosRate = 1 - spec;
      const pPos = sens * base + falsePosRate * (1 - base);
      const ppv = (sens * base) / pPos;

      if (posRateEl) posRateEl.textContent = (pPos * 100).toFixed(2) + "%";
      if (ppvEl) ppvEl.textContent = (ppv * 100).toFixed(2) + "%";
      if (legendEl) {
        const total = 1000;
        const infected = Math.round(total * base);
        const healthy = total - infected;
        const tp = Math.round(infected * sens);
        const fn = infected - tp;
        const tn = Math.round(healthy * spec);
        const fp = healthy - tn;
        legendEl.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="inline-block rounded-sm" style="width:10px;height:10px;background:#ef4444"></span>
            <span>TP 真阳性 (${tp})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block rounded-sm" style="width:10px;height:10px;background:#a855f7"></span>
            <span>FP 假阳性 (${fp})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block rounded-sm" style="width:10px;height:10px;background:#7f1d1d"></span>
            <span>FN 假阴性 (${fn})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block rounded-sm" style="width:10px;height:10px;background:#10b981"></span>
            <span>TN 真阴性 (${tn})</span>
          </div>
        `;
      }
      if (derivationEl) {
        const scenario = (scenarioSel && scenarioSel.value) || "custom";
        const scenarioName = {
          medical: "罕见病检测",
          security: "机场安检",
          cheat: "反作弊系统",
          custom: "自定义场景",
        }[scenario];
        const notesMap = {
          medical: {
            D: "患病",
            notD: "健康",
            posD: "真阳性率（检测阳性且患病）",
            posNotD: "假阳性率（健康却被误报）",
          },
          security: {
            D: "携带违禁品",
            notD: "正常乘客",
            posD: "真阳性率（安检识别违禁品）",
            posNotD: "假阳性率（正常误报为危险）",
          },
          cheat: {
            D: "作弊/外挂存在",
            notD: "正常玩家",
            posD: "真阳性率（检测正确识别作弊）",
            posNotD: "假阳性率（正常被误判作弊）",
          },
          custom: {
            D: "事件成立",
            notD: "事件不成立",
            posD: "真阳性率",
            posNotD: "假阳性率",
          },
        }[scenario];
        const latex = `$$\\begin{aligned}
\\text{设颜色：}\\ &\\textcolor{red}{D},\\ \\textcolor{green}{\\neg D},\\ \\textcolor{red}{P(+|D)},\\ \\textcolor{purple}{P(+|\\neg D)} \\\\
P(+) &= \\textcolor{red}{P(+|D)}\\,\\textcolor{red}{P(D)} + \\textcolor{purple}{P(+|\\neg D)}\\,\\textcolor{green}{P(\\neg D)} \\\\
PPV &= \\frac{\\textcolor{red}{P(+|D)}\\,\\textcolor{red}{P(D)}}{\\textcolor{red}{P(+|D)}\\,\\textcolor{red}{P(D)}+\\textcolor{purple}{P(+|\\neg D)}\\,\\textcolor{green}{P(\\neg D)}} \\\\
&= \\frac{${sens.toFixed(3)}\\times${base.toFixed(3)}}{${sens.toFixed(
          3
        )}\\times${base.toFixed(3)}+${falsePosRate.toFixed(3)}\\times${(
          1 - base
        ).toFixed(3)}} \\\\
&\\approx ${(ppv * 100).toFixed(2)}\\%
\\end{aligned}$$`;
        const descHtml = `
          <div class="mt-2 text-xs text-gray-400">
            当前场景：${scenarioName}；
            <span style="color:#ef4444">D</span> 表示 ${notesMap.D}；
            <span style="color:#10b981">¬D</span> 表示 ${notesMap.notD}；
            <span style="color:#ef4444">P(+|D)</span> 为 ${notesMap.posD}；
            <span style="color:#a855f7">P(+|¬D)</span> 为 ${notesMap.posNotD}；
            <span class="ml-1">真阳性事件：测试阳性且 D 成立。</span>
          </div>
        `;
        derivationEl.innerHTML = `<div>${latex}</div>${descHtml}`;
        if (typeof renderMathInElement !== "undefined") {
          renderMathInElement(derivationEl, {
            delimiters: [{ left: "$$", right: "$$", display: true }],
          });
          if (typeof requestAnimationFrame !== "undefined") {
            requestAnimationFrame(annotateDerivation);
          } else {
            setTimeout(annotateDerivation, 0);
          }
        }
      }

      renderViz(base, sens, spec);
    }

    function renderViz(base, sens, spec) {
      if (!vizEl) return;
      const total = 1000;
      const infected = Math.round(total * base);
      const healthy = total - infected;

      const tp = Math.round(infected * sens);
      const fn = infected - tp;

      const tn = Math.round(healthy * spec);
      const fp = healthy - tn;

      let canvas = vizEl.querySelector("canvas");
      if (!canvas) {
        canvas = document.createElement("canvas");
        vizEl.innerHTML = "";
        vizEl.appendChild(canvas);
      }

      const rect = vizEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      const cols = 50;
      const rows = 20;
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;
      const radius = Math.min(cellW, cellH) * 0.35;

      let dots = [];
      for (let i = 0; i < tp; i++) dots.push({ color: "#ef4444" });
      for (let i = 0; i < fn; i++) dots.push({ color: "#7f1d1d" });
      for (let i = 0; i < fp; i++) dots.push({ color: "#a855f7" });
      for (let i = 0; i < tn; i++) dots.push({ color: "#10b981" });

      dots.forEach((dot, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        const x = c * cellW + cellW / 2;
        const y = r * cellH + cellH / 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      });
    }

    baseInput.addEventListener("input", update);
    sensInput.addEventListener("input", update);
    specInput.addEventListener("input", update);

    setControls(scenarios.medical);
  }

  function setupMontyHall() {
    const doorsContainer = document.getElementById("monty-doors");
    const keepBtn = document.getElementById("monty-keep");
    const switchBtn = document.getElementById("monty-switch");
    const msgEl = document.getElementById("monty-message");
    const totalRunsEl = document.getElementById("monty-total-runs");
    const keepRateEl = document.getElementById("monty-keep-rate");
    const keepBar = document.getElementById("monty-keep-bar");
    const switchRateEl = document.getElementById("monty-switch-rate");
    const switchBar = document.getElementById("monty-switch-bar");
    const montyDerivEl = document.getElementById("monty-derivation");

    const sim10Btn = document.getElementById("monty-sim-10");
    const sim100Btn = document.getElementById("monty-sim-100");
    const resetBtn = document.getElementById("monty-reset");

    if (!doorsContainer || !keepBtn || !switchBtn) return;

    let state = "pick";
    let prizeDoor = 0;
    let selectedDoor = -1;
    let openedDoor = -1;
    let stats = { keepWins: 0, keepTotal: 0, switchWins: 0, switchTotal: 0 };

    function initGame() {
      state = "pick";
      prizeDoor = Math.floor(Math.random() * 3);
      selectedDoor = -1;
      openedDoor = -1;
      renderDoors();
      updateMessage("请选择一扇门开始游戏");
      keepBtn.disabled = true;
      switchBtn.disabled = true;
      keepBtn.classList.add("opacity-50");
      switchBtn.classList.add("opacity-50");
    }

    function renderDoors(revealAll = false) {
      doorsContainer.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const door = document.createElement("div");
        door.className =
          "relative w-24 h-36 cursor-pointer transition-transform duration-300 transform hover:scale-105";

        const content = document.createElement("div");
        content.className =
          "absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700";
        if (i === prizeDoor) {
          content.innerHTML =
            '<i class="fa-solid fa-car text-4xl text-neon-green"></i>';
        } else {
          content.innerHTML =
            '<i class="fa-solid fa-horse-head text-4xl text-gray-500"></i>';
        }
        door.appendChild(content);

        const cover = document.createElement("div");
        let coverClass =
          "absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg border-2 border-indigo-400 flex items-center justify-center text-2xl font-bold text-white transition-all duration-500 origin-left";

        if (i === selectedDoor) {
          coverClass +=
            " ring-4 ring-neon-purple shadow-[0_0_15px_rgba(167,139,250,0.5)]";
        }

        if (
          revealAll ||
          i === openedDoor ||
          (state === "result" && i === prizeDoor)
        ) {
          coverClass += " opacity-0 pointer-events-none";
          cover.style.transform = "perspective(1000px) rotateY(-110deg)";
        }

        cover.className = coverClass;
        cover.textContent = i + 1;
        door.appendChild(cover);

        door.onclick = () => handleDoorClick(i);
        doorsContainer.appendChild(door);
      }
    }

    function updateMessage(text, type = "info") {
      if (!msgEl) return;
      msgEl.innerHTML = text;
      if (type === "host") {
        msgEl.className =
          "text-center text-lg min-h-[1.75rem] text-neon-purple font-bold";
        msgEl.innerHTML = `<i class="fa-solid fa-microphone mr-2"></i>${text}`;
      } else {
        msgEl.className = "text-center text-lg min-h-[1.75rem] text-gray-200";
      }
    }

    const hostMessages = [
      "哼哼，让我看看...这扇门后面只有山羊！",
      "作为主持人，我不能让你选空，所以我帮你排除一个错误答案。",
      "看来你运气不错（或者很差？），我打开了这扇门！",
      "见证奇迹的时刻... 咩~ 是山羊！",
    ];

    function handleDoorClick(doorIdx) {
      if (state !== "pick") return;
      selectedDoor = doorIdx;

      const availableDoors = [0, 1, 2].filter(
        (d) => d !== prizeDoor && d !== selectedDoor
      );
      openedDoor =
        availableDoors[Math.floor(Math.random() * availableDoors.length)];

      state = "decide";
      renderDoors();
      // Random host message
      const msg = hostMessages[Math.floor(Math.random() * hostMessages.length)];
      updateMessage(
        `${msg}<br>主持人打开了 ${openedDoor + 1} 号门（山羊）。你要换门吗？`,
        "host"
      );

      keepBtn.disabled = false;
      switchBtn.disabled = false;
      keepBtn.classList.remove("opacity-50");
      switchBtn.classList.remove("opacity-50");
    }

    function handleDecision(doSwitch) {
      if (state !== "decide") return;

      const finalDoor = doSwitch
        ? [0, 1, 2].find((d) => d !== selectedDoor && d !== openedDoor)
        : selectedDoor;
      const win = finalDoor === prizeDoor;

      if (doSwitch) {
        stats.switchTotal++;
        if (win) stats.switchWins++;
      } else {
        stats.keepTotal++;
        if (win) stats.keepWins++;
      }

      state = "result";
      renderDoors(true);
      updateMessage(
        win
          ? doSwitch
            ? "换门成功！你赢得了跑车！"
            : "坚持成功！你赢得了跑车！"
          : "很遗憾，是山羊。"
      );
      updateStats();

      setTimeout(initGame, 2500);
    }

    function updateMessage(msg) {
      msgEl.textContent = msg;
    }

    function updateStats() {
      const keepRate =
        stats.keepTotal > 0 ? (stats.keepWins / stats.keepTotal) * 100 : 0;
      const switchRate =
        stats.switchTotal > 0
          ? (stats.switchWins / stats.switchTotal) * 100
          : 0;
      const total = stats.keepTotal + stats.switchTotal;

      totalRunsEl.textContent = total;
      keepRateEl.textContent = keepRate.toFixed(1) + "%";
      keepBar.style.width = keepRate + "%";

      switchRateEl.textContent = switchRate.toFixed(1) + "%";
      switchBar.style.width = switchRate + "%";

      if (montyDerivEl) {
        if (total > 100) {
          montyDerivEl.classList.remove("hidden");
          const latex = `$$\\begin{aligned}
P(\\text{win}|\\text{keep}) &= P(\\text{初选正确}) = \\frac{1}{3} \\\\
P(\\text{win}|\\text{switch}) &= P(\\text{初选错误}) = \\frac{2}{3}
\\end{aligned}$$`;
          const html = `
            <div class="text-sm text-gray-200 mb-2">理论推导</div>
            <div class="mb-3">${latex}</div>
            <div class="text-xs text-gray-400 space-y-1">
              <div>情形 1：奖品在初选门（概率 1/3），主持人开一扇羊门，换门会失去奖品 → 换门输</div>
              <div>情形 2：奖品不在初选门（概率 2/3），主持人开一扇羊门，换到剩余未开门即为奖品 → 换门赢</div>
              <div>因此：换门策略的胜率 = 初选错误的概率 = 2/3；坚持策略胜率 = 初选正确的概率 = 1/3</div>
              <div>当前模拟：坚持 ${keepRate.toFixed(
                1
              )}%，换门 ${switchRate.toFixed(1)}%</div>
            </div>
          `;
          montyDerivEl.innerHTML = html;
          if (typeof renderMathInElement !== "undefined") {
            renderMathInElement(montyDerivEl, {
              delimiters: [{ left: "$$", right: "$$", display: true }],
            });
          }
        } else {
          montyDerivEl.classList.add("hidden");
          montyDerivEl.innerHTML = "";
        }
      }
    }

    function runSimulation(n) {
      for (let i = 0; i < n; i++) {
        const doSwitch = Math.random() < 0.5;
        const p = Math.floor(Math.random() * 3);
        const s = Math.floor(Math.random() * 3);
        const avail = [0, 1, 2].filter((d) => d !== p && d !== s);
        const o = avail[Math.floor(Math.random() * avail.length)];
        const final = doSwitch ? [0, 1, 2].find((d) => d !== s && d !== o) : s;
        const win = final === p;

        if (doSwitch) {
          stats.switchTotal++;
          if (win) stats.switchWins++;
        } else {
          stats.keepTotal++;
          if (win) stats.keepWins++;
        }
      }
      updateStats();
    }

    keepBtn.addEventListener("click", () => handleDecision(false));
    switchBtn.addEventListener("click", () => handleDecision(true));

    if (sim10Btn) sim10Btn.addEventListener("click", () => runSimulation(10));
    if (sim100Btn)
      sim100Btn.addEventListener("click", () => runSimulation(100));
    if (resetBtn)
      resetBtn.addEventListener("click", () => {
        stats = { keepWins: 0, keepTotal: 0, switchWins: 0, switchTotal: 0 };
        updateStats();
        initGame();
      });

    initGame();
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      setupPerlinBackground();
    } catch (e) {
      console.warn("Perlin background setup failed:", e);
    }
    try {
      setupTitleBar();
    } catch (e) {
      console.warn("Title bar setup failed:", e);
    }
    try {
      setupDice();
    } catch (e) {
      console.warn("Dice setup failed:", e);
    }
    try {
      setupConditionalProbability();
    } catch (e) {
      console.warn("Conditional setup failed:", e);
    }
    try {
      setupVennSandbox();
    } catch (e) {
      console.warn("Venn sandbox setup failed:", e);
    }
    try {
      setupCritExperiment();
    } catch (e) {
      console.warn("Crit experiment setup failed:", e);
    }
    try {
      setupGachaLab();
    } catch (e) {
      console.warn("Gacha lab setup failed:", e);
    }
    try {
      setupAmongUsAnalyzer();
    } catch (e) {
      console.warn("Among Us analyzer setup failed:", e);
    }
    try {
      setupBayesLab();
    } catch (e) {
      console.warn("Bayes lab setup failed:", e);
    }
    try {
      setupMontyHall();
    } catch (e) {
      console.warn("Monty Hall setup failed:", e);
    }
  });
})();
