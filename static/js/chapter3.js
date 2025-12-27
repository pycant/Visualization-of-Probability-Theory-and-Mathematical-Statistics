/**
 * Chapter 3: 多维随机变量及其分布 - 交互式可视化
 * 实现联合分布、边际分布、独立性检验等概念的可视化
 */

class Chapter3Visualizer {
  constructor() {
    this.currentSamples = [];
    this.noise =
      (window.Noise2D && window.Noise2D.create({ seed: 1337 })) || null;
    this.bgNoise =
      (window.Noise2D && window.Noise2D.create({ seed: 1337 })) || null;
    this.bgTime = 0;
    this.bgConfig = { cols: 200, rows: 120, scale: 0.02 };
    this.bgCanvas = null;
    this.bgCtx = null;
    this.parameters = {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      nSamples: 1000,
      distType: "normal",
    };

    this.independenceTest = {
      sampleSize: 1000,
      trueCorrelation: 0,
      noiseLevel: 0.1,
      scenario: "social",
      alpha: 0.05,
    };

    this.init();
  }

  init() {
    this.initializeEventListeners();
    this.initializeCanvases();
    this.generateInitialSamples();
    this.updateAllVisualizations();
    this.initializeIndependenceTest();
    this.startBackgroundContours();
  }

  initializeEventListeners() {
    // 3.1 联合分布参数控制
    const paramSliders = [
      "mu1-slider",
      "mu2-slider",
      "sigma1-slider",
      "sigma2-slider",
      "rho-slider",
      "n-samples-slider",
    ];

    paramSliders.forEach((id) => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener("input", (e) =>
          this.updateParameter(id, e.target.value)
        );
      }
    });

    // 分布类型选择
    const distTypeSelect = document.getElementById("dist-type");
    if (distTypeSelect) {
      distTypeSelect.addEventListener("change", (e) => {
        this.parameters.distType = e.target.value;
        this.generateSamples();
        this.updateAllVisualizations();
      });
    }

    // 按钮事件
    const generateBtn = document.getElementById("generate-samples");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        this.generateSamples();
        this.updateAllVisualizations();
      });
    }

    const resetBtn = document.getElementById("reset-params");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetParameters());
    }

    // 联合概率计算
    const calcProbBtn = document.getElementById("calc-joint-prob");
    if (calcProbBtn) {
      calcProbBtn.addEventListener("click", () =>
        this.calculateJointProbability()
      );
    }

    // 3.2 独立性检验控制
    this.initializeIndependenceEventListeners();
  }

  initializeIndependenceEventListeners() {
    const indepSliders = [
      "sample-size-slider",
      "true-correlation-slider",
      "noise-level-slider",
    ];

    indepSliders.forEach((id) => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener("input", (e) =>
          this.updateIndependenceParameter(id, e.target.value)
        );
      }
    });

    // 场景选择
    const scenarioSelect = document.getElementById("scenario-select");
    if (scenarioSelect) {
      scenarioSelect.addEventListener("change", (e) => {
        this.independenceTest.scenario = e.target.value;
        this.updateScenarioLabels();
      });
    }

    // 显著性水平
    const alphaSelect = document.getElementById("alpha-level");
    if (alphaSelect) {
      alphaSelect.addEventListener("change", (e) => {
        this.independenceTest.alpha = parseFloat(e.target.value);
      });
    }

    // 独立性检验按钮
    const runTestBtn = document.getElementById("run-independence-test");
    if (runTestBtn) {
      runTestBtn.addEventListener("click", () => this.runIndependenceTest());
    }

    const batchTestBtn = document.getElementById("batch-test");
    if (batchTestBtn) {
      batchTestBtn.addEventListener("click", () => this.runBatchTest());
    }

    // 边际分布按钮
    const marginalBtns = [
      "show-marginal-x",
      "show-marginal-y",
      "animate-integration",
    ];

    marginalBtns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => this.handleMarginalAction(id));
      }
    });
  }

  initializeCanvases() {
    // 获取所有画布元素
    this.canvases = {
      contour: document.getElementById("contour-canvas"),
      scatter: document.getElementById("scatter-canvas"),
      marginal: document.getElementById("marginal-canvas"),
      conditionalProb: document.getElementById("conditional-prob-chart"),
      glow: document.getElementById("marginal-glow"),
    };

    // 初始化画布上下文
    Object.keys(this.canvases).forEach((key) => {
      if (this.canvases[key]) {
        this.canvases[key].ctx = this.canvases[key].getContext("2d");
      }
    });

    this.bgCanvas = document.getElementById("bg-noise");
    if (this.bgCanvas) {
      this.bgCtx = this.bgCanvas.getContext("2d");
      this.bgLayer = document.createElement("canvas");
      this.bgLayerCtx = this.bgLayer.getContext("2d");
      const resizeBg = () => {
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        this.bgDpr = dpr;
        this.bgViewW = vw;
        this.bgViewH = vh;
        this.bgCanvas.width = Math.floor(vw * dpr);
        this.bgCanvas.height = Math.floor(vh * dpr);
        this.bgCanvas.style.width = vw + "px";
        this.bgCanvas.style.height = vh + "px";
        this.bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.bgCtx.imageSmoothingEnabled = true;
        this.bgCtx.imageSmoothingQuality = "medium";
        this.bgLayer.width = this.bgCanvas.width;
        this.bgLayer.height = this.bgCanvas.height;
        this.bgLayerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.bgLayerCtx.imageSmoothingEnabled = true;
        this.bgLayerCtx.imageSmoothingQuality = "medium";
      };
      resizeBg();
      window.addEventListener("resize", resizeBg);
    }

    // 初始化3D图表
    this.init3DPlot();

    if (this.canvases.glow) {
      this.glowLayer = document.createElement("canvas");
      this.glowLayerCtx = this.glowLayer.getContext("2d");
      const resizeGlow = () => {
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        this.canvases.glow.width = Math.floor(window.innerWidth * dpr);
        this.canvases.glow.height = Math.floor(window.innerHeight * dpr);
        this.canvases.glow.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.glowLayer.width = this.canvases.glow.width;
        this.glowLayer.height = this.canvases.glow.height;
        this.glowLayerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resizeGlow();
      window.addEventListener("resize", resizeGlow);
    }
  }

  init3DPlot() {
    const plotDiv = document.getElementById("joint-3d-plot");
    if (!plotDiv) return;

    // 使用Plotly.js创建3D表面图
    this.plot3DData = this.generate3DPlotData();

    const layout = {
      scene: {
        xaxis: { title: "股票A收益率 (%)" },
        yaxis: { title: "股票B收益率 (%)" },
        zaxis: { title: "概率密度" },
        bgcolor: "rgba(15, 23, 48, 0.8)",
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 },
        },
      },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#ffffff" },
      margin: { l: 0, r: 0, t: 0, b: 0 },
    };

    const config = {
      displayModeBar: false,
      responsive: true,
    };

    Plotly.newPlot(plotDiv, [this.plot3DData], layout, config);
  }

  generate3DPlotData() {
    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;
    const size = 30;
    const range = 3;

    const x = [];
    const y = [];
    const z = [];

    for (let i = 0; i < size; i++) {
      const xRow = [];
      const yRow = [];
      const zRow = [];

      for (let j = 0; j < size; j++) {
        const xVal = mu1 + ((i - size / 2) * range * sigma1) / (size / 2);
        const yVal = mu2 + ((j - size / 2) * range * sigma2) / (size / 2);

        xRow.push(xVal);
        yRow.push(yVal);
        zRow.push(
          this.bivariateNormalPDF(xVal, yVal, mu1, mu2, sigma1, sigma2, rho)
        );
      }

      x.push(xRow);
      y.push(yRow);
      z.push(zRow);
    }

    return {
      x: x,
      y: y,
      z: z,
      type: "surface",
      colorscale: [
        [0, "rgba(15, 23, 48, 0.8)"],
        [0.5, "rgba(34, 211, 238, 0.6)"],
        [1, "rgba(167, 139, 250, 0.8)"],
      ],
      showscale: false,
    };
  }

  bivariateNormalPDF(x, y, mu1, mu2, sigma1, sigma2, rho) {
    const z1 = (x - mu1) / sigma1;
    const z2 = (y - mu2) / sigma2;
    const rho2 = rho * rho;

    const exponent =
      (-0.5 / (1 - rho2)) * (z1 * z1 + z2 * z2 - 2 * rho * z1 * z2);
    const coefficient =
      1 / (2 * Math.PI * sigma1 * sigma2 * Math.sqrt(1 - rho2));

    return coefficient * Math.exp(exponent);
  }

  updateParameter(sliderId, value) {
    const paramMap = {
      "mu1-slider": "mu1",
      "mu2-slider": "mu2",
      "sigma1-slider": "sigma1",
      "sigma2-slider": "sigma2",
      "rho-slider": "rho",
      "n-samples-slider": "nSamples",
    };

    const param = paramMap[sliderId];
    if (param) {
      this.parameters[param] = parseFloat(value);
      this.updateParameterDisplay(param, value);

      if (param === "nSamples") {
        this.generateSamples();
      }

      this.updateAllVisualizations();
    }
  }

  updateParameterDisplay(param, value) {
    const displayMap = {
      mu1: "mu1-val",
      mu2: "mu2-val",
      sigma1: "sigma1-val",
      sigma2: "sigma2-val",
      rho: "rho-val",
      nSamples: "n-samples-val",
    };

    const displayId = displayMap[param];
    const displayElement = document.getElementById(displayId);

    if (displayElement) {
      let displayValue = value;
      if (param.includes("mu") || param.includes("sigma")) {
        displayValue = `${value}%`;
      } else if (param === "rho") {
        displayValue = parseFloat(value).toFixed(1);
      }
      displayElement.textContent = displayValue;
    }
  }

  generateInitialSamples() {
    this.generateSamples();
  }

  generateSamples() {
    const { mu1, mu2, sigma1, sigma2, rho, nSamples, distType } =
      this.parameters;

    this.currentSamples = [];

    for (let i = 0; i < nSamples; i++) {
      let x, y;

      switch (distType) {
        case "normal":
          [x, y] = this.generateBivariateNormal(mu1, mu2, sigma1, sigma2, rho);
          break;
        case "uniform":
          [x, y] = this.generateBivariateUniform(mu1, mu2, sigma1, sigma2, rho);
          break;
        case "exponential":
          [x, y] = this.generateBivariateExponential(
            mu1,
            mu2,
            sigma1,
            sigma2,
            rho
          );
          break;
        default:
          [x, y] = this.generateBivariateNormal(mu1, mu2, sigma1, sigma2, rho);
      }

      this.currentSamples.push([x, y]);
    }
  }

  generateBivariateNormal(mu1, mu2, sigma1, sigma2, rho) {
    // Box-Muller变换生成标准正态分布
    const u1 = Math.random();
    const u2 = Math.random();

    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    // 变换到相关的二维正态分布
    const x = mu1 + sigma1 * z1;
    const y = mu2 + sigma2 * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);

    return [x, y];
  }

  generateBivariateUniform(mu1, mu2, sigma1, sigma2, rho) {
    // 简化的二维均匀分布（独立情况）
    const x = mu1 + sigma1 * (Math.random() - 0.5) * 2;
    const y = mu2 + sigma2 * (Math.random() - 0.5) * 2;
    return [x, y];
  }

  generateBivariateExponential(mu1, mu2, sigma1, sigma2, rho) {
    // 简化的二维指数分布
    const x = mu1 - sigma1 * Math.log(Math.random());
    const y = mu2 - sigma2 * Math.log(Math.random());
    return [x, y];
  }

  updateAllVisualizations() {
    this.updateContourPlot();
    this.updateScatterPlot();
    this.updateMarginalPlot();
    this.update3DPlot();
    this.updateStatistics();
    this.updateMarginalGlow();
  }

  updateContourPlot() {
    const canvas = this.canvases.contour;
    if (!canvas) return;

    const ctx = canvas.ctx;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;
    const levels = [0.1, 0.05, 0.02, 0.01, 0.005];
    const colors = ["#00f3ff", "#bf00ff", "#00ff66", "#ffc107", "#ff6b6b"];
    levels.forEach((level, i) => {
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      this.drawContourLevel(
        ctx,
        width,
        height,
        level,
        mu1,
        mu2,
        sigma1,
        sigma2,
        rho
      );
    });
  }

  drawContourLevel(ctx, width, height, level, mu1, mu2, sigma1, sigma2, rho) {
    const resolution = 100;
    const xRange = 4 * sigma1;
    const yRange = 4 * sigma2;

    ctx.beginPath();

    for (let i = 0; i < resolution; i++) {
      const angle = (2 * Math.PI * i) / resolution;

      // 计算椭圆上的点
      const a = Math.sqrt(-2 * Math.log(level) * (1 - rho * rho));
      const x = mu1 + sigma1 * a * Math.cos(angle);
      const y =
        mu2 +
        sigma2 *
          (rho * a * Math.cos(angle) +
            Math.sqrt(1 - rho * rho) * a * Math.sin(angle));

      const canvasX = ((x - (mu1 - 2 * sigma1)) / (4 * sigma1)) * width;
      const canvasY =
        height - ((y - (mu2 - 2 * sigma2)) / (4 * sigma2)) * height;

      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }

    ctx.closePath();
    ctx.stroke();
  }

  getMarginals() {
    const xValues = this.currentSamples.map(([x]) => x);
    const yValues = this.currentSamples.map(([, y]) => y);
    const bins = 64;
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const bwX = (maxX - minX) / bins || 1;
    const bwY = (maxY - minY) / bins || 1;
    const hx = new Array(bins).fill(0);
    const hy = new Array(bins).fill(0);
    xValues.forEach((v) => {
      const i = Math.min(Math.floor((v - minX) / bwX), bins - 1);
      hx[i]++;
    });
    yValues.forEach((v) => {
      const i = Math.min(Math.floor((v - minY) / bwY), bins - 1);
      hy[i]++;
    });
    const nx = hx.map((c) => c / Math.max(1, Math.max(...hx)));
    const ny = hy.map((c) => c / Math.max(1, Math.max(...hy)));
    return { nx, ny };
  }

  updateMarginalGlow() {
    const t =
      typeof this.bgTime === "number" && this.bgTime > 0
        ? this.bgTime * 0.00008
        : performance.now() * 0.00008;
    this.renderEdgeBars(t);
  }

  startBackgroundContours() {
    if (
      !this.bgCanvas ||
      !this.bgCtx ||
      !this.bgNoise ||
      typeof d3 === "undefined" ||
      !d3.contours
    )
      return;
    this.bgLastRAF = 0;
    this.bgMinDt = 1000 / 30;
    this.performanceMode = "normal";
    this.bgFrameAccum = 0;
    this.bgFrameSamples = 0;
    const baseW = this.bgConfig.cols;
    const baseH = this.bgConfig.rows;
    const scale = this.bgConfig.scale;
    const values = new Float32Array(baseW * baseH);
    const thresholds = Array.from(
      { length: 15 },
      (_, i) => 0.12 + i * 0.05
    ).map((v) => Math.min(0.98, v));
    const palette = ["#00f3ff", "#bf00ff", "#00ff66", "#ffc107", "#ff6b6b"];
    const draw = (now) => {
      if (this.bgLastRAF && now - this.bgLastRAF < this.bgMinDt) {
        requestAnimationFrame(draw);
        return;
      }
      const dt = this.bgLastRAF ? now - this.bgLastRAF : this.bgMinDt;
      this.bgLastRAF = now;
      this.bgFrameAccum += dt;
      this.bgFrameSamples += 1;
      if (this.bgFrameSamples >= 15) {
        const avg = this.bgFrameAccum / this.bgFrameSamples;
        if (!this.performanceDegraded && avg > 45) {
          this.performanceDegraded = true;
          this.performanceMode = "degraded";
        } else if (this.performanceDegraded && avg < 35) {
          this.performanceDegraded = false;
          this.performanceMode = "normal";
        }
        this.bgFrameAccum = 0;
        this.bgFrameSamples = 0;
      }
      this.bgTime = now;
      const t = now * 0.00008;
      let k = 0;
      for (let y = 0; y < baseH; y++) {
        for (let x = 0; x < baseW; x++) {
          const v = this.bgNoise.noise2(x * scale, y * scale + t);
          values[k++] = Math.max(0, Math.min(1, (v + 1) * 0.5));
        }
      }
      const gen = d3.contours().size([baseW, baseH]).thresholds(thresholds);
      const sets = gen(values);
      const W = this.bgViewW || window.innerWidth;
      const H = this.bgViewH || window.innerHeight;
      this.bgLayerCtx.clearRect(0, 0, W, H);
      this.bgLayerCtx.globalAlpha = 0.7;
      this.bgLayerCtx.lineJoin = "round";
      this.bgLayerCtx.lineCap = "round";
      const minV = thresholds[0];
      const maxV = thresholds[thresholds.length - 1];
      sets.forEach((contour, idx) => {
        const v = contour.value || minV;
        const tval = Math.max(
          0,
          Math.min(1, (v - minV) / Math.max(1e-6, maxV - minV))
        );
        const hex = this.mixHexColors(palette, tval);
        const alpha = 0.5 + 0.3 * tval;
        this.bgLayerCtx.strokeStyle = this.rgbaFromHex(hex, alpha);
        this.bgLayerCtx.lineWidth = 2.0 + idx * 0.6;
        contour.coordinates.forEach((multi) => {
          multi.forEach((ring) => {
            this.bgLayerCtx.beginPath();
            for (let p = 0; p < ring.length; p++) {
              const gx = ring[p][0];
              const gy = ring[p][1];
              const x = (gx / (baseW - 1)) * W;
              const y = (gy / (baseH - 1)) * H;
              if (p === 0) this.bgLayerCtx.moveTo(x, y);
              else this.bgLayerCtx.lineTo(x, y);
            }
            this.bgLayerCtx.closePath();
            this.bgLayerCtx.stroke();
          });
        });
      });
      this.bgCtx.clearRect(0, 0, W, H);
      this.bgCtx.globalAlpha = 1;
      this.bgCtx.globalCompositeOperation = "lighter";
      this.bgCtx.filter =
        this.performanceMode === "degraded" ? "blur(6px)" : "blur(10px)";
      this.bgCtx.drawImage(this.bgLayer, 0, 0, W, H);
      this.bgCtx.filter = "none";
      this.bgCtx.globalCompositeOperation = "source-over";
      this.bgCtx.drawImage(this.bgLayer, 0, 0, W, H);
      this.renderEdgeBars(t);
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  renderEdgeBars(t) {
    const canvas = this.canvases.glow;
    if (!canvas || !this.bgNoise) return;
    const ctx = canvas.ctx;
    const layer = this.glowLayerCtx || ctx;
    const W = this.bgViewW || window.innerWidth;
    const H = this.bgViewH || window.innerHeight;
    const baseW = this.bgConfig.cols;
    const baseH = this.bgConfig.rows;
    const scale = this.bgConfig.scale;
    layer.clearRect(0, 0, W, H);
    layer.globalCompositeOperation = "source-over";
    layer.lineCap = "round";
    layer.lineJoin = "round";
    const barsX = Math.max(
      48,
      Math.floor(W / (this.performanceMode === "degraded" ? 18 : 12))
    );
    const barsY = Math.max(
      28,
      Math.floor(H / (this.performanceMode === "degraded" ? 18 : 12))
    );
    const cellW = W / barsX;
    const cellH = H / barsY;
    const lwTop = Math.max(2, cellW * 0.6);
    const lwSide = Math.max(2, cellH * 0.6);
    const maxLenV = Math.min(H * 0.09, 80);
    const minLenV = Math.max(6, H * 0.02);
    const maxLenH = Math.min(W * 0.09, 80);
    const minLenH = Math.max(6, W * 0.02);
    layer.shadowBlur = 0;
    const topVals = new Array(barsX);
    const bottomVals = new Array(barsX);
    for (let i = 0; i < barsX; i++) {
      const gx = (i / (barsX - 1)) * (baseW - 1);
      const vTop = this.bgNoise.noise2(gx * scale, t);
      const vBottom = this.bgNoise.noise2(gx * scale, (baseH - 1) * scale + t);
      topVals[i] = Math.max(0, Math.min(1, (vTop + 1) * 0.5));
      bottomVals[i] = Math.max(0, Math.min(1, (vBottom + 1) * 0.5));
    }
    const leftVals = new Array(barsY);
    const rightVals = new Array(barsY);
    for (let j = 0; j < barsY; j++) {
      const gy = (j / (barsY - 1)) * (baseH - 1);
      const vLeft = this.bgNoise.noise2(0, gy * scale + t);
      const vRight = this.bgNoise.noise2((baseW - 1) * scale, gy * scale + t);
      leftVals[j] = Math.max(0, Math.min(1, (vLeft + 1) * 0.5));
      rightVals[j] = Math.max(0, Math.min(1, (vRight + 1) * 0.5));
    }
    const ntop = this.normalizeArray(topVals, 1.4, 1.25);
    const nbottom = this.normalizeArray(bottomVals, 1.4, 1.25);
    const nleft = this.normalizeArray(leftVals, 1.4, 1.25);
    const nright = this.normalizeArray(rightVals, 1.4, 1.25);
    ctx.shadowBlur = 18;
    const lenTopArr = ntop.map((n) => minLenV + n * (maxLenV - minLenV));
    const lenBottomArr = nbottom.map((n) => minLenV + n * (maxLenV - minLenV));
    const lenTopSm = this.smoothArray(lenTopArr, 5, 2);
    const lenBottomSm = this.smoothArray(lenBottomArr, 5, 2);
    const maxTop = Math.max(...lenTopSm);
    const maxBottom = Math.max(...lenBottomSm);
    layer.save();
    layer.beginPath();
    layer.moveTo(0, 0);
    for (let i = 0; i < barsX; i++) {
      const x = (i / (barsX - 1)) * W;
      layer.lineTo(x, lenTopSm[i]);
    }
    layer.lineTo(W, 0);
    layer.closePath();
    layer.clip();
    for (let i = 0; i < barsX; i++) {
      const x0 = (i / barsX) * W;
      const len = lenTopSm[i];
      if (len <= 0) continue;
      const hex = this.mixHexColors(["#00f3ff", "#00ff66", "#ffc107"], ntop[i]);
      const a0 = 0.5 + ntop[i] * 0.4;
      const grad = layer.createLinearGradient(x0, 0, x0, len);
      grad.addColorStop(0, this.rgbaFromHex(hex, a0));
      grad.addColorStop(1, this.rgbaFromHex(hex, 0));
      layer.fillStyle = grad;
      layer.fillRect(x0, 0, W / barsX, len);
    }
    layer.restore();
    layer.save();
    layer.beginPath();
    layer.moveTo(0, H);
    for (let i = 0; i < barsX; i++) {
      const x = (i / (barsX - 1)) * W;
      layer.lineTo(x, H - lenBottomSm[i]);
    }
    layer.lineTo(W, H);
    layer.closePath();
    layer.clip();
    for (let i = 0; i < barsX; i++) {
      const x0 = (i / barsX) * W;
      const len = lenBottomSm[i];
      if (len <= 0) continue;
      const hex = this.mixHexColors(
        ["#00f3ff", "#00ff66", "#ffc107"],
        nbottom[i]
      );
      const a0 = 0.5 + nbottom[i] * 0.4;
      const grad = layer.createLinearGradient(x0, H, x0, H - len);
      grad.addColorStop(0, this.rgbaFromHex(hex, a0));
      grad.addColorStop(1, this.rgbaFromHex(hex, 0));
      layer.fillStyle = grad;
      layer.fillRect(x0, H - len, W / barsX, len);
    }
    layer.restore();
    const lenLeftArr = nleft.map((n) => minLenH + n * (maxLenH - minLenH));
    const lenRightArr = nright.map((n) => minLenH + n * (maxLenH - minLenH));
    const lenLeftSm = this.smoothArray(lenLeftArr, 5, 2);
    const lenRightSm = this.smoothArray(lenRightArr, 5, 2);
    const maxLeft = Math.max(...lenLeftSm);
    const maxRight = Math.max(...lenRightSm);
    layer.save();
    layer.beginPath();
    layer.moveTo(0, 0);
    for (let j = 0; j < barsY; j++) {
      const y = (j / (barsY - 1)) * H;
      layer.lineTo(lenLeftSm[j], y);
    }
    layer.lineTo(0, H);
    layer.closePath();
    layer.clip();
    for (let j = 0; j < barsY; j++) {
      const y0 = (j / barsY) * H;
      const len = lenLeftSm[j];
      if (len <= 0) continue;
      const hex = this.mixHexColors(
        ["#bf00ff", "#ffc107", "#ff6b6b"],
        nleft[j]
      );
      const a0 = 0.5 + nleft[j] * 0.4;
      const grad = layer.createLinearGradient(0, y0, len, y0);
      grad.addColorStop(0, this.rgbaFromHex(hex, a0));
      grad.addColorStop(1, this.rgbaFromHex(hex, 0));
      layer.fillStyle = grad;
      layer.fillRect(0, y0, len, H / barsY);
    }
    layer.restore();
    layer.save();
    layer.beginPath();
    layer.moveTo(W, 0);
    for (let j = 0; j < barsY; j++) {
      const y = (j / (barsY - 1)) * H;
      layer.lineTo(W - lenRightSm[j], y);
    }
    layer.lineTo(W, H);
    layer.closePath();
    layer.clip();
    for (let j = 0; j < barsY; j++) {
      const y0 = (j / barsY) * H;
      const len = lenRightSm[j];
      if (len <= 0) continue;
      const hex = this.mixHexColors(
        ["#bf00ff", "#ffc107", "#ff6b6b"],
        nright[j]
      );
      const a0 = 0.5 + nright[j] * 0.4;
      const grad = layer.createLinearGradient(W, y0, W - len, y0);
      grad.addColorStop(0, this.rgbaFromHex(hex, a0));
      grad.addColorStop(1, this.rgbaFromHex(hex, 0));
      layer.fillStyle = grad;
      layer.fillRect(W - len, y0, len, H / barsY);
    }
    layer.restore();
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    ctx.filter =
      this.performanceMode === "degraded" ? "blur(6px)" : "blur(12px)";
    ctx.drawImage(this.glowLayer || canvas, 0, 0, W, H);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(this.glowLayer || canvas, 0, 0, W, H);
  }
  normalizeArray(arr, contrast, gamma) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const eps = 1e-6;
    const out = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      let n = (arr[i] - min) / Math.max(eps, max - min);
      n = (n - 0.5) * contrast + 0.5;
      if (n < 0) n = 0;
      if (n > 1) n = 1;
      n = Math.pow(n, gamma);
      out[i] = n;
    }
    return out;
  }
  hexToRgb(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return { r, g, b };
  }
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  mixHexColors(stops, t) {
    if (!stops || stops.length === 0) return "#ffffff";
    if (t <= 0) return stops[0];
    if (t >= 1) return stops[stops.length - 1];
    const pos = t * (stops.length - 1);
    const i = Math.floor(pos);
    const tt = pos - i;
    const c1 = this.hexToRgb(stops[i]);
    const c2 = this.hexToRgb(stops[i + 1]);
    const r = Math.round(this.lerp(c1.r, c2.r, tt));
    const g = Math.round(this.lerp(c1.g, c2.g, tt));
    const b = Math.round(this.lerp(c1.b, c2.b, tt));
    const rh = r.toString(16).padStart(2, "0");
    const gh = g.toString(16).padStart(2, "0");
    const bh = b.toString(16).padStart(2, "0");
    return `#${rh}${gh}${bh}`;
  }
  rgbaFromHex(hex, a) {
    const { r, g, b } = this.hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  smoothArray(arr, window = 5, passes = 1) {
    if (!arr || arr.length === 0) return [];
    let out = arr.slice();
    const w = Math.max(1, Math.floor(window));
    for (let p = 0; p < passes; p++) {
      const tmp = new Array(out.length);
      for (let i = 0; i < out.length; i++) {
        let sum = 0;
        let count = 0;
        for (let k = -w; k <= w; k++) {
          const idx = i + k;
          if (idx >= 0 && idx < out.length) {
            sum += out[idx];
            count++;
          }
        }
        tmp[i] = sum / Math.max(1, count);
      }
      out = tmp;
    }
    return out;
  }
  updateScatterPlot() {
    const canvas = this.canvases.scatter;
    if (!canvas) return;

    const ctx = canvas.ctx;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 绘制坐标轴
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // 绘制样本点
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;
    const xRange = 4 * sigma1;
    const yRange = 4 * sigma2;

    ctx.fillStyle = "rgba(34, 211, 238, 0.6)";

    this.currentSamples.forEach(([x, y]) => {
      const canvasX = ((x - (mu1 - xRange / 2)) / xRange) * width;
      const canvasY = height - ((y - (mu2 - yRange / 2)) / yRange) * height;

      if (
        canvasX >= 0 &&
        canvasX <= width &&
        canvasY >= 0 &&
        canvasY <= height
      ) {
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  updateMarginalPlot() {
    const canvas = this.canvases.marginal;
    if (!canvas) return;

    const ctx = canvas.ctx;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 计算边际分布
    const xValues = this.currentSamples.map(([x, y]) => x);
    const yValues = this.currentSamples.map(([x, y]) => y);

    // 绘制X的边际分布（底部）
    this.drawMarginalDistribution(
      ctx,
      xValues,
      0,
      height * 0.7,
      width,
      height * 0.3,
      "#00f3ff",
      true
    );

    // 绘制Y的边际分布（右侧）
    this.drawMarginalDistribution(
      ctx,
      yValues,
      width * 0.7,
      0,
      width * 0.3,
      height * 0.7,
      "#bf00ff",
      false
    );
  }

  drawMarginalDistribution(ctx, values, x, y, w, h, color, isHorizontal) {
    const bins = 20;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;

    const histogram = new Array(bins).fill(0);

    values.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    const maxCount = Math.max(...histogram);

    ctx.fillStyle = color + "80";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    histogram.forEach((count, i) => {
      const barHeight = (count / maxCount) * (isHorizontal ? h : w);

      if (isHorizontal) {
        const barX = x + (i / bins) * w;
        const barY = y + h - barHeight;
        ctx.fillRect(barX, barY, w / bins, barHeight);
        ctx.strokeRect(barX, barY, w / bins, barHeight);
      } else {
        const barX = x;
        const barY = y + (i / bins) * h;
        ctx.fillRect(barX, barY, barHeight, h / bins);
        ctx.strokeRect(barX, barY, barHeight, h / bins);
      }
    });
  }

  update3DPlot() {
    const plotDiv = document.getElementById("joint-3d-plot");
    if (!plotDiv) return;

    this.plot3DData = this.generate3DPlotData();
    Plotly.restyle(plotDiv, { z: [this.plot3DData.z] }, [0]);
  }

  updateStatistics() {
    // 计算样本统计量
    const xValues = this.currentSamples.map(([x, y]) => x);
    const yValues = this.currentSamples.map(([x, y]) => y);

    const sampleCorr = this.calculateCorrelation(xValues, yValues);
    const theoryCorr = this.parameters.rho;

    // 更新显示
    const theoryCorrEl = document.getElementById("theory-corr");
    const sampleCorrEl = document.getElementById("sample-corr");
    const sampleCountEl = document.getElementById("sample-count");

    if (theoryCorrEl) theoryCorrEl.textContent = theoryCorr.toFixed(2);
    if (sampleCorrEl) sampleCorrEl.textContent = sampleCorr.toFixed(2);
    if (sampleCountEl) sampleCountEl.textContent = this.currentSamples.length;
  }

  calculateCorrelation(x, y) {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    return numerator / Math.sqrt(denomX * denomY);
  }

  calculateJointProbability() {
    const xMin = parseFloat(document.getElementById("x-min").value);
    const xMax = parseFloat(document.getElementById("x-max").value);
    const yMin = parseFloat(document.getElementById("y-min").value);
    const yMax = parseFloat(document.getElementById("y-max").value);

    // 使用样本估计概率
    let count = 0;
    this.currentSamples.forEach(([x, y]) => {
      if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
        count++;
      }
    });

    const probability = count / this.currentSamples.length;

    const jointProbEl = document.getElementById("joint-prob");
    if (jointProbEl) {
      jointProbEl.textContent = probability.toFixed(3);
    }
  }

  resetParameters() {
    this.parameters = {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      nSamples: 1000,
      distType: "normal",
    };

    // 重置滑动条
    document.getElementById("mu1-slider").value = 5;
    document.getElementById("mu2-slider").value = 8;
    document.getElementById("sigma1-slider").value = 15;
    document.getElementById("sigma2-slider").value = 20;
    document.getElementById("rho-slider").value = 0.3;
    document.getElementById("n-samples-slider").value = 1000;
    document.getElementById("dist-type").value = "normal";

    // 更新显示
    Object.keys(this.parameters).forEach((param) => {
      this.updateParameterDisplay(param, this.parameters[param]);
    });

    this.generateSamples();
    this.updateAllVisualizations();
  }

  // 3.2 独立性检验相关方法
  initializeIndependenceTest() {
    this.updateScenarioLabels();
    this.generateIndependenceData();
    this.updateIndependenceVisualization();
  }

  updateIndependenceParameter(sliderId, value) {
    const paramMap = {
      "sample-size-slider": "sampleSize",
      "true-correlation-slider": "trueCorrelation",
      "noise-level-slider": "noiseLevel",
    };

    const param = paramMap[sliderId];
    if (param) {
      this.independenceTest[param] = parseFloat(value);
      this.updateIndependenceParameterDisplay(param, value);
      this.generateIndependenceData();
      this.updateIndependenceVisualization();
    }
  }

  updateIndependenceParameterDisplay(param, value) {
    const displayMap = {
      sampleSize: "sample-size-val",
      trueCorrelation: "true-correlation-val",
      noiseLevel: "noise-level-val",
    };

    const displayId = displayMap[param];
    const displayElement = document.getElementById(displayId);

    if (displayElement) {
      displayElement.textContent = parseFloat(value).toFixed(1);
    }
  }

  updateScenarioLabels() {
    // 根据场景更新标签
    const scenarios = {
      social: { x: "点赞行为", y: "评论行为" },
      shopping: { x: "浏览商品", y: "购买行为" },
      learning: { x: "观看视频", y: "做练习" },
      custom: { x: "变量X", y: "变量Y" },
    };

    const scenario = scenarios[this.independenceTest.scenario];
    // 这里可以更新UI中的标签文本
  }

  generateIndependenceData() {
    const { sampleSize, trueCorrelation, noiseLevel } = this.independenceTest;

    this.independenceData = {
      contingencyTable: this.generateContingencyTable(
        sampleSize,
        trueCorrelation,
        noiseLevel
      ),
      rawData: [],
    };
  }

  generateContingencyTable(n, correlation, noise) {
    // 生成2x2列联表
    const baseProbs = [0.3, 0.2, 0.2, 0.3]; // [00, 01, 10, 11]

    // 根据相关性调整概率
    const adjustment = correlation * 0.1;
    const probs = [
      baseProbs[0] - adjustment + noise * (Math.random() - 0.5),
      baseProbs[1] + adjustment + noise * (Math.random() - 0.5),
      baseProbs[2] + adjustment + noise * (Math.random() - 0.5),
      baseProbs[3] - adjustment + noise * (Math.random() - 0.5),
    ];

    // 归一化
    const sum = probs.reduce((a, b) => a + b);
    const normalizedProbs = probs.map((p) => Math.max(0, p / sum));

    // 生成频数
    const frequencies = normalizedProbs.map((p) => Math.round(p * n));

    return [
      [frequencies[0], frequencies[1]],
      [frequencies[2], frequencies[3]],
    ];
  }

  updateIndependenceVisualization() {
    this.updateJointProbabilityTable();
    this.updateConditionalProbabilityChart();
  }

  updateJointProbabilityTable() {
    const tableContainer = document.getElementById("joint-prob-table");
    if (!tableContainer) return;

    const table = this.independenceData.contingencyTable;
    const total = table.flat().reduce((a, b) => a + b);

    const html = `
      <table class="joint-prob-table">
        <thead>
          <tr>
            <th></th>
            <th>Y=0</th>
            <th>Y=1</th>
            <th>边际</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>X=0</strong></td>
            <td>${(table[0][0] / total).toFixed(3)}</td>
            <td>${(table[0][1] / total).toFixed(3)}</td>
            <td class="marginal-cell">${(
              (table[0][0] + table[0][1]) /
              total
            ).toFixed(3)}</td>
          </tr>
          <tr>
            <td><strong>X=1</strong></td>
            <td>${(table[1][0] / total).toFixed(3)}</td>
            <td>${(table[1][1] / total).toFixed(3)}</td>
            <td class="marginal-cell">${(
              (table[1][0] + table[1][1]) /
              total
            ).toFixed(3)}</td>
          </tr>
          <tr>
            <td><strong>边际</strong></td>
            <td class="marginal-cell">${(
              (table[0][0] + table[1][0]) /
              total
            ).toFixed(3)}</td>
            <td class="marginal-cell">${(
              (table[0][1] + table[1][1]) /
              total
            ).toFixed(3)}</td>
            <td class="total-cell">1.000</td>
          </tr>
        </tbody>
      </table>
    `;

    tableContainer.innerHTML = html;
  }

  updateConditionalProbabilityChart() {
    const canvas = this.canvases.conditionalProb;
    if (!canvas) return;

    const ctx = canvas.ctx;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 计算条件概率
    const table = this.independenceData.contingencyTable;
    const total = table.flat().reduce((a, b) => a + b);

    const pY1 = (table[0][1] + table[1][1]) / total;
    const pY1GivenX0 = table[0][1] / (table[0][0] + table[0][1]);
    const pY1GivenX1 = table[1][1] / (table[1][0] + table[1][1]);

    // 绘制柱状图
    const barWidth = width / 6;
    const maxHeight = height * 0.8;

    // P(Y=1)
    ctx.fillStyle = "#00f3ff";
    ctx.fillRect(barWidth, height - pY1 * maxHeight, barWidth, pY1 * maxHeight);

    // P(Y=1|X=0)
    ctx.fillStyle = "#bf00ff";
    ctx.fillRect(
      3 * barWidth,
      height - pY1GivenX0 * maxHeight,
      barWidth,
      pY1GivenX0 * maxHeight
    );

    // P(Y=1|X=1)
    ctx.fillStyle = "#00ff66";
    ctx.fillRect(
      5 * barWidth,
      height - pY1GivenX1 * maxHeight,
      barWidth,
      pY1GivenX1 * maxHeight
    );

    // 添加标签
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("P(Y=1)", 1.5 * barWidth, height - 10);
    ctx.fillText("P(Y=1|X=0)", 3.5 * barWidth, height - 10);
    ctx.fillText("P(Y=1|X=1)", 5.5 * barWidth, height - 10);
  }

  runIndependenceTest() {
    const table = this.independenceData.contingencyTable;
    const chiSquare = this.calculateChiSquare(table);
    const df = 1; // 2x2表的自由度
    const pValue = this.calculatePValue(chiSquare, df);

    // 更新显示
    document.getElementById("chi-square-stat").textContent =
      chiSquare.toFixed(3);
    document.getElementById("degrees-freedom").textContent = df;
    document.getElementById("p-value").textContent = pValue.toFixed(4);

    const conclusion = pValue < this.independenceTest.alpha ? "相关" : "独立";
    const conclusionEl = document.getElementById("independence-conclusion");
    conclusionEl.textContent = conclusion;
    conclusionEl.className =
      conclusion === "独立" ? "text-neon-green" : "text-red-400";
  }

  calculateChiSquare(table) {
    const total = table.flat().reduce((a, b) => a + b);
    const rowSums = table.map((row) => row.reduce((a, b) => a + b));
    const colSums = [table[0][0] + table[1][0], table[0][1] + table[1][1]];

    let chiSquare = 0;

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const expected = (rowSums[i] * colSums[j]) / total;
        const observed = table[i][j];
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    }

    return chiSquare;
  }

  calculatePValue(chiSquare, df) {
    // 简化的p值计算（实际应用中应使用更精确的方法）
    if (df === 1) {
      if (chiSquare < 0.016) return 0.9;
      if (chiSquare < 0.455) return 0.5;
      if (chiSquare < 2.706) return 0.1;
      if (chiSquare < 3.841) return 0.05;
      if (chiSquare < 6.635) return 0.01;
      return 0.001;
    }
    return 0.05; // 默认值
  }

  runBatchTest() {
    const iterations = 100;
    const results = [];

    for (let i = 0; i < iterations; i++) {
      this.generateIndependenceData();
      const table = this.independenceData.contingencyTable;
      const chiSquare = this.calculateChiSquare(table);
      const pValue = this.calculatePValue(chiSquare, 1);
      results.push(pValue < this.independenceTest.alpha);
    }

    const rejectionRate = results.filter((r) => r).length / iterations;

    // 显示批量测试结果
    alert(
      `批量测试结果：\n${iterations}次测试中，${(rejectionRate * 100).toFixed(
        1
      )}%的情况下拒绝独立性假设`
    );
  }

  handleMarginalAction(actionId) {
    switch (actionId) {
      case "show-marginal-x":
        this.showMarginalDistribution("x");
        break;
      case "show-marginal-y":
        this.showMarginalDistribution("y");
        break;
      case "animate-integration":
        this.animateIntegrationProcess();
        break;
    }
  }

  showMarginalDistribution(variable) {
    // 高亮显示对应的边际分布
    const canvas = this.canvases.marginal;
    if (!canvas) return;

    // 添加高亮效果
    canvas.style.boxShadow =
      variable === "x"
        ? "0 0 20px rgba(0, 243, 255, 0.5)"
        : "0 0 20px rgba(191, 0, 255, 0.5)";

    setTimeout(() => {
      canvas.style.boxShadow = "";
    }, 2000);
  }

  animateIntegrationProcess() {
    // 动画演示积分过程
    const canvas = this.canvases.contour;
    if (!canvas) return;

    const ctx = canvas.ctx;
    let animationFrame = 0;
    const totalFrames = 60;

    const animate = () => {
      if (animationFrame >= totalFrames) return;

      // 重绘等高线图
      this.updateContourPlot();

      // 添加积分区域动画
      const progress = animationFrame / totalFrames;
      ctx.fillStyle = `rgba(0, 255, 102, ${
        0.3 * Math.sin(progress * Math.PI)
      })`;
      ctx.fillRect(0, 0, canvas.width * progress, canvas.height);

      animationFrame++;
      requestAnimationFrame(animate);
    };

    animate();
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  window.chapter3Visualizer = new Chapter3Visualizer();
});
