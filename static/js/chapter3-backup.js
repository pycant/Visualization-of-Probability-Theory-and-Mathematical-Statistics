/**
 * Chapter 3: 多维随机变量及其分布 - 交互式可视化
 * 扩展 Chapter 1 的模块化架构，集成数学库和 3D 可视化
 * 
 * 依赖库:
 * - jStat: 统计计算
 * - ml-matrix: 矩阵运算
 * - fast-check: 属性测试
 * - Three.js: 3D 可视化
 * - Plotly.js: 交互式图表
 */

(function() {
  'use strict';

  // 数学引擎模块 - 核心计算功能
  const MathEngine = {
    // 检查数学库是否可用
    checkLibraries() {
      const libraries = {
        jStat: typeof jStat !== 'undefined',
        mlMatrix: typeof ML !== 'undefined' && typeof ML.Matrix !== 'undefined',
        fastCheck: typeof fc !== 'undefined',
        three: typeof THREE !== 'undefined',
        plotly: typeof Plotly !== 'undefined'
      };
      
      console.log('Mathematical libraries status:', libraries);
      return libraries;
    },

    // 生成多元正态分布样本
    generateMultivariateNormal(mu, sigma, n) {
      if (!this.checkLibraries().jStat) {
        console.warn('jStat not available, using fallback implementation');
        return this.generateMultivariateNormalFallback(mu, sigma, n);
      }
      
      const samples = [];
      for (let i = 0; i < n; i++) {
        // 使用 Cholesky 分解生成相关样本
        const sample = this.choleskyTransform(mu, sigma);
        samples.push(sample);
      }
      return samples;
    },

    // 备用实现（不依赖外部库）
    generateMultivariateNormalFallback(mu, sigma, n) {
      const samples = [];
      const rho = sigma[0][1] / (Math.sqrt(sigma[0][0]) * Math.sqrt(sigma[1][1]));
      
      for (let i = 0; i < n; i++) {
        const [z1, z2] = this.boxMullerTransform();
        const x = mu[0] + Math.sqrt(sigma[0][0]) * z1;
        const y = mu[1] + Math.sqrt(sigma[1][1]) * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);
        samples.push([x, y]);
      }
      return samples;
    },

    // Box-Muller 变换
    boxMullerTransform() {
      const u1 = Math.random();
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      return [z1, z2];
    },

    // Cholesky 分解变换
    choleskyTransform(mu, sigma) {
      // 简化的 2x2 Cholesky 分解
      const a11 = Math.sqrt(sigma[0][0]);
      const a21 = sigma[0][1] / a11;
      const a22 = Math.sqrt(sigma[1][1] - a21 * a21);
      
      const [z1, z2] = this.boxMullerTransform();
      const x = mu[0] + a11 * z1;
      const y = mu[1] + a21 * z1 + a22 * z2;
      
      return [x, y];
    },

    // 计算相关系数
    calculateCorrelation(samples) {
      if (samples.length === 0) return 0;
      
      const xValues = samples.map(s => s[0]);
      const yValues = samples.map(s => s[1]);
      
      const meanX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
      const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;
      
      let numerator = 0;
      let sumXSquared = 0;
      let sumYSquared = 0;
      
      for (let i = 0; i < samples.length; i++) {
        const dx = xValues[i] - meanX;
        const dy = yValues[i] - meanY;
        numerator += dx * dy;
        sumXSquared += dx * dx;
        sumYSquared += dy * dy;
      }
      
      const denominator = Math.sqrt(sumXSquared * sumYSquared);
      return denominator === 0 ? 0 : numerator / denominator;
    },

    // 卡方独立性检验
    chiSquareTest(observedFreq, expectedFreq) {
      let chiSquare = 0;
      let degreesOfFreedom = 0;
      
      for (let i = 0; i < observedFreq.length; i++) {
        for (let j = 0; j < observedFreq[i].length; j++) {
          const observed = observedFreq[i][j];
          const expected = expectedFreq[i][j];
          if (expected > 0) {
            chiSquare += Math.pow(observed - expected, 2) / expected;
            degreesOfFreedom++;
          }
        }
      }
      
      degreesOfFreedom = Math.max(1, (observedFreq.length - 1) * (observedFreq[0].length - 1));
      
      // 简化的 p 值计算（实际应用中应使用更精确的方法）
      const pValue = this.approximatePValue(chiSquare, degreesOfFreedom);
      
      return {
        chiSquare: chiSquare,
        degreesOfFreedom: degreesOfFreedom,
        pValue: pValue
      };
    },

    // 近似 p 值计算
    approximatePValue(chiSquare, df) {
      // 简化实现，实际应用中应使用更精确的卡方分布
      const criticalValues = {
        1: { 0.05: 3.841, 0.01: 6.635 },
        2: { 0.05: 5.991, 0.01: 9.210 },
        3: { 0.05: 7.815, 0.01: 11.345 },
        4: { 0.05: 9.488, 0.01: 13.277 }
      };
      
      const critical = criticalValues[Math.min(df, 4)] || criticalValues[4];
      
      if (chiSquare > critical[0.01]) return 0.001;
      if (chiSquare > critical[0.05]) return 0.02;
      return 0.1;
    }
  };

  // 可视化管理器 - 协调所有可视化组件
  const VisualizationManager = {
    components: {},
    
    register(name, component) {
      this.components[name] = component;
    },
    
    updateAll(data) {
      Object.values(this.components).forEach(component => {
        if (component.update) {
          component.update(data);
        }
      });
    },
    
    resizeAll() {
      Object.values(this.components).forEach(component => {
        if (component.resize) {
          component.resize();
        }
      });
    }
  };

  // 3D 联合分布可视化组件 - 增强版 Three.js 实现
  const JointDistributionVisualizer = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    surface: null,
    controls: null,
    animationId: null,
    
    init(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container || typeof THREE === 'undefined') {
        console.warn('Three.js not available or container not found');
        return false;
      }
      
      this.setupThreeJS();
      this.setupControls();
      this.createSurface();
      this.setupLighting();
      this.animate();
      return true;
    },
    
    setupThreeJS() {
      // 创建场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0f1730);
      
      // 创建相机
      const aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
      this.camera.position.set(8, 8, 8);
      this.camera.lookAt(0, 0, 0);
      
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      this.container.appendChild(this.renderer.domElement);
    },
    
    setupControls() {
      // 添加轨道控制器（如果可用）
      if (typeof THREE.OrbitControls !== 'undefined') {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.maxPolarAngle = Math.PI / 2;
      } else {
        // 简单的鼠标控制
        this.setupSimpleControls();
      }
    },
    
    setupSimpleControls() {
      let isMouseDown = false;
      let mouseX = 0, mouseY = 0;
      
      this.renderer.domElement.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      
      this.renderer.domElement.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        
        // 旋转相机
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position);
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        this.camera.position.setFromSpherical(spherical);
        this.camera.lookAt(0, 0, 0);
        
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      
      this.renderer.domElement.addEventListener('mouseup', () => {
        isMouseDown = false;
      });
      
      // 缩放控制
      this.renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 1.1 : 0.9;
        this.camera.position.multiplyScalar(scale);
        this.camera.position.clampLength(3, 20);
      });
    },
    
    setupLighting() {
      // 环境光
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      this.scene.add(ambientLight);
      
      // 主光源
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      this.scene.add(directionalLight);
      
      // 补充光源
      const fillLight = new THREE.DirectionalLight(0x00f3ff, 0.3);
      fillLight.position.set(-5, 5, -5);
      this.scene.add(fillLight);
      
      // 点光源（用于高光效果）
      const pointLight = new THREE.PointLight(0xbf00ff, 0.5, 20);
      pointLight.position.set(0, 8, 0);
      this.scene.add(pointLight);
    },
    
    createSurface() {
      // 创建参数化表面几何体
      const resolution = 64;
      const geometry = new THREE.PlaneGeometry(8, 8, resolution - 1, resolution - 1);
      
      // 创建渐变材质
      const material = new THREE.MeshPhongMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.85,
        wireframe: false,
        side: THREE.DoubleSide,
        shininess: 100,
        specular: 0x222222
      });
      
      this.surface = new THREE.Mesh(geometry, material);
      this.surface.receiveShadow = true;
      this.surface.castShadow = true;
      this.scene.add(this.surface);
      
      // 添加网格线
      this.createWireframe();
      
      // 添加坐标轴
      this.createAxes();
    },
    
    createWireframe() {
      const wireframeGeometry = this.surface.geometry.clone();
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      
      this.wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      this.scene.add(this.wireframe);
    },
    
    createAxes() {
      const axesHelper = new THREE.AxesHelper(5);
      this.scene.add(axesHelper);
      
      // 添加坐标轴标签（使用简单的几何体）
      const createAxisLabel = (text, position, color) => {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);
        this.scene.add(sphere);
      };
      
      createAxisLabel('X', new THREE.Vector3(5.5, 0, 0), 0xff0000);
      createAxisLabel('Y', new THREE.Vector3(0, 5.5, 0), 0x00ff00);
      createAxisLabel('Z', new THREE.Vector3(0, 0, 5.5), 0x0000ff);
    },
    
    update(parameters) {
      if (!this.surface) return;
      
      const { mu1, mu2, sigma1, sigma2, rho } = parameters;
      const vertices = this.surface.geometry.attributes.position.array;
      const colors = [];
      
      // 更新顶点位置和颜色
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        
        // 计算概率密度
        const density = this.bivariateNormalPDF(x, y, mu1/10, mu2/10, sigma1/10, sigma2/10, rho);
        const z = density * 50; // 缩放以便可视化
        
        vertices[i + 2] = z;
        
        // 根据高度设置颜色
        const normalizedHeight = Math.min(z / 5, 1);
        colors.push(
          normalizedHeight,           // R
          0.2 + normalizedHeight * 0.8, // G  
          1 - normalizedHeight * 0.5   // B
        );
      }
      
      // 更新几何体
      this.surface.geometry.attributes.position.needsUpdate = true;
      
      // 添加颜色属性
      if (!this.surface.geometry.attributes.color) {
        this.surface.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.surface.material.vertexColors = true;
      } else {
        this.surface.geometry.attributes.color.array = new Float32Array(colors);
        this.surface.geometry.attributes.color.needsUpdate = true;
      }
      
      // 更新线框
      if (this.wireframe) {
        this.wireframe.geometry.attributes.position.needsUpdate = true;
      }
      
      // 重新计算法向量以获得正确的光照
      this.surface.geometry.computeVertexNormals();
    },
    
    bivariateNormalPDF(x, y, mu1, mu2, sigma1, sigma2, rho) {
      const z1 = (x - mu1) / sigma1;
      const z2 = (y - mu2) / sigma2;
      const rho2 = rho * rho;
      
      const exponent = (-0.5 / (1 - rho2)) * (z1 * z1 + z2 * z2 - 2 * rho * z1 * z2);
      const coefficient = 1 / (2 * Math.PI * sigma1 * sigma2 * Math.sqrt(1 - rho2));
      
      return coefficient * Math.exp(exponent);
    },
    
    animate() {
      this.animationId = requestAnimationFrame(() => this.animate());
      
      // 更新控制器
      if (this.controls && this.controls.update) {
        this.controls.update();
      }
      
      // 渲染场景
      this.renderer.render(this.scene, this.camera);
    },
    
    resize() {
      if (!this.camera || !this.renderer || !this.container) return;
      
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    },
    
    dispose() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      
      if (this.controls && this.controls.dispose) {
        this.controls.dispose();
      }
      
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
  };

  // 导航控制器 - 处理平滑滚动和章节高亮
  const NavigationController = {
    init() {
      this.setupSmoothScrolling();
      this.setupSectionHighlighting();
      this.populateHeroLinks();
    },

    setupSmoothScrolling() {
      // 为所有导航链接添加平滑滚动
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // 更新URL但不触发页面跳转
          history.pushState(null, null, `#${targetId}`);
        }
      });
    },

    setupSectionHighlighting() {
      // 监听滚动事件，高亮当前章节
      const sections = document.querySelectorAll('section[id^="sec-3-"]');
      const navLinks = document.querySelectorAll('a[href^="#sec-3-"]');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            
            // 移除所有活跃状态
            navLinks.forEach(link => {
              link.classList.remove('active-section');
            });

            // 添加当前章节的活跃状态
            const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
            if (activeLink) {
              activeLink.classList.add('active-section');
            }
          }
        });
      }, {
        threshold: 0.3,
        rootMargin: '-20% 0px -20% 0px'
      });

      sections.forEach(section => observer.observe(section));
    },

    populateHeroLinks() {
      // 确保hero区域的导航链接正确设置
      const heroLinksContainer = document.getElementById('hero-links');
      if (!heroLinksContainer) return;

      // 如果已经有链接，不需要重新生成
      if (heroLinksContainer.children.length > 0) return;

      const sectionLinks = [
        { href: '#sec-3-1', label: '3.1 联合分布', icon: 'fa-cube', color: 'neon-blue' },
        { href: '#sec-3-2', label: '3.2 独立性检验', icon: 'fa-microscope', color: 'neon-purple' },
        { href: '#sec-3-3', label: '3.3 变量变换', icon: 'fa-exchange-alt', color: 'neon-green' },
        { href: '#sec-3-4', label: '3.4 相关分析', icon: 'fa-chart-line', color: 'yellow-400' },
        { href: '#sec-3-5', label: '3.5 条件分布', icon: 'fa-filter', color: 'orange-400' }
      ];

      sectionLinks.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.href;
        linkElement.className = `px-4 py-2 rounded-lg border border-${link.color}/30 bg-${link.color}/10 text-${link.color} hover:bg-${link.color}/20 transition-all duration-300 flex items-center gap-2`;
        linkElement.innerHTML = `
          <i class="fa-solid ${link.icon}"></i>
          <span>${link.label}</span>
        `;
        heroLinksContainer.appendChild(linkElement);
      });
    }
  };

  // 主控制器 - 扩展 Chapter 1 的模式
  const Chapter3Controller = {
    parameters: {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      nSamples: 1000,
      distType: 'normal'
    },
    
    currentSamples: [],
    
    init() {
      // 初始化导航控制器
      NavigationController.init();
      
      this.setupEventListeners();
      this.initializeVisualizations();
      this.generateInitialSamples();
      this.updateAllVisualizations();
      
      // 启动背景动画（继承自 Chapter 1）
      this.setupPerlinBackground();
      
      console.log('Chapter 3 initialized with mathematical libraries:', MathEngine.checkLibraries());
    },
    
    setupEventListeners() {
      // 参数控制滑块
      const paramSliders = [
        'mu1-slider', 'mu2-slider', 'sigma1-slider', 
        'sigma2-slider', 'rho-slider', 'n-samples-slider'
      ];
      
      paramSliders.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
          slider.addEventListener('input', (e) => this.updateParameter(id, e.target.value));
        }
      });
      
      // 分布类型选择
      const distTypeSelect = document.getElementById('dist-type');
      if (distTypeSelect) {
        distTypeSelect.addEventListener('change', (e) => {
          this.parameters.distType = e.target.value;
          this.generateSamples();
          this.updateAllVisualizations();
        });
      }
      
      // 按钮事件
      const generateBtn = document.getElementById('generate-samples');
      if (generateBtn) {
        generateBtn.addEventListener('click', () => {
          this.generateSamples();
          this.updateAllVisualizations();
        });
      }
      
      const resetBtn = document.getElementById('reset-params');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetParameters());
      }
    },
    
    initializeVisualizations() {
      // 注册可视化组件
      VisualizationManager.register('joint3d', JointDistributionVisualizer);
      VisualizationManager.register('contour', ContourPlotRenderer);
      VisualizationManager.register('scatter', ScatterPlotGenerator);
      VisualizationManager.register('marginal', MarginalDistributionRenderer);
      
      // 初始化 3D 可视化 - 使用 Three.js
      if (JointDistributionVisualizer.init('joint-3d-plot')) {
        console.log('Three.js 3D visualization initialized');
      } else {
        // 如果 Three.js 不可用，回退到 Plotly.js
        console.log('Falling back to Plotly.js 3D visualization');
        this.init3DPlot();
      }
      
      // 初始化等高线渲染器
      if (ContourPlotRenderer.init('contour-canvas')) {
        console.log('Contour plot renderer initialized');
      }
      
      // 初始化散点图生成器
      if (ScatterPlotGenerator.init('scatter-canvas')) {
        console.log('Scatter plot generator initialized');
      }
      
      // 初始化边际分布渲染器
      if (MarginalDistributionRenderer.init('marginal-canvas')) {
        console.log('Marginal distribution renderer initialized');
      }
      
      // 初始化其他可视化组件
      this.initializeCanvases();
      this.initializeIndependenceTest();
    },
    
    updateParameter(sliderId, value) {
      const paramMap = {
        'mu1-slider': 'mu1',
        'mu2-slider': 'mu2', 
        'sigma1-slider': 'sigma1',
        'sigma2-slider': 'sigma2',
        'rho-slider': 'rho',
        'n-samples-slider': 'nSamples'
      };
      
      const param = paramMap[sliderId];
      if (param) {
        this.parameters[param] = parseFloat(value);
        this.updateParameterDisplay(param, value);
        
        if (param === 'nSamples') {
          this.generateSamples();
        }
        
        this.updateAllVisualizations();
      }
    },
    
    updateParameterDisplay(param, value) {
      const displayMap = {
        mu1: 'mu1-val',
        mu2: 'mu2-val',
        sigma1: 'sigma1-val', 
        sigma2: 'sigma2-val',
        rho: 'rho-val',
        nSamples: 'n-samples-val'
      };
      
      const displayId = displayMap[param];
      const displayElement = document.getElementById(displayId);
      
      if (displayElement) {
        let displayValue = value;
        if (param.includes('mu') || param.includes('sigma')) {
          displayValue = `${value}%`;
        } else if (param === 'rho') {
          displayValue = parseFloat(value).toFixed(1);
        }
        displayElement.textContent = displayValue;
      }
    },
    
    generateInitialSamples() {
      this.generateSamples();
    },
    
    generateSamples() {
      const { mu1, mu2, sigma1, sigma2, rho, nSamples } = this.parameters;
      
      // 构建协方差矩阵
      const mu = [mu1, mu2];
      const sigma = [
        [sigma1 * sigma1, rho * sigma1 * sigma2],
        [rho * sigma1 * sigma2, sigma2 * sigma2]
      ];
      
      this.currentSamples = MathEngine.generateMultivariateNormal(mu, sigma, nSamples);
    },
    
    updateAllVisualizations() {
      // 更新 Three.js 3D 可视化
      if (JointDistributionVisualizer.surface) {
        JointDistributionVisualizer.update(this.parameters);
      }
      
      // 更新等高线图
      if (ContourPlotRenderer.ctx) {
        ContourPlotRenderer.render(this.parameters);
      }
      
      // 更新散点图
      if (ScatterPlotGenerator.ctx) {
        ScatterPlotGenerator.updateSamples(this.currentSamples);
      }
      
      // 更新边际分布图
      if (MarginalDistributionRenderer.ctx) {
        MarginalDistributionRenderer.update(this.currentSamples, this.parameters);
      }
      
      // 更新可视化管理器中的组件
      VisualizationManager.updateAll(this.parameters);
      this.updateStatistics();
    },
    
    updateStatistics() {
      // 计算样本统计量
      const sampleCorr = MathEngine.calculateCorrelation(this.currentSamples);
      const theoryCorr = this.parameters.rho;
      
      // 更新显示
      const theoryCorrEl = document.getElementById('theory-corr');
      const sampleCorrEl = document.getElementById('sample-corr');
      const sampleCountEl = document.getElementById('sample-count');
      
      if (theoryCorrEl) theoryCorrEl.textContent = theoryCorr.toFixed(2);
      if (sampleCorrEl) sampleCorrEl.textContent = sampleCorr.toFixed(2);
      if (sampleCountEl) sampleCountEl.textContent = this.currentSamples.length;
    },
    
    resetParameters() {
      this.parameters = {
        mu1: 5,
        mu2: 8,
        sigma1: 15,
        sigma2: 20,
        rho: 0.3,
        nSamples: 1000,
        distType: 'normal'
      };
      
      // 重置 UI 控件
      Object.keys(this.parameters).forEach(param => {
        const slider = document.getElementById(`${param}-slider`);
        if (slider) {
          slider.value = this.parameters[param];
          this.updateParameterDisplay(param, this.parameters[param]);
        }
      });
      
      this.generateSamples();
      this.updateAllVisualizations();
    },
    
    // 继承 Chapter 1 的背景动画
    setupPerlinBackground() {
      // 复用 Chapter 1 的柏林噪声背景实现
      if (typeof setupPerlinBackground === 'function') {
        setupPerlinBackground();
      }
    }
  };

  // 属性测试模块 - 集成 fast-check
  const PropertyTester = {
    testMathematicalAccuracy() {
      if (!MathEngine.checkLibraries().fastCheck) {
        console.warn('fast-check not available, skipping property tests');
        return { passed: false, reason: 'fast-check not available' };
      }
      
      try {
        // 测试相关系数计算的准确性
        const correlationTest = fc.assert(
          fc.property(
            fc.array(fc.tuple(fc.float(), fc.float()), { minLength: 10, maxLength: 100 }),
            (samples) => {
              const corr = MathEngine.calculateCorrelation(samples);
              return corr >= -1 && corr <= 1; // 相关系数必须在 [-1, 1] 范围内
            }
          ),
          { numRuns: 100 }
        );
        
        return { passed: true, tests: ['correlation_bounds'] };
      } catch (error) {
        return { passed: false, reason: error.message };
      }
    },
    
    testVisualizationUpdates() {
      // 测试可视化更新的一致性
      const testParams = {
        mu1: 0, mu2: 0, sigma1: 1, sigma2: 1, rho: 0.5, nSamples: 100
      };
      
      try {
        VisualizationManager.updateAll(testParams);
        return { passed: true, tests: ['visualization_updates'] };
      } catch (error) {
        return { passed: false, reason: error.message };
      }
    }
  };

  // 词向量空间探索器 - 现代AI应用示例
  const WordVectorSpaceExplorer = {
    canvas: null,
    ctx: null,
    wordVectors: [],
    selectedWords: [],
    viewport: { x: 0, y: 0, scale: 1 },
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
    
    // 预定义的热门词汇和它们的模拟向量
    popularWords: {
      // 网红词汇
      '网红': [-0.2, 0.8], '直播': [0.1, 0.9], '带货': [0.3, 0.7], 
      '粉丝': [-0.1, 0.6], '流量': [0.2, 0.8], '打赏': [0.4, 0.5],
      
      // 科技词汇  
      'AI': [0.8, 0.3], '算法': [0.7, 0.1], '机器学习': [0.9, 0.2],
      '深度学习': [0.8, 0.4], '神经网络': [0.6, 0.3], '大模型': [0.9, 0.5],
      
      // 流行语
      '内卷': [-0.3, -0.2], '躺平': [-0.5, -0.4], '摆烂': [-0.4, -0.3],
      '破防': [-0.2, -0.1], 'emo': [-0.6, -0.2], '社死': [-0.3, -0.5],
      
      // 专业术语
      '概率': [0.1, -0.8], '分布': [0.2, -0.7], '统计': [0.0, -0.9],
      '方差': [0.3, -0.6], '相关性': [0.1, -0.5], '独立性': [-0.1, -0.7],
      
      // 生活词汇
      '咖啡': [-0.8, 0.1], '奶茶': [-0.7, 0.3], '火锅': [-0.9, 0.2],
      '健身': [-0.6, -0.1], '游戏': [-0.5, 0.4], '音乐': [-0.8, 0.5]
    },
    
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return false;
      
      this.ctx = this.canvas.getContext('2d');
      this.generateWordVectors();
      this.setupInteractions();
      this.render();
      return true;
    },
    
    generateWordVectors() {
      this.wordVectors = [];
      
      // 添加预定义的热门词汇
      Object.entries(this.popularWords).forEach(([word, vector]) => {
        // 添加一些随机噪声使分布更真实
        const noisyVector = [
          vector[0] + (Math.random() - 0.5) * 0.1,
          vector[1] + (Math.random() - 0.5) * 0.1
        ];
        
        this.wordVectors.push({
          word: word,
          vector: noisyVector,
          category: this.getWordCategory(word),
          frequency: Math.random() * 100 + 10, // 模拟词频
          similarity: 0 // 与选中词的相似度
        });
      });
      
      // 添加一些随机生成的词汇
      const randomWords = ['词汇A', '词汇B', '词汇C', '词汇D', '词汇E'];
      randomWords.forEach(word => {
        this.wordVectors.push({
          word: word,
          vector: [Math.random() * 2 - 1, Math.random() * 2 - 1],
          category: 'random',
          frequency: Math.random() * 50 + 5,
          similarity: 0
        });
      });
    },
    
    getWordCategory(word) {
      const categories = {
        '网红,直播,带货,粉丝,流量,打赏': 'internet',
        'AI,算法,机器学习,深度学习,神经网络,大模型': 'tech',
        '内卷,躺平,摆烂,破防,emo,社死': 'slang',
        '概率,分布,统计,方差,相关性,独立性': 'academic',
        '咖啡,奶茶,火锅,健身,游戏,音乐': 'lifestyle'
      };
      
      for (const [words, category] of Object.entries(categories)) {
        if (words.includes(word)) return category;
      }
      return 'other';
    },
    
    setupInteractions() {
      // 鼠标拖拽平移
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.lastMousePos = this.getMousePos(e);
      });
      
      this.canvas.addEventListener('mousemove', (e) => {
        const mousePos = this.getMousePos(e);
        
        if (this.isDragging) {
          const deltaX = mousePos.x - this.lastMousePos.x;
          const deltaY = mousePos.y - this.lastMousePos.y;
          
          this.viewport.x += deltaX / this.viewport.scale;
          this.viewport.y += deltaY / this.viewport.scale;
          
          this.lastMousePos = mousePos;
          this.render();
        } else {
          // 检查鼠标悬停的词汇
          this.handleMouseHover(mousePos);
        }
      });
      
      this.canvas.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
      
      // 鼠标滚轮缩放
      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.viewport.scale *= zoomFactor;
        this.viewport.scale = Math.max(0.1, Math.min(5, this.viewport.scale));
        
        this.render();
      });
      
      // 点击选择词汇
      this.canvas.addEventListener('click', (e) => {
        const mousePos = this.getMousePos(e);
        this.handleWordSelection(mousePos);
      });
    },
    
    getMousePos(e) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    },
    
    worldToScreen(worldX, worldY) {
      return {
        x: (worldX + this.viewport.x) * this.viewport.scale + this.canvas.width / 2,
        y: (worldY + this.viewport.y) * this.viewport.scale + this.canvas.height / 2
      };
    },
    
    screenToWorld(screenX, screenY) {
      return {
        x: (screenX - this.canvas.width / 2) / this.viewport.scale - this.viewport.x,
        y: (screenY - this.canvas.height / 2) / this.viewport.scale - this.viewport.y
      };
    },
    
    handleMouseHover(mousePos) {
      const worldPos = this.screenToWorld(mousePos.x, mousePos.y);
      
      // 查找最近的词汇
      let closestWord = null;
      let minDistance = Infinity;
      
      this.wordVectors.forEach(wordData => {
        const screenPos = this.worldToScreen(wordData.vector[0], wordData.vector[1]);
        const distance = Math.sqrt(
          Math.pow(screenPos.x - mousePos.x, 2) + 
          Math.pow(screenPos.y - mousePos.y, 2)
        );
        
        if (distance < 30 && distance < minDistance) {
          minDistance = distance;
          closestWord = wordData;
        }
      });
      
      // 更新悬停状态
      this.wordVectors.forEach(wordData => {
        wordData.isHovered = wordData === closestWord;
      });
      
      this.render();
    },
    
    handleWordSelection(mousePos) {
      const worldPos = this.screenToWorld(mousePos.x, mousePos.y);
      
      // 查找点击的词汇
      let clickedWord = null;
      let minDistance = Infinity;
      
      this.wordVectors.forEach(wordData => {
        const screenPos = this.worldToScreen(wordData.vector[0], wordData.vector[1]);
        const distance = Math.sqrt(
          Math.pow(screenPos.x - mousePos.x, 2) + 
          Math.pow(screenPos.y - mousePos.y, 2)
        );
        
        if (distance < 30 && distance < minDistance) {
          minDistance = distance;
          clickedWord = wordData;
        }
      });
      
      if (clickedWord) {
        // 切换选择状态
        const index = this.selectedWords.indexOf(clickedWord);
        if (index > -1) {
          this.selectedWords.splice(index, 1);
        } else {
          this.selectedWords.push(clickedWord);
        }
        
        // 计算相似度
        this.calculateSimilarities();
        this.render();
      }
    },
    
    calculateSimilarities() {
      if (this.selectedWords.length === 0) {
        this.wordVectors.forEach(wordData => {
          wordData.similarity = 0;
        });
        return;
      }
      
      // 计算与选中词汇的平均相似度
      this.wordVectors.forEach(wordData => {
        let totalSimilarity = 0;
        
        this.selectedWords.forEach(selectedWord => {
          const similarity = this.cosineSimilarity(wordData.vector, selectedWord.vector);
          totalSimilarity += similarity;
        });
        
        wordData.similarity = totalSimilarity / this.selectedWords.length;
      });
    },
    
    cosineSimilarity(vec1, vec2) {
      const dotProduct = vec1[0] * vec2[0] + vec1[1] * vec2[1];
      const magnitude1 = Math.sqrt(vec1[0] * vec1[0] + vec1[1] * vec1[1]);
      const magnitude2 = Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1]);
      
      return dotProduct / (magnitude1 * magnitude2);
    },
    
    render() {
      if (!this.ctx) return;
      
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      // 清空画布
      this.ctx.clearRect(0, 0, width, height);
      
      // 绘制背景网格
      this.drawGrid();
      
      // 绘制坐标轴
      this.drawAxes();
      
      // 绘制词向量点
      this.drawWordVectors();
      
      // 绘制连接线（相似词汇）
      this.drawSimilarityConnections();
      
      // 绘制选中词汇的高亮
      this.drawSelectedWords();
      
      // 绘制信息面板
      this.drawInfoPanel();
      
      // 绘制控制说明
      this.drawControls();
    },
    
    drawGrid() {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([2, 2]);
      
      const gridSpacing = 0.2;
      
      for (let x = -2; x <= 2; x += gridSpacing) {
        const screenPos = this.worldToScreen(x, 0);
        this.ctx.beginPath();
        this.ctx.moveTo(screenPos.x, 0);
        this.ctx.lineTo(screenPos.x, this.canvas.height);
        this.ctx.stroke();
      }
      
      for (let y = -2; y <= 2; y += gridSpacing) {
        const screenPos = this.worldToScreen(0, y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, screenPos.y);
        this.ctx.lineTo(this.canvas.width, screenPos.y);
        this.ctx.stroke();
      }
      
      this.ctx.setLineDash([]);
    },
    
    drawAxes() {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 2;
      
      // X轴
      const xAxisY = this.worldToScreen(0, 0).y;
      this.ctx.beginPath();
      this.ctx.moveTo(0, xAxisY);
      this.ctx.lineTo(this.canvas.width, xAxisY);
      this.ctx.stroke();
      
      // Y轴
      const yAxisX = this.worldToScreen(0, 0).x;
      this.ctx.beginPath();
      this.ctx.moveTo(yAxisX, 0);
      this.ctx.lineTo(yAxisX, this.canvas.height);
      this.ctx.stroke();
      
      // 轴标签
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('语义维度1', this.canvas.width - 60, xAxisY - 10);
      
      this.ctx.save();
      this.ctx.translate(yAxisX + 15, 60);
      this.ctx.rotate(-Math.PI / 2);
      this.ctx.fillText('语义维度2', 0, 0);
      this.ctx.restore();
    },
    
    drawWordVectors() {
      this.wordVectors.forEach(wordData => {
        const screenPos = this.worldToScreen(wordData.vector[0], wordData.vector[1]);
        
        // 跳过屏幕外的点
        if (screenPos.x < -50 || screenPos.x > this.canvas.width + 50 ||
            screenPos.y < -50 || screenPos.y > this.canvas.height + 50) {
          return;
        }
        
        // 根据类别设置颜色
        const color = this.getCategoryColor(wordData.category);
        
        // 根据相似度调整透明度和大小
        const similarity = Math.abs(wordData.similarity);
        const alpha = wordData.isHovered ? 1 : (0.3 + similarity * 0.7);
        const radius = wordData.isHovered ? 8 : (4 + similarity * 4);
        
        // 绘制词汇点
        this.ctx.fillStyle = color.replace('1)', `${alpha})`);
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 绘制边框
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = wordData.isHovered ? 3 : 1;
        this.ctx.stroke();
        
        // 绘制词汇文本
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = wordData.isHovered ? '12px Arial' : '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(wordData.word, screenPos.x, screenPos.y - radius - 2);
      });
    },
    
    getCategoryColor(category) {
      const colors = {
        'internet': 'rgba(255, 107, 107, 1)', // 红色 - 网红
        'tech': 'rgba(34, 211, 238, 1)',      // 青色 - 科技
        'slang': 'rgba(191, 0, 255, 1)',      // 紫色 - 流行语
        'academic': 'rgba(0, 255, 102, 1)',   // 绿色 - 学术
        'lifestyle': 'rgba(255, 193, 7, 1)',  // 黄色 - 生活
        'other': 'rgba(128, 128, 128, 1)'     // 灰色 - 其他
      };
      
      return colors[category] || colors['other'];
    },
    
    drawSimilarityConnections() {
      if (this.selectedWords.length === 0) return;
      
      // 绘制高相似度词汇之间的连接线
      this.wordVectors.forEach(wordData => {
        if (wordData.similarity > 0.7) {
          this.selectedWords.forEach(selectedWord => {
            const pos1 = this.worldToScreen(wordData.vector[0], wordData.vector[1]);
            const pos2 = this.worldToScreen(selectedWord.vector[0], selectedWord.vector[1]);
            
            this.ctx.strokeStyle = `rgba(0, 255, 102, ${wordData.similarity * 0.5})`;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(pos1.x, pos1.y);
            this.ctx.lineTo(pos2.x, pos2.y);
            this.ctx.stroke();
          });
        }
      });
      
      this.ctx.setLineDash([]);
    },
    
    drawSelectedWords() {
      this.selectedWords.forEach(wordData => {
        const screenPos = this.worldToScreen(wordData.vector[0], wordData.vector[1]);
        
        // 绘制选中高亮圈
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([]);
        
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, 12, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // 绘制脉冲效果
        const time = Date.now() * 0.005;
        const pulseRadius = 15 + Math.sin(time) * 5;
        
        this.ctx.strokeStyle = `rgba(255, 255, 0, ${0.3 + Math.sin(time) * 0.2})`;
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, pulseRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
      });
    },
    
    drawInfoPanel() {
      // 绘制信息面板
      const panelX = 10;
      const panelY = 10;
      const panelW = 250;
      const panelH = 200;
      
      this.ctx.fillStyle = 'rgba(15, 23, 48, 0.9)';
      this.ctx.fillRect(panelX, panelY, panelW, panelH);
      
      this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(panelX, panelY, panelW, panelH);
      
      // 标题
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText('词向量空间探索器', panelX + 10, panelY + 10);
      
      // 说明文字
      this.ctx.font = '11px Arial';
      const explanations = [
        '• 每个点代表一个词汇的向量表示',
        '• 相近的词汇在空间中距离更近',
        '• 颜色表示不同的语义类别',
        '• 点击词汇查看相似词汇连接',
        '',
        '类别说明:',
        '🔴 网红词汇  🔵 科技词汇',
        '🟣 流行语    🟢 学术词汇', 
        '🟡 生活词汇  ⚪ 其他词汇'
      ];
      
      explanations.forEach((text, i) => {
        this.ctx.fillText(text, panelX + 10, panelY + 35 + i * 14);
      });
      
      // 选中词汇信息
      if (this.selectedWords.length > 0) {
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        this.ctx.fillText(`已选中: ${this.selectedWords.map(w => w.word).join(', ')}`, 
                          panelX + 10, panelY + panelH - 20);
      }
    },
    
    drawControls() {
      // 绘制控制说明
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'bottom';
      
      const controls = [
        '拖拽: 平移视图',
        '滚轮: 缩放',
        '点击: 选择词汇'
      ];
      
      controls.forEach((text, i) => {
        this.ctx.fillText(text, this.canvas.width - 10, 
                          this.canvas.height - 10 - i * 12);
      });
    },
    
    // 添加新词汇
    addWord(word, vector) {
      this.wordVectors.push({
        word: word,
        vector: vector,
        category: 'custom',
        frequency: 50,
        similarity: 0,
        isHovered: false
      });
      
      this.render();
    },
    
    // 重置视图
    resetView() {
      this.viewport = { x: 0, y: 0, scale: 1 };
      this.selectedWords = [];
      this.calculateSimilarities();
      this.render();
    }
  };

  // 麦克斯韦-玻尔兹曼分子速度分析器 - 物理学应用示例
  const MaxwellBoltzmannAnalyzer = {
    canvas: null,
    ctx: null,
    temperature: 300, // 开尔文
    moleculeCount: 1000,
    velocityData: [],
    animationId: null,
    
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return false;
      
      this.ctx = this.canvas.getContext('2d');
      this.generateVelocityData();
      this.setupControls();
      this.startAnimation();
      return true;
    },
    
    setupControls() {
      // 温度控制
      const tempSlider = document.getElementById('temperature-slider');
      if (tempSlider) {
        tempSlider.addEventListener('input', (e) => {
          this.temperature = parseFloat(e.target.value);
          this.generateVelocityData();
          this.updateTemperatureDisplay();
        });
      }
      
      // 分子数量控制
      const countSlider = document.getElementById('molecule-count-slider');
      if (countSlider) {
        countSlider.addEventListener('input', (e) => {
          this.moleculeCount = parseInt(e.target.value);
          this.generateVelocityData();
        });
      }
    },
    
    generateVelocityData() {
      this.velocityData = [];
      
      // 玻尔兹曼常数和分子质量（简化值）
      const k = 1.38e-23; // 玻尔兹曼常数
      const m = 4.65e-26; // 氮气分子质量 (kg)
      
      // 计算最可能速度
      const vmp = Math.sqrt(2 * k * this.temperature / m);
      
      // 生成三维速度分量
      for (let i = 0; i < this.moleculeCount; i++) {
        // 使用Box-Muller变换生成正态分布的速度分量
        const [vx1, vy1] = this.boxMullerTransform();
        const [vz1, vx2] = this.boxMullerTransform();
        
        // 缩放到合适的速度范围
        const scale = vmp / 3;
        const vx = vx1 * scale;
        const vy = vy1 * scale;
        const vz = vz1 * scale;
        
        // 计算速度大小
        const speed = Math.sqrt(vx*vx + vy*vy + vz*vz);
        
        this.velocityData.push({
          vx: vx,
          vy: vy, 
          vz: vz,
          speed: speed,
          // 添加可视化用的位置
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          // 颜色基于速度
          color: this.speedToColor(speed / vmp)
        });
      }
    },
    
    boxMullerTransform() {
      const u1 = Math.random();
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      return [z1, z2];
    },
    
    speedToColor(normalizedSpeed) {
      // 将速度映射到颜色：蓝色(慢) -> 绿色(中等) -> 红色(快)
      const colors = [
        { r: 0, g: 100, b: 255 },   // 蓝色
        { r: 0, g: 255, b: 100 },   // 绿色
        { r: 255, g: 200, b: 0 },   // 黄色
        { r: 255, g: 50, b: 50 }    // 红色
      ];
      
      const scaledSpeed = Math.min(normalizedSpeed * 2, colors.length - 1);
      const index = Math.floor(scaledSpeed);
      const fraction = scaledSpeed - index;
      
      if (index >= colors.length - 1) {
        const color = colors[colors.length - 1];
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
      }
      
      const color1 = colors[index];
      const color2 = colors[index + 1];
      
      const r = Math.floor(color1.r + (color2.r - color1.r) * fraction);
      const g = Math.floor(color1.g + (color2.g - color1.g) * fraction);
      const b = Math.floor(color1.b + (color2.b - color1.b) * fraction);
      
      return `rgb(${r}, ${g}, ${b})`;
    },
    
    startAnimation() {
      const animate = () => {
        this.render();
        this.animationId = requestAnimationFrame(animate);
      };
      animate();
    },
    
    render() {
      if (!this.ctx) return;
      
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      // 清空画布
      this.ctx.clearRect(0, 0, width, height);
      
      // 绘制背景
      this.drawBackground();
      
      // 绘制分子
      this.drawMolecules();
      
      // 绘制速度分布图
      this.drawVelocityDistribution();
      
      // 绘制边际分布
      this.drawMarginalDistributions();
      
      // 绘制统计信息
      this.drawStatistics();
      
      // 更新分子位置（简单的布朗运动）
      this.updateMoleculePositions();
    },
    
    drawBackground() {
      // 绘制容器边界
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
      
      // 绘制标题
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('麦克斯韦-玻尔兹曼分子速度分析器', this.canvas.width / 2, 30);
      
      // 绘制温度显示
      this.ctx.font = '14px Arial';
      this.ctx.fillText(`温度: ${this.temperature}K`, this.canvas.width / 2, 50);
    },
    
    drawMolecules() {
      // 绘制分子点
      this.velocityData.forEach(molecule => {
        const radius = 2 + molecule.speed * 0.1;
        
        this.ctx.fillStyle = molecule.color;
        this.ctx.globalAlpha = 0.7;
        
        this.ctx.beginPath();
        this.ctx.arc(molecule.x, molecule.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 绘制速度向量（缩放显示）
        const scale = 10;
        const endX = molecule.x + molecule.vx * scale;
        const endY = molecule.y + molecule.vy * scale;
        
        this.ctx.strokeStyle = molecule.color;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(molecule.x, molecule.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      });
      
      this.ctx.globalAlpha = 1;
    },
    
    drawVelocityDistribution() {
      // 在右侧绘制速度分布直方图
      const histX = this.canvas.width * 0.7;
      const histY = this.canvas.height * 0.1;
      const histW = this.canvas.width * 0.25;
      const histH = this.canvas.height * 0.4;
      
      // 计算速度分布
      const speeds = this.velocityData.map(m => m.speed);
      const maxSpeed = Math.max(...speeds);
      const bins = 20;
      const binWidth = maxSpeed / bins;
      const histogram = new Array(bins).fill(0);
      
      speeds.forEach(speed => {
        const binIndex = Math.min(Math.floor(speed / binWidth), bins - 1);
        histogram[binIndex]++;
      });
      
      const maxCount = Math.max(...histogram);
      
      // 绘制直方图背景
      this.ctx.fillStyle = 'rgba(15, 23, 48, 0.8)';
      this.ctx.fillRect(histX, histY, histW, histH);
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(histX, histY, histW, histH);
      
      // 绘制直方图条
      histogram.forEach((count, i) => {
        const barHeight = (count / maxCount) * histH * 0.8;
        const barX = histX + (i / bins) * histW;
        const barY = histY + histH - barHeight;
        const barWidth = histW / bins;
        
        this.ctx.fillStyle = '#00f3ff';
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.globalAlpha = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
      });
      
      // 绘制理论麦克斯韦-玻尔兹曼分布曲线
      this.drawTheoreticalDistribution(histX, histY, histW, histH, maxSpeed);
      
      // 标题
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('速度分布', histX + histW / 2, histY - 5);
    },
    
    drawTheoreticalDistribution(histX, histY, histW, histH, maxSpeed) {
      // 绘制理论麦克斯韦-玻尔兹曼分布
      const k = 1.38e-23;
      const m = 4.65e-26;
      const T = this.temperature;
      
      this.ctx.strokeStyle = '#ff6b6b';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([]);
      
      this.ctx.beginPath();
      
      const points = 100;
      for (let i = 0; i <= points; i++) {
        const v = (i / points) * maxSpeed;
        
        // 麦克斯韦-玻尔兹曼分布公式
        const coefficient = 4 * Math.PI * Math.pow(m / (2 * Math.PI * k * T), 1.5);
        const exponential = Math.exp(-m * v * v / (2 * k * T));
        const density = coefficient * v * v * exponential;
        
        // 归一化到直方图高度
        const normalizedDensity = density * this.moleculeCount * 1000; // 缩放因子
        const y = histY + histH - (normalizedDensity / 100) * histH * 0.8;
        const x = histX + (i / points) * histW;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.stroke();
    },
    
    drawMarginalDistributions() {
      // 绘制X、Y、Z速度分量的边际分布
      const marginalY = this.canvas.height * 0.6;
      const marginalH = this.canvas.height * 0.35;
      const marginalW = this.canvas.width * 0.2;
      
      // X分量分布
      this.drawComponentDistribution(
        this.velocityData.map(m => m.vx),
        0.05 * this.canvas.width, marginalY, marginalW, marginalH,
        'Vx分量', '#00f3ff'
      );
      
      // Y分量分布
      this.drawComponentDistribution(
        this.velocityData.map(m => m.vy),
        0.3 * this.canvas.width, marginalY, marginalW, marginalH,
        'Vy分量', '#bf00ff'
      );
      
      // Z分量分布
      this.drawComponentDistribution(
        this.velocityData.map(m => m.vz),
        0.55 * this.canvas.width, marginalY, marginalW, marginalH,
        'Vz分量', '#00ff66'
      );
    },
    
    drawComponentDistribution(values, x, y, w, h, title, color) {
      // 绘制单个速度分量的分布
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal;
      const bins = 15;
      const binWidth = range / bins;
      const histogram = new Array(bins).fill(0);
      
      values.forEach(val => {
        const binIndex = Math.min(Math.floor((val - minVal) / binWidth), bins - 1);
        histogram[binIndex]++;
      });
      
      const maxCount = Math.max(...histogram);
      
      // 背景
      this.ctx.fillStyle = 'rgba(15, 23, 48, 0.6)';
      this.ctx.fillRect(x, y, w, h);
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, w, h);
      
      // 直方图
      histogram.forEach((count, i) => {
        const barHeight = (count / maxCount) * h * 0.8;
        const barX = x + (i / bins) * w;
        const barY = y + h - barHeight;
        const barWidth = w / bins;
        
        this.ctx.fillStyle = color + '80';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
      });
      
      // 标题
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(title, x + w / 2, y - 5);
    },
    
    drawStatistics() {
      // 绘制统计信息
      const statsX = 10;
      const statsY = this.canvas.height * 0.6;
      
      const speeds = this.velocityData.map(m => m.speed);
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const maxSpeed = Math.max(...speeds);
      
      // 理论平均速度
      const k = 1.38e-23;
      const m = 4.65e-26;
      const theoreticalAvg = Math.sqrt(8 * k * this.temperature / (Math.PI * m));
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'left';
      
      const stats = [
        `分子数量: ${this.moleculeCount}`,
        `平均速度: ${(avgSpeed * 1000).toFixed(1)} m/s`,
        `理论平均: ${(theoreticalAvg * 1000).toFixed(1)} m/s`,
        `最大速度: ${(maxSpeed * 1000).toFixed(1)} m/s`,
        `温度: ${this.temperature} K`
      ];
      
      stats.forEach((stat, i) => {
        this.ctx.fillText(stat, statsX, statsY + i * 16);
      });
    },
    
    updateMoleculePositions() {
      // 简单的分子运动更新
      this.velocityData.forEach(molecule => {
        // 根据速度更新位置
        molecule.x += molecule.vx * 0.1;
        molecule.y += molecule.vy * 0.1;
        
        // 边界反弹
        if (molecule.x <= 15 || molecule.x >= this.canvas.width - 15) {
          molecule.vx *= -0.8; // 能量损失
          molecule.x = Math.max(15, Math.min(this.canvas.width - 15, molecule.x));
        }
        
        if (molecule.y <= 15 || molecule.y >= this.canvas.height * 0.55) {
          molecule.vy *= -0.8;
          molecule.y = Math.max(15, Math.min(this.canvas.height * 0.55, molecule.y));
        }
        
        // 重新计算速度大小和颜色
        molecule.speed = Math.sqrt(molecule.vx*molecule.vx + molecule.vy*molecule.vy + molecule.vz*molecule.vz);
        molecule.color = this.speedToColor(molecule.speed / 1000);
      });
    },
    
    updateTemperatureDisplay() {
      const tempDisplay = document.getElementById('temperature-val');
      if (tempDisplay) {
        tempDisplay.textContent = `${this.temperature}K`;
      }
    },
    
    dispose() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  };

  // 场景切换系统 - 在传统和现代应用之间切换
  const ScenarioSwitcher = {
    currentScenario: 'traditional',
    scenarios: {
      traditional: {
        name: '传统统计学',
        description: '经典概率论和统计学概念',
        examples: ['正态分布', '相关分析', '假设检验'],
        color: '#00f3ff'
      },
      modern: {
        name: '现代应用',
        description: '当代科技和生活中的统计应用',
        examples: ['AI算法', '社交媒体', '电商推荐'],
        color: '#bf00ff'
      },
      trendy: {
        name: '潮流热点',
        description: '网络文化和流行趋势分析',
        examples: ['网红经济', '短视频', '游戏数据'],
        color: '#00ff66'
      }
    },
    
    init() {
      this.setupScenarioTabs();
      this.setupTransitions();
      this.loadScenario(this.currentScenario);
    },
    
    setupScenarioTabs() {
      const tabContainer = document.getElementById('scenario-tabs');
      if (!tabContainer) return;
      
      // 清空现有标签
      tabContainer.innerHTML = '';
      
      // 创建场景标签
      Object.entries(this.scenarios).forEach(([key, scenario]) => {
        const tab = document.createElement('button');
        tab.className = `scenario-tab px-4 py-2 rounded-lg border transition-all duration-300 ${
          key === this.currentScenario 
            ? 'border-' + scenario.color.substring(1) + ' bg-' + scenario.color.substring(1) + '/20 text-' + scenario.color.substring(1)
            : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
        }`;
        tab.textContent = scenario.name;
        tab.addEventListener('click', () => this.switchScenario(key));
        
        tabContainer.appendChild(tab);
      });
    },
    
    setupTransitions() {
      // 设置平滑过渡效果
      const visualizationContainers = document.querySelectorAll('.visualization-container');
      visualizationContainers.forEach(container => {
        container.style.transition = 'all 0.5s ease-in-out';
      });
    },
    
    switchScenario(scenarioKey) {
      if (scenarioKey === this.currentScenario) return;
      
      const oldScenario = this.currentScenario;
      this.currentScenario = scenarioKey;
      
      // 更新标签样式
      this.updateTabStyles();
      
      // 执行场景切换动画
      this.animateScenarioTransition(oldScenario, scenarioKey);
      
      // 加载新场景内容
      this.loadScenario(scenarioKey);
      
      // 更新可视化参数
      this.updateVisualizationForScenario(scenarioKey);
    },
    
    updateTabStyles() {
      const tabs = document.querySelectorAll('.scenario-tab');
      tabs.forEach((tab, index) => {
        const scenarioKey = Object.keys(this.scenarios)[index];
        const scenario = this.scenarios[scenarioKey];
        
        if (scenarioKey === this.currentScenario) {
          tab.className = `scenario-tab px-4 py-2 rounded-lg border border-${scenario.color.substring(1)} bg-${scenario.color.substring(1)}/20 text-${scenario.color.substring(1)} transition-all duration-300`;
        } else {
          tab.className = 'scenario-tab px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 transition-all duration-300';
        }
      });
    },
    
    animateScenarioTransition(oldScenario, newScenario) {
      // 创建过渡效果
      const overlay = document.createElement('div');
      overlay.className = 'scenario-transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, ${this.scenarios[oldScenario].color}40, ${this.scenarios[newScenario].color}40);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        pointer-events: none;
      `;
      
      document.body.appendChild(overlay);
      
      // 淡入效果
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
      
      // 淡出并移除
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      }, 500);
    },
    
    loadScenario(scenarioKey) {
      const scenario = this.scenarios[scenarioKey];
      
      // 更新场景描述
      this.updateScenarioDescription(scenario);
      
      // 更新示例内容
      this.updateExamples(scenario, scenarioKey);
      
      // 更新可视化主题
      this.updateVisualizationTheme(scenario);
    },
    
    updateScenarioDescription(scenario) {
      const descElement = document.getElementById('scenario-description');
      if (descElement) {
        descElement.innerHTML = `
          <h3 class="text-lg font-bold mb-2" style="color: ${scenario.color}">
            ${scenario.name}
          </h3>
          <p class="text-gray-300 mb-4">${scenario.description}</p>
        `;
      }
    },
    
    updateExamples(scenario, scenarioKey) {
      const examplesContainer = document.getElementById('scenario-examples');
      if (!examplesContainer) return;
      
      examplesContainer.innerHTML = '';
      
      scenario.examples.forEach((example, index) => {
        const exampleElement = document.createElement('div');
        exampleElement.className = 'example-item p-3 rounded-lg border border-gray-600 bg-gray-800/30 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer';
        exampleElement.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" style="background-color: ${scenario.color}"></div>
            <span class="text-white">${example}</span>
          </div>
        `;
        
        exampleElement.addEventListener('click', () => {
          this.loadExample(scenarioKey, index);
        });
        
        examplesContainer.appendChild(exampleElement);
      });
    },
    
    updateVisualizationTheme(scenario) {
      // 更新可视化组件的主题色彩
      const visualizations = document.querySelectorAll('canvas');
      visualizations.forEach(canvas => {
        canvas.style.borderColor = scenario.color + '40';
      });
      
      // 更新控制面板主题
      const controlPanels = document.querySelectorAll('.control-panel');
      controlPanels.forEach(panel => {
        panel.style.borderColor = scenario.color + '30';
      });
    },
    
    updateVisualizationForScenario(scenarioKey) {
      // 根据场景调整可视化参数
      switch (scenarioKey) {
        case 'traditional':
          this.loadTraditionalParameters();
          break;
        case 'modern':
          this.loadModernParameters();
          break;
        case 'trendy':
          this.loadTrendyParameters();
          break;
      }
    },
    
    loadTraditionalParameters() {
      // 传统统计学参数
      if (typeof Chapter3Controller !== 'undefined') {
        Chapter3Controller.parameters = {
          mu1: 0,
          mu2: 0,
          sigma1: 1,
          sigma2: 1,
          rho: 0.5,
          nSamples: 1000,
          distType: 'normal'
        };
        Chapter3Controller.updateAllVisualizations();
      }
      
      // 更新词向量为学术词汇
      if (WordVectorSpaceExplorer.canvas) {
        WordVectorSpaceExplorer.selectedWords = [];
        WordVectorSpaceExplorer.render();
      }
    },
    
    loadModernParameters() {
      // 现代应用参数 - 更复杂的分布
      if (typeof Chapter3Controller !== 'undefined') {
        Chapter3Controller.parameters = {
          mu1: 10,
          mu2: 15,
          sigma1: 8,
          sigma2: 12,
          rho: 0.7,
          nSamples: 2000,
          distType: 'normal'
        };
        Chapter3Controller.updateAllVisualizations();
      }
    },
    
    loadTrendyParameters() {
      // 潮流热点参数 - 偏态分布
      if (typeof Chapter3Controller !== 'undefined') {
        Chapter3Controller.parameters = {
          mu1: 20,
          mu2: 25,
          sigma1: 15,
          sigma2: 18,
          rho: 0.3,
          nSamples: 1500,
          distType: 'exponential'
        };
        Chapter3Controller.updateAllVisualizations();
      }
    },
    
    loadExample(scenarioKey, exampleIndex) {
      const scenario = this.scenarios[scenarioKey];
      const example = scenario.examples[exampleIndex];
      
      // 显示示例详情
      this.showExampleDetails(scenarioKey, example);
      
      // 根据示例调整可视化
      this.adjustVisualizationForExample(scenarioKey, exampleIndex);
    },
    
    showExampleDetails(scenarioKey, example) {
      // 创建示例详情弹窗
      const modal = document.createElement('div');
      modal.className = 'example-modal';
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(15, 23, 48, 0.95);
        border: 1px solid ${this.scenarios[scenarioKey].color}40;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        z-index: 1001;
        backdrop-filter: blur(10px);
      `;
      
      modal.innerHTML = `
        <div class="example-details">
          <h4 class="text-xl font-bold mb-4" style="color: ${this.scenarios[scenarioKey].color}">
            ${example}
          </h4>
          <p class="text-gray-300 mb-4">
            ${this.getExampleDescription(scenarioKey, example)}
          </p>
          <div class="flex justify-end gap-3">
            <button class="close-modal px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
              关闭
            </button>
            <button class="apply-example px-4 py-2 rounded-lg text-white transition-colors" 
                    style="background-color: ${this.scenarios[scenarioKey].color}">
              应用示例
            </button>
          </div>
        </div>
      `;
      
      // 添加背景遮罩
      const backdrop = document.createElement('div');
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
      `;
      
      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
      
      // 事件监听
      modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
      });
      
      modal.querySelector('.apply-example').addEventListener('click', () => {
        this.applyExample(scenarioKey, example);
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
      });
      
      backdrop.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
      });
    },
    
    getExampleDescription(scenarioKey, example) {
      const descriptions = {
        traditional: {
          '正态分布': '经典的钟形分布，广泛应用于自然现象和测量误差分析。',
          '相关分析': '研究两个或多个变量之间线性关系强度的统计方法。',
          '假设检验': '基于样本数据对总体参数进行推断的统计推理方法。'
        },
        modern: {
          'AI算法': '机器学习中的概率分布应用，如贝叶斯网络和神经网络。',
          '社交媒体': '用户行为分析、内容推荐和病毒传播建模。',
          '电商推荐': '基于用户历史行为的协同过滤和个性化推荐系统。'
        },
        trendy: {
          '网红经济': '分析网红影响力、粉丝互动和商业转化的统计模型。',
          '短视频': '视频内容特征与用户参与度的相关性分析。',
          '游戏数据': '玩家行为模式、游戏平衡性和收益优化分析。'
        }
      };
      
      return descriptions[scenarioKey]?.[example] || '暂无详细描述';
    },
    
    adjustVisualizationForExample(scenarioKey, exampleIndex) {
      // 根据具体示例调整可视化参数
      const adjustments = {
        traditional: [
          { mu1: 0, mu2: 0, sigma1: 1, sigma2: 1, rho: 0 },
          { mu1: 5, mu2: 8, sigma1: 2, sigma2: 3, rho: 0.8 },
          { mu1: 10, mu2: 10, sigma1: 5, sigma2: 5, rho: 0.2 }
        ],
        modern: [
          { mu1: 15, mu2: 20, sigma1: 8, sigma2: 10, rho: 0.6 },
          { mu1: 25, mu2: 30, sigma1: 12, sigma2: 15, rho: 0.4 },
          { mu1: 35, mu2: 40, sigma1: 18, sigma2: 20, rho: 0.7 }
        ],
        trendy: [
          { mu1: 50, mu2: 60, sigma1: 25, sigma2: 30, rho: 0.5 },
          { mu1: 40, mu2: 45, sigma1: 20, sigma2: 22, rho: 0.3 },
          { mu1: 30, mu2: 35, sigma1: 15, sigma2: 18, rho: 0.8 }
        ]
      };
      
      const params = adjustments[scenarioKey]?.[exampleIndex];
      if (params && typeof Chapter3Controller !== 'undefined') {
        Object.assign(Chapter3Controller.parameters, params);
        Chapter3Controller.generateSamples();
        Chapter3Controller.updateAllVisualizations();
      }
    },
    
    applyExample(scenarioKey, example) {
      // 应用示例到当前可视化
      console.log(`应用示例: ${scenarioKey} - ${example}`);
      
      // 显示应用成功提示
      this.showSuccessMessage(`已应用示例: ${example}`);
    },
    
    showSuccessMessage(message) {
      const toast = document.createElement('div');
      toast.className = 'success-toast';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 255, 102, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1002;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
      `;
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      // 滑入动画
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
      }, 10);
      
      // 自动移除
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  };

  // 初始化函数
  function initializeChapter3() {
    // 检查数学库可用性
    const libraries = MathEngine.checkLibraries();
    console.log('Chapter 3 initializing with libraries:', libraries);
    
    // 初始化主控制器
    Chapter3Controller.init();
    
    // 初始化词向量空间探索器
    if (WordVectorSpaceExplorer.init('word-vector-canvas')) {
      console.log('Word Vector Space Explorer initialized');
      VisualizationManager.register('wordVectors', WordVectorSpaceExplorer);
    }
    
    // 初始化麦克斯韦-玻尔兹曼分析器
    if (MaxwellBoltzmannAnalyzer.init('maxwell-boltzmann-canvas')) {
      console.log('Maxwell-Boltzmann Analyzer initialized');
      VisualizationManager.register('maxwellBoltzmann', MaxwellBoltzmannAnalyzer);
    }
    
    // 初始化场景切换系统
    ScenarioSwitcher.init();
    
    console.log('Chapter 3 initialization complete');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChapter3);
  } else {
    initializeChapter3();
  }

})();

// Chapter3Controller 类的其余方法
const Chapter3Controller = {
  // ... 其他属性和方法 ...

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
  },

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
  },

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

  // 密度等高线渲染器 - 增强版
  const ContourPlotRenderer = {
    canvas: null,
    ctx: null,
    densityGrid: null,
    gridResolution: 100,
    
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return false;
      
      this.ctx = this.canvas.getContext('2d');
      return true;
    },
    
    render(parameters) {
      if (!this.ctx) return;
      
      const { mu1, mu2, sigma1, sigma2, rho, distType = 'normal' } = parameters;
      const distributionType = distType;
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      this.ctx.clearRect(0, 0, width, height);
      
      // 设置绘制范围 - 根据分布类型调整
      let xRange, yRange;
      if (distributionType === 'uniform') {
        xRange = 6 * Math.max(sigma1, 10);
        yRange = 6 * Math.max(sigma2, 10);
      } else if (distributionType === 'exponential') {
        xRange = 8 * Math.max(sigma1, 15);
        yRange = 8 * Math.max(sigma2, 15);
      } else {
        xRange = 4 * Math.max(sigma1, 20);
        yRange = 4 * Math.max(sigma2, 20);
      }
      
      const xMin = mu1 - xRange / 2;
      const xMax = mu1 + xRange / 2;
      const yMin = mu2 - yRange / 2;
      const yMax = mu2 + yRange / 2;
      
      // 生成密度网格
      this.generateDensityGrid(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType);
      
      // 使用D3.js生成等高线
      if (typeof d3 !== 'undefined' && d3.contours) {
        this.renderD3Contours(xMin, xMax, yMin, yMax);
      } else {
        // 回退到自定义等高线算法
        this.renderCustomContours(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType);
      }
      
      // 添加渐变填充背景
      this.drawDensityGradient(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType);
      
      // 绘制坐标轴和标签
      this.drawAxes(xMin, xMax, yMin, yMax);
      
      // 添加图例
      this.drawColorLegend();
    },
    
    generateDensityGrid(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType) {
      const resolution = this.gridResolution;
      this.densityGrid = new Array(resolution);
      
      for (let i = 0; i < resolution; i++) {
        this.densityGrid[i] = new Array(resolution);
        for (let j = 0; j < resolution; j++) {
          const x = xMin + (i / (resolution - 1)) * (xMax - xMin);
          const y = yMin + (j / (resolution - 1)) * (yMax - yMin);
          
          this.densityGrid[i][j] = this.calculateDensity(x, y, mu1, mu2, sigma1, sigma2, rho, distributionType);
        }
      }
    },
    
    calculateDensity(x, y, mu1, mu2, sigma1, sigma2, rho, distributionType) {
      switch (distributionType) {
        case 'uniform':
          return this.bivariateUniformPDF(x, y, mu1, mu2, sigma1, sigma2);
        case 'exponential':
          return this.bivariateExponentialPDF(x, y, mu1, mu2, sigma1, sigma2);
        default:
          return this.bivariateNormalPDF(x, y, mu1, mu2, sigma1, sigma2, rho);
      }
    },
    
    bivariateNormalPDF(x, y, mu1, mu2, sigma1, sigma2, rho) {
      const z1 = (x - mu1) / sigma1;
      const z2 = (y - mu2) / sigma2;
      const rho2 = rho * rho;
      
      const exponent = (-0.5 / (1 - rho2)) * (z1 * z1 + z2 * z2 - 2 * rho * z1 * z2);
      const coefficient = 1 / (2 * Math.PI * sigma1 * sigma2 * Math.sqrt(1 - rho2));
      
      return coefficient * Math.exp(exponent);
    },
    
    bivariateUniformPDF(x, y, mu1, mu2, sigma1, sigma2) {
      const xInRange = Math.abs(x - mu1) <= sigma1;
      const yInRange = Math.abs(y - mu2) <= sigma2;
      return (xInRange && yInRange) ? 1 / (4 * sigma1 * sigma2) : 0;
    },
    
    bivariateExponentialPDF(x, y, mu1, mu2, sigma1, sigma2) {
      if (x < mu1 || y < mu2) return 0;
      const lambda1 = 1 / sigma1;
      const lambda2 = 1 / sigma2;
      return lambda1 * lambda2 * Math.exp(-lambda1 * (x - mu1) - lambda2 * (y - mu2));
    },
    
    renderD3Contours(xMin, xMax, yMin, yMax) {
      // 使用D3.js生成等高线
      const contours = d3.contours()
        .size([this.gridResolution, this.gridResolution])
        .thresholds(20);
      
      const flatGrid = [];
      for (let j = 0; j < this.gridResolution; j++) {
        for (let i = 0; i < this.gridResolution; i++) {
          flatGrid.push(this.densityGrid[i][j]);
        }
      }
      
      const contourData = contours(flatGrid);
      
      // 绘制等高线
      contourData.forEach((contour, index) => {
        const level = contour.value;
        const color = this.getContourColor(level, index, contourData.length);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.8;
        
        contour.coordinates.forEach(polygon => {
          polygon.forEach(ring => {
            this.ctx.beginPath();
            ring.forEach((point, i) => {
              const x = (point[0] / this.gridResolution) * this.canvas.width;
              const y = (1 - point[1] / this.gridResolution) * this.canvas.height;
              
              if (i === 0) {
                this.ctx.moveTo(x, y);
              } else {
                this.ctx.lineTo(x, y);
              }
            });
            this.ctx.closePath();
            this.ctx.stroke();
          });
        });
      });
      
      this.ctx.globalAlpha = 1;
    },
    
    renderCustomContours(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType) {
      // 自定义等高线算法 - 行进立方体的简化版本
      const levels = this.calculateContourLevels();
      
      levels.forEach((level, index) => {
        const color = this.getContourColor(level, index, levels.length);
        this.drawContourLevel(level, color, xMin, xMax, yMin, yMax);
      });
    },
    
    calculateContourLevels() {
      // 计算等高线水平
      const flatGrid = this.densityGrid.flat();
      const maxDensity = Math.max(...flatGrid);
      const minDensity = Math.min(...flatGrid.filter(d => d > 0));
      
      const levels = [];
      const numLevels = 15;
      
      for (let i = 1; i <= numLevels; i++) {
        const level = minDensity + (i / numLevels) * (maxDensity - minDensity);
        levels.push(level);
      }
      
      return levels;
    },
    
    drawContourLevel(level, color, xMin, xMax, yMin, yMax) {
      const resolution = this.gridResolution;
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1.5;
      this.ctx.globalAlpha = 0.7;
      
      // 简化的等高线绘制 - 检查每个网格单元
      for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution - 1; j++) {
          const v1 = this.densityGrid[i][j];
          const v2 = this.densityGrid[i + 1][j];
          const v3 = this.densityGrid[i + 1][j + 1];
          const v4 = this.densityGrid[i][j + 1];
          
          // 检查等高线是否穿过此网格
          const values = [v1, v2, v3, v4];
          const minVal = Math.min(...values);
          const maxVal = Math.max(...values);
          
          if (level >= minVal && level <= maxVal) {
            // 绘制网格边界上的等高线段
            this.drawGridContour(i, j, level, [v1, v2, v3, v4], xMin, xMax, yMin, yMax);
          }
        }
      }
      
      this.ctx.globalAlpha = 1;
    },
    
    drawGridContour(i, j, level, values, xMin, xMax, yMin, yMax) {
      const [v1, v2, v3, v4] = values;
      const resolution = this.gridResolution;
      
      // 计算网格在画布上的位置
      const x1 = (i / resolution) * this.canvas.width;
      const y1 = ((resolution - j - 1) / resolution) * this.canvas.height;
      const x2 = ((i + 1) / resolution) * this.canvas.width;
      const y2 = ((resolution - j - 2) / resolution) * this.canvas.height;
      
      const intersections = [];
      
      // 检查四条边是否与等高线相交
      if ((v1 <= level && v2 >= level) || (v1 >= level && v2 <= level)) {
        const t = (level - v1) / (v2 - v1);
        intersections.push({ x: x1 + t * (x2 - x1), y: y1 });
      }
      
      if ((v2 <= level && v3 >= level) || (v2 >= level && v3 <= level)) {
        const t = (level - v2) / (v3 - v2);
        intersections.push({ x: x2, y: y1 + t * (y2 - y1) });
      }
      
      if ((v3 <= level && v4 >= level) || (v3 >= level && v4 <= level)) {
        const t = (level - v3) / (v4 - v3);
        intersections.push({ x: x2 - t * (x2 - x1), y: y2 });
      }
      
      if ((v4 <= level && v1 >= level) || (v4 >= level && v1 <= level)) {
        const t = (level - v4) / (v1 - v4);
        intersections.push({ x: x1, y: y2 - t * (y2 - y1) });
      }
      
      // 绘制等高线段
      if (intersections.length >= 2) {
        this.ctx.beginPath();
        this.ctx.moveTo(intersections[0].x, intersections[0].y);
        this.ctx.lineTo(intersections[1].x, intersections[1].y);
        this.ctx.stroke();
      }
    },
    
    getContourColor(level, index, totalLevels) {
      // 生成等高线颜色
      const colors = [
        '#ff6b6b', '#ffc107', '#00ff66', 
        '#00f3ff', '#bf00ff', '#ff9800', '#e91e63'
      ];
      
      const colorIndex = Math.floor((index / totalLevels) * colors.length);
      return colors[Math.min(colorIndex, colors.length - 1)];
    },
    
    drawDensityGradient(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType) {
      const width = this.canvas.width;
      const height = this.canvas.height;
      const imageData = this.ctx.createImageData(width, height);
      const data = imageData.data;
      
      // 计算每个像素的密度值并映射到颜色
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const x = xMin + (j / width) * (xMax - xMin);
          const y = yMax - (i / height) * (yMax - yMin);
          
          const density = this.calculateDensity(x, y, mu1, mu2, sigma1, sigma2, rho, distributionType);
          const normalizedDensity = Math.min(density * 1000, 1); // 归一化
          
          const pixelIndex = (i * width + j) * 4;
          
          // 使用热力图配色方案
          const color = this.densityToColor(normalizedDensity);
          data[pixelIndex] = color.r;     // R
          data[pixelIndex + 1] = color.g; // G
          data[pixelIndex + 2] = color.b; // B
          data[pixelIndex + 3] = color.a; // A
        }
      }
      
      // 绘制渐变背景
      this.ctx.globalAlpha = 0.2;
      this.ctx.putImageData(imageData, 0, 0);
      this.ctx.globalAlpha = 1;
    },
    
    densityToColor(density) {
      // 热力图配色：蓝色 -> 青色 -> 绿色 -> 黄色 -> 红色
      const colors = [
        { r: 0, g: 0, b: 128 },     // 深蓝
        { r: 0, g: 243, b: 255 },   // 青色
        { r: 0, g: 255, b: 102 },   // 绿色
        { r: 255, g: 193, b: 7 },   // 黄色
        { r: 255, g: 107, b: 107 }  // 红色
      ];
      
      const scaledDensity = density * (colors.length - 1);
      const index = Math.floor(scaledDensity);
      const fraction = scaledDensity - index;
      
      if (index >= colors.length - 1) {
        return { ...colors[colors.length - 1], a: Math.floor(density * 255) };
      }
      
      const color1 = colors[index];
      const color2 = colors[index + 1];
      
      return {
        r: Math.floor(color1.r + (color2.r - color1.r) * fraction),
        g: Math.floor(color1.g + (color2.g - color1.g) * fraction),
        b: Math.floor(color1.b + (color2.b - color1.b) * fraction),
        a: Math.floor(density * 255)
      };
    },
    
    drawAxes(xMin, xMax, yMin, yMax) {
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([5, 5]);
      
      // 绘制网格线
      const gridLines = 10;
      for (let i = 0; i <= gridLines; i++) {
        const x = (i / gridLines) * width;
        const y = (i / gridLines) * height;
        
        // 垂直线
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
        
        // 水平线
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
        this.ctx.stroke();
      }
      
      this.ctx.setLineDash([]);
      
      // 绘制坐标轴标签
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      
      // X轴标签
      for (let i = 0; i <= 5; i++) {
        const x = (i / 5) * width;
        const value = xMin + (i / 5) * (xMax - xMin);
        this.ctx.fillText(value.toFixed(1), x, height - 5);
      }
      
      // Y轴标签
      this.ctx.textAlign = 'left';
      for (let i = 0; i <= 5; i++) {
        const y = (i / 5) * height;
        const value = yMax - (i / 5) * (yMax - yMin);
        this.ctx.fillText(value.toFixed(1), 5, y);
      }
    },
    
    drawColorLegend() {
      // 绘制颜色图例
      const legendX = this.canvas.width - 60;
      const legendY = 20;
      const legendW = 20;
      const legendH = 200;
      
      // 绘制渐变条
      const gradient = this.ctx.createLinearGradient(0, legendY, 0, legendY + legendH);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(0.25, '#ffc107');
      gradient.addColorStop(0.5, '#00ff66');
      gradient.addColorStop(0.75, '#00f3ff');
      gradient.addColorStop(1, '#0000ff');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(legendX, legendY, legendW, legendH);
      
      // 边框
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(legendX, legendY, legendW, legendH);
      
      // 标签
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('高', legendX + legendW + 5, legendY + 10);
      this.ctx.fillText('密度', legendX + legendW + 5, legendY + legendH / 2);
      this.ctx.fillText('低', legendX + legendW + 5, legendY + legendH - 5);
    }
  };
    
    renderD3Contours(xMin, xMax, yMin, yMax) {
      const resolution = this.gridResolution;
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      // 将密度网格转换为一维数组
      const values = new Float32Array(resolution * resolution);
      let maxDensity = 0;
      
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const density = this.densityGrid[i][j];
          values[i * resolution + j] = density;
          maxDensity = Math.max(maxDensity, density);
        }
      }
      
      // 生成等高线阈值
      const numLevels = 8;
      const thresholds = Array.from({ length: numLevels }, (_, i) => 
        (maxDensity * 0.1) + (i / (numLevels - 1)) * (maxDensity * 0.9)
      );
      
      // 使用D3生成等高线
      const contours = d3.contours()
        .size([resolution, resolution])
        .thresholds(thresholds);
      
      const contourData = contours(values);
      
      // 绘制等高线
      contourData.forEach((contour, index) => {
        const level = contour.value;
        const color = this.getLevelColor(level, maxDensity, index, numLevels);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2 + (index * 0.3);
        this.ctx.globalAlpha = 0.8;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 3;
        
        // 绘制等高线路径
        contour.coordinates.forEach(polygon => {
          polygon.forEach(ring => {
            if (ring.length < 2) return;
            
            this.ctx.beginPath();
            ring.forEach((point, i) => {
              // 转换坐标到画布空间
              const x = (point[0] / resolution) * width;
              const y = height - (point[1] / resolution) * height;
              
              if (i === 0) {
                this.ctx.moveTo(x, y);
              } else {
                this.ctx.lineTo(x, y);
              }
            });
            this.ctx.closePath();
            this.ctx.stroke();
          });
        });
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
      });
    },
    
    renderCustomContours(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType) {
      // 回退到原有的自定义等高线算法
      const levels = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2];
      const colors = [
        '#ff6b6b', '#ffc107', '#00ff66', 
        '#00f3ff', '#bf00ff', '#ff9800', '#e91e63'
      ];
      
      levels.forEach((level, i) => {
        this.drawContourLevel(level, colors[i], xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType);
      });
    },
    
    getLevelColor(level, maxDensity, index, totalLevels) {
      // 改进的颜色映射 - 使用更科学的配色方案
      const normalizedLevel = level / maxDensity;
      const hue = 240 - (normalizedLevel * 180); // 从蓝色到红色
      const saturation = 70 + (normalizedLevel * 30); // 饱和度递增
      const lightness = 40 + (normalizedLevel * 40); // 亮度递增
      
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },
    
    bivariateUniformPDF(x, y, mu1, mu2, sigma1, sigma2) {
      const a1 = mu1 - sigma1 * Math.sqrt(3);
      const b1 = mu1 + sigma1 * Math.sqrt(3);
      const a2 = mu2 - sigma2 * Math.sqrt(3);
      const b2 = mu2 + sigma2 * Math.sqrt(3);
      
      if (x >= a1 && x <= b1 && y >= a2 && y <= b2) {
        return 1 / ((b1 - a1) * (b2 - a2));
      }
      return 0;
    },
    
    bivariateExponentialPDF(x, y, mu1, mu2, sigma1, sigma2) {
      if (x < mu1 || y < mu2) return 0;
      
      const lambda1 = 1 / sigma1;
      const lambda2 = 1 / sigma2;
      
      return lambda1 * lambda2 * Math.exp(-lambda1 * (x - mu1) - lambda2 * (y - mu2));
    },
    
    
    drawContourLevel(level, color, xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType = 'normal') {
      const resolution = 150;
      const contourPoints = [];
      
      // 使用行进立方体算法的简化版本
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const x1 = xMin + (i / resolution) * (xMax - xMin);
          const y1 = yMin + (j / resolution) * (yMax - yMin);
          const x2 = xMin + ((i + 1) / resolution) * (xMax - xMin);
          const y2 = yMin + ((j + 1) / resolution) * (yMax - yMin);
          
          // 计算网格四个角的密度值
          const v1 = this.calculateDensity(x1, y1, mu1, mu2, sigma1, sigma2, rho, distributionType);
          const v2 = this.calculateDensity(x2, y1, mu1, mu2, sigma1, sigma2, rho, distributionType);
          const v3 = this.calculateDensity(x2, y2, mu1, mu2, sigma1, sigma2, rho, distributionType);
          const v4 = this.calculateDensity(x1, y2, mu1, mu2, sigma1, sigma2, rho, distributionType);
          
          // 检查等高线是否穿过此网格
          const values = [v1, v2, v3, v4];
          const minVal = Math.min(...values);
          const maxVal = Math.max(...values);
          
          if (level >= minVal && level <= maxVal) {
            // 使用线性插值找到等高线点
            const points = this.interpolateContourPoints(
              x1, y1, x2, y2, v1, v2, v3, v4, level
            );
            contourPoints.push(...points);
          }
        }
      }
      
      // 绘制等高线
      if (contourPoints.length > 0) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.8;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 4;
        
        this.drawSmoothCurve(contourPoints, xMin, xMax, yMin, yMax);
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
      }
    },
    
    interpolateContourPoints(x1, y1, x2, y2, v1, v2, v3, v4, level) {
      const points = [];
      const edges = [
        { x1, y1, x2, y1: y1, v1, v2 }, // 底边
        { x1: x2, y1, x2, y2, v1: v2, v2: v3 }, // 右边
        { x1: x2, y1: y2, x2: x1, y2, v1: v3, v2: v4 }, // 顶边
        { x1, y1: y2, x2: x1, y2: y1, v1: v4, v2: v1 }  // 左边
      ];
      
      edges.forEach(edge => {
        if ((edge.v1 <= level && edge.v2 >= level) || 
            (edge.v1 >= level && edge.v2 <= level)) {
          const t = (level - edge.v1) / (edge.v2 - edge.v1);
          const x = edge.x1 + t * (edge.x2 - edge.x1);
          const y = edge.y1 + t * (edge.y2 - edge.y1);
          points.push({ x, y });
        }
      });
      
      return points;
    },
    
    drawSmoothCurve(points, xMin, xMax, yMin, yMax) {
      if (points.length < 2) return;
      
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      this.ctx.beginPath();
      
      // 转换到画布坐标
      const canvasPoints = points.map(p => ({
        x: ((p.x - xMin) / (xMax - xMin)) * width,
        y: height - ((p.y - yMin) / (yMax - yMin)) * height
      }));
      
      // 绘制平滑曲线
      if (canvasPoints.length > 2) {
        this.ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
        
        for (let i = 1; i < canvasPoints.length - 1; i++) {
          const cp1x = (canvasPoints[i].x + canvasPoints[i + 1].x) / 2;
          const cp1y = (canvasPoints[i].y + canvasPoints[i + 1].y) / 2;
          this.ctx.quadraticCurveTo(canvasPoints[i].x, canvasPoints[i].y, cp1x, cp1y);
        }
        
        const lastPoint = canvasPoints[canvasPoints.length - 1];
        this.ctx.lineTo(lastPoint.x, lastPoint.y);
      } else {
        this.ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
        this.ctx.lineTo(canvasPoints[1].x, canvasPoints[1].y);
      }
      
      this.ctx.stroke();
    },
    
    drawDensityGradient(xMin, xMax, yMin, yMax, mu1, mu2, sigma1, sigma2, rho, distributionType = 'normal') {
      const width = this.canvas.width;
      const height = this.canvas.height;
      const imageData = this.ctx.createImageData(width, height);
      const data = imageData.data;
      
      let maxDensity = 0;
      const densityValues = [];
      
      // 首先计算所有密度值以找到最大值
      for (let i = 0; i < height; i++) {
        densityValues[i] = [];
        for (let j = 0; j < width; j++) {
          const x = xMin + (j / width) * (xMax - xMin);
          const y = yMax - (i / height) * (yMax - yMin);
          
          const density = this.calculateDensity(x, y, mu1, mu2, sigma1, sigma2, rho, distributionType);
          densityValues[i][j] = density;
          maxDensity = Math.max(maxDensity, density);
        }
      }
      
      // 计算每个像素的密度值并映射到颜色
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const density = densityValues[i][j];
          const normalizedDensity = maxDensity > 0 ? density / maxDensity : 0;
          
          const pixelIndex = (i * width + j) * 4;
          
          // 使用改进的热力图配色方案
          const color = this.densityToColor(normalizedDensity);
          data[pixelIndex] = color.r;     // R
          data[pixelIndex + 1] = color.g; // G
          data[pixelIndex + 2] = color.b; // B
          data[pixelIndex + 3] = color.a; // A
        }
      }
      
      // 绘制渐变背景
      this.ctx.globalAlpha = 0.2;
      this.ctx.putImageData(imageData, 0, 0);
      this.ctx.globalAlpha = 1;
    },
    
    densityToColor(density) {
      // 改进的热力图配色：深蓝 -> 青色 -> 绿色 -> 黄色 -> 红色
      const colors = [
        { r: 0, g: 0, b: 64 },      // 深蓝
        { r: 0, g: 100, b: 200 },   // 蓝色
        { r: 0, g: 200, b: 255 },   // 青色
        { r: 0, g: 255, b: 150 },   // 青绿
        { r: 100, g: 255, b: 0 },   // 绿色
        { r: 255, g: 255, b: 0 },   // 黄色
        { r: 255, g: 150, b: 0 },   // 橙色
        { r: 255, g: 50, b: 50 }    // 红色
      ];
      
      if (density <= 0) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }
      
      const scaledDensity = Math.pow(density, 0.7) * (colors.length - 1); // 使用幂函数增强对比度
      const index = Math.floor(scaledDensity);
      const fraction = scaledDensity - index;
      
      if (index >= colors.length - 1) {
        return { ...colors[colors.length - 1], a: Math.floor(density * 180) };
      }
      
      const color1 = colors[index];
      const color2 = colors[index + 1];
      
      return {
        r: Math.floor(color1.r + (color2.r - color1.r) * fraction),
        g: Math.floor(color1.g + (color2.g - color1.g) * fraction),
        b: Math.floor(color1.b + (color2.b - color1.b) * fraction),
        a: Math.floor(density * 180)
      };
    },
    
    drawColorLegend() {
      const width = this.canvas.width;
      const height = this.canvas.height;
      const legendWidth = 20;
      const legendHeight = 100;
      const legendX = width - legendWidth - 10;
      const legendY = 10;
      
      // 绘制颜色条
      const gradient = this.ctx.createLinearGradient(0, legendY, 0, legendY + legendHeight);
      gradient.addColorStop(0, '#ff3232');    // 红色 (高密度)
      gradient.addColorStop(0.2, '#ff9600');  // 橙色
      gradient.addColorStop(0.4, '#ffff00');  // 黄色
      gradient.addColorStop(0.6, '#64ff00');  // 绿色
      gradient.addColorStop(0.8, '#00c8ff');  // 青色
      gradient.addColorStop(1, '#000040');    // 深蓝 (低密度)
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
      
      // 绘制边框
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
      
      // 添加标签
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('高', legendX + legendWidth + 5, legendY + 10);
      this.ctx.fillText('密度', legendX + legendWidth + 5, legendY + legendHeight / 2);
      this.ctx.fillText('低', legendX + legendWidth + 5, legendY + legendHeight - 5);
    },
    
    drawAxes(xMin, xMax, yMin, yMax) {
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([5, 5]);
      
      // 绘制网格线
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const x = (i / gridLines) * width;
        const y = (i / gridLines) * height;
        
        // 垂直线
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
        
        // 水平线
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
        this.ctx.stroke();
      }
      
      this.ctx.setLineDash([]);
      
      // 绘制坐标轴标签
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      
      // X轴标签
      for (let i = 0; i <= gridLines; i++) {
        const x = (i / gridLines) * width;
        const value = xMin + (i / gridLines) * (xMax - xMin);
        this.ctx.fillText(value.toFixed(1), x, height - 5);
      }
      
      // Y轴标签
      this.ctx.textAlign = 'left';
      for (let i = 0; i <= gridLines; i++) {
        const y = (i / gridLines) * height;
        const value = yMax - (i / gridLines) * (yMax - yMin);
        this.ctx.fillText(value.toFixed(1), 5, y);
      }
    },
    
    bivariateNormalPDF(x, y, mu1, mu2, sigma1, sigma2, rho) {
      const z1 = (x - mu1) / sigma1;
      const z2 = (y - mu2) / sigma2;
      const rho2 = rho * rho;
      
      const exponent = (-0.5 / (1 - rho2)) * (z1 * z1 + z2 * z2 - 2 * rho * z1 * z2);
      const coefficient = 1 / (2 * Math.PI * sigma1 * sigma2 * Math.sqrt(1 - rho2));
      
      return coefficient * Math.exp(exponent);
    }
  };

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
};

// 交互式散点图生成器 - 增强版
const ScatterPlotGenerator = {
    canvas: null,
    ctx: null,
    samples: [],
    viewport: { xMin: -50, xMax: 50, yMin: -50, yMax: 50 },
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
    zoomLevel: 1,
    
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return false;
      
      this.ctx = this.canvas.getContext('2d');
      this.setupInteractions();
      return true;
    },
    
    setupInteractions() {
      // 鼠标拖拽平移
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.lastMousePos = this.getMousePos(e);
      });
      
      this.canvas.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        const currentPos = this.getMousePos(e);
        const deltaX = currentPos.x - this.lastMousePos.x;
        const deltaY = currentPos.y - this.lastMousePos.y;
        
        // 转换为数据坐标的偏移
        const xRange = this.viewport.xMax - this.viewport.xMin;
        const yRange = this.viewport.yMax - this.viewport.yMin;
        const xOffset = (deltaX / this.canvas.width) * xRange;
        const yOffset = (deltaY / this.canvas.height) * yRange;
        
        this.viewport.xMin -= xOffset;
        this.viewport.xMax -= xOffset;
        this.viewport.yMin += yOffset; // Y轴反向
        this.viewport.yMax += yOffset;
        
        this.lastMousePos = currentPos;
        this.render();
      });
      
      this.canvas.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
      
      this.canvas.addEventListener('mouseleave', () => {
        this.isDragging = false;
      });
      
      // 鼠标滚轮缩放
      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const mousePos = this.getMousePos(e);
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        
        // 以鼠标位置为中心缩放
        const dataPos = this.canvasToData(mousePos.x, mousePos.y);
        
        const xRange = this.viewport.xMax - this.viewport.xMin;
        const yRange = this.viewport.yMax - this.viewport.yMin;
        
        const newXRange = xRange * zoomFactor;
        const newYRange = yRange * zoomFactor;
        
        this.viewport.xMin = dataPos.x - (dataPos.x - this.viewport.xMin) * zoomFactor;
        this.viewport.xMax = this.viewport.xMin + newXRange;
        this.viewport.yMin = dataPos.y - (dataPos.y - this.viewport.yMin) * zoomFactor;
        this.viewport.yMax = this.viewport.yMin + newYRange;
        
        this.zoomLevel *= zoomFactor;
        this.render();
      });
      
      // 双击重置视图
      this.canvas.addEventListener('dblclick', () => {
        this.resetViewport();
        this.render();
      });
    },
    
    getMousePos(e) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    },
    
    canvasToData(canvasX, canvasY) {
      const x = this.viewport.xMin + (canvasX / this.canvas.width) * (this.viewport.xMax - this.viewport.xMin);
      const y = this.viewport.yMax - (canvasY / this.canvas.height) * (this.viewport.yMax - this.viewport.yMin);
      return { x, y };
    },
    
    dataToCanvas(dataX, dataY) {
      const x = ((dataX - this.viewport.xMin) / (this.viewport.xMax - this.viewport.xMin)) * this.canvas.width;
      const y = ((this.viewport.yMax - dataY) / (this.viewport.yMax - this.viewport.yMin)) * this.canvas.height;
      return { x, y };
    },
    
    resetViewport() {
      if (this.samples.length === 0) {
        this.viewport = { xMin: -50, xMax: 50, yMin: -50, yMax: 50 };
        return;
      }
      
      // 根据样本数据自动调整视图
      const xValues = this.samples.map(s => s[0]);
      const yValues = this.samples.map(s => s[1]);
      
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);
      
      const xPadding = (xMax - xMin) * 0.1;
      const yPadding = (yMax - yMin) * 0.1;
      
      this.viewport = {
        xMin: xMin - xPadding,
        xMax: xMax + xPadding,
        yMin: yMin - yPadding,
        yMax: yMax + yPadding
      };
      
      this.zoomLevel = 1;
    },
    
    updateSamples(samples) {
      this.samples = samples || [];
      this.resetViewport();
      this.render();
    },
    
    render() {
      if (!this.ctx) return;
      
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      // 清空画布
      this.ctx.clearRect(0, 0, width, height);
      
      // 绘制背景网格
      this.drawGrid();
      
      // 绘制坐标轴
      this.drawAxes();
      
      // 绘制样本点
      this.drawSamples();
      
      // 绘制统计信息
      this.drawStatistics();
      
      // 绘制控制提示
      this.drawControls();
    },
    
    drawGrid() {
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([2, 2]);
      
      // 计算网格间距
      const xRange = this.viewport.xMax - this.viewport.xMin;
      const yRange = this.viewport.yMax - this.viewport.yMin;
      
      const xStep = this.calculateGridStep(xRange);
      const yStep = this.calculateGridStep(yRange);
      
      // 绘制垂直网格线
      const xStart = Math.ceil(this.viewport.xMin / xStep) * xStep;
      for (let x = xStart; x <= this.viewport.xMax; x += xStep) {
        const canvasPos = this.dataToCanvas(x, 0);
        this.ctx.beginPath();
        this.ctx.moveTo(canvasPos.x, 0);
        this.ctx.lineTo(canvasPos.x, height);
        this.ctx.stroke();
      }
      
      // 绘制水平网格线
      const yStart = Math.ceil(this.viewport.yMin / yStep) * yStep;
      for (let y = yStart; y <= this.viewport.yMax; y += yStep) {
        const canvasPos = this.dataToCanvas(0, y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, canvasPos.y);
        this.ctx.lineTo(width, canvasPos.y);
        this.ctx.stroke();
      }
      
      this.ctx.setLineDash([]);
    },
    
    calculateGridStep(range) {
      const targetLines = 10;
      const rawStep = range / targetLines;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const normalized = rawStep / magnitude;
      
      if (normalized <= 1) return magnitude;
      if (normalized <= 2) return 2 * magnitude;
      if (normalized <= 5) return 5 * magnitude;
      return 10 * magnitude;
    },
    
    drawAxes() {
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      // 绘制主坐标轴
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 2;
      
      // X轴
      if (this.viewport.yMin <= 0 && this.viewport.yMax >= 0) {
        const yPos = this.dataToCanvas(0, 0).y;
        this.ctx.beginPath();
        this.ctx.moveTo(0, yPos);
        this.ctx.lineTo(width, yPos);
        this.ctx.stroke();
      }
      
      // Y轴
      if (this.viewport.xMin <= 0 && this.viewport.xMax >= 0) {
        const xPos = this.dataToCanvas(0, 0).x;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos, 0);
        this.ctx.lineTo(xPos, height);
        this.ctx.stroke();
      }
      
      // 绘制刻度标签
      this.drawAxisLabels();
    },
    
    drawAxisLabels() {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.font = '11px Arial';
      
      const xRange = this.viewport.xMax - this.viewport.xMin;
      const yRange = this.viewport.yMax - this.viewport.yMin;
      const xStep = this.calculateGridStep(xRange);
      const yStep = this.calculateGridStep(yRange);
      
      // X轴标签
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      const xStart = Math.ceil(this.viewport.xMin / xStep) * xStep;
      for (let x = xStart; x <= this.viewport.xMax; x += xStep) {
        const canvasPos = this.dataToCanvas(x, this.viewport.yMin);
        if (canvasPos.x >= 0 && canvasPos.x <= this.canvas.width) {
          this.ctx.fillText(x.toFixed(1), canvasPos.x, this.canvas.height - 15);
        }
      }
      
      // Y轴标签
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      const yStart = Math.ceil(this.viewport.yMin / yStep) * yStep;
      for (let y = yStart; y <= this.viewport.yMax; y += yStep) {
        const canvasPos = this.dataToCanvas(this.viewport.xMin, y);
        if (canvasPos.y >= 0 && canvasPos.y <= this.canvas.height) {
          this.ctx.fillText(y.toFixed(1), 5, canvasPos.y);
        }
      }
    },
    
    drawSamples() {
      if (this.samples.length === 0) return;
      
      // 根据密度调整点的大小和透明度
      const pointSize = Math.max(1, Math.min(4, 1000 / this.samples.length));
      const alpha = Math.max(0.3, Math.min(0.8, 500 / this.samples.length));
      
      this.ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
      this.ctx.strokeStyle = `rgba(34, 211, 238, ${alpha + 0.2})`;
      this.ctx.lineWidth = 1;
      
      // 绘制样本点
      this.samples.forEach(([x, y]) => {
        const canvasPos = this.dataToCanvas(x, y);
        
        // 只绘制在视图范围内的点
        if (canvasPos.x >= -pointSize && canvasPos.x <= this.canvas.width + pointSize &&
            canvasPos.y >= -pointSize && canvasPos.y <= this.canvas.height + pointSize) {
          
          this.ctx.beginPath();
          this.ctx.arc(canvasPos.x, canvasPos.y, pointSize, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.stroke();
        }
      });
      
      // 绘制密度热点
      this.drawDensityHotspots();
    },
    
    drawDensityHotspots() {
      if (this.samples.length < 100) return;
      
      // 计算局部密度
      const gridSize = 20;
      const densityGrid = this.calculateDensityGrid(gridSize);
      
      // 绘制密度热点
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const density = densityGrid[i][j];
          if (density > 0) {
            const x = this.viewport.xMin + (i / gridSize) * (this.viewport.xMax - this.viewport.xMin);
            const y = this.viewport.yMin + (j / gridSize) * (this.viewport.yMax - this.viewport.yMin);
            const canvasPos = this.dataToCanvas(x, y);
            
            const radius = Math.sqrt(density) * 10;
            const alpha = Math.min(0.3, density / 10);
            
            this.ctx.fillStyle = `rgba(191, 0, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(canvasPos.x, canvasPos.y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
          }
        }
      }
    },
    
    calculateDensityGrid(gridSize) {
      const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
      
      this.samples.forEach(([x, y]) => {
        const i = Math.floor(((x - this.viewport.xMin) / (this.viewport.xMax - this.viewport.xMin)) * gridSize);
        const j = Math.floor(((y - this.viewport.yMin) / (this.viewport.yMax - this.viewport.yMin)) * gridSize);
        
        if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
          grid[i][j]++;
        }
      });
      
      return grid;
    },
    
    drawStatistics() {
      if (this.samples.length === 0) return;
      
      const stats = this.calculateStatistics();
      
      // 绘制统计信息面板
      this.ctx.fillStyle = 'rgba(15, 23, 48, 0.8)';
      this.ctx.fillRect(10, 10, 200, 120);
      
      this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(10, 10, 200, 120);
      
      // 绘制统计文本
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      
      const lines = [
        `样本数量: ${this.samples.length}`,
        `X均值: ${stats.meanX.toFixed(2)}`,
        `Y均值: ${stats.meanY.toFixed(2)}`,
        `X标准差: ${stats.stdX.toFixed(2)}`,
        `Y标准差: ${stats.stdY.toFixed(2)}`,
        `相关系数: ${stats.correlation.toFixed(3)}`,
        `缩放: ${this.zoomLevel.toFixed(1)}x`
      ];
      
      lines.forEach((line, i) => {
        this.ctx.fillText(line, 15, 20 + i * 15);
      });
    },
    
    calculateStatistics() {
      if (this.samples.length === 0) {
        return { meanX: 0, meanY: 0, stdX: 0, stdY: 0, correlation: 0 };
      }
      
      const xValues = this.samples.map(s => s[0]);
      const yValues = this.samples.map(s => s[1]);
      
      const meanX = xValues.reduce((a, b) => a + b) / xValues.length;
      const meanY = yValues.reduce((a, b) => a + b) / yValues.length;
      
      const varX = xValues.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0) / xValues.length;
      const varY = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0) / yValues.length;
      
      const stdX = Math.sqrt(varX);
      const stdY = Math.sqrt(varY);
      
      const covariance = this.samples.reduce((sum, [x, y]) => 
        sum + (x - meanX) * (y - meanY), 0) / this.samples.length;
      
      const correlation = covariance / (stdX * stdY);
      
      return { meanX, meanY, stdX, stdY, correlation };
    },
    
    drawControls() {
      // 绘制控制提示
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'bottom';
      
      const controls = [
        '拖拽: 平移视图',
        '滚轮: 缩放',
        '双击: 重置视图'
      ];
      
      controls.forEach((text, i) => {
        this.ctx.fillText(text, this.canvas.width - 10, this.canvas.height - 10 - i * 12);
      });
    }
  };

  // 边际分布曲线渲染器 - 增强版
  const MarginalDistributionRenderer = {
    canvas: null,
    ctx: null,
    samples: [],
    parameters: {},
    animationState: { isAnimating: false, progress: 0 },
    
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return false;
      
      this.ctx = this.canvas.getContext('2d');
      return true;
    },
    
    update(samples, parameters) {
      this.samples = samples || [];
      this.parameters = parameters || {};
      this.render();
    },
    
    render() {
      if (!this.ctx) return;
      
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      this.ctx.clearRect(0, 0, width, height);
      
      // 计算边际分布
      const marginals = this.calculateMarginalDistributions();
      
      // 绘制X的边际分布（底部）
      this.drawMarginalDistribution(
        marginals.x,
        0, height * 0.6, width, height * 0.4,
        '#00f3ff', 'X边际分布', true
      );
      
      // 绘制Y的边际分布（右侧）
      this.drawMarginalDistribution(
        marginals.y,
        width * 0.6, 0, width * 0.4, height * 0.6,
        '#bf00ff', 'Y边际分布', false
      );
      
      // 绘制理论曲线对比
      this.drawTheoreticalCurves(marginals);
      
      // 绘制积分可视化
      if (this.animationState.isAnimating) {
        this.drawIntegrationAnimation();
      }
      
      // 绘制统计信息
      this.drawMarginalStatistics(marginals);
    },
    
    calculateMarginalDistributions() {
      if (this.samples.length === 0) {
        return { x: { bins: [], density: [], range: [0, 1] }, y: { bins: [], density: [], range: [0, 1] } };
      }
      
      const xValues = this.samples.map(s => s[0]);
      const yValues = this.samples.map(s => s[1]);
      
      const xMarginal = this.calculateMarginal(xValues);
      const yMarginal = this.calculateMarginal(yValues);
      
      return { x: xMarginal, y: yMarginal };
    },
    
    calculateMarginal(values) {
      const bins = 50;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      const binWidth = range / bins;
      
      const histogram = new Array(bins).fill(0);
      const binCenters = [];
      
      // 计算直方图
      values.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
        histogram[binIndex]++;
      });
      
      // 计算bin中心点
      for (let i = 0; i < bins; i++) {
        binCenters.push(min + (i + 0.5) * binWidth);
      }
      
      // 归一化为密度
      const totalArea = histogram.reduce((sum, count) => sum + count, 0) * binWidth;
      const density = histogram.map(count => count / totalArea);
      
      // 使用核密度估计平滑曲线
      const smoothDensity = this.kernelDensityEstimation(values, binCenters);
      
      return {
        bins: binCenters,
        density: density,
        smoothDensity: smoothDensity,
        range: [min, max],
        histogram: histogram
      };
    },
    
    kernelDensityEstimation(data, evaluationPoints) {
      const n = data.length;
      const bandwidth = this.calculateBandwidth(data);
      
      return evaluationPoints.map(x => {
        const sum = data.reduce((acc, xi) => {
          const u = (x - xi) / bandwidth;
          return acc + this.gaussianKernel(u);
        }, 0);
        
        return sum / (n * bandwidth);
      });
    },
    
    calculateBandwidth(data) {
      const n = data.length;
      const std = this.calculateStandardDeviation(data);
      // Silverman's rule of thumb
      return 1.06 * std * Math.pow(n, -1/5);
    },
    
    calculateStandardDeviation(data) {
      const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
      const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
      return Math.sqrt(variance);
    },
    
    gaussianKernel(u) {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
    },
    
    drawMarginalDistribution(marginal, x, y, w, h, color, title, isHorizontal) {
      if (marginal.bins.length === 0) return;
      
      // 绘制背景
      this.ctx.fillStyle = 'rgba(15, 23, 48, 0.3)';
      this.ctx.fillRect(x, y, w, h);
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, w, h);
      
      // 绘制直方图
      this.drawHistogram(marginal, x, y, w, h, color, isHorizontal);
      
      // 绘制平滑密度曲线
      this.drawSmoothCurve(marginal, x, y, w, h, color, isHorizontal);
      
      // 绘制理论分布曲线
      this.drawTheoreticalMarginal(marginal, x, y, w, h, color, isHorizontal);
      
      // 绘制标题
      this.drawTitle(title, x, y, w, h, isHorizontal);
    },
    
    drawHistogram(marginal, x, y, w, h, color, isHorizontal) {
      const maxDensity = Math.max(...marginal.density);
      
      this.ctx.fillStyle = color + '40';
      this.ctx.strokeStyle = color + '80';
      this.ctx.lineWidth = 1;
      
      marginal.density.forEach((density, i) => {
        const normalizedHeight = (density / maxDensity) * (isHorizontal ? h * 0.8 : w * 0.8);
        
        if (isHorizontal) {
          const barX = x + (i / marginal.bins.length) * w;
          const barY = y + h - normalizedHeight;
          const barWidth = w / marginal.bins.length;
          
          this.ctx.fillRect(barX, barY, barWidth, normalizedHeight);
          this.ctx.strokeRect(barX, barY, barWidth, normalizedHeight);
        } else {
          const barX = x;
          const barY = y + (i / marginal.bins.length) * h;
          const barHeight = h / marginal.bins.length;
          
          this.ctx.fillRect(barX, barY, normalizedHeight, barHeight);
          this.ctx.strokeRect(barX, barY, normalizedHeight, barHeight);
        }
      });
    },
    
    drawSmoothCurve(marginal, x, y, w, h, color, isHorizontal) {
      if (!marginal.smoothDensity) return;
      
      const maxDensity = Math.max(...marginal.smoothDensity);
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 6;
      
      this.ctx.beginPath();
      
      marginal.smoothDensity.forEach((density, i) => {
        const normalizedHeight = (density / maxDensity) * (isHorizontal ? h * 0.8 : w * 0.8);
        
        let plotX, plotY;
        
        if (isHorizontal) {
          plotX = x + (i / marginal.bins.length) * w;
          plotY = y + h - normalizedHeight;
        } else {
          plotX = x + normalizedHeight;
          plotY = y + (i / marginal.bins.length) * h;
        }
        
        if (i === 0) {
          this.ctx.moveTo(plotX, plotY);
        } else {
          this.ctx.lineTo(plotX, plotY);
        }
      });
      
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    },
    
    drawTheoreticalMarginal(marginal, x, y, w, h, color, isHorizontal) {
      if (!this.parameters.mu1) return;
      
      const { mu1, mu2, sigma1, sigma2 } = this.parameters;
      const isXMarginal = isHorizontal;
      const mu = isXMarginal ? mu1 : mu2;
      const sigma = isXMarginal ? sigma1 : sigma2;
      
      // 计算理论正态分布
      const theoreticalDensity = marginal.bins.map(value => {
        const z = (value - mu) / sigma;
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      });
      
      const maxTheoreticalDensity = Math.max(...theoreticalDensity);
      
      this.ctx.strokeStyle = color + 'CC';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      
      this.ctx.beginPath();
      
      theoreticalDensity.forEach((density, i) => {
        const normalizedHeight = (density / maxTheoreticalDensity) * (isHorizontal ? h * 0.8 : w * 0.8);
        
        let plotX, plotY;
        
        if (isHorizontal) {
          plotX = x + (i / marginal.bins.length) * w;
          plotY = y + h - normalizedHeight;
        } else {
          plotX = x + normalizedHeight;
          plotY = y + (i / marginal.bins.length) * h;
        }
        
        if (i === 0) {
          this.ctx.moveTo(plotX, plotY);
        } else {
          this.ctx.lineTo(plotX, plotY);
        }
      });
      
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    },
    
    drawTitle(title, x, y, w, h, isHorizontal) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      
      if (isHorizontal) {
        this.ctx.fillText(title, x + w / 2, y + 5);
      } else {
        this.ctx.save();
        this.ctx.translate(x + w / 2, y + h / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(title, 0, 0);
        this.ctx.restore();
      }
    },
    
    drawTheoreticalCurves(marginals) {
      // 在中心区域绘制理论vs实际对比
      const centerX = this.canvas.width * 0.05;
      const centerY = this.canvas.height * 0.05;
      const centerW = this.canvas.width * 0.5;
      const centerH = this.canvas.height * 0.5;
      
      // 绘制对比信息
      this.ctx.fillStyle = 'rgba(15, 23, 48, 0.8)';
      this.ctx.fillRect(centerX, centerY, centerW, centerH);
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(centerX, centerY, centerW, centerH);
      
      // 绘制说明文字
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      
      const explanations = [
        '边际分布提取过程:',
        '1. 从联合分布积分得到边际分布',
        '2. 实线: 样本估计密度',
        '3. 虚线: 理论正态分布',
        '4. 柱状图: 原始样本直方图'
      ];
      
      explanations.forEach((text, i) => {
        this.ctx.fillText(text, centerX + 10, centerY + 15 + i * 18);
      });
    },
    
    drawMarginalStatistics(marginals) {
      // 在右下角绘制统计信息
      const statsX = this.canvas.width * 0.65;
      const statsY = this.canvas.height * 0.65;
      const statsW = this.canvas.width * 0.3;
      const statsH = this.canvas.height * 0.3;
      
      this.ctx.fillStyle = 'rgba(15, 23, 48, 0.8)';
      this.ctx.fillRect(statsX, statsY, statsW, statsH);
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(statsX, statsY, statsW, statsH);
      
      // 计算统计量
      const xStats = this.calculateMarginalStats(marginals.x);
      const yStats = this.calculateMarginalStats(marginals.y);
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '11px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      
      const stats = [
        'X边际统计:',
        `  均值: ${xStats.mean.toFixed(2)}`,
        `  标准差: ${xStats.std.toFixed(2)}`,
        `  偏度: ${xStats.skewness.toFixed(2)}`,
        'Y边际统计:',
        `  均值: ${yStats.mean.toFixed(2)}`,
        `  标准差: ${yStats.std.toFixed(2)}`,
        `  偏度: ${yStats.skewness.toFixed(2)}`
      ];
      
      stats.forEach((text, i) => {
        this.ctx.fillText(text, statsX + 10, statsY + 15 + i * 14);
      });
    },
    
    calculateMarginalStats(marginal) {
      if (!marginal.bins || marginal.bins.length === 0) {
        return { mean: 0, std: 0, skewness: 0 };
      }
      
      // 使用样本数据计算统计量
      const values = [];
      marginal.histogram.forEach((count, i) => {
        for (let j = 0; j < count; j++) {
          values.push(marginal.bins[i]);
        }
      });
      
      if (values.length === 0) return { mean: 0, std: 0, skewness: 0 };
      
      const mean = values.reduce((sum, x) => sum + x, 0) / values.length;
      const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      const skewness = values.reduce((sum, x) => sum + Math.pow((x - mean) / std, 3), 0) / values.length;
      
      return { mean, std, skewness };
    },
    
    // 积分过程动画
    animateIntegration() {
      this.animationState.isAnimating = true;
      this.animationState.progress = 0;
      
      const animate = () => {
        this.animationState.progress += 0.02;
        
        if (this.animationState.progress >= 1) {
          this.animationState.isAnimating = false;
          this.animationState.progress = 0;
        } else {
          this.render();
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    },
    
    drawIntegrationAnimation() {
      // 绘制积分过程的可视化动画
      const progress = this.animationState.progress;
      
      // 在中心区域绘制积分演示
      const centerX = this.canvas.width * 0.1;
      const centerY = this.canvas.height * 0.1;
      const centerW = this.canvas.width * 0.4;
      const centerH = this.canvas.height * 0.4;
      
      // 绘制积分区域
      this.ctx.fillStyle = `rgba(0, 255, 102, ${0.3 * progress})`;
      this.ctx.fillRect(centerX, centerY, centerW * progress, centerH);
      
      // 绘制积分线
      this.ctx.strokeStyle = '#00ff66';
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([]);
      
      this.ctx.beginPath();
      this.ctx.moveTo(centerX + centerW * progress, centerY);
      this.ctx.lineTo(centerX + centerW * progress, centerY + centerH);
      this.ctx.stroke();
      
      // 绘制积分公式
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `∫ f(x,y) dy = f_X(x)`,
        centerX + centerW / 2,
        centerY - 20
      );
    }
  };

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
    // 动画演示积分过程 - 启动边际分布渲染器的积分动画
    if (MarginalDistributionRenderer.animateIntegration) {
      MarginalDistributionRenderer.animateIntegration();
    }

    // 同时在等高线图上显示积分过程
    this.animateContourIntegration();
  },

  animateContourIntegration() {
    const canvas = this.canvases.contour;
    if (!canvas) return;

    let progress = 0;
    const animate = () => {
      progress += 0.02;
      
      if (progress >= 1) {
        // 动画完成，重新渲染正常的等高线图
        if (ContourPlotRenderer.render) {
          ContourPlotRenderer.render(this.parameters);
        }
        return;
      }

      // 绘制积分线动画
      const ctx = canvas.ctx;
      const width = canvas.width;
      const height = canvas.height;
      
      // 重新绘制等高线图
      if (ContourPlotRenderer.render) {
        ContourPlotRenderer.render(this.parameters);
      }
      
      // 添加积分线
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 10;
      
      const lineX = width * progress;
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, height);
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
};

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  // 初始化 Chapter 3 可视化系统
  if (typeof initializeChapter3 === 'function') {
    initializeChapter3();
  } else {
    console.error('initializeChapter3 function not found');
  }
});
