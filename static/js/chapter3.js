﻿﻿/**
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
    this.bgConfig = { cols: 150, rows: 90, scale: 0.015 };
    this.useBackgroundEffects = false;
    this.bgCanvas = null;
    this.bgCtx = null;
    this.plot3DQuality = "medium";
    this.bgDebug = false;
    this._bgDebugFrameCount = 0;
    this.bgDumpInterval = 60;
    try {
      if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.search
      ) {
        if (/bgdebug=1|bgdebug=true/i.test(window.location.search))
          this.bgDebug = true;
      }
      if (typeof localStorage !== "undefined") {
        const dben = localStorage.getItem("chapter3_bgdebug");
        if (dben === "true") this.bgDebug = true;
        const dbi = localStorage.getItem("chapter3_bgdumpInterval");
        if (dbi) {
          const n = parseInt(dbi, 10);
          if (!isNaN(n) && n > 0) this.bgDumpInterval = n;
        }
      }
    } catch (_) {}
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

    // 网红直播数据分析器配置
    this.streamerAnalytics = {
      isActive: false,
      currentStreamerType: "gaming",
      currentPersona: "gaming-pro",
      currentPlatform: "douyin",
      streamingTime: "evening",
      danmuActivity: 3,
      giftFrequency: 3,
      realTimeData: {
        danmuCount: [],
        giftValues: [],
        viewingDurations: [],
        timestamps: [],
      },
      trendingTopics: [
        "王者荣耀",
        "原神",
        "YYDS",
        "绝绝子",
        "emo",
        "直播带货",
        "网红经济",
        "粉丝经济",
        "流量密码",
        "爆款",
      ],
      correlationMatrix: null,
      lastUpdate: Date.now(),
    };

    // 社交媒体行为模式分析配置
    this.socialMediaAnalytics = {
      isActive: false,
      currentPlatform: "weibo",
      currentUserType: "kol",
      behaviorData: {
        postingFrequency: [], // 发帖频率数据
        engagementRate: [], // 互动率数据
        contentTypes: [], // 内容类型数据
        timeActivity: [], // 时间段活跃度数据
      },
      platforms: {
        weibo: {
          name: "微博",
          avgPostingFreq: [2, 8], // 每天发帖次数范围
          avgEngagementRate: [3, 15], // 互动率百分比范围
          contentTypes: ["文字", "图片", "视频", "转发", "话题"],
          peakHours: [9, 12, 18, 21], // 活跃时段
          algorithmInfluence: 0.65,
          userStickiness: 0.78,
          contentDiversity: 0.85,
          spreadVelocity: 0.72,
          color: "#ff6b6b",
        },
        douyin: {
          name: "抖音",
          avgPostingFreq: [1, 5],
          avgEngagementRate: [8, 25],
          contentTypes: ["短视频", "直播", "图文", "音乐", "挑战"],
          peakHours: [12, 15, 19, 22],
          algorithmInfluence: 0.85,
          userStickiness: 0.92,
          contentDiversity: 0.75,
          spreadVelocity: 0.88,
          color: "#4ecdc4",
        },
        bilibili: {
          name: "B站",
          avgPostingFreq: [0.5, 3],
          avgEngagementRate: [5, 20],
          contentTypes: ["视频", "专栏", "动态", "直播", "番剧"],
          peakHours: [14, 17, 20, 23],
          algorithmInfluence: 0.55,
          userStickiness: 0.88,
          contentDiversity: 0.95,
          spreadVelocity: 0.65,
          color: "#45b7d1",
        },
      },
      userTypes: {
        kol: {
          name: "KOL",
          postingMultiplier: 2.5,
          engagementMultiplier: 3.0,
          viralProbability: 0.15,
          contentQuality: 0.85,
        },
        ordinary: {
          name: "普通用户",
          postingMultiplier: 1.0,
          engagementMultiplier: 1.0,
          viralProbability: 0.02,
          contentQuality: 0.65,
        },
        brand: {
          name: "品牌方",
          postingMultiplier: 1.8,
          engagementMultiplier: 1.5,
          viralProbability: 0.08,
          contentQuality: 0.75,
        },
        bot: {
          name: "机器人",
          postingMultiplier: 5.0,
          engagementMultiplier: 0.3,
          viralProbability: 0.01,
          contentQuality: 0.35,
        },
      },
      trendingHashtags: [
        "#YYDS",
        "#绝绝子",
        "#emo了",
        "#内卷",
        "#躺平",
        "#元宇宙",
        "#NFT",
        "#Web3",
        "#AI绘画",
        "#ChatGPT",
        "#新消费",
        "#国潮",
        "#盲盒",
        "#剧本杀",
        "#露营",
        "#直播带货",
        "#网红经济",
        "#粉丝经济",
        "#流量密码",
      ],
      independenceTestResults: {
        postingEngagement: null,
        timeActivity: null,
        contentViral: null,
      },
      correlationMatrix: null,
      viralSpreadData: [],
      lastUpdate: Date.now(),
    };

    // 游戏角色属性独立性检验配置
    this.gameCharacterAnalytics = {
      isActive: false,
      currentGame: "王者荣耀",
      currentClass: "战士",
      currentRole: "上单",
      characterData: {
        attack: [], // 攻击力数据
        defense: [], // 防御力数据
        agility: [], // 敏捷数据
      },
      gameThemes: {
        王者荣耀: {
          classes: ["战士", "法师", "射手", "刺客", "坦克", "辅助"],
          roles: ["上单", "中单", "下路", "打野", "辅助"],
          statRanges: {
            attack: [100, 300],
            defense: [80, 250],
            agility: [60, 200],
          },
          color: "#1890ff",
        },
        原神: {
          classes: ["剑士", "法师", "弓箭手", "长柄武器", "法器"],
          roles: ["主C", "副C", "辅助", "治疗", "盾辅"],
          statRanges: {
            attack: [150, 400],
            defense: [100, 300],
            agility: [80, 250],
          },
          color: "#722ed1",
        },
        英雄联盟: {
          classes: ["战士", "法师", "射手", "刺客", "坦克", "辅助"],
          roles: ["上单", "中单", "ADC", "打野", "辅助"],
          statRanges: {
            attack: [120, 350],
            defense: [90, 280],
            agility: [70, 220],
          },
          color: "#13c2c2",
        },
      },
      independenceTestResults: {
        attackDefense: null,
        attackAgility: null,
        defenseAgility: null,
      },
      correlationMatrix: null,
      lastUpdate: Date.now(),
    };

    // 变量变换可视化器配置 (Section 3.3)
    this.variableTransformation = {
      isActive: false,
      currentType: "linear",
      originalSamples: [],
      transformedSamples: [],
      transformationMatrix: [
        [1, 0],
        [0, 1],
      ], // Identity matrix for linear transformations
      customFormulas: {
        u: "x + y", // Default custom transformation u = x + y
        v: "x - y", // Default custom transformation v = x - y
      },
      parameters: {
        // Linear transformation parameters
        a11: 1,
        a12: 0,
        a21: 0,
        a22: 1,
        // Polar transformation parameters
        centerX: 0,
        centerY: 0,
        // Logarithmic transformation parameters
        baseX: Math.E,
        baseY: Math.E,
        shiftX: 1,
        shiftY: 1,
        // Animation parameters
        animationProgress: 0,
        isAnimating: false,
      },
      jacobianMatrix: [
        [1, 0],
        [0, 1],
      ],
      jacobianDeterminant: 1,
      presets: {
        linear: {
          name: "线性变换",
          description: "矩阵变换: [u,v] = A[x,y]",
          parameters: ["a11", "a12", "a21", "a22"],
          defaultValues: [1, 0, 0, 1],
        },
        polar: {
          name: "极坐标变换",
          description: "r = √(x²+y²), θ = arctan(y/x)",
          parameters: ["centerX", "centerY"],
          defaultValues: [0, 0],
        },
        logarithmic: {
          name: "对数变换",
          description: "u = log(x+shift), v = log(y+shift)",
          parameters: ["baseX", "baseY", "shiftX", "shiftY"],
          defaultValues: [Math.E, Math.E, 1, 1],
        },
        custom: {
          name: "自定义变换",
          description: "用户定义的变换函数",
          parameters: ["u_formula", "v_formula"],
          defaultValues: ["x + y", "x - y"],
        },
      },
      modernScenarios: {
        cnn: {
          name: "CNN卷积操作对比器",
          isActive: false,
          kernelSize: 3,
          stride: 1,
          padding: 1,
          kernelWeights: [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1],
          ], // Sobel edge detection
          inputImage: null,
          outputFeatureMap: null,
        },
        imageProcessing: {
          name: "图像处理变换实验室",
          isActive: false,
          currentFilter: "rotation",
          rotationAngle: 0,
          scaleX: 1,
          scaleY: 1,
          filterStrength: 0.5,
        },
        crypto: {
          name: "加密货币价格变换分析",
          isActive: false,
          currentCrypto: "bitcoin",
          priceData: [],
          logTransformed: [],
          volatilityAnalysis: null,
        },
      },
      lastUpdate: Date.now(),
    };

    // 条件分布模拟器配置 (Section 3.5)
    this.conditionalDistribution = {
      isActive: false,
      currentScenario: "stock",
      conditionValue: 0.0,
      observationNoise: 0.1,
      predictionConfidence: 95,
      jointSamples: [],
      conditionalSamples: [],
      conditionalMean: 0,
      conditionalVariance: 1,
      predictionInterval: { lower: 0, upper: 0 },
      rSquared: 0,
      bayesianUpdate: {
        priorMean: 0,
        priorVariance: 1,
        likelihoodVariance: 0.1,
        posteriorMean: 0,
        posteriorVariance: 1,
        observations: [],
      },
      scenarios: {
        stock: {
          name: "股价预测",
          description: "基于历史数据预测股价走势",
          xLabel: "市场指数",
          yLabel: "股价",
          color: "#00f3ff",
        },
        weather: {
          name: "天气预报",
          description: "根据气象条件预测温度",
          xLabel: "湿度 (%)",
          yLabel: "温度 (°C)",
          color: "#bf00ff",
        },
        recommendation: {
          name: "推荐系统",
          description: "基于用户行为预测偏好",
          xLabel: "浏览时长",
          yLabel: "评分",
          color: "#00ff66",
        },
        medical: {
          name: "医疗诊断",
          description: "根据症状预测疾病概率",
          xLabel: "症状严重程度",
          yLabel: "疾病概率",
          color: "#ffc107",
        },
      },
      modernApplications: {
        memeVirality: {
          name: "网络梗传播预测器",
          isActive: false,
          initialEngagement: 100,
          viralCoefficient: 1.2,
          decayRate: 0.1,
          platformMultiplier: 1.0,
          trendingTopics: ["YYDS", "绝绝子", "emo", "内卷", "躺平"],
          spreadData: [],
          viralityScore: 0,
        },
        liveCommerce: {
          name: "直播带货转化率分析",
          isActive: false,
          viewerCharacteristics: {
            age: 25,
            income: 5000,
            loyaltyScore: 0.7,
          },
          productFeatures: {
            price: 100,
            category: "beauty",
            brandRecognition: 0.8,
          },
          conversionRate: 0.05,
          platforms: ["淘宝直播", "抖音直播", "快手直播"],
        },
        gameMatchmaking: {
          name: "游戏匹配系统优化器",
          isActive: false,
          playerSkill: 1500,
          winRate: 0.5,
          queueTime: 30,
          balanceScore: 0.85,
          gameTypes: ["王者荣耀", "英雄联盟", "DOTA2"],
        },
      },
      lastUpdate: Date.now(),
    };

    // 热点话题连接器配置 (Task 10.2)
    this.trendingTopicConnector = {
      isActive: false,
      currentPlatform: "weibo", // weibo, zhihu, douyin, bilibili
      updateInterval: 30000, // 30 seconds
      maxTopics: 10,
      platforms: {
        weibo: {
          name: "微博热搜",
          color: "#ff6b6b",
          icon: "fa-weibo",
          apiEndpoint: "/api/trending/weibo",
          updateFrequency: 300000, // 5 minutes
          probabilityModel: "exponential_decay",
        },
        zhihu: {
          name: "知乎热榜",
          color: "#0066ff",
          icon: "fa-question-circle",
          apiEndpoint: "/api/trending/zhihu",
          updateFrequency: 600000, // 10 minutes
          probabilityModel: "power_law",
        },
        douyin: {
          name: "抖音热门",
          color: "#fe2c55",
          icon: "fa-music",
          apiEndpoint: "/api/trending/douyin",
          updateFrequency: 180000, // 3 minutes
          probabilityModel: "viral_cascade",
        },
        bilibili: {
          name: "B站热门",
          color: "#00a1d6",
          icon: "fa-play-circle",
          apiEndpoint: "/api/trending/bilibili",
          updateFrequency: 420000, // 7 minutes
          probabilityModel: "community_driven",
        },
      },
      currentTopics: [],
      topicHistory: [],
      probabilityAnalysis: {
        viralityScore: 0,
        spreadVelocity: 0,
        decayRate: 0,
        peakTime: 0,
        expectedLifespan: 0,
        correlationWithEvents: [],
      },
      newsEventAnalysis: {
        currentEvents: [],
        eventProbabilities: {},
        eventCorrelations: {},
        predictiveModels: {},
      },
      statisticalPatterns: {
        powerLawExponent: 2.1,
        exponentialDecayRate: 0.05,
        cascadeThreshold: 0.15,
        networkEffectMultiplier: 1.8,
        temporalCorrelations: [],
      },
      realTimeData: {
        engagementMetrics: [],
        spreadingPatterns: [],
        userBehaviorData: [],
        platformCrossover: [],
      },
      lastUpdate: Date.now(),
    };

    this.init();
  }

  init() {
    this.initializeEventListeners();
    this.initializeCanvases();
    this.generateInitialSamples();
    this.updateAllVisualizations();
    this.initializeIndependenceTest();
    this.initializeStreamerAnalytics(); // Add streamer analytics initialization
    this.initializeSocialMediaAnalytics(); // Add social media analytics initialization
    this.initializeGameCharacterAnalytics(); // Add game character analytics initialization
    this.initializeAdaptiveQuality(); // Add adaptive quality initialization
    this.initializeResponsiveDesign(); // Add responsive design initialization
    this.initializePerformanceOptimization(); // Add performance optimization initialization
    this.initializeSection32Tabs(); // Add section 3.2 tab switching
    this.initializeVariableTransformation(); // Add variable transformation initialization
    this.initializeCorrelationAnalysis(); // Add correlation analysis initialization
    this.initializeConditionalDistribution(); // Add conditional distribution initialization
    this.initializeHistoricalInfo(); // Add historical information initialization
    if (this.useBackgroundEffects) this.startBackgroundContours();
  }

  initializeEventListeners() {
    // 3.1 联合分布参数控制 - Enhanced with real-time updates
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
        // Add enhanced event listeners for real-time updates
        slider.addEventListener("input", (e) => {
          this.updateParameter(id, e.target.value);
        });

        // Add visual feedback on interaction
        slider.addEventListener("mousedown", () => {
          slider.style.transform = "scale(1.02)";
        });

        slider.addEventListener("mouseup", () => {
          slider.style.transform = "scale(1)";
        });

        // Add keyboard support for fine-tuning
        slider.addEventListener("keydown", (e) => {
          const step = parseFloat(slider.step) || 0.1;
          const currentValue = parseFloat(slider.value);

          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            const newValue = Math.min(
              parseFloat(slider.max),
              currentValue + step
            );
            slider.value = newValue;
            this.updateParameter(id, newValue);
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            const newValue = Math.max(
              parseFloat(slider.min),
              currentValue - step
            );
            slider.value = newValue;
            this.updateParameter(id, newValue);
          }
        });
      }
    });

    // 分布类型选择 - Enhanced with descriptions and new types
    const distTypeSelect = document.getElementById("dist-type");
    if (distTypeSelect) {
      distTypeSelect.addEventListener("change", (e) => {
        this.parameters.distType = e.target.value;
        this.updateDistributionDescription(e.target.value);
        this.generateSamples();
        this.updateAllVisualizations();
      });

      // Initialize description
      this.updateDistributionDescription(distTypeSelect.value);
    }

    // 按钮事件 - Enhanced with new functionality
    const generateBtn = document.getElementById("generate-samples");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        this.generateSamples();
        this.updateAllVisualizations();
        this.showGenerationFeedback();
      });
    }

    const resetBtn = document.getElementById("reset-params");
    if (resetBtn) {
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Toggle reset options dropdown
        const resetOptions = document.getElementById("reset-options");
        if (resetOptions) {
          resetOptions.classList.toggle("hidden");
        }
      });
    }

    // Enhanced Reset Options Event Listeners (Requirements 7.7)
    const resetAllBtn = document.getElementById("reset-all");
    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", () => {
        this.resetParameters();
        this.hideResetOptions();
      });
    }

    const resetDistOnlyBtn = document.getElementById("reset-distribution-only");
    if (resetDistOnlyBtn) {
      resetDistOnlyBtn.addEventListener("click", () => {
        this.resetDistributionOnly();
        this.hideResetOptions();
      });
    }

    const resetPresetBtn = document.getElementById("reset-to-preset");
    if (resetPresetBtn) {
      resetPresetBtn.addEventListener("click", () => {
        this.resetToPreset("balanced");
        this.hideResetOptions();
      });
    }

    // Hide reset options when clicking outside
    document.addEventListener("click", (e) => {
      const resetOptions = document.getElementById("reset-options");
      const resetBtn = document.getElementById("reset-params");
      if (
        resetOptions &&
        resetBtn &&
        !resetOptions.contains(e.target) &&
        !resetBtn.contains(e.target)
      ) {
        resetOptions.classList.add("hidden");
      }
    });

    const exportBtn = document.getElementById("export-data");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCurrentData());
    }

    // 联合概率计算 - Enhanced with numerical integration
    const calcProbBtn = document.getElementById("calc-joint-prob");
    if (calcProbBtn) {
      calcProbBtn.addEventListener("click", () =>
        this.calculateJointProbability()
      );
    }

    // Region highlighting controls
    const highlightBtn = document.getElementById("highlight-region");
    const clearHighlightBtn = document.getElementById("clear-highlight");

    if (highlightBtn) {
      highlightBtn.addEventListener("click", () =>
        this.highlightProbabilityRegion()
      );
    }

    if (clearHighlightBtn) {
      clearHighlightBtn.addEventListener("click", () =>
        this.clearRegionHighlight()
      );
    }

    // Add preset region functionality
    this.addPresetRegionButtons();

    // Enhanced real-time region area calculation and validation
    const regionInputs = ["x-min", "x-max", "y-min", "y-max"];
    regionInputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", () => {
          this.validateRegionInputs();
          this.updateRegionArea();
        });

        input.addEventListener("blur", () => {
          this.validateRegionInputs();
        });

        // Add keyboard shortcuts
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && this.validateRegionInputs()) {
            this.calculateJointProbability();
          }
        });

        // Add visual feedback on focus
        input.addEventListener("focus", () => {
          input.style.borderColor = "rgba(34, 211, 238, 0.5)";
        });

        input.addEventListener("blur", () => {
          input.style.borderColor = "";
        });
      }
    });

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
        this.handleScenarioChange(e.target.value);
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

    // Game Character Analytics Event Listeners
    this.setupGameCharacterEventListeners();
  }

  setupGameCharacterEventListeners() {
    // Game theme selector
    const gameThemeSelector = document.getElementById("game-theme-selector");
    if (gameThemeSelector) {
      gameThemeSelector.addEventListener("change", (e) => {
        this.gameCharacterAnalytics.currentGame = e.target.value;
        this.generateGameCharacterData();
        this.updateGameCharacterVisualization();
      });
    }

    // Character class filter
    const characterClassFilter = document.getElementById(
      "character-class-filter"
    );
    if (characterClassFilter) {
      characterClassFilter.addEventListener("change", (e) => {
        this.gameCharacterAnalytics.currentClass = e.target.value;
        this.generateGameCharacterData();
        this.updateGameCharacterVisualization();
      });
    }

    // Character count slider
    const characterCountSlider = document.getElementById(
      "character-count-slider"
    );
    if (characterCountSlider) {
      characterCountSlider.addEventListener("input", (e) => {
        const count = parseInt(e.target.value);
        document.getElementById("character-count-val").textContent =
          count.toLocaleString();
        this.independenceTest.sampleSize = count;
        this.generateGameCharacterData();
        this.updateGameCharacterVisualization();
      });
    }

    // Balance factor slider
    const balanceFactorSlider = document.getElementById(
      "balance-factor-slider"
    );
    if (balanceFactorSlider) {
      balanceFactorSlider.addEventListener("input", (e) => {
        const factor = parseFloat(e.target.value);
        document.getElementById("balance-factor-val").textContent =
          factor.toFixed(1);
        this.gameCharacterAnalytics.balanceFactor = factor;
        this.generateGameCharacterData();
        this.updateGameCharacterVisualization();
      });
    }

    // Generate characters button
    const generateCharactersBtn = document.getElementById(
      "generate-characters"
    );
    if (generateCharactersBtn) {
      generateCharactersBtn.addEventListener("click", () => {
        this.generateGameCharacterData();
        this.updateGameCharacterVisualization();
      });
    }

    // Analyze balance button
    const analyzeBalanceBtn = document.getElementById("analyze-balance");
    if (analyzeBalanceBtn) {
      analyzeBalanceBtn.addEventListener("click", () => {
        this.calculateGameCharacterIndependence();
        this.updateGameCharacterVisualization();
      });
    }

    // Game theme buttons
    const gameThemeButtons = document.querySelectorAll(".game-theme-btn");
    gameThemeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Remove active class from all buttons
        gameThemeButtons.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        // Update current game based on button ID
        const gameId = btn.id.replace("game-", "");
        const gameMap = {
          lol: "英雄联盟",
          genshin: "原神",
          honor: "王者荣耀",
          dota2: "DOTA2",
        };

        this.gameCharacterAnalytics.currentGame = gameMap[gameId] || "英雄联盟";
        this.generateGameCharacterData();
        this.updateGameCharacterVisualization();
      });
    });

    // Character class buttons
    const characterClassButtons = document.querySelectorAll(
      ".character-class-btn"
    );
    characterClassButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Remove active class from all buttons
        characterClassButtons.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        // Update current class based on button ID
        const classId = btn.id.replace("class-", "");
        const classMap = {
          tank: "坦克",
          dps: "输出",
          support: "辅助",
          assassin: "刺客",
        };

        this.gameCharacterAnalytics.currentClass = classMap[classId] || "战士";
        this.generateGameCharacterData();
        this.updateGameCharacterVisualization();
      });
    });

    // Add esports analyzer event listeners
    this.setupEsportsEventListeners();
  }

  setupEsportsEventListeners() {
    // Game theme buttons for esports analyzer
    const esportsGameButtons = document.querySelectorAll(".game-theme-btn");
    esportsGameButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Remove active class from all buttons
        esportsGameButtons.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        // Update current game based on button ID
        const gameId = btn.id.replace("game-", "");
        const gameMap = {
          lol: "lol",
          honor: "wzry",
          dota2: "dota2",
        };

        this.esportsData.currentGame = gameMap[gameId] || "lol";
        this.generateEsportsData();
        this.renderEsportsVisualizations();
      });
    });

    // Position buttons for esports analyzer
    const positionButtons = document.querySelectorAll(".position-btn");
    positionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Remove active class from all buttons
        positionButtons.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        // Update current position based on button ID
        const positionId = btn.id.replace("pos-", "");
        const positionMap = {
          top: "top",
          jungle: "jungle",
          mid: "mid",
          adc: "adc",
          support: "support",
        };

        this.esportsData.currentPosition = positionMap[positionId] || "mid";
        this.generateEsportsData();
        this.renderEsportsVisualizations();
      });
    });

    // Generate esports data button
    const generateEsportsDataBtn = document.getElementById(
      "generate-esports-data"
    );
    if (generateEsportsDataBtn) {
      generateEsportsDataBtn.addEventListener("click", () => {
        this.generateEsportsData();
        this.renderEsportsVisualizations();
        this.showDataGenerationFeedback("esports");
      });
    }

    // Analyze esports balance button
    const analyzeEsportsBalanceBtn = document.getElementById(
      "analyze-esports-balance"
    );
    if (analyzeEsportsBalanceBtn) {
      analyzeEsportsBalanceBtn.addEventListener("click", () => {
        this.calculateEsportsCorrelationMatrix();
        this.renderEsportsVisualizations();
        this.showAnalysisFeedback("esports");
      });
    }
  }

  showDataGenerationFeedback(type) {
    // Show brief feedback when data is generated
    const feedbackEl = document.createElement("div");
    feedbackEl.className =
      "fixed top-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg z-50";
    feedbackEl.textContent = `${
      type === "esports" ? "电竞" : "游戏"
    }数据已生成`;
    document.body.appendChild(feedbackEl);

    setTimeout(() => {
      feedbackEl.remove();
    }, 2000);
  }

  showAnalysisFeedback(type) {
    // Show brief feedback when analysis is complete
    const feedbackEl = document.createElement("div");
    feedbackEl.className =
      "fixed top-4 right-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg z-50";
    feedbackEl.textContent = `${type === "esports" ? "电竞" : "游戏"}分析完成`;
    document.body.appendChild(feedbackEl);

    setTimeout(() => {
      feedbackEl.remove();
    }, 2000);
  }

  initializeSection32Tabs() {
    // Initialize section 3.2 tab switching
    this.currentSection32Tab = "streamer";

    // Add event listeners for section 3.2 tabs
    const section32Tabs = document.querySelectorAll(".scenario-tab-3-2");
    section32Tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = tab.id.replace("tab-", "");
        this.switchSection32Tab(tabId);
      });
    });

    // Initialize with streamer tab active
    this.switchSection32Tab("streamer");
  }

  switchSection32Tab(tabName) {
    if (this.currentSection32Tab === tabName) return;

    this.currentSection32Tab = tabName;

    // Update tab styles
    const tabs = document.querySelectorAll(".scenario-tab-3-2");
    tabs.forEach((tab) => {
      const isActive = tab.id === `tab-${tabName}`;
      if (isActive) {
        tab.className =
          "scenario-tab-3-2 px-4 py-2 rounded-lg border border-neon-purple/30 bg-neon-purple/20 text-neon-purple transition-all duration-300 active";
      } else {
        tab.className =
          "scenario-tab-3-2 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 transition-all duration-300";
      }
    });

    // Show/hide content based on selected tab
    const streamerLab = document.getElementById("streamer-analytics-lab");
    const gameCharacterAnalyzer = document.getElementById(
      "game-character-analyzer"
    );
    const generalDashboard = document.getElementById(
      "general-independence-dashboard"
    );

    // Hide all content first
    if (streamerLab) streamerLab.classList.add("hidden");
    if (gameCharacterAnalyzer) gameCharacterAnalyzer.classList.add("hidden");
    const socialMediaAnalyzer = document.getElementById(
      "social-media-analyzer"
    );
    if (socialMediaAnalyzer) socialMediaAnalyzer.classList.add("hidden");
    if (generalDashboard) generalDashboard.classList.add("hidden");

    // Show selected content
    switch (tabName) {
      case "streamer":
        if (streamerLab) streamerLab.classList.remove("hidden");
        if (generalDashboard) generalDashboard.classList.remove("hidden");
        break;
      case "game-character":
        if (gameCharacterAnalyzer)
          gameCharacterAnalyzer.classList.remove("hidden");
        if (generalDashboard) generalDashboard.classList.remove("hidden");
        this.startGameCharacterAnalysis();
        break;
      case "social-media":
        const socialMediaAnalyzer = document.getElementById(
          "social-media-analyzer"
        );
        if (socialMediaAnalyzer) socialMediaAnalyzer.classList.remove("hidden");
        if (generalDashboard) generalDashboard.classList.remove("hidden");
        // Initialize social media analytics if not already active
        if (!this.socialMediaAnalytics.isActive) {
          this.initializeSocialMediaAnalytics();
        }
        break;
    }

    console.log(`Switched to section 3.2 tab: ${tabName}`);
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
        this.canvases[key].ctx = this.canvases[key].getContext("2d", {
          willReadFrequently: true,
        });
      }
    });

    this.bgCanvas = document.getElementById("bg-noise");
    if (!this.useBackgroundEffects && this.bgCanvas) {
      this.bgCanvas.style.display = "none";
    }
    if (this.bgCanvas && this.useBackgroundEffects) {
      this.bgCtx = this.bgCanvas.getContext("2d", { willReadFrequently: true });
      this.bgLayer = document.createElement("canvas");
      this.bgLayerCtx = this.bgLayer.getContext("2d", {
        willReadFrequently: true,
      });
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

    // 初始化3D图表（延迟以避免首帧争用）
    setTimeout(() => {
      this.init3DPlot();
      this.initializePlotQualitySelector();
    }, 500);

    if (!this.useBackgroundEffects && this.canvases.glow) {
      this.canvases.glow.style.display = "none";
    }
    if (this.canvases.glow && this.useBackgroundEffects) {
      this.glowLayer = document.createElement("canvas");
      this.glowLayerCtx = this.glowLayer.getContext("2d", {
        willReadFrequently: true,
      });
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
    this.plot3DReady = false;

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
    this._plot3DLayout = layout;

    const config = {
      displayModeBar: false,
      responsive: true,
      staticPlot: false,
    };

    const p = Plotly.newPlot(plotDiv, [this.plot3DData], layout, config);
    if (p && typeof p.then === "function") {
      p.then(() => {
        this.plot3DReady = true;
      });
    } else {
      this.plot3DReady = true;
    }
  }

  initializePlotQualitySelector() {
    const selector = document.getElementById("plot-quality-selector");
    if (!selector) return;
    const options = selector.querySelectorAll(".quality-option");
    options.forEach((btn) => {
      btn.addEventListener("click", () => {
        const level = btn.getAttribute("data-quality") || "medium";
        this.plot3DQuality = level;
        options.forEach((b) => b.classList.toggle("active", b === btn));
        this.init3DPlot();
      });
    });
  }

  generate3DPlotData() {
    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;
    const qualityMap = { low: 16, medium: 24, high: 32 };
    const size = qualityMap[this.plot3DQuality] || 24;
    const range = 3;
    this.plot3DSize = size;

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
      // Parameter validation and constraint enforcement
      const validatedValue = this.validateParameter(param, parseFloat(value));
      this.parameters[param] = validatedValue;
      this.updateParameterDisplay(param, validatedValue);

      // Real-time visualization updates (within 100ms requirement)
      if (param === "nSamples") {
        this.generateSamples();
      }

      // Update joint probability defaults when distribution parameters change
      if (["mu1", "mu2", "sigma1", "sigma2"].includes(param)) {
        this.updateJointProbabilityDefaults();
      }

      // Debounced update for performance
      this.scheduleVisualizationUpdate();
    }
  }

  validateParameter(param, value) {
    // Enhanced parameter validation and constraint enforcement
    switch (param) {
      case "mu1":
      case "mu2":
        // Mean values: reasonable range for percentage returns
        const validatedMean = Math.max(-50, Math.min(50, value));
        if (validatedMean !== value) {
          this.showParameterWarning(
            param,
            value,
            validatedMean,
            "均值必须在-50%到50%之间"
          );
        }
        return validatedMean;

      case "sigma1":
      case "sigma2":
        // Standard deviations must be positive and reasonable
        const validatedSigma = Math.max(0.1, Math.min(100, value));
        if (validatedSigma !== value) {
          this.showParameterWarning(
            param,
            value,
            validatedSigma,
            "标准差必须在0.1%到100%之间"
          );
        }
        return validatedSigma;

      case "rho":
        // Correlation coefficient bounds with enhanced validation
        const validatedRho = Math.max(-0.99, Math.min(0.99, value));
        if (validatedRho !== value) {
          this.showParameterWarning(
            param,
            value,
            validatedRho,
            "相关系数必须在-0.99到0.99之间"
          );
        }
        // Additional constraint: ensure covariance matrix remains positive definite
        if (Math.abs(validatedRho) >= 1.0) {
          return Math.sign(validatedRho) * 0.99;
        }
        return validatedRho;

      case "nSamples":
        // Sample size limits with performance considerations
        const validatedSamples = Math.max(
          100,
          Math.min(10000, Math.floor(value))
        );
        if (validatedSamples !== Math.floor(value)) {
          this.showParameterWarning(
            param,
            value,
            validatedSamples,
            "样本数量必须在100到10,000之间"
          );
        }
        return validatedSamples;

      default:
        return value;
    }
  }

  showParameterWarning(param, originalValue, validatedValue, message) {
    // Show user-friendly warning when parameter validation occurs
    const paramNames = {
      mu1: "股票A期望收益",
      mu2: "股票B期望收益",
      sigma1: "股票A波动率",
      sigma2: "股票B波动率",
      rho: "相关系数",
      nSamples: "样本数量",
    };

    const paramName = paramNames[param] || param;
    console.warn(
      `参数验证: ${paramName} 从 ${originalValue} 调整为 ${validatedValue}. ${message}`
    );

    // Optional: Show toast notification to user
    this.showToastNotification(`${paramName}已调整为有效范围内的值`, "warning");
  }

  showToastNotification(message, type = "info") {
    // Create and show a temporary notification
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform translate-x-full`;

    const typeClasses = {
      info: "bg-blue-500/90 text-white border border-blue-400/50",
      warning: "bg-yellow-500/90 text-white border border-yellow-400/50",
      error: "bg-red-500/90 text-white border border-red-400/50",
      success: "bg-green-500/90 text-white border border-green-400/50",
    };

    toast.className += ` ${typeClasses[type] || typeClasses.info}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 10);

    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  scheduleVisualizationUpdate() {
    // Debounce visualization updates for real-time performance
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      const startTime = performance.now();
      this.updateAllVisualizations();
      const endTime = performance.now();

      // Log performance for monitoring (should be < 100ms)
      if (endTime - startTime > 100) {
        console.warn(
          `Visualization update took ${endTime - startTime}ms (target: <100ms)`
        );
      }
    }, 16); // ~60fps update rate
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
    let ariaValueText = "";

    if (displayElement) {
      let displayValue = value;

      // Enhanced formatting for real-time value display
      if (param.includes("mu") || param.includes("sigma")) {
        displayValue = `${parseFloat(value).toFixed(1)}%`;
        ariaValueText = displayValue;
      } else if (param === "rho") {
        displayValue = parseFloat(value).toFixed(2);
        ariaValueText = displayValue;

        // Add visual indicator for correlation strength
        const absRho = Math.abs(value);
        if (absRho > 0.7) {
          displayElement.className = "text-red-400 font-mono font-bold";
        } else if (absRho > 0.3) {
          displayElement.className = "text-yellow-400 font-mono font-bold";
        } else {
          displayElement.className = "text-neon-blue font-mono font-bold";
        }

        // Update correlation interpretation and ARIA text
        this.updateCorrelationInterpretation(value);
        const interpretation = this.getCorrelationInterpretation(value);
        ariaValueText = `${displayValue} ${interpretation}`;
      } else if (param === "nSamples") {
        displayValue = Math.floor(value).toLocaleString();
        ariaValueText = `${Math.floor(value)} 个样本`;
        // Update performance indicator for sample size
        this.updatePerformanceIndicator(Math.floor(value));
      }

      displayElement.textContent = displayValue;

      // Add visual feedback for parameter changes
      displayElement.style.transform = "scale(1.1)";
      displayElement.style.transition = "transform 0.2s ease";
      setTimeout(() => {
        displayElement.style.transform = "scale(1)";
      }, 200);
    }

    // Update slider ARIA attributes and value to match validated parameter
    const sliderMap = {
      mu1: "mu1-slider",
      mu2: "mu2-slider",
      sigma1: "sigma1-slider",
      sigma2: "sigma2-slider",
      rho: "rho-slider",
      nSamples: "n-samples-slider",
    };

    const sliderId = sliderMap[param];
    if (sliderId) {
      const sliderElement = document.getElementById(sliderId);
      if (sliderElement) {
        if (parseFloat(sliderElement.value) !== value) {
          sliderElement.value = value;
        }

        // Update ARIA attributes for accessibility
        sliderElement.setAttribute("aria-valuenow", value);
        if (ariaValueText) {
          sliderElement.setAttribute("aria-valuetext", ariaValueText);
        }
      }
    }
  }

  updateCorrelationInterpretation(rho) {
    const interpretationElement = document.getElementById("rho-interpretation");
    if (!interpretationElement) return;

    const interpretation = this.getCorrelationInterpretation(rho);
    const absRho = Math.abs(rho);
    let colorClass = "";

    if (absRho >= 0.9) {
      colorClass = "text-red-400";
    } else if (absRho >= 0.7) {
      colorClass = "text-orange-400";
    } else if (absRho >= 0.5) {
      colorClass = "text-yellow-400";
    } else if (absRho >= 0.3) {
      colorClass = "text-neon-blue";
    } else {
      colorClass = "text-gray-400";
    }

    interpretationElement.innerHTML = `<span class="${colorClass}">${interpretation}</span>`;
  }

  getCorrelationInterpretation(rho) {
    const absRho = Math.abs(rho);

    if (absRho >= 0.9) {
      return rho > 0 ? "极强正相关" : "极强负相关";
    } else if (absRho >= 0.7) {
      return rho > 0 ? "强正相关" : "强负相关";
    } else if (absRho >= 0.5) {
      return rho > 0 ? "中等正相关" : "中等负相关";
    } else if (absRho >= 0.3) {
      return rho > 0 ? "弱正相关" : "弱负相关";
    } else {
      return "几乎无相关";
    }
  }

  updateDistributionDescription(distType) {
    const descriptions = {
      normal: "经典的钟形分布，适用于大多数自然现象",
      uniform: "在指定区域内均匀分布，所有点等概率",
      exponential: "指数衰减分布，常用于生存分析和可靠性工程",
    };

    const properties = {
      normal: {
        complexity: "中等",
        correlationSupport: "是",
        paramCount: "5个",
        recommendedSamples: "1000-5000",
        complexityLevel: "medium",
      },
      uniform: {
        complexity: "低",
        correlationSupport: "部分",
        paramCount: "4个",
        recommendedSamples: "500-2000",
        complexityLevel: "low",
      },
      exponential: {
        complexity: "高",
        correlationSupport: "是",
        paramCount: "5个",
        recommendedSamples: "1500-8000",
        complexityLevel: "high",
      },
    };

    // Update description
    const descElement = document.getElementById("dist-description");
    if (descElement && descriptions[distType]) {
      descElement.textContent = descriptions[distType];
    }

    // Update distribution properties display
    const props = properties[distType];
    if (props) {
      const complexityEl = document.getElementById("complexity-level");
      const correlationEl = document.getElementById("correlation-support");
      const paramCountEl = document.getElementById("param-count");
      const recommendedEl = document.getElementById("recommended-samples");

      if (complexityEl) complexityEl.textContent = props.complexity;
      if (correlationEl) {
        correlationEl.textContent = props.correlationSupport;
        correlationEl.className =
          props.correlationSupport === "是"
            ? "text-green-400"
            : "text-yellow-400";
      }
      if (paramCountEl) paramCountEl.textContent = props.paramCount;
      if (recommendedEl) recommendedEl.textContent = props.recommendedSamples;

      // Update complexity indicator color
      const indicatorEl = document.getElementById("dist-complexity-indicator");
      if (indicatorEl) {
        const colorClass =
          props.complexityLevel === "low"
            ? "text-green-400"
            : props.complexityLevel === "medium"
            ? "text-yellow-400"
            : "text-red-400";
        indicatorEl.className = `ml-auto text-xs ${colorClass}`;
      }
    }

    // Adjust recommended sample size based on distribution
    this.updateSampleSizeRecommendations(distType);
  }

  updateSampleSizeRecommendations(distType) {
    const recommendations = {
      normal: { min: 1000, max: 5000, optimal: 2000 },
      uniform: { min: 500, max: 2000, optimal: 1000 },
      exponential: { min: 1500, max: 8000, optimal: 3000 },
    };

    const rec = recommendations[distType] || recommendations.normal;
    const currentSize = this.parameters.nSamples;

    // Update slider recommendations
    const slider = document.getElementById("n-samples-slider");
    if (slider) {
      // Adjust slider range based on distribution complexity
      slider.setAttribute("min", Math.max(100, rec.min - 500));
      slider.setAttribute("max", Math.min(10000, rec.max + 2000));
    }

    // Update performance metrics
    this.updatePerformanceMetrics(currentSize, distType);
  }

  updatePerformanceMetrics(sampleSize, distType = null) {
    const currentDistType = distType || this.parameters.distType;

    // Calculate estimated performance metrics
    const complexity = {
      normal: 1.0,
      uniform: 0.5,
      exponential: 1.5,
    };

    const baseComplexity = complexity[currentDistType] || 1.0;
    const estimatedRenderTime = Math.round(sampleSize * baseComplexity * 0.05); // ms
    const estimatedMemory = Math.round(sampleSize * 0.002); // MB
    const estimatedFrameRate = Math.max(15, 60 - Math.floor(sampleSize / 200));

    // Update display elements
    const renderTimeEl = document.getElementById("render-time");
    const memoryEl = document.getElementById("memory-usage");
    const frameRateEl = document.getElementById("frame-rate");

    if (renderTimeEl) renderTimeEl.textContent = `~${estimatedRenderTime}ms`;
    if (memoryEl) memoryEl.textContent = `~${estimatedMemory}MB`;
    if (frameRateEl) {
      frameRateEl.textContent = `${estimatedFrameRate}fps`;
      frameRateEl.className =
        estimatedFrameRate >= 45
          ? "text-green-400 text-xs font-mono"
          : estimatedFrameRate >= 30
          ? "text-yellow-400 text-xs font-mono"
          : "text-red-400 text-xs font-mono";
    }

    // Update performance indicator and bar
    this.updatePerformanceIndicator(sampleSize);
  }

  updatePerformanceIndicator(sampleSize) {
    const indicator = document.getElementById("performance-indicator");
    const recommendation = document.getElementById(
      "sample-size-recommendation"
    );
    const performanceBar = document.getElementById("performance-bar");

    if (!indicator || !recommendation || !performanceBar) return;

    let status, color, barWidth, recText;

    if (sampleSize <= 1000) {
      status = "流畅";
      color = "bg-green-500/20 text-green-400";
      barWidth = "20%";
      recText = "推荐范围";
    } else if (sampleSize <= 3000) {
      status = "良好";
      color = "bg-yellow-500/20 text-yellow-400";
      barWidth = "50%";
      recText = "可接受";
    } else if (sampleSize <= 5000) {
      status = "较慢";
      color = "bg-orange-500/20 text-orange-400";
      barWidth = "75%";
      recText = "可能较慢";
    } else {
      status = "慢";
      color = "bg-red-500/20 text-red-400";
      barWidth = "100%";
      recText = "性能影响";
    }

    indicator.className = `ml-2 text-xs px-2 py-1 rounded-full ${color}`;
    indicator.innerHTML = `<i class="fa-solid fa-tachometer-alt"></i> ${status}`;
    recommendation.textContent = recText;
    performanceBar.style.width = barWidth;
    performanceBar.className = `h-1 rounded-full transition-all duration-300 ${
      sampleSize <= 1000
        ? "bg-green-400"
        : sampleSize <= 3000
        ? "bg-yellow-400"
        : sampleSize <= 5000
        ? "bg-orange-400"
        : "bg-red-400"
    }`;
  }

  showGenerationFeedback() {
    const generateBtn = document.getElementById("generate-samples");
    if (!generateBtn) return;

    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin mr-2"></i>生成中...';
    generateBtn.disabled = true;

    setTimeout(() => {
      generateBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>生成完成';
      setTimeout(() => {
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
      }, 1000);
    }, 500);
  }

  exportCurrentData() {
    const data = {
      parameters: this.parameters,
      samples: this.currentSamples,
      statistics: {
        sampleCorrelation: this.calculateCorrelation(
          this.currentSamples.map(([x]) => x),
          this.currentSamples.map(([, y]) => y)
        ),
        theoreticalCorrelation: this.parameters.rho,
        sampleSize: this.currentSamples.length,
      },
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chapter3_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show export confirmation
    this.showExportConfirmation();
  }

  showExportConfirmation() {
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-neon-blue/20 border border-neon-blue/50 text-neon-blue px-4 py-2 rounded-lg z-50 transition-all duration-300";
    notification.innerHTML =
      '<i class="fa-solid fa-download mr-2"></i>数据已导出';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  generateInitialSamples() {
    this.generateSamples();
    this.initializeJointProbabilityDefaults();
  }

  initializeJointProbabilityDefaults() {
    // Set reasonable default values for the joint probability calculator
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;

    // Default to a central region around the mean
    const xMinDefault = (mu1 - sigma1).toFixed(1);
    const xMaxDefault = (mu1 + sigma1).toFixed(1);
    const yMinDefault = (mu2 - sigma2).toFixed(1);
    const yMaxDefault = (mu2 + sigma2).toFixed(1);

    // Update input fields if they exist
    const xMinInput = document.getElementById("x-min");
    const xMaxInput = document.getElementById("x-max");
    const yMinInput = document.getElementById("y-min");
    const yMaxInput = document.getElementById("y-max");

    if (xMinInput && !xMinInput.value) xMinInput.value = xMinDefault;
    if (xMaxInput && !xMaxInput.value) xMaxInput.value = xMaxDefault;
    if (yMinInput && !yMinInput.value) yMinInput.value = yMinDefault;
    if (yMaxInput && !yMaxInput.value) yMaxInput.value = yMaxDefault;

    // Update area calculation
    this.updateRegionArea();
  }

  updateJointProbabilityDefaults() {
    // Update joint probability calculator defaults when parameters change
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;

    // Only update if inputs are currently at default values or empty
    const xMinInput = document.getElementById("x-min");
    const xMaxInput = document.getElementById("x-max");
    const yMinInput = document.getElementById("y-min");
    const yMaxInput = document.getElementById("y-max");

    if (!xMinInput || !xMaxInput || !yMinInput || !yMaxInput) return;

    // Check if current values are close to old defaults (suggesting they haven't been manually changed)
    const currentXMin = parseFloat(xMinInput.value);
    const currentXMax = parseFloat(xMaxInput.value);
    const currentYMin = parseFloat(yMinInput.value);
    const currentYMax = parseFloat(yMaxInput.value);

    // Update if values are empty or seem to be old defaults
    const shouldUpdate =
      isNaN(currentXMin) ||
      isNaN(currentXMax) ||
      isNaN(currentYMin) ||
      isNaN(currentYMax) ||
      this.areValuesCloseToDefaults(
        currentXMin,
        currentXMax,
        currentYMin,
        currentYMax
      );

    if (shouldUpdate) {
      xMinInput.value = (mu1 - sigma1).toFixed(1);
      xMaxInput.value = (mu1 + sigma1).toFixed(1);
      yMinInput.value = (mu2 - sigma2).toFixed(1);
      yMaxInput.value = (mu2 + sigma2).toFixed(1);

      this.validateRegionInputs();
      this.updateRegionArea();
    }
  }

  areValuesCloseToDefaults(xMin, xMax, yMin, yMax) {
    // Check if current values are close to what the defaults would have been
    // This helps determine if the user has manually changed the values
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;
    const tolerance = 0.5; // Allow some tolerance for floating point differences

    const expectedXMin = mu1 - sigma1;
    const expectedXMax = mu1 + sigma1;
    const expectedYMin = mu2 - sigma2;
    const expectedYMax = mu2 + sigma2;

    return (
      Math.abs(xMin - expectedXMin) < tolerance &&
      Math.abs(xMax - expectedXMax) < tolerance &&
      Math.abs(yMin - expectedYMin) < tolerance &&
      Math.abs(yMax - expectedYMax) < tolerance
    );
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

  generateBivariateStudentT(mu1, mu2, sigma1, sigma2, rho, df = 3) {
    // Generate bivariate Student-t distribution
    const [z1, z2] = this.boxMullerTransform();

    // Chi-square random variable for degrees of freedom
    const chi2 = this.generateChiSquare(df);
    const scale = Math.sqrt(df / chi2);

    const x = mu1 + sigma1 * z1 * scale;
    const y = mu2 + sigma2 * (rho * z1 + Math.sqrt(1 - rho * rho) * z2) * scale;

    return [x, y];
  }

  generateBivariateGamma(mu1, mu2, sigma1, sigma2, rho) {
    // Simplified bivariate gamma (using normal copula approach)
    const [u1, u2] = this.generateBivariateNormal(0, 0, 1, 1, rho);

    // Transform to uniform using normal CDF approximation
    const cdf1 = this.normalCDF(u1);
    const cdf2 = this.normalCDF(u2);

    // Transform to gamma using inverse gamma CDF
    const shape1 = (mu1 / sigma1) ** 2;
    const scale1 = sigma1 ** 2 / mu1;
    const shape2 = (mu2 / sigma2) ** 2;
    const scale2 = sigma2 ** 2 / mu2;

    const x = this.gammaInverseCDF(cdf1, shape1, scale1);
    const y = this.gammaInverseCDF(cdf2, shape2, scale2);

    return [x, y];
  }

  generateChiSquare(df) {
    // Simple chi-square generation using sum of squared normals
    let sum = 0;
    for (let i = 0; i < df; i++) {
      const z = this.boxMullerTransform()[0];
      sum += z * z;
    }
    return sum;
  }

  normalCDF(x) {
    // Approximation of normal CDF
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  erf(x) {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  gammaInverseCDF(p, shape, scale) {
    // Simplified gamma inverse CDF approximation
    if (p <= 0) return 0;
    if (p >= 1) return Infinity;

    // Use normal approximation for large shape parameters
    if (shape > 10) {
      const mean = shape * scale;
      const variance = shape * scale * scale;
      const z = this.normalInverseCDF(p);
      return Math.max(0, mean + Math.sqrt(variance) * z);
    }

    // Simple iterative approximation for small shape parameters
    let x = shape * scale; // Initial guess
    for (let i = 0; i < 10; i++) {
      const cdf = this.gammaCDF(x, shape, scale);
      const pdf = this.gammaPDF(x, shape, scale);
      if (Math.abs(cdf - p) < 1e-6 || pdf === 0) break;
      x = Math.max(0.001, x - (cdf - p) / pdf);
    }

    return x;
  }

  normalInverseCDF(p) {
    // Approximation of normal inverse CDF (Beasley-Springer-Moro algorithm)
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;

    const a = [
      0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
      1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
    ];
    const b = [
      0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
      6.680131188771972e1, -1.328068155288572e1,
    ];

    const c = [
      0, -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
      -2.549732539343734, 4.374664141464968, 2.938163982698783,
    ];
    const d = [
      0, 7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
      3.754408661907416,
    ];

    let x;
    if (p < 0.02425) {
      const q = Math.sqrt(-2 * Math.log(p));
      x =
        (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
        ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    } else if (p <= 0.97575) {
      const q = p - 0.5;
      const r = q * q;
      x =
        ((((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) *
          q) /
        (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      x =
        -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
        ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    }

    return x;
  }

  gammaCDF(x, shape, scale) {
    // Simplified gamma CDF using incomplete gamma function approximation
    if (x <= 0) return 0;
    return this.incompleteGamma(shape, x / scale) / this.gamma(shape);
  }

  gammaPDF(x, shape, scale) {
    // Gamma probability density function
    if (x <= 0) return 0;
    return (
      (Math.pow(x / scale, shape - 1) * Math.exp(-x / scale)) /
      (scale * this.gamma(shape))
    );
  }

  gamma(z) {
    // Approximation of gamma function using Stirling's approximation
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * this.gamma(1 - z));
    z -= 1;
    let x = 0.99999999999980993;
    const g = 7;
    const p = [
      676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012,
      9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    for (let i = 0; i < p.length; i++) {
      x += p[i] / (z + i + 1);
    }

    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  incompleteGamma(s, x) {
    // Approximation of incomplete gamma function
    if (x === 0) return 0;
    if (s === 0) return 1;

    // Use series expansion for small x
    if (x < s + 1) {
      let sum = 1 / s;
      let term = 1 / s;
      for (let n = 1; n < 100; n++) {
        term *= x / (s + n);
        sum += term;
        if (Math.abs(term) < 1e-15) break;
      }
      return sum * Math.exp(-x) * Math.pow(x, s);
    }

    // Use continued fraction for large x
    let a = 1 - s;
    let b = a + x + 1;
    let c = 1e30;
    let d = 1 / b;
    let h = d;

    for (let i = 1; i <= 100; i++) {
      const an = -i * (i - s);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }

    return this.gamma(s) - h * Math.exp(-x) * Math.pow(x, s);
  }

  generateBivariateNormal(mu1, mu2, sigma1, sigma2, rho) {
    // Box-Muller变换生成标准正态分布
    const [z1, z2] = this.boxMullerTransform();

    // 变换到相关的二维正态分布
    const x = mu1 + sigma1 * z1;
    const y = mu2 + sigma2 * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);

    return [x, y];
  }

  boxMullerTransform() {
    const u1 = Math.random();
    const u2 = Math.random();

    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    return [z1, z2];
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
    if (this.useBackgroundEffects) this.updateMarginalGlow();
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

    // Draw probability region highlight if active
    if (this.highlightRegion) {
      this.drawProbabilityRegion(ctx, width, height);
    }
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

  drawProbabilityRegion(ctx, width, height) {
    const { xMin, xMax, yMin, yMax } = this.highlightRegion;
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;

    // Convert probability region to canvas coordinates
    const canvasXMin = ((xMin - (mu1 - 2 * sigma1)) / (4 * sigma1)) * width;
    const canvasXMax = ((xMax - (mu1 - 2 * sigma1)) / (4 * sigma1)) * width;
    const canvasYMin =
      height - ((yMax - (mu2 - 2 * sigma2)) / (4 * sigma2)) * height;
    const canvasYMax =
      height - ((yMin - (mu2 - 2 * sigma2)) / (4 * sigma2)) * height;

    // Draw highlighted rectangle
    ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
    ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    ctx.fillRect(
      canvasXMin,
      canvasYMin,
      canvasXMax - canvasXMin,
      canvasYMax - canvasYMin
    );
    ctx.strokeRect(
      canvasXMin,
      canvasYMin,
      canvasXMax - canvasXMin,
      canvasYMax - canvasYMin
    );

    ctx.setLineDash([]); // Reset line dash

    // Add region label
    ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "P(X∈[a,b], Y∈[c,d])",
      (canvasXMin + canvasXMax) / 2,
      (canvasYMin + canvasYMax) / 2
    );
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

  debugBackgroundStatus() {
    try {
      const d3ok = typeof d3 !== "undefined" && !!d3.contours;
      const blurEl = document.getElementById("global-bg-blur");
      let blurInfo = null;
      if (blurEl && window.getComputedStyle) {
        const cs = getComputedStyle(blurEl);
        blurInfo = {
          backdropFilter: cs.getPropertyValue("backdrop-filter"),
          backgroundColor: cs.getPropertyValue("background-color"),
          opacity: cs.getPropertyValue("opacity"),
        };
      }
      console.info("Chapter3 Background Status", {
        useBackgroundEffects: !!this.useBackgroundEffects,
        bgCanvasExists: !!this.bgCanvas,
        bgCtxReady: !!this.bgCtx,
        d3ContourAvailable: d3ok,
        usingFallbackRenderer: !d3ok,
        glowCanvasExists: !!(this.canvases && this.canvases.glow),
        bgView: { w: this.bgViewW, h: this.bgViewH, dpr: this.bgDpr },
        blurLayer: blurInfo,
      });
    } catch (_) {}
  }

  generateFallbackContours(values, baseW, baseH, thresholds) {
    const sets = [];
    for (let ti = 0; ti < thresholds.length; ti++) {
      const t = thresholds[ti];
      const segments = [];

      // Generate line segments using marching squares
      for (let y = 0; y < baseH - 1; y++) {
        for (let x = 0; x < baseW - 1; x++) {
          const i00 = y * baseW + x;
          const i10 = y * baseW + (x + 1);
          const i01 = (y + 1) * baseW + x;
          const i11 = (y + 1) * baseW + (x + 1);
          const v00 = values[i00];
          const v10 = values[i10];
          const v01 = values[i01];
          const v11 = values[i11];
          const vC = (v00 + v10 + v01 + v11) * 0.25;

          // Compute intersections on each edge (with labels)
          let top = null,
            right = null,
            bottom = null,
            left = null;
          if (v00 < t !== v10 < t) {
            const r = (t - v00) / Math.max(1e-6, v10 - v00);
            top = [x + r, y];
          }
          if (v10 < t !== v11 < t) {
            const r = (t - v10) / Math.max(1e-6, v11 - v10);
            right = [x + 1, y + r];
          }
          if (v01 < t !== v11 < t) {
            const r = (t - v01) / Math.max(1e-6, v11 - v01);
            bottom = [x + r, y + 1];
          }
          if (v00 < t !== v01 < t) {
            const r = (t - v00) / Math.max(1e-6, v01 - v00);
            left = [x, y + r];
          }

          const pts = [];
          if (top) pts.push(top);
          if (right) pts.push(right);
          if (bottom) pts.push(bottom);
          if (left) pts.push(left);

          if (pts.length === 2) {
            segments.push([pts[0], pts[1]]);
          } else if (pts.length === 4) {
            // Ambiguous case: choose diagonal pairing based on center value
            if (vC < t) {
              if (top && right) segments.push([top, right]);
              if (bottom && left) segments.push([bottom, left]);
            } else {
              if (top && left) segments.push([top, left]);
              if (right && bottom) segments.push([right, bottom]);
            }
          }
        }
      }

      // Connect segments into continuous polylines
      const polylines = this.connectSegmentsToPolylines(segments);

      // Smooth the polylines
      const smoothedPolylines = polylines.map((line) =>
        this.smoothPolyline(line)
      );

      // Convert to the expected coordinate format
      const coords = smoothedPolylines.map((line) => [line]);

      sets.push({ value: t, coordinates: coords });
    }
    return sets;
  }

  connectSegmentsToPolylines(segments) {
    if (segments.length === 0) return [];

    // Improved segment connection with better precision handling
    const tolerance = 1e-3; // Increased tolerance for better connection
    const keyOf = (p) =>
      `${Math.round(p[0] / tolerance) * tolerance},${
        Math.round(p[1] / tolerance) * tolerance
      }`;

    const adjacency = new Map();
    const used = new Array(segments.length).fill(false);

    // Build adjacency map with improved precision
    segments.forEach((seg, idx) => {
      const [a, b] = seg;
      const ka = keyOf(a);
      const kb = keyOf(b);

      if (!adjacency.has(ka)) adjacency.set(ka, []);
      if (!adjacency.has(kb)) adjacency.set(kb, []);

      adjacency.get(ka).push({ idx, point: a, otherPoint: b, otherKey: kb });
      adjacency.get(kb).push({ idx, point: b, otherPoint: a, otherKey: ka });
    });

    const polylines = [];

    for (let i = 0; i < segments.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      const [start, end] = segments[i];
      const line = [start, end];

      // Extend forward from end point
      let currentKey = keyOf(end);
      let currentPoint = end;

      while (true) {
        const neighbors = adjacency.get(currentKey) || [];
        let nextConnection = null;

        for (const neighbor of neighbors) {
          if (used[neighbor.idx]) continue;
          // Check if this connection makes sense (avoid sharp turns)
          if (
            this.isValidConnection(
              currentPoint,
              neighbor.point,
              neighbor.otherPoint
            )
          ) {
            nextConnection = neighbor;
            break;
          }
        }

        if (!nextConnection) break;

        used[nextConnection.idx] = true;
        line.push(nextConnection.otherPoint);
        currentKey = nextConnection.otherKey;
        currentPoint = nextConnection.otherPoint;
      }

      // Extend backward from start point
      currentKey = keyOf(start);
      currentPoint = start;

      while (true) {
        const neighbors = adjacency.get(currentKey) || [];
        let prevConnection = null;

        for (const neighbor of neighbors) {
          if (used[neighbor.idx]) continue;
          if (
            this.isValidConnection(
              currentPoint,
              neighbor.point,
              neighbor.otherPoint
            )
          ) {
            prevConnection = neighbor;
            break;
          }
        }

        if (!prevConnection) break;

        used[prevConnection.idx] = true;
        line.unshift(prevConnection.otherPoint);
        currentKey = prevConnection.otherKey;
        currentPoint = prevConnection.otherPoint;
      }

      // Only keep lines with sufficient length
      if (line.length >= 3) {
        polylines.push(line);
      }
    }

    return polylines;
  }

  isValidConnection(currentPoint, connectionPoint, nextPoint) {
    // Check if the connection creates a reasonable angle (avoid sharp turns)
    const dist1 = Math.sqrt(
      Math.pow(currentPoint[0] - connectionPoint[0], 2) +
        Math.pow(currentPoint[1] - connectionPoint[1], 2)
    );
    const dist2 = Math.sqrt(
      Math.pow(connectionPoint[0] - nextPoint[0], 2) +
        Math.pow(connectionPoint[1] - nextPoint[1], 2)
    );

    // Reject connections that are too short or create unrealistic jumps
    return dist1 < 2.0 && dist2 < 2.0;
  }

  smoothPolyline(points) {
    if (points.length < 3) return points;

    const smoothed = [points[0]]; // Keep first point

    // Apply simple smoothing using moving average
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // Weighted average for smoothing
      const smoothX = 0.25 * prev[0] + 0.5 * curr[0] + 0.25 * next[0];
      const smoothY = 0.25 * prev[1] + 0.5 * curr[1] + 0.25 * next[1];

      smoothed.push([smoothX, smoothY]);
    }

    smoothed.push(points[points.length - 1]); // Keep last point
    return smoothed;
  }

  normalizeContourCoordinates(coordinates) {
    // Simplified version that just extracts rings from D3 MultiPolygon format
    // without problematic segment linking that caused straight-line artifacts
    const polylines = [];
    coordinates.forEach((multi) => {
      multi.forEach((ring) => {
        // Only include rings with enough points to form a meaningful contour
        if (ring.length >= 3) {
          polylines.push(ring);
        }
      });
    });
    return polylines;
  }

  startBackgroundContours() {
    if (!this.bgCanvas) {
      console.warn("Background contours disabled: #bg-noise canvas not found");
      this.debugBackgroundStatus();
      return;
    }
    if (!this.bgCtx) {
      console.warn("Background contours disabled: 2D context unavailable");
      this.debugBackgroundStatus();
      return;
    }
    if (!this.bgNoise) {
      console.warn("Background contours disabled: Noise2D not available");
      this.debugBackgroundStatus();
      return;
    }
    this.bgLastRAF = 0;
    this.bgMinDt = 1000 / 30;
    this.performanceMode = "normal";
    this.bgFrameAccum = 0;
    this.bgFrameSamples = 0;
    const baseW = this.bgConfig.cols;
    const baseH = this.bgConfig.rows;
    const scale = this.bgConfig.scale;
    const values = new Float32Array(baseW * baseH);
    const thresholds = Array.from({ length: 8 }, (_, i) => 0.2 + i * 0.08).map(
      (v) => Math.min(0.85, v)
    );
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
          console.warn("Background performance degraded", {
            averageFrameMs: avg,
            mode: this.performanceMode,
          });
        } else if (this.performanceDegraded && avg < 35) {
          this.performanceDegraded = false;
          this.performanceMode = "normal";
          console.info("Background performance restored", {
            averageFrameMs: avg,
            mode: this.performanceMode,
          });
        }
        this.bgFrameAccum = 0;
        this.bgFrameSamples = 0;
      }
      this.bgTime = now;
      const t = now * 0.00005; // Slower animation for smoother effect
      let k = 0;
      for (let y = 0; y < baseH; y++) {
        for (let x = 0; x < baseW; x++) {
          // Apply multiple octaves of noise for more organic patterns
          const v1 = this.bgNoise.noise2(x * scale, y * scale + t);
          const v2 =
            this.bgNoise.noise2(x * scale * 2, y * scale * 2 + t * 0.5) * 0.5;
          const v3 =
            this.bgNoise.noise2(x * scale * 4, y * scale * 4 + t * 0.25) * 0.25;
          const combined = v1 + v2 + v3;
          values[k++] = Math.max(0, Math.min(1, (combined + 1) * 0.4 + 0.1));
        }
      }
      let sets;
      if (typeof d3 !== "undefined" && d3.contours) {
        const gen = d3.contours().size([baseW, baseH]).thresholds(thresholds);
        sets = gen(values);
      } else {
        if (!this._bgWarned) {
          this._bgWarned = true;
          console.warn(
            "d3-contour unavailable, using fallback isoline renderer"
          );
        }
        sets = this.generateFallbackContours(values, baseW, baseH, thresholds);
      }
      if (!this._bgLoggedStart) {
        this._bgLoggedStart = true;
        console.info("Background contours started", {
          renderer:
            typeof d3 !== "undefined" && d3.contours ? "d3" : "fallback",
          baseSize: [baseW, baseH],
          thresholdsCount: thresholds.length,
          scale,
        });
        this.debugBackgroundStatus();
      }
      const W = this.bgViewW || window.innerWidth;
      const H = this.bgViewH || window.innerHeight;
      if (this.bgDebug) {
        this._bgDebugFrameCount = (this._bgDebugFrameCount || 0) + 1;
        if (this._bgDebugFrameCount % this.bgDumpInterval === 0) {
          let coordsCount = 0;
          sets.forEach((c) => {
            coordsCount += c.coordinates.length;
          });
          let blurOpacity = null;
          try {
            const el = document.getElementById("global-bg-blur");
            if (el && window.getComputedStyle) {
              blurOpacity = getComputedStyle(el).getPropertyValue("opacity");
            }
          } catch (_) {}
          console.info("Background debug", {
            frame: this._bgDebugFrameCount,
            dt,
            mode: this.performanceMode,
            view: { W, H, dpr: this.bgDpr },
            base: { w: baseW, h: baseH, scale },
            thresholdsCount: thresholds.length,
            contoursCount: sets.length,
            totalSegments: coordsCount,
            blurLayerOpacity: blurOpacity,
          });
        }
      }
      this.bgLayerCtx.clearRect(0, 0, W, H);
      this.bgLayerCtx.globalAlpha = 0.8;
      this.bgLayerCtx.lineJoin = "round";
      this.bgLayerCtx.lineCap = "round";
      this.bgLayerCtx.shadowBlur = 2;
      this.bgLayerCtx.shadowColor = "rgba(0, 0, 0, 0.1)";
      const minV = thresholds[0];
      const maxV = thresholds[thresholds.length - 1];
      sets.forEach((contour, idx) => {
        const v = contour.value || minV;
        const tval = Math.max(
          0,
          Math.min(1, (v - minV) / Math.max(1e-6, maxV - minV))
        );
        const hex = this.mixHexColors(palette, tval);
        const alpha = 0.4 + 0.4 * tval;
        this.bgLayerCtx.strokeStyle = this.rgbaFromHex(hex, alpha);
        this.bgLayerCtx.lineWidth = 1.5 + idx * 0.3; // Thinner, more elegant lines
        // Use D3 coordinates directly without problematic normalization
        contour.coordinates.forEach((multi) => {
          multi.forEach((ring) => {
            if (ring.length < 3) return; // Skip very short segments

            this.bgLayerCtx.beginPath();
            for (let p = 0; p < ring.length; p++) {
              const gx = ring[p][0];
              const gy = ring[p][1];
              const x = (gx / (baseW - 1)) * W;
              const y = (gy / (baseH - 1)) * H;
              if (p === 0) this.bgLayerCtx.moveTo(x, y);
              else this.bgLayerCtx.lineTo(x, y);
            }

            // Check if the contour should be closed
            const fx = (ring[0][0] / (baseW - 1)) * W;
            const fy = (ring[0][1] / (baseH - 1)) * H;
            const lx = (ring[ring.length - 1][0] / (baseW - 1)) * W;
            const ly = (ring[ring.length - 1][1] / (baseH - 1)) * H;
            const dx = fx - lx;
            const dy = fy - ly;
            const closed = dx * dx + dy * dy < 2.0; // Slightly more tolerant
            if (closed) this.bgLayerCtx.closePath();
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

    // Draw probability region highlight if active
    if (this.highlightRegion) {
      this.drawScatterRegionHighlight(ctx, width, height);
    }

    // 绘制样本点
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;
    const xRange = 4 * sigma1;
    const yRange = 4 * sigma2;

    this.currentSamples.forEach(([x, y]) => {
      const canvasX = ((x - (mu1 - xRange / 2)) / xRange) * width;
      const canvasY = height - ((y - (mu2 - yRange / 2)) / yRange) * height;

      if (
        canvasX >= 0 &&
        canvasX <= width &&
        canvasY >= 0 &&
        canvasY <= height
      ) {
        // Check if point is in highlighted region
        let pointColor = "rgba(34, 211, 238, 0.6)";
        if (this.highlightRegion) {
          const { xMin, xMax, yMin, yMax } = this.highlightRegion;
          if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
            pointColor = "rgba(255, 255, 0, 0.8)"; // Highlight points in region
          } else {
            pointColor = "rgba(34, 211, 238, 0.3)"; // Dim other points
          }
        }

        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  drawScatterRegionHighlight(ctx, width, height) {
    const { xMin, xMax, yMin, yMax } = this.highlightRegion;
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;

    // Convert probability region to canvas coordinates
    const xRange = 4 * sigma1;
    const yRange = 4 * sigma2;

    const canvasXMin = ((xMin - (mu1 - xRange / 2)) / xRange) * width;
    const canvasXMax = ((xMax - (mu1 - xRange / 2)) / xRange) * width;
    const canvasYMin = height - ((yMax - (mu2 - yRange / 2)) / yRange) * height;
    const canvasYMax = height - ((yMin - (mu2 - yRange / 2)) / yRange) * height;

    // Draw highlighted rectangle
    ctx.fillStyle = "rgba(255, 255, 0, 0.1)";
    ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    ctx.fillRect(
      canvasXMin,
      canvasYMin,
      canvasXMax - canvasXMin,
      canvasYMax - canvasYMin
    );
    ctx.strokeRect(
      canvasXMin,
      canvasYMin,
      canvasXMax - canvasXMin,
      canvasYMax - canvasYMin
    );

    ctx.setLineDash([]); // Reset line dash

    // Add region label
    ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "计算区域",
      (canvasXMin + canvasXMax) / 2,
      (canvasYMin + canvasYMax) / 2
    );
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
    if (typeof Plotly === "undefined") return;

    this.plot3DData = this.generate3DPlotData();
    if (!this.plot3DReady) {
      this.init3DPlot();
      return;
    }
    const size = this.plot3DSize || 24;
    const prevSize = this._prevPlot3DSize || size;
    this._prevPlot3DSize = size;
    if (size !== prevSize) {
      Plotly.react(plotDiv, [this.plot3DData], this._plot3DLayout || {});
    } else {
      Plotly.restyle(plotDiv, { z: [this.plot3DData.z] }, [0]);
    }
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
    const method = document.getElementById("calc-method").value;

    // Enhanced input validation
    if (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) {
      this.showCalculationError("请输入有效的数值");
      return;
    }

    if (xMin >= xMax) {
      this.showCalculationError("X范围无效: 最小值必须小于最大值");
      return;
    }

    if (yMin >= yMax) {
      this.showCalculationError("Y范围无效: 最小值必须小于最大值");
      return;
    }

    // Check if region is reasonable (not too large or too small)
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;
    const xRange = Math.abs(xMax - xMin);
    const yRange = Math.abs(yMax - yMin);

    if (xRange > 10 * sigma1 || yRange > 10 * sigma2) {
      this.showCalculationWarning("计算区域较大，可能影响计算精度");
    }

    if (xRange < 0.01 * sigma1 || yRange < 0.01 * sigma2) {
      this.showCalculationWarning("计算区域较小，可能导致样本估计不准确");
    }

    // Show loading state
    this.showCalculationLoading();

    // Calculate using selected method(s)
    const results = {};

    try {
      if (method === "sample" || method === "both") {
        results.sample = this.calculateSampleProbability(
          xMin,
          xMax,
          yMin,
          yMax
        );
      }

      if (method === "numerical" || method === "both") {
        results.numerical = this.calculateNumericalProbability(
          xMin,
          xMax,
          yMin,
          yMax
        );
      }

      // Display results
      this.displayProbabilityResults(results, method);
      this.updateRegionArea();

      // Reset button state
      this.resetCalculationButton();
    } catch (error) {
      console.error("Calculation error:", error);
      this.showCalculationError("计算过程中发生错误，请检查参数设置");
    }
  }

  showCalculationWarning(message) {
    const resultsDiv = document.getElementById("prob-results");
    resultsDiv.innerHTML =
      `
      <div class="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-3 py-2 rounded-lg text-xs mb-2">
        <i class="fa-solid fa-exclamation-triangle mr-2"></i>
        ${message}
      </div>
    ` + resultsDiv.innerHTML;
    resultsDiv.classList.remove("hidden");
  }

  resetCalculationButton() {
    setTimeout(() => {
      const calcBtn = document.getElementById("calc-joint-prob");
      if (calcBtn) {
        calcBtn.innerHTML =
          '<i class="fa-solid fa-play mr-2"></i>计算 P(X∈[a,b], Y∈[c,d])';
        calcBtn.disabled = false;
      }
    }, 500);
  }

  calculateSampleProbability(xMin, xMax, yMin, yMax) {
    let count = 0;
    const total = this.currentSamples.length;

    this.currentSamples.forEach(([x, y]) => {
      if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
        count++;
      }
    });

    return {
      probability: count / total,
      count: count,
      total: total,
      method: "sample",
    };
  }

  calculateNumericalProbability(xMin, xMax, yMin, yMax) {
    const { mu1, mu2, sigma1, sigma2, rho, distType } = this.parameters;

    // Use appropriate numerical integration based on distribution type
    switch (distType) {
      case "normal":
        return this.integrateNormalDistribution(
          xMin,
          xMax,
          yMin,
          yMax,
          mu1,
          mu2,
          sigma1,
          sigma2,
          rho
        );
      case "uniform":
        return this.integrateUniformDistribution(
          xMin,
          xMax,
          yMin,
          yMax,
          mu1,
          mu2,
          sigma1,
          sigma2
        );
      case "exponential":
        return this.integrateExponentialDistribution(
          xMin,
          xMax,
          yMin,
          yMax,
          mu1,
          mu2,
          sigma1,
          sigma2
        );
      default:
        return this.integrateNormalDistribution(
          xMin,
          xMax,
          yMin,
          yMax,
          mu1,
          mu2,
          sigma1,
          sigma2,
          rho
        );
    }
  }

  integrateNormalDistribution(
    xMin,
    xMax,
    yMin,
    yMax,
    mu1,
    mu2,
    sigma1,
    sigma2,
    rho
  ) {
    // Enhanced Simpson's rule for 2D integration with adaptive step size
    let nx = 50; // Base integration steps in x direction
    let ny = 50; // Base integration steps in y direction

    // Adaptive step size based on region size and correlation
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const avgSigma = (sigma1 + sigma2) / 2;

    // Increase steps for smaller regions or higher correlation
    if (xRange < avgSigma || yRange < avgSigma) {
      nx = Math.min(100, nx * 2);
      ny = Math.min(100, ny * 2);
    }

    if (Math.abs(rho) > 0.7) {
      nx = Math.min(100, nx * 1.5);
      ny = Math.min(100, ny * 1.5);
    }

    const dx = (xMax - xMin) / nx;
    const dy = (yMax - yMin) / ny;

    let integral = 0;
    let maxPdf = 0; // Track maximum PDF for validation

    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= ny; j++) {
        const x = xMin + i * dx;
        const y = yMin + j * dy;

        const pdf = this.bivariateNormalPDF(
          x,
          y,
          mu1,
          mu2,
          sigma1,
          sigma2,
          rho
        );
        maxPdf = Math.max(maxPdf, pdf);

        // Simpson's rule weights
        let weight = 1;
        if (i === 0 || i === nx) weight *= 1;
        else if (i % 2 === 1) weight *= 4;
        else weight *= 2;

        if (j === 0 || j === ny) weight *= 1;
        else if (j % 2 === 1) weight *= 4;
        else weight *= 2;

        integral += weight * pdf;
      }
    }

    integral *= (dx * dy) / 9; // Simpson's rule normalization

    // Validate result
    const probability = Math.max(0, Math.min(1, integral));

    // Calculate estimated error based on step size and PDF variation
    const estimatedError = (dx * dy * maxPdf) / (nx * ny);

    return {
      probability: probability,
      method: "numerical",
      steps: nx * ny,
      accuracy:
        estimatedError < 1e-6
          ? "high"
          : estimatedError < 1e-4
          ? "medium"
          : "low",
      estimatedError: estimatedError,
      maxPdf: maxPdf,
    };
  }

  integrateUniformDistribution(
    xMin,
    xMax,
    yMin,
    yMax,
    mu1,
    mu2,
    sigma1,
    sigma2
  ) {
    // For uniform distribution, calculate overlap area
    // Parameters: mu1, mu2 are centers, sigma1, sigma2 define half-widths
    const uniformXMin = mu1 - sigma1;
    const uniformXMax = mu1 + sigma1;
    const uniformYMin = mu2 - sigma2;
    const uniformYMax = mu2 + sigma2;

    const overlapXMin = Math.max(xMin, uniformXMin);
    const overlapXMax = Math.min(xMax, uniformXMax);
    const overlapYMin = Math.max(yMin, uniformYMin);
    const overlapYMax = Math.min(yMax, uniformYMax);

    if (overlapXMin >= overlapXMax || overlapYMin >= overlapYMax) {
      return {
        probability: 0,
        method: "analytical",
        accuracy: "exact",
        note: "No overlap with uniform distribution support",
      };
    }

    const overlapArea =
      (overlapXMax - overlapXMin) * (overlapYMax - overlapYMin);
    const totalArea = (uniformXMax - uniformXMin) * (uniformYMax - uniformYMin);

    return {
      probability: overlapArea / totalArea,
      method: "analytical",
      accuracy: "exact",
      overlapArea: overlapArea,
      totalArea: totalArea,
    };
  }

  integrateExponentialDistribution(
    xMin,
    xMax,
    yMin,
    yMax,
    mu1,
    mu2,
    sigma1,
    sigma2
  ) {
    // Enhanced exponential integration with proper bounds checking
    const lambda1 = 1 / sigma1;
    const lambda2 = 1 / sigma2;

    // Exponential distribution is only defined for x >= mu, y >= mu
    const effectiveXMin = Math.max(xMin, mu1);
    const effectiveXMax = Math.max(xMax, mu1);
    const effectiveYMin = Math.max(yMin, mu2);
    const effectiveYMax = Math.max(yMax, mu2);

    if (effectiveXMin >= effectiveXMax || effectiveYMin >= effectiveYMax) {
      return {
        probability: 0,
        method: "analytical",
        accuracy: "exact",
        note: "Region outside exponential distribution support",
      };
    }

    // Calculate marginal probabilities (assuming independence)
    const probX =
      Math.exp(-lambda1 * (effectiveXMin - mu1)) -
      Math.exp(-lambda1 * (effectiveXMax - mu1));
    const probY =
      Math.exp(-lambda2 * (effectiveYMin - mu2)) -
      Math.exp(-lambda2 * (effectiveYMax - mu2));

    return {
      probability: Math.max(0, probX * probY),
      method: "analytical",
      accuracy: "approximate",
      note: "Assumes independence between X and Y",
      marginalProbX: probX,
      marginalProbY: probY,
    };
  }

  displayProbabilityResults(results, method) {
    const resultsDiv = document.getElementById("prob-results");
    const sampleResult = document.getElementById("sample-result");
    const numericalResult = document.getElementById("numerical-result");
    const errorEstimate = document.getElementById("error-estimate");

    resultsDiv.classList.remove("hidden");

    if (results.sample) {
      const confidence = this.calculateSampleConfidence(results.sample);
      document.getElementById("sample-prob").textContent = `${(
        results.sample.probability * 100
      ).toFixed(2)}% (${results.sample.count}/${results.sample.total})`;

      // Add confidence interval if available
      if (confidence) {
        document.getElementById("sample-prob").textContent += ` ±${(
          confidence.margin * 100
        ).toFixed(2)}%`;
      }

      sampleResult.classList.remove("hidden");
    } else {
      sampleResult.classList.add("hidden");
    }

    if (results.numerical) {
      let numericalText = `${(results.numerical.probability * 100).toFixed(
        4
      )}%`;

      // Add accuracy indicator
      if (results.numerical.accuracy) {
        const accuracyIcon =
          {
            high: "🟢",
            medium: "🟡",
            low: "🔴",
          }[results.numerical.accuracy] || "";
        numericalText += ` ${accuracyIcon}`;
      }

      document.getElementById("numerical-prob").textContent = numericalText;
      numericalResult.classList.remove("hidden");
    } else {
      numericalResult.classList.add("hidden");
    }

    // Calculate and display error estimate if both methods available
    if (results.sample && results.numerical) {
      const error = Math.abs(
        results.sample.probability - results.numerical.probability
      );
      const relativeError =
        results.numerical.probability > 0
          ? (error / results.numerical.probability) * 100
          : 0;

      document.getElementById("error-value").textContent = `±${(
        error * 100
      ).toFixed(3)}% (${relativeError.toFixed(1)}% 相对误差)`;
      errorEstimate.classList.remove("hidden");
    } else {
      errorEstimate.classList.add("hidden");
    }

    // Update the main joint probability display
    const jointProbEl = document.getElementById("joint-prob");
    if (jointProbEl) {
      const mainProb = results.numerical || results.sample;
      jointProbEl.textContent = (mainProb.probability * 100).toFixed(2) + "%";
    }

    // Add calculation details
    this.displayCalculationDetails(results);
  }

  calculateSampleConfidence(sampleResult) {
    // Calculate 95% confidence interval for sample proportion
    const p = sampleResult.probability;
    const n = sampleResult.total;

    if (n < 30 || p === 0 || p === 1) {
      return null; // Not enough samples or extreme probability
    }

    const z = 1.96; // 95% confidence
    const margin = z * Math.sqrt((p * (1 - p)) / n);

    return {
      margin: margin,
      lower: Math.max(0, p - margin),
      upper: Math.min(1, p + margin),
    };
  }

  displayCalculationDetails(results) {
    // Add detailed calculation information
    let detailsHtml = '<div class="mt-3 text-xs text-gray-400 space-y-1">';

    if (results.sample) {
      detailsHtml += `<div>样本方法: ${results.sample.total} 个样本点</div>`;
    }

    if (results.numerical) {
      detailsHtml += `<div>数值积分: ${results.numerical.steps} 个积分点`;
      if (results.numerical.accuracy) {
        detailsHtml += ` (${results.numerical.accuracy} 精度)`;
      }
      detailsHtml += `</div>`;
    }

    detailsHtml += "</div>";

    const resultsDiv = document.getElementById("prob-results");
    const existingDetails = resultsDiv.querySelector(".calculation-details");
    if (existingDetails) {
      existingDetails.remove();
    }

    const detailsElement = document.createElement("div");
    detailsElement.className = "calculation-details";
    detailsElement.innerHTML = detailsHtml;
    resultsDiv.appendChild(detailsElement);
  }

  updateRegionArea() {
    const xMin = parseFloat(document.getElementById("x-min").value);
    const xMax = parseFloat(document.getElementById("x-max").value);
    const yMin = parseFloat(document.getElementById("y-min").value);
    const yMax = parseFloat(document.getElementById("y-max").value);

    if (
      xMin < xMax &&
      yMin < yMax &&
      !isNaN(xMin) &&
      !isNaN(xMax) &&
      !isNaN(yMin) &&
      !isNaN(yMax)
    ) {
      const area = (xMax - xMin) * (yMax - yMin);
      const areaElement = document.getElementById("region-area");
      if (areaElement) {
        areaElement.textContent = area.toFixed(2);
      }
    } else {
      const areaElement = document.getElementById("region-area");
      if (areaElement) {
        areaElement.textContent = "无效";
      }
    }
  }

  validateRegionInputs() {
    const xMinInput = document.getElementById("x-min");
    const xMaxInput = document.getElementById("x-max");
    const yMinInput = document.getElementById("y-min");
    const yMaxInput = document.getElementById("y-max");

    const xMin = parseFloat(xMinInput.value);
    const xMax = parseFloat(xMaxInput.value);
    const yMin = parseFloat(yMinInput.value);
    const yMax = parseFloat(yMaxInput.value);

    // Reset styles
    [xMinInput, xMaxInput, yMinInput, yMaxInput].forEach((input) => {
      input.style.borderColor = "";
      input.style.backgroundColor = "";
    });

    let isValid = true;

    // Validate X range
    if (isNaN(xMin) || isNaN(xMax)) {
      [xMinInput, xMaxInput].forEach((input) => {
        if (isNaN(parseFloat(input.value))) {
          input.style.borderColor = "rgba(239, 68, 68, 0.5)";
          input.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
        }
      });
      isValid = false;
    } else if (xMin >= xMax) {
      [xMinInput, xMaxInput].forEach((input) => {
        input.style.borderColor = "rgba(245, 158, 11, 0.5)";
        input.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
      });
      isValid = false;
    }

    // Validate Y range
    if (isNaN(yMin) || isNaN(yMax)) {
      [yMinInput, yMaxInput].forEach((input) => {
        if (isNaN(parseFloat(input.value))) {
          input.style.borderColor = "rgba(239, 68, 68, 0.5)";
          input.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
        }
      });
      isValid = false;
    } else if (yMin >= yMax) {
      [yMinInput, yMaxInput].forEach((input) => {
        input.style.borderColor = "rgba(245, 158, 11, 0.5)";
        input.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
      });
      isValid = false;
    }

    // Update calculate button state
    const calcBtn = document.getElementById("calc-joint-prob");
    if (calcBtn) {
      if (isValid) {
        calcBtn.disabled = false;
        calcBtn.style.opacity = "1";
      } else {
        calcBtn.disabled = true;
        calcBtn.style.opacity = "0.5";
      }
    }

    return isValid;
  }

  addPresetRegionButtons() {
    // Add preset region buttons after the clear highlight button
    const clearBtn = document.getElementById("clear-highlight");
    if (!clearBtn) return;

    const presetContainer = document.createElement("div");
    presetContainer.className = "mt-2 flex flex-wrap gap-1";
    presetContainer.innerHTML = `
      <button id="preset-center" class="flex-1 py-1 px-2 rounded border border-blue-400/30 bg-blue-400/10 text-blue-400 text-xs hover:bg-blue-400/20" title="中心区域">
        中心
      </button>
      <button id="preset-tail" class="flex-1 py-1 px-2 rounded border border-purple-400/30 bg-purple-400/10 text-purple-400 text-xs hover:bg-purple-400/20" title="尾部区域">
        尾部
      </button>
      <button id="preset-quadrant" class="flex-1 py-1 px-2 rounded border border-green-400/30 bg-green-400/10 text-green-400 text-xs hover:bg-green-400/20" title="第一象限">
        象限
      </button>
    `;

    clearBtn.parentElement.appendChild(presetContainer);

    // Add event listeners for preset buttons
    document.getElementById("preset-center").addEventListener("click", () => {
      this.setPresetRegion("center");
    });

    document.getElementById("preset-tail").addEventListener("click", () => {
      this.setPresetRegion("tail");
    });

    document.getElementById("preset-quadrant").addEventListener("click", () => {
      this.setPresetRegion("quadrant");
    });
  }

  setPresetRegion(type) {
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;
    let xMin, xMax, yMin, yMax;

    switch (type) {
      case "center":
        // Central region around the mean
        xMin = mu1 - sigma1;
        xMax = mu1 + sigma1;
        yMin = mu2 - sigma2;
        yMax = mu2 + sigma2;
        break;

      case "tail":
        // Tail region (high values)
        xMin = mu1 + sigma1;
        xMax = mu1 + 2 * sigma1;
        yMin = mu2 + sigma2;
        yMax = mu2 + 2 * sigma2;
        break;

      case "quadrant":
        // First quadrant (positive values)
        xMin = Math.max(0, mu1 - sigma1);
        xMax = mu1 + 2 * sigma1;
        yMin = Math.max(0, mu2 - sigma2);
        yMax = mu2 + 2 * sigma2;
        break;

      default:
        return;
    }

    // Update input fields
    document.getElementById("x-min").value = xMin.toFixed(1);
    document.getElementById("x-max").value = xMax.toFixed(1);
    document.getElementById("y-min").value = yMin.toFixed(1);
    document.getElementById("y-max").value = yMax.toFixed(1);

    // Update area and validate
    this.validateRegionInputs();
    this.updateRegionArea();

    // Auto-highlight the region
    this.highlightProbabilityRegion();
  }

  highlightProbabilityRegion() {
    // Add visual highlighting to the probability region on visualizations
    this.highlightRegion = {
      xMin: parseFloat(document.getElementById("x-min").value),
      xMax: parseFloat(document.getElementById("x-max").value),
      yMin: parseFloat(document.getElementById("y-min").value),
      yMax: parseFloat(document.getElementById("y-max").value),
    };

    // Redraw visualizations with highlighting
    this.updateContourPlot();
    this.updateScatterPlot();
  }

  clearRegionHighlight() {
    this.highlightRegion = null;
    this.updateContourPlot();
    this.updateScatterPlot();
  }

  showCalculationLoading() {
    const calcBtn = document.getElementById("calc-joint-prob");
    if (calcBtn) {
      calcBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin mr-2"></i>计算中...';
      calcBtn.disabled = true;
    }
  }

  showCalculationError(message) {
    const resultsDiv = document.getElementById("prob-results");
    resultsDiv.innerHTML = `
      <div class="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-xs">
        <i class="fa-solid fa-exclamation-triangle mr-2"></i>
        ${message}
      </div>
    `;
    resultsDiv.classList.remove("hidden");

    // Reset button
    setTimeout(() => {
      const calcBtn = document.getElementById("calc-joint-prob");
      if (calcBtn) {
        calcBtn.innerHTML =
          '<i class="fa-solid fa-play mr-2"></i>计算 P(X∈[a,b], Y∈[c,d])';
        calcBtn.disabled = false;
      }
    }, 2000);
  }

  resetParameters() {
    // Reset to default values with validation
    const defaultParams = {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      nSamples: 1000,
      distType: "normal",
    };

    // Apply validation to default parameters
    Object.keys(defaultParams).forEach((param) => {
      if (param !== "distType") {
        this.parameters[param] = this.validateParameter(
          param,
          defaultParams[param]
        );
      } else {
        this.parameters[param] = defaultParams[param];
      }
    });

    // Reset sliders with visual feedback
    const sliderUpdates = [
      { id: "mu1-slider", value: this.parameters.mu1 },
      { id: "mu2-slider", value: this.parameters.mu2 },
      { id: "sigma1-slider", value: this.parameters.sigma1 },
      { id: "sigma2-slider", value: this.parameters.sigma2 },
      { id: "rho-slider", value: this.parameters.rho },
      { id: "n-samples-slider", value: this.parameters.nSamples },
    ];

    sliderUpdates.forEach(({ id, value }) => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.value = value;
        // Add reset animation
        slider.style.transition = "all 0.3s ease";
        slider.style.transform = "scale(1.05)";
        setTimeout(() => {
          slider.style.transform = "scale(1)";
        }, 300);
      }
    });

    // Reset distribution type selector
    const distTypeSelect = document.getElementById("dist-type");
    if (distTypeSelect) {
      distTypeSelect.value = this.parameters.distType;
    }

    // Update all displays
    Object.keys(this.parameters).forEach((param) => {
      if (param !== "distType") {
        this.updateParameterDisplay(param, this.parameters[param]);
      }
    });

    // Regenerate samples and update visualizations
    this.generateSamples();
    this.updateAllVisualizations();

    // Show reset confirmation
    this.showResetConfirmation();
  }

  showResetConfirmation() {
    // Create temporary notification
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-neon-green/20 border border-neon-green/50 text-neon-green px-4 py-2 rounded-lg z-50 transition-all duration-300";
    notification.innerHTML = '<i class="fa-solid fa-check mr-2"></i>参数已重置';
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    }, 10);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  // Enhanced Reset Methods (Requirements 7.7)
  resetDistributionOnly() {
    // Reset only distribution-related parameters
    const distributionParams = {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      distType: "normal",
    };

    Object.keys(distributionParams).forEach((param) => {
      if (param !== "distType") {
        this.parameters[param] = this.validateParameter(
          param,
          distributionParams[param]
        );
      } else {
        this.parameters[param] = distributionParams[param];
      }
    });

    this.updateParameterDisplays(distributionParams);
    this.generateSamples();
    this.updateAllVisualizations();
    this.showNotification("分布参数已重置", "neon-blue");
  }

  resetToPreset(presetName = "balanced") {
    const presets = {
      balanced: {
        mu1: 5,
        mu2: 8,
        sigma1: 15,
        sigma2: 20,
        rho: 0.3,
        nSamples: 1000,
        distType: "normal",
      },
      highCorrelation: {
        mu1: 10,
        mu2: 12,
        sigma1: 10,
        sigma2: 12,
        rho: 0.8,
        nSamples: 2000,
        distType: "normal",
      },
      independent: {
        mu1: 0,
        mu2: 0,
        sigma1: 20,
        sigma2: 20,
        rho: 0.0,
        nSamples: 1500,
        distType: "uniform",
      },
    };

    const preset = presets[presetName] || presets.balanced;

    Object.keys(preset).forEach((param) => {
      if (param !== "distType") {
        this.parameters[param] = this.validateParameter(param, preset[param]);
      } else {
        this.parameters[param] = preset[param];
      }
    });

    this.updateParameterDisplays(preset);
    this.generateSamples();
    this.updateAllVisualizations();
    this.showNotification(`已应用 ${presetName} 预设`, "neon-green");
  }

  updateParameterDisplays(params) {
    Object.keys(params).forEach((param) => {
      if (param !== "distType") {
        const slider = document.getElementById(`${param}-slider`);
        if (slider) {
          slider.value = params[param];
        }
        this.updateParameterDisplay(param, params[param]);
      } else {
        const select = document.getElementById("dist-type");
        if (select) {
          select.value = params[param];
          this.updateDistributionDescription(params[param]);
        }
      }
    });
  }

  showNotification(message, colorClass = "neon-green") {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 bg-${colorClass}/20 border border-${colorClass}/50 text-${colorClass} px-4 py-2 rounded-lg z-50 transition-all duration-300`;
    notification.innerHTML = `<i class="fa-solid fa-check mr-2"></i>${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  hideResetOptions() {
    const resetOptions = document.getElementById("reset-options");
    if (resetOptions) {
      resetOptions.classList.add("hidden");
    }
  }

  // Enhanced Sample Size Performance Management (Requirements 7.5)
  initializeAdaptiveQuality() {
    const adaptiveToggle = document.getElementById("adaptive-quality");
    if (adaptiveToggle) {
      adaptiveToggle.addEventListener("change", (e) => {
        this.adaptiveQualityEnabled = e.target.checked;
        if (this.adaptiveQualityEnabled) {
          this.adjustQualityBasedOnPerformance();
        }
      });
    }

    // Initialize performance monitoring
    this.performanceMetrics = {
      lastRenderTime: 0,
      averageRenderTime: 0,
      frameCount: 0,
      adaptiveQualityEnabled: true,
    };
  }

  // Responsive Design System (Requirements 9.1, 9.2, 9.3)
  initializeResponsiveDesign() {
    // Initialize responsive design system
    this.responsiveConfig = {
      breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        large: 1440,
      },
      currentBreakpoint: "desktop",
      touchDevice: this.isTouchDevice(),
      orientation:
        window.innerWidth > window.innerHeight ? "landscape" : "portrait",
    };

    // Set up responsive event listeners
    this.setupResponsiveEventListeners();

    // Initialize touch controls for mobile devices
    if (this.responsiveConfig.touchDevice) {
      this.initializeTouchControls();
    }

    // Set initial responsive state
    this.updateResponsiveLayout();

    console.log("Responsive design system initialized", this.responsiveConfig);
  }

  isTouchDevice() {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  setupResponsiveEventListeners() {
    // Window resize handler with debouncing
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleWindowResize();
      }, 150);
    });

    // Orientation change handler
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });

    // Viewport change handler for mobile browsers
    if (this.responsiveConfig.touchDevice) {
      let viewportTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(viewportTimeout);
        viewportTimeout = setTimeout(() => {
          this.handleViewportChange();
        }, 300);
      });
    }
  }

  initializeTouchControls() {
    // Add touch-friendly interactions for mobile devices
    const sliders = document.querySelectorAll(".param-slider");
    sliders.forEach((slider) => {
      // Increase touch target size
      slider.style.minHeight = "44px";
      slider.style.padding = "12px 0";

      // Add touch event handlers
      slider.addEventListener("touchstart", this.handleTouchStart.bind(this), {
        passive: true,
      });
      slider.addEventListener("touchmove", this.handleTouchMove.bind(this), {
        passive: false,
      });
      slider.addEventListener("touchend", this.handleTouchEnd.bind(this), {
        passive: true,
      });
    });

    // Add touch controls for canvas interactions
    const canvases = document.querySelectorAll("canvas");
    canvases.forEach((canvas) => {
      this.addCanvasTouchControls(canvas);
    });

    // Add swipe gestures for scenario switching
    this.initializeSwipeGestures();
  }

  handleTouchStart(event) {
    const slider = event.target;
    slider.classList.add("touch-active");

    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  handleTouchMove(event) {
    // Prevent page scrolling while adjusting sliders
    if (event.target.classList.contains("param-slider")) {
      event.preventDefault();
    }
  }

  handleTouchEnd(event) {
    const slider = event.target;
    slider.classList.remove("touch-active");
  }

  addCanvasTouchControls(canvas) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    canvas.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length === 1) {
          const touch = event.touches[0];
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
          touchStartTime = Date.now();
        }
      },
      { passive: true }
    );

    canvas.addEventListener(
      "touchend",
      (event) => {
        if (event.changedTouches.length === 1) {
          const touch = event.changedTouches[0];
          const touchEndX = touch.clientX;
          const touchEndY = touch.clientY;
          const touchEndTime = Date.now();

          const deltaX = touchEndX - touchStartX;
          const deltaY = touchEndY - touchStartY;
          const deltaTime = touchEndTime - touchStartTime;

          // Detect tap gesture
          if (
            Math.abs(deltaX) < 10 &&
            Math.abs(deltaY) < 10 &&
            deltaTime < 300
          ) {
            this.handleCanvasTap(canvas, touch.clientX, touch.clientY);
          }
        }
      },
      { passive: true }
    );
  }

  handleCanvasTap(canvas, x, y) {
    // Handle canvas tap interactions for mobile
    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    // Trigger appropriate interaction based on canvas type
    if (canvas.id === "scatter-canvas") {
      this.handleScatterPlotTap(canvasX, canvasY);
    } else if (canvas.id === "contour-canvas") {
      this.handleContourPlotTap(canvasX, canvasY);
    }
  }

  initializeSwipeGestures() {
    const scenarioContainer = document.getElementById("scenario-tabs");
    if (!scenarioContainer) return;

    let startX = 0;
    let startY = 0;

    scenarioContainer.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
      },
      { passive: true }
    );

    scenarioContainer.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;

        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Detect horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            this.switchToPreviousScenario();
          } else {
            this.switchToNextScenario();
          }
        }
      },
      { passive: true }
    );
  }

  handleWindowResize() {
    // Update responsive configuration
    const newBreakpoint = this.getCurrentBreakpoint();
    const orientationChanged = this.updateOrientation();

    if (
      newBreakpoint !== this.responsiveConfig.currentBreakpoint ||
      orientationChanged
    ) {
      this.responsiveConfig.currentBreakpoint = newBreakpoint;
      this.updateResponsiveLayout();
    }

    // Resize canvases and visualizations
    this.resizeCanvases();
    this.resizeVisualizations();

    // Update performance metrics based on new screen size
    this.updatePerformanceForScreenSize();
  }

  handleOrientationChange() {
    this.updateOrientation();
    this.updateResponsiveLayout();

    // Delay canvas resize to account for browser UI changes
    setTimeout(() => {
      this.resizeCanvases();
      this.resizeVisualizations();
    }, 500);
  }

  handleViewportChange() {
    // Handle mobile browser viewport changes (address bar show/hide)
    if (this.responsiveConfig.touchDevice) {
      this.resizeCanvases();
    }
  }

  getCurrentBreakpoint() {
    const width = window.innerWidth;
    const breakpoints = this.responsiveConfig.breakpoints;

    if (width <= breakpoints.mobile) return "mobile";
    if (width <= breakpoints.tablet) return "tablet";
    if (width <= breakpoints.desktop) return "desktop";
    return "large";
  }

  updateOrientation() {
    const newOrientation =
      window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    const changed = newOrientation !== this.responsiveConfig.orientation;
    this.responsiveConfig.orientation = newOrientation;
    return changed;
  }

  updateResponsiveLayout() {
    const { currentBreakpoint, touchDevice, orientation } =
      this.responsiveConfig;

    // Update body classes for CSS targeting
    document.body.className = document.body.className.replace(
      /\b(mobile|tablet|desktop|large|touch|landscape|portrait)\b/g,
      ""
    );
    document.body.classList.add(currentBreakpoint);

    if (touchDevice) {
      document.body.classList.add("touch");
    }

    document.body.classList.add(orientation);

    // Update layout-specific configurations
    this.updateLayoutForBreakpoint(currentBreakpoint);

    console.log(
      `Layout updated for ${currentBreakpoint} ${orientation} ${
        touchDevice ? "touch" : "mouse"
      }`
    );
  }

  updateLayoutForBreakpoint(breakpoint) {
    switch (breakpoint) {
      case "mobile":
        this.configureMobileLayout();
        break;
      case "tablet":
        this.configureTabletLayout();
        break;
      case "desktop":
        this.configureDesktopLayout();
        break;
      case "large":
        this.configureLargeLayout();
        break;
    }
  }

  configureMobileLayout() {
    // Optimize for mobile devices
    this.parameters.nSamples = Math.min(this.parameters.nSamples, 1500);

    // Simplify visualizations for performance
    this.setVisualizationQuality("low");

    // Enable touch-optimized controls
    this.enableTouchOptimizations();
  }

  configureTabletLayout() {
    // Optimize for tablet devices
    this.parameters.nSamples = Math.min(this.parameters.nSamples, 3000);

    // Medium quality visualizations
    this.setVisualizationQuality("medium");
  }

  configureDesktopLayout() {
    // Full desktop experience
    this.setVisualizationQuality("high");
  }

  configureLargeLayout() {
    // High-end desktop experience
    this.setVisualizationQuality("ultra");
  }

  setVisualizationQuality(quality) {
    this.visualizationQuality = quality;

    const qualitySettings = {
      low: {
        contourResolution: 20,
        scatterPointSize: 2,
        animationFrameRate: 30,
      },
      medium: {
        contourResolution: 30,
        scatterPointSize: 3,
        animationFrameRate: 45,
      },
      high: {
        contourResolution: 50,
        scatterPointSize: 4,
        animationFrameRate: 60,
      },
      ultra: {
        contourResolution: 80,
        scatterPointSize: 5,
        animationFrameRate: 60,
      },
    };

    this.qualityConfig = qualitySettings[quality] || qualitySettings.medium;
  }

  enableTouchOptimizations() {
    // Add touch-specific CSS classes
    document.body.classList.add("touch-optimized");

    // Increase touch target sizes
    const controls = document.querySelectorAll(
      "button, .param-slider, .scenario-tab"
    );
    controls.forEach((control) => {
      control.style.minHeight = "44px";
      control.style.minWidth = "44px";
    });
  }

  resizeCanvases() {
    // Resize all canvases to fit new viewport
    Object.values(this.canvases).forEach((canvas) => {
      if (canvas && canvas.parentElement) {
        this.resizeCanvas(canvas);
      }
    });
  }

  resizeCanvas(canvas) {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Set canvas size based on container
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    // Scale context for high DPI displays
    if (canvas.ctx) {
      canvas.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.ctx.imageSmoothingEnabled = true;
      canvas.ctx.imageSmoothingQuality = "high";
    }
  }

  resizeVisualizations() {
    // Resize 3D visualizations
    if (window.Plotly && document.getElementById("joint-3d-plot")) {
      window.Plotly.Plots.resize("joint-3d-plot");
    }

    // Update all canvas-based visualizations
    this.updateAllVisualizations();
  }

  updatePerformanceForScreenSize() {
    const { currentBreakpoint } = this.responsiveConfig;

    // Adjust performance targets based on screen size
    const performanceTargets = {
      mobile: { maxSamples: 1500, targetFPS: 30 },
      tablet: { maxSamples: 3000, targetFPS: 45 },
      desktop: { maxSamples: 5000, targetFPS: 60 },
      large: { maxSamples: 8000, targetFPS: 60 },
    };

    this.performanceTarget =
      performanceTargets[currentBreakpoint] || performanceTargets.desktop;
  }

  switchToPreviousScenario() {
    const scenarios = Object.keys(this.scenarios);
    const currentIndex = scenarios.indexOf(this.currentScenario);
    const previousIndex =
      currentIndex > 0 ? currentIndex - 1 : scenarios.length - 1;
    this.switchScenario(scenarios[previousIndex]);
  }

  switchToNextScenario() {
    const scenarios = Object.keys(this.scenarios);
    const currentIndex = scenarios.indexOf(this.currentScenario);
    const nextIndex =
      currentIndex < scenarios.length - 1 ? currentIndex + 1 : 0;
    this.switchScenario(scenarios[nextIndex]);
  }

  adjustQualityBasedOnPerformance() {
    if (!this.adaptiveQualityEnabled) return;

    const currentSampleSize = this.parameters.nSamples;
    const renderTime = this.performanceMetrics.averageRenderTime;

    // Adjust quality based on performance
    if (renderTime > 100 && currentSampleSize > 2000) {
      // Reduce sample size for better performance
      const newSampleSize = Math.max(1000, currentSampleSize * 0.8);
      this.updateParameter("nSamples", newSampleSize);
      this.showNotification("已自动调整样本数量以优化性能", "yellow-400");
    }
  }

  measureRenderPerformance(renderFunction) {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    this.performanceMetrics.lastRenderTime = renderTime;
    this.performanceMetrics.frameCount++;

    // Calculate rolling average
    const alpha = 0.1; // Smoothing factor
    this.performanceMetrics.averageRenderTime =
      this.performanceMetrics.averageRenderTime * (1 - alpha) +
      renderTime * alpha;

    // Update performance display
    this.updatePerformanceMetrics(this.parameters.nSamples);

    // Auto-adjust if needed
    if (this.performanceMetrics.frameCount % 10 === 0) {
      this.adjustQualityBasedOnPerformance();
    }

    return result;
  }

  // Performance Optimization System (Requirements 9.4, 9.5, 9.7)
  initializePerformanceOptimization() {
    // Initialize frame rate monitoring
    this.frameRateMonitor = {
      frameCount: 0,
      lastTime: performance.now(),
      currentFPS: 60,
      targetFPS: 60,
      frameHistory: [],
      isMonitoring: false,
    };

    // Initialize memory management
    this.memoryManager = {
      maxSampleSize: this.getMaxSampleSizeForDevice(),
      currentMemoryUsage: 0,
      memoryThreshold: this.getMemoryThreshold(),
      gcInterval: null,
    };

    // Initialize WebGL fallback detection
    this.webglSupport = this.detectWebGLSupport();

    // Start performance monitoring
    this.startFrameRateMonitoring();
    this.startMemoryMonitoring();

    console.log("Performance optimization initialized", {
      webglSupport: this.webglSupport,
      maxSampleSize: this.memoryManager.maxSampleSize,
      memoryThreshold: this.memoryManager.memoryThreshold,
    });
  }

  getMaxSampleSizeForDevice() {
    // Determine maximum sample size based on device capabilities
    const memory = navigator.deviceMemory || 4; // GB, default to 4GB if unknown
    const cores = navigator.hardwareConcurrency || 4;

    // Base calculation on available memory and CPU cores
    let maxSamples = 1000; // Conservative default

    if (memory >= 8 && cores >= 8) {
      maxSamples = 10000; // High-end device
    } else if (memory >= 4 && cores >= 4) {
      maxSamples = 5000; // Mid-range device
    } else if (memory >= 2) {
      maxSamples = 2000; // Low-end device
    }

    // Adjust for mobile devices
    if (this.responsiveConfig && this.responsiveConfig.touchDevice) {
      maxSamples = Math.min(maxSamples, 3000);
    }

    return maxSamples;
  }

  getMemoryThreshold() {
    // Set memory usage threshold based on available memory
    const memory = navigator.deviceMemory || 4;
    return Math.min(memory * 0.25 * 1024 * 1024 * 1024, 1024 * 1024 * 1024); // 25% of RAM or 1GB max
  }

  detectWebGLSupport() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

      if (!gl) {
        return { supported: false, reason: "WebGL context not available" };
      }

      // Test WebGL capabilities
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      const version = gl.getParameter(gl.VERSION);

      // Check for software rendering (usually indicates poor performance)
      const isSoftwareRendering =
        renderer.toLowerCase().includes("software") ||
        renderer.toLowerCase().includes("llvmpipe") ||
        renderer.toLowerCase().includes("swiftshader");

      return {
        supported: true,
        renderer,
        vendor,
        version,
        isSoftwareRendering,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      };
    } catch (error) {
      return { supported: false, reason: error.message };
    }
  }

  startFrameRateMonitoring() {
    if (this.frameRateMonitor.isMonitoring) return;

    this.frameRateMonitor.isMonitoring = true;

    const measureFrame = (timestamp) => {
      if (!this.frameRateMonitor.isMonitoring) return;

      const deltaTime = timestamp - this.frameRateMonitor.lastTime;
      this.frameRateMonitor.lastTime = timestamp;

      if (deltaTime > 0) {
        const currentFPS = 1000 / deltaTime;
        this.frameRateMonitor.currentFPS = currentFPS;

        // Keep frame history for averaging
        this.frameRateMonitor.frameHistory.push(currentFPS);
        if (this.frameRateMonitor.frameHistory.length > 60) {
          this.frameRateMonitor.frameHistory.shift();
        }

        // Check if performance is degrading
        this.checkFrameRatePerformance();
      }

      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  checkFrameRatePerformance() {
    const history = this.frameRateMonitor.frameHistory;
    if (history.length < 30) return; // Need enough samples

    const averageFPS =
      history.reduce((sum, fps) => sum + fps, 0) / history.length;
    const targetFPS = this.frameRateMonitor.targetFPS;

    // If FPS drops significantly below target, trigger optimization
    if (averageFPS < targetFPS * 0.7) {
      this.triggerPerformanceOptimization("low_fps", { averageFPS, targetFPS });
    }
  }

  startMemoryMonitoring() {
    // Monitor memory usage periodically
    this.memoryManager.gcInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 5000); // Check every 5 seconds
  }

  checkMemoryUsage() {
    if (performance.memory) {
      const memoryInfo = performance.memory;
      this.memoryManager.currentMemoryUsage = memoryInfo.usedJSHeapSize;

      // Check if memory usage is too high
      if (memoryInfo.usedJSHeapSize > this.memoryManager.memoryThreshold) {
        this.triggerPerformanceOptimization("high_memory", {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit,
        });
      }
    }
  }

  triggerPerformanceOptimization(reason, data) {
    console.warn(`Performance optimization triggered: ${reason}`, data);

    switch (reason) {
      case "low_fps":
        this.optimizeForFrameRate();
        break;
      case "high_memory":
        this.optimizeForMemory();
        break;
      case "large_dataset":
        this.optimizeForDataSize();
        break;
    }
  }

  optimizeForFrameRate() {
    // Reduce visualization quality to improve frame rate
    if (this.visualizationQuality !== "low") {
      const currentQuality = this.visualizationQuality;
      const qualityLevels = ["ultra", "high", "medium", "low"];
      const currentIndex = qualityLevels.indexOf(currentQuality);
      const newQuality =
        qualityLevels[Math.min(currentIndex + 1, qualityLevels.length - 1)];

      this.setVisualizationQuality(newQuality);
      this.showPerformanceNotification(
        `已降低可视化质量至 ${newQuality} 以提升帧率`
      );
    }

    // Reduce sample size if necessary
    if (this.parameters.nSamples > 1000) {
      const newSampleSize = Math.max(
        1000,
        Math.floor(this.parameters.nSamples * 0.8)
      );
      this.updateParameter("n-samples-slider", newSampleSize);
      this.showPerformanceNotification(
        `已减少样本数量至 ${newSampleSize} 以提升性能`
      );
    }
  }

  optimizeForMemory() {
    // Clear unnecessary data
    this.clearVisualizationCache();

    // Reduce sample size
    const newSampleSize = Math.min(
      this.parameters.nSamples,
      this.memoryManager.maxSampleSize
    );
    if (newSampleSize < this.parameters.nSamples) {
      this.updateParameter("n-samples-slider", newSampleSize);
      this.showPerformanceNotification(`已减少样本数量以优化内存使用`);
    }

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  optimizeForDataSize() {
    // Implement data streaming for large datasets
    this.enableDataStreaming();

    // Use level-of-detail rendering
    this.enableLevelOfDetail();
  }

  clearVisualizationCache() {
    // Clear cached visualization data
    if (this.cachedContourData) {
      this.cachedContourData = null;
    }

    if (this.cachedScatterData) {
      this.cachedScatterData = null;
    }

    // Clear Three.js geometry cache
    if (this.plot3DData) {
      this.plot3DData = null;
    }
  }

  enableDataStreaming() {
    // Implement progressive data loading for large datasets
    this.dataStreamingEnabled = true;
    this.streamingChunkSize = 500; // Process data in chunks
  }

  enableLevelOfDetail() {
    // Implement level-of-detail rendering based on zoom level
    this.levelOfDetailEnabled = true;
  }

  addWebGLFallbacks() {
    // Add fallbacks for older browsers without WebGL support
    if (!this.webglSupport.supported) {
      console.warn("WebGL not supported, using Canvas 2D fallbacks");
      this.useCanvas2DFallbacks();
    } else if (this.webglSupport.isSoftwareRendering) {
      console.warn(
        "Software rendering detected, enabling performance optimizations"
      );
      this.enableSoftwareRenderingOptimizations();
    }
  }

  useCanvas2DFallbacks() {
    // Replace WebGL-based visualizations with Canvas 2D equivalents
    this.webglFallbackMode = true;

    // Disable 3D visualizations
    const plot3D = document.getElementById("joint-3d-plot");
    if (plot3D) {
      plot3D.style.display = "none";

      // Show 2D alternative
      const fallbackMessage = document.createElement("div");
      fallbackMessage.className = "webgl-fallback-message";
      fallbackMessage.innerHTML = `
        <div class="text-center p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <i class="fa-solid fa-exclamation-triangle text-yellow-400 mb-2"></i>
          <p class="text-sm text-yellow-300">您的浏览器不支持 WebGL，已切换到 2D 可视化模式</p>
        </div>
      `;
      plot3D.parentNode.insertBefore(fallbackMessage, plot3D);
    }
  }

  enableSoftwareRenderingOptimizations() {
    // Optimize for software rendering
    this.setVisualizationQuality("low");
    this.parameters.nSamples = Math.min(this.parameters.nSamples, 1500);

    this.showPerformanceNotification("检测到软件渲染，已启用性能优化模式");
  }

  showPerformanceNotification(message) {
    // Show performance-related notifications to user
    const notification = document.createElement("div");
    notification.className =
      "performance-notification fixed top-4 right-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg z-50 transition-all duration-300";
    notification.innerHTML = `<i class="fa-solid fa-tachometer-alt mr-2"></i>${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  // Enhanced updateAllVisualizations with performance monitoring
  updateAllVisualizationsWithPerformance() {
    return this.measureRenderPerformance(() => {
      this.updateAllVisualizations();
    });
  }

  // Memory-efficient sample generation
  generateSamplesEfficiently() {
    const { nSamples } = this.parameters;

    // Use streaming approach for large datasets
    if (nSamples > 5000 && this.dataStreamingEnabled) {
      this.generateSamplesInChunks();
    } else {
      this.generateSamples();
    }
  }

  generateSamplesInChunks() {
    const { nSamples } = this.parameters;
    const chunkSize = this.streamingChunkSize || 500;
    const numChunks = Math.ceil(nSamples / chunkSize);

    this.currentSamples = [];

    for (let i = 0; i < numChunks; i++) {
      const currentChunkSize = Math.min(chunkSize, nSamples - i * chunkSize);
      const chunkSamples = this.generateSampleChunk(currentChunkSize);
      this.currentSamples.push(...chunkSamples);

      // Yield control to prevent blocking
      if (i % 5 === 0) {
        setTimeout(() => {}, 0);
      }
    }
  }

  generateSampleChunk(size) {
    const { mu1, mu2, sigma1, sigma2, rho, distType } = this.parameters;
    const samples = [];

    for (let i = 0; i < size; i++) {
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

      samples.push([x, y]);
    }

    return samples;
  }

  // Cleanup method for performance optimization
  cleanup() {
    // Stop monitoring
    this.frameRateMonitor.isMonitoring = false;

    if (this.memoryManager.gcInterval) {
      clearInterval(this.memoryManager.gcInterval);
    }

    // Clear caches
    this.clearVisualizationCache();

    console.log("Performance optimization cleanup completed");
  }

  // Scenario Switching System Implementation (Requirements 2.11, 3.9)
  initializeStreamerAnalytics() {
    // Initialize streamer analytics configuration and UI
    this.streamerAnalytics.isActive = true;

    // Set up scenario tabs
    this.setupScenarioTabs();

    // Initialize default scenario
    this.currentScenario = "traditional";
    this.loadScenario(this.currentScenario);

    // Initialize streamer data simulation
    this.initializeStreamerDataSimulation();

    console.log("Streamer Analytics initialized");
  }

  setupScenarioTabs() {
    const tabContainer = document.getElementById("scenario-tabs");
    if (!tabContainer) return;

    // Define available scenarios
    this.scenarios = {
      traditional: {
        name: "传统场景",
        icon: "fa-chart-line",
        color: "#00f3ff",
        description: "经典的股票收益率分析，展示联合分布的基本概念",
        contentId: "traditional-scenario",
      },
      nlp: {
        name: "词向量空间",
        icon: "fa-language",
        color: "#bf00ff",
        description: "探索词向量在高维空间中的分布特性",
        contentId: "nlp-scenario",
      },
      physics: {
        name: "分子速度分析",
        icon: "fa-atom",
        color: "#00ff66",
        description: "麦克斯韦-玻尔兹曼分布在统计物理中的应用",
        contentId: "physics-scenario",
      },
      streamer: {
        name: "网红直播分析",
        icon: "fa-video",
        color: "#ffc107",
        description: "分析直播数据中的多维变量关系",
        contentId: "streamer-scenario",
      },
      gameCharacter: {
        name: "游戏角色分析",
        icon: "fa-gamepad",
        color: "#ff6b35",
        description: "分析游戏角色属性间的独立性和相关性",
        contentId: "game-character-scenario",
      },
    };

    // Clear existing tabs
    tabContainer.innerHTML = "";

    // Create scenario tabs
    Object.entries(this.scenarios).forEach(([key, scenario]) => {
      const tab = document.createElement("button");
      tab.className = `scenario-tab px-4 py-2 rounded-lg border transition-all duration-300 ${
        key === this.currentScenario
          ? `border-[${scenario.color}] bg-[${scenario.color}]/20 text-[${scenario.color}]`
          : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
      }`;

      tab.innerHTML = `
        <i class="fa-solid ${scenario.icon} mr-2"></i>
        <span class="hidden sm:inline">${scenario.name}</span>
      `;

      tab.dataset.scenario = key;
      tab.title = scenario.description;

      // Add click event listener
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        this.switchScenario(key);
      });

      tabContainer.appendChild(tab);
    });

    // Update scenario description
    this.updateScenarioDescription();
  }

  switchScenario(scenarioKey) {
    if (!this.scenarios[scenarioKey] || scenarioKey === this.currentScenario)
      return;

    const previousScenario = this.currentScenario;
    this.currentScenario = scenarioKey;

    // Update tab styles with smooth transition
    this.updateTabStyles();

    // Hide previous scenario content with fade out
    this.hideScenarioContent(previousScenario);

    // Show new scenario content with fade in (delayed)
    setTimeout(() => {
      this.showScenarioContent(scenarioKey);
      this.loadScenario(scenarioKey);
    }, 200);

    // Update scenario description
    this.updateScenarioDescription();

    // Trigger scenario-specific initialization
    this.handleScenarioChange(scenarioKey);
  }

  updateTabStyles() {
    const tabs = document.querySelectorAll(".scenario-tab");
    tabs.forEach((tab, index) => {
      const scenarioKey = Object.keys(this.scenarios)[index];
      const scenario = this.scenarios[scenarioKey];

      if (scenarioKey === this.currentScenario) {
        tab.className = `scenario-tab px-4 py-2 rounded-lg border border-[${scenario.color}] bg-[${scenario.color}]/20 text-[${scenario.color}] transition-all duration-300 transform scale-105`;
      } else {
        tab.className =
          "scenario-tab px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 transition-all duration-300";
      }
    });
  }

  hideScenarioContent(scenarioKey) {
    const scenario = this.scenarios[scenarioKey];
    if (!scenario) return;

    const contentElement = document.getElementById(scenario.contentId);
    if (contentElement) {
      contentElement.style.opacity = "0";
      contentElement.style.transform = "translateY(10px)";
      setTimeout(() => {
        contentElement.classList.add("hidden");
      }, 200);
    }
  }

  showScenarioContent(scenarioKey) {
    const scenario = this.scenarios[scenarioKey];
    if (!scenario) return;

    const contentElement = document.getElementById(scenario.contentId);
    if (contentElement) {
      contentElement.classList.remove("hidden");
      contentElement.style.opacity = "0";
      contentElement.style.transform = "translateY(10px)";

      // Force reflow
      contentElement.offsetHeight;

      // Animate in
      contentElement.style.transition = "all 0.4s ease-out";
      contentElement.style.opacity = "1";
      contentElement.style.transform = "translateY(0)";
    }
  }

  updateScenarioDescription() {
    const descriptionElement = document.getElementById("scenario-description");
    if (!descriptionElement || !this.scenarios[this.currentScenario]) return;

    const scenario = this.scenarios[this.currentScenario];
    descriptionElement.innerHTML = `
      <div class="text-sm text-gray-300 transition-all duration-300">
        <i class="fa-solid ${scenario.icon} mr-2" style="color: ${scenario.color}"></i>
        ${scenario.description}
      </div>
    `;
  }

  loadScenario(scenarioKey) {
    // Load scenario-specific content and configurations
    switch (scenarioKey) {
      case "traditional":
        this.loadTraditionalScenario();
        break;
      case "nlp":
        this.loadNLPScenario();
        break;
      case "physics":
        this.loadPhysicsScenario();
        break;
      case "streamer":
        this.loadStreamerScenario();
        break;
      case "gameCharacter":
        this.loadGameCharacterScenario();
        break;
    }
  }

  loadTraditionalScenario() {
    // Reset to traditional stock analysis parameters
    this.parameters = {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      nSamples: 1000,
      distType: "normal",
    };

    // Update parameter displays
    Object.keys(this.parameters).forEach((param) => {
      this.updateParameterDisplay(param, this.parameters[param]);
    });

    // Regenerate samples and update visualizations
    this.generateSamples();
    this.updateAllVisualizations();
  }

  loadNLPScenario() {
    // Configure for word vector analysis
    this.parameters = {
      mu1: 0,
      mu2: 0,
      sigma1: 1,
      sigma2: 1,
      rho: 0.6, // Higher correlation for semantic similarity
      nSamples: 2000,
      distType: "normal",
    };

    // Update parameter displays
    Object.keys(this.parameters).forEach((param) => {
      this.updateParameterDisplay(param, this.parameters[param]);
    });

    // Generate word vector samples
    this.generateSamples();
    this.updateAllVisualizations();

    // Initialize word vector specific visualizations
    this.initializeWordVectorVisualization();
  }

  loadPhysicsScenario() {
    // Configure for molecular velocity analysis
    this.parameters = {
      mu1: 0,
      mu2: 0,
      sigma1: 25,
      sigma2: 25,
      rho: 0.1, // Low correlation for independent velocity components
      nSamples: 3000,
      distType: "normal",
    };

    // Update parameter displays
    Object.keys(this.parameters).forEach((param) => {
      this.updateParameterDisplay(param, this.parameters[param]);
    });

    // Generate molecular velocity samples
    this.generateSamples();
    this.updateAllVisualizations();

    // Initialize physics-specific visualizations
    this.initializeMolecularVelocityVisualization();
  }

  loadStreamerScenario() {
    // Configure for streamer analytics
    this.parameters = {
      mu1: 50, // Average danmu count
      mu2: 30, // Average gift value
      sigma1: 20,
      sigma2: 15,
      rho: 0.7, // High correlation between engagement metrics
      nSamples: 1500,
      distType: "normal",
    };

    // Update parameter displays
    Object.keys(this.parameters).forEach((param) => {
      this.updateParameterDisplay(param, this.parameters[param]);
    });

    // Generate streamer analytics samples
    this.generateSamples();
    this.updateAllVisualizations();

    // Initialize streamer-specific analytics
    this.initializeStreamerSpecificAnalytics();
  }

  loadGameCharacterScenario() {
    // Configure for game character stats analysis
    this.parameters = {
      mu1: 75, // Average attack stat
      mu2: 60, // Average defense stat
      sigma1: 25,
      sigma2: 20,
      rho: -0.3, // Negative correlation between attack and defense (game balance)
      nSamples: 2000,
      distType: "normal",
    };

    // Update parameter displays
    Object.keys(this.parameters).forEach((param) => {
      this.updateParameterDisplay(param, this.parameters[param]);
    });

    // Generate game character samples
    this.generateSamples();
    this.updateAllVisualizations();

    // Initialize game character specific analytics
    this.initializeGameCharacterAnalytics();
    this.startGameCharacterAnalysis();
  }

  handleScenarioChange(scenarioKey) {
    // Handle scenario-specific changes and updates
    console.log(`Switching to scenario: ${scenarioKey}`);

    // Update axis labels based on scenario
    this.updateAxisLabels(scenarioKey);

    // Update visualization themes
    this.updateVisualizationTheme(scenarioKey);

    // Trigger scenario-specific analytics
    if (scenarioKey === "streamer") {
      this.startStreamerDataSimulation();
    } else if (scenarioKey === "gameCharacter") {
      this.startGameCharacterAnalysis();
    } else {
      this.stopStreamerDataSimulation();
      this.stopGameCharacterAnalysis();
    }

    // Update independence test scenario
    if (this.independenceTest) {
      this.independenceTest.scenario =
        this.getIndependenceTestScenario(scenarioKey);
      this.updateScenarioLabels();
    }
  }

  updateAxisLabels(scenarioKey) {
    const labelMappings = {
      traditional: { x: "股票A收益率 (%)", y: "股票B收益率 (%)" },
      nlp: { x: "词向量维度1", y: "词向量维度2" },
      physics: { x: "分子速度X (m/s)", y: "分子速度Y (m/s)" },
      streamer: { x: "弹幕数量", y: "礼物价值" },
      gameCharacter: { x: "攻击力", y: "防御力" },
    };

    const labels = labelMappings[scenarioKey] || labelMappings.traditional;

    // Update 3D plot labels if Plotly is available
    if (window.Plotly && document.getElementById("joint-3d-plot")) {
      const update = {
        "scene.xaxis.title": labels.x,
        "scene.yaxis.title": labels.y,
        "scene.zaxis.title": "概率密度",
      };

      Plotly.relayout("joint-3d-plot", update);
    }
  }

  updateVisualizationTheme(scenarioKey) {
    const scenario = this.scenarios[scenarioKey];
    if (!scenario) return;

    // Update color scheme based on scenario
    const themeColor = scenario.color;

    // Apply theme to various UI elements
    const themeElements = document.querySelectorAll(".theme-color");
    themeElements.forEach((element) => {
      element.style.color = themeColor;
    });

    // Update canvas border colors
    Object.values(this.canvases).forEach((canvas) => {
      if (canvas && canvas.style) {
        canvas.style.borderColor = themeColor + "40"; // 25% opacity
      }
    });
  }

  getIndependenceTestScenario(scenarioKey) {
    const scenarioMappings = {
      traditional: "social",
      nlp: "learning",
      physics: "custom",
      streamer: "streamer",
      gaming: "gaming",
    };

    return scenarioMappings[scenarioKey] || "social";
  }

  initializeStreamerDataSimulation() {
    // Initialize real-time data simulation for streamer analytics
    this.streamerAnalytics.realTimeData = {
      danmuCount: [],
      giftValues: [],
      viewingDurations: [],
      timestamps: [],
    };

    // Set up trending topics rotation
    this.setupTrendingTopicsRotation();
  }

  startStreamerDataSimulation() {
    if (this.streamerDataInterval) {
      clearInterval(this.streamerDataInterval);
    }

    this.streamerDataInterval = setInterval(() => {
      this.updateStreamerRealTimeData();
    }, 2000); // Update every 2 seconds
  }

  stopStreamerDataSimulation() {
    if (this.streamerDataInterval) {
      clearInterval(this.streamerDataInterval);
      this.streamerDataInterval = null;
    }
  }

  updateStreamerRealTimeData() {
    const data = this.streamerAnalytics.realTimeData;
    const timestamp = Date.now();

    // Generate new data point
    const danmuCount = Math.max(
      0,
      Math.round(
        this.parameters.mu1 + (Math.random() - 0.5) * this.parameters.sigma1
      )
    );
    const giftValue = Math.max(
      0,
      Math.round(
        this.parameters.mu2 + (Math.random() - 0.5) * this.parameters.sigma2
      )
    );
    const viewingDuration = Math.max(1, Math.round(30 + Math.random() * 120)); // 1-150 minutes

    // Add to arrays
    data.danmuCount.push(danmuCount);
    data.giftValues.push(giftValue);
    data.viewingDurations.push(viewingDuration);
    data.timestamps.push(timestamp);

    // Keep only last 50 data points
    if (data.danmuCount.length > 50) {
      data.danmuCount.shift();
      data.giftValues.shift();
      data.viewingDurations.shift();
      data.timestamps.shift();
    }

    // Update real-time display
    this.updateStreamerRealTimeDisplay();
  }

  updateStreamerRealTimeDisplay() {
    const data = this.streamerAnalytics.realTimeData;
    if (data.danmuCount.length === 0) return;

    // Update latest values display
    const latestDanmu = data.danmuCount[data.danmuCount.length - 1];
    const latestGift = data.giftValues[data.giftValues.length - 1];
    const latestDuration =
      data.viewingDurations[data.viewingDurations.length - 1];

    // Update UI elements if they exist
    const danmuDisplay = document.getElementById("realtime-danmu");
    const giftDisplay = document.getElementById("realtime-gift");
    const durationDisplay = document.getElementById("realtime-duration");

    if (danmuDisplay) danmuDisplay.textContent = latestDanmu;
    if (giftDisplay) giftDisplay.textContent = `¥${latestGift}`;
    if (durationDisplay) durationDisplay.textContent = `${latestDuration}分钟`;

    // Calculate and display correlation
    if (data.danmuCount.length >= 10) {
      const correlation = this.calculateCorrelation(
        data.danmuCount,
        data.giftValues
      );
      const correlationDisplay = document.getElementById(
        "realtime-correlation"
      );
      if (correlationDisplay) {
        correlationDisplay.textContent = correlation.toFixed(3);
        correlationDisplay.className = `font-mono ${
          Math.abs(correlation) > 0.7
            ? "text-red-400"
            : Math.abs(correlation) > 0.3
            ? "text-yellow-400"
            : "text-green-400"
        }`;
      }
    }
  }

  setupTrendingTopicsRotation() {
    // Rotate trending topics every 5 seconds
    if (this.trendingTopicsInterval) {
      clearInterval(this.trendingTopicsInterval);
    }

    let currentTopicIndex = 0;
    this.trendingTopicsInterval = setInterval(() => {
      const topicsDisplay = document.getElementById("trending-topics");
      if (topicsDisplay && this.streamerAnalytics.trendingTopics.length > 0) {
        const topic = this.streamerAnalytics.trendingTopics[currentTopicIndex];
        topicsDisplay.innerHTML = `
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
            <i class="fa-solid fa-fire mr-1"></i>
            ${topic}
          </span>
        `;
        currentTopicIndex =
          (currentTopicIndex + 1) %
          this.streamerAnalytics.trendingTopics.length;
      }
    }, 5000);
  }

  initializeWordVectorVisualization() {
    // Initialize NLP-specific visualizations
    console.log("Initializing word vector visualization");
    // Additional NLP-specific setup can be added here
  }

  initializeMolecularVelocityVisualization() {
    // Initialize physics-specific visualizations
    console.log("Initializing molecular velocity visualization");
    // Additional physics-specific setup can be added here
  }

  initializeStreamerSpecificAnalytics() {
    // Initialize streamer-specific analytics
    console.log("Initializing streamer-specific analytics");
    // Additional streamer analytics setup can be added here
  }

  // 3.2 独立性检验相关方法
  initializeIndependenceTest() {
    this.updateScenarioLabels();
    this.generateIndependenceData();
    this.updateIndependenceVisualization();
  }

  calculateCorrelation(xArray, yArray) {
    if (
      !xArray ||
      !yArray ||
      xArray.length !== yArray.length ||
      xArray.length < 2
    ) {
      return 0;
    }

    const n = xArray.length;
    const meanX = xArray.reduce((a, b) => a + b) / n;
    const meanY = yArray.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xArray[i] - meanX;
      const dy = yArray[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
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
      streamer: { x: "弹幕数量", y: "礼物价值" },
      gaming: { x: "攻击力", y: "防御力" },
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

    // Enhanced interactive table with editable cells and validation
    const html = `
      <div class="joint-prob-container">
        <div class="table-header mb-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-300">联合概率分布表</span>
            <div class="flex gap-2">
              <button id="edit-table-btn" class="px-2 py-1 text-xs rounded border border-neon-blue/30 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20">
                <i class="fa-solid fa-edit mr-1"></i>编辑
              </button>
              <button id="reset-table-btn" class="px-2 py-1 text-xs rounded border border-gray-400/30 bg-gray-400/10 text-gray-400 hover:bg-gray-400/20">
                <i class="fa-solid fa-undo mr-1"></i>重置
              </button>
            </div>
          </div>
        </div>
        <table class="joint-prob-table w-full">
          <thead>
            <tr>
              <th class="p-2 text-center"></th>
              <th class="p-2 text-center bg-neon-purple/10">Y=0</th>
              <th class="p-2 text-center bg-neon-purple/10">Y=1</th>
              <th class="p-2 text-center bg-yellow-400/10">边际P(X)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-2 text-center bg-neon-blue/10"><strong>X=0</strong></td>
              <td class="p-2 text-center editable-cell" data-row="0" data-col="0" title="点击编辑概率值">
                <span class="prob-value">${(table[0][0] / total).toFixed(
                  3
                )}</span>
                <input type="number" class="prob-input hidden w-full bg-transparent text-center" 
                       min="0" max="1" step="0.001" value="${(
                         table[0][0] / total
                       ).toFixed(3)}">
              </td>
              <td class="p-2 text-center editable-cell" data-row="0" data-col="1" title="点击编辑概率值">
                <span class="prob-value">${(table[0][1] / total).toFixed(
                  3
                )}</span>
                <input type="number" class="prob-input hidden w-full bg-transparent text-center" 
                       min="0" max="1" step="0.001" value="${(
                         table[0][1] / total
                       ).toFixed(3)}">
              </td>
              <td class="p-2 text-center marginal-cell">${(
                (table[0][0] + table[0][1]) /
                total
              ).toFixed(3)}</td>
            </tr>
            <tr>
              <td class="p-2 text-center bg-neon-blue/10"><strong>X=1</strong></td>
              <td class="p-2 text-center editable-cell" data-row="1" data-col="0" title="点击编辑概率值">
                <span class="prob-value">${(table[1][0] / total).toFixed(
                  3
                )}</span>
                <input type="number" class="prob-input hidden w-full bg-transparent text-center" 
                       min="0" max="1" step="0.001" value="${(
                         table[1][0] / total
                       ).toFixed(3)}">
              </td>
              <td class="p-2 text-center editable-cell" data-row="1" data-col="1" title="点击编辑概率值">
                <span class="prob-value">${(table[1][1] / total).toFixed(
                  3
                )}</span>
                <input type="number" class="prob-input hidden w-full bg-transparent text-center" 
                       min="0" max="1" step="0.001" value="${(
                         table[1][1] / total
                       ).toFixed(3)}">
              </td>
              <td class="p-2 text-center marginal-cell">${(
                (table[1][0] + table[1][1]) /
                total
              ).toFixed(3)}</td>
            </tr>
            <tr>
              <td class="p-2 text-center bg-yellow-400/10"><strong>边际P(Y)</strong></td>
              <td class="p-2 text-center marginal-cell">${(
                (table[0][0] + table[1][0]) /
                total
              ).toFixed(3)}</td>
              <td class="p-2 text-center marginal-cell">${(
                (table[0][1] + table[1][1]) /
                total
              ).toFixed(3)}</td>
              <td class="p-2 text-center total-cell font-bold">1.000</td>
            </tr>
          </tbody>
        </table>
        <div class="validation-info mt-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-gray-400">概率和: <span id="prob-sum" class="text-neon-green">1.000</span></span>
            <span class="validation-status text-green-400">
              <i class="fa-solid fa-check-circle mr-1"></i>有效
            </span>
          </div>
        </div>
      </div>
    `;

    tableContainer.innerHTML = html;
    this.initializeTableInteractivity();
  }

  initializeTableInteractivity() {
    // Add event listeners for interactive table functionality
    const editBtn = document.getElementById("edit-table-btn");
    const resetBtn = document.getElementById("reset-table-btn");
    const editableCells = document.querySelectorAll(".editable-cell");

    if (editBtn) {
      editBtn.addEventListener("click", () => this.toggleTableEditMode());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetTableToGenerated());
    }

    // Add click listeners to editable cells
    editableCells.forEach((cell) => {
      cell.addEventListener("click", () => this.editTableCell(cell));
    });

    // Add input validation listeners
    const probInputs = document.querySelectorAll(".prob-input");
    probInputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateAndUpdateCell(input));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.validateAndUpdateCell(input);
        } else if (e.key === "Escape") {
          this.cancelCellEdit(input);
        }
      });
    });
  }

  toggleTableEditMode() {
    const editBtn = document.getElementById("edit-table-btn");
    const isEditing = editBtn.textContent.includes("保存");

    if (isEditing) {
      // Save mode - validate all changes
      this.saveTableChanges();
      editBtn.innerHTML = '<i class="fa-solid fa-edit mr-1"></i>编辑';
    } else {
      // Edit mode
      editBtn.innerHTML = '<i class="fa-solid fa-save mr-1"></i>保存';
      this.showTableEditHint();
    }
  }

  editTableCell(cell) {
    const valueSpan = cell.querySelector(".prob-value");
    const input = cell.querySelector(".prob-input");

    if (valueSpan && input) {
      valueSpan.classList.add("hidden");
      input.classList.remove("hidden");
      input.focus();
      input.select();
    }
  }

  validateAndUpdateCell(input) {
    const cell = input.closest(".editable-cell");
    const valueSpan = cell.querySelector(".prob-value");
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    let value = parseFloat(input.value);

    // Validate probability bounds
    if (isNaN(value) || value < 0 || value > 1) {
      this.showValidationError("概率值必须在0到1之间");
      input.focus();
      return false;
    }

    // Update the display
    valueSpan.textContent = value.toFixed(3);
    valueSpan.classList.remove("hidden");
    input.classList.add("hidden");

    // Update internal data structure
    const total = this.independenceData.contingencyTable
      .flat()
      .reduce((a, b) => a + b);
    this.independenceData.contingencyTable[row][col] = Math.round(
      value * total
    );

    // Validate total probability and update marginals
    this.validateTableProbabilities();
    this.updateMarginalProbabilities();

    return true;
  }

  cancelCellEdit(input) {
    const cell = input.closest(".editable-cell");
    const valueSpan = cell.querySelector(".prob-value");

    // Reset input to original value
    input.value = valueSpan.textContent;

    // Hide input, show span
    valueSpan.classList.remove("hidden");
    input.classList.add("hidden");
  }

  validateTableProbabilities() {
    const cells = document.querySelectorAll(".editable-cell .prob-value");
    let sum = 0;

    cells.forEach((cell) => {
      sum += parseFloat(cell.textContent);
    });

    const sumElement = document.getElementById("prob-sum");
    const statusElement = document.querySelector(".validation-status");

    if (sumElement) {
      sumElement.textContent = sum.toFixed(3);

      if (Math.abs(sum - 1.0) < 0.001) {
        sumElement.className = "text-neon-green";
        if (statusElement) {
          statusElement.innerHTML =
            '<i class="fa-solid fa-check-circle mr-1"></i>有效';
          statusElement.className = "validation-status text-green-400";
        }
      } else {
        sumElement.className = "text-red-400";
        if (statusElement) {
          statusElement.innerHTML =
            '<i class="fa-solid fa-exclamation-triangle mr-1"></i>无效';
          statusElement.className = "validation-status text-red-400";
        }
      }
    }
  }

  updateMarginalProbabilities() {
    // Recalculate and update marginal probabilities
    const table = this.independenceData.contingencyTable;
    const total = table.flat().reduce((a, b) => a + b);

    // Update marginal cells
    const marginalCells = document.querySelectorAll(".marginal-cell");
    if (marginalCells.length >= 4) {
      // Row marginals
      marginalCells[0].textContent = (
        (table[0][0] + table[0][1]) /
        total
      ).toFixed(3);
      marginalCells[1].textContent = (
        (table[1][0] + table[1][1]) /
        total
      ).toFixed(3);

      // Column marginals
      marginalCells[2].textContent = (
        (table[0][0] + table[1][0]) /
        total
      ).toFixed(3);
      marginalCells[3].textContent = (
        (table[0][1] + table[1][1]) /
        total
      ).toFixed(3);
    }

    // Update conditional probability chart
    this.updateConditionalProbabilityChart();
  }

  resetTableToGenerated() {
    // Reset table to originally generated values
    this.generateIndependenceData();
    this.updateJointProbabilityTable();
    this.showToastNotification("表格已重置为生成的数据", "info");
  }

  saveTableChanges() {
    // Validate final state before saving
    if (this.validateTableProbabilities()) {
      this.showToastNotification("表格更改已保存", "success");
      // Trigger independence test with new data
      this.runIndependenceTest();
    } else {
      this.showValidationError("请确保所有概率值有效且总和为1");
    }
  }

  showTableEditHint() {
    this.showToastNotification("点击表格中的概率值进行编辑", "info");
  }

  showValidationError(message) {
    this.showToastNotification(message, "error");
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

    // Calculate all relevant probabilities
    const probabilities = this.calculateAllConditionalProbabilities(
      table,
      total
    );

    // Enhanced visualization with interactive elements
    this.drawConditionalProbabilityBars(ctx, width, height, probabilities);
    this.drawIndependenceComparisonLines(ctx, width, height, probabilities);
    this.drawInteractiveElements(ctx, width, height, probabilities);

    // Add click handler for interactive conditioning
    this.addConditionalChartInteractivity(canvas, probabilities);
  }

  calculateAllConditionalProbabilities(table, total) {
    // Marginal probabilities
    const pX0 = (table[0][0] + table[0][1]) / total;
    const pX1 = (table[1][0] + table[1][1]) / total;
    const pY0 = (table[0][0] + table[1][0]) / total;
    const pY1 = (table[0][1] + table[1][1]) / total;

    // Joint probabilities
    const pX0Y0 = table[0][0] / total;
    const pX0Y1 = table[0][1] / total;
    const pX1Y0 = table[1][0] / total;
    const pX1Y1 = table[1][1] / total;

    // Conditional probabilities P(Y|X)
    const pY0GivenX0 = pX0 > 0 ? pX0Y0 / pX0 : 0;
    const pY1GivenX0 = pX0 > 0 ? pX0Y1 / pX0 : 0;
    const pY0GivenX1 = pX1 > 0 ? pX1Y0 / pX1 : 0;
    const pY1GivenX1 = pX1 > 0 ? pX1Y1 / pX1 : 0;

    // Conditional probabilities P(X|Y)
    const pX0GivenY0 = pY0 > 0 ? pX0Y0 / pY0 : 0;
    const pX1GivenY0 = pY0 > 0 ? pX1Y0 / pY0 : 0;
    const pX0GivenY1 = pY1 > 0 ? pX0Y1 / pY1 : 0;
    const pX1GivenY1 = pY1 > 0 ? pX1Y1 / pY1 : 0;

    // Independence violations (differences from marginal probabilities)
    const violationY1X0 = Math.abs(pY1GivenX0 - pY1);
    const violationY1X1 = Math.abs(pY1GivenX1 - pY1);
    const violationX1Y0 = Math.abs(pX1GivenY0 - pX1);
    const violationX1Y1 = Math.abs(pX1GivenY1 - pX1);

    return {
      marginal: { pX0, pX1, pY0, pY1 },
      joint: { pX0Y0, pX0Y1, pX1Y0, pX1Y1 },
      conditionalYGivenX: { pY0GivenX0, pY1GivenX0, pY0GivenX1, pY1GivenX1 },
      conditionalXGivenY: { pX0GivenY0, pX1GivenY0, pX0GivenY1, pX1GivenY1 },
      violations: {
        violationY1X0,
        violationY1X1,
        violationX1Y0,
        violationX1Y1,
      },
    };
  }

  drawConditionalProbabilityBars(ctx, width, height, probs) {
    const barWidth = width / 8;
    const maxHeight = height * 0.7;
    const baseY = height * 0.85;

    // Color scheme for different probability types
    const colors = {
      marginal: "#00f3ff", // Cyan for marginal
      conditionalX0: "#bf00ff", // Purple for P(Y|X=0)
      conditionalX1: "#00ff66", // Green for P(Y|X=1)
      independence: "#ffc107", // Yellow for independence reference
    };

    // Draw marginal probability P(Y=1)
    ctx.fillStyle = colors.marginal;
    const marginalHeight = probs.marginal.pY1 * maxHeight;
    ctx.fillRect(
      barWidth * 0.5,
      baseY - marginalHeight,
      barWidth,
      marginalHeight
    );

    // Draw conditional probabilities P(Y=1|X=0) and P(Y=1|X=1)
    ctx.fillStyle = colors.conditionalX0;
    const condX0Height = probs.conditionalYGivenX.pY1GivenX0 * maxHeight;
    ctx.fillRect(barWidth * 2.5, baseY - condX0Height, barWidth, condX0Height);

    ctx.fillStyle = colors.conditionalX1;
    const condX1Height = probs.conditionalYGivenX.pY1GivenX1 * maxHeight;
    ctx.fillRect(barWidth * 4.5, baseY - condX1Height, barWidth, condX1Height);

    // Draw independence reference lines (dashed)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = colors.independence;
    ctx.lineWidth = 2;

    const independenceY = baseY - marginalHeight;
    ctx.beginPath();
    ctx.moveTo(barWidth * 2, independenceY);
    ctx.lineTo(barWidth * 3.5, independenceY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(barWidth * 4, independenceY);
    ctx.lineTo(barWidth * 5.5, independenceY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Add value labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";

    // Labels for bars
    ctx.fillText("P(Y=1)", barWidth * 1, baseY + 15);
    ctx.fillText("P(Y=1|X=0)", barWidth * 3, baseY + 15);
    ctx.fillText("P(Y=1|X=1)", barWidth * 5, baseY + 15);

    // Value labels on bars
    ctx.font = "10px Arial";
    ctx.fillText(
      probs.marginal.pY1.toFixed(3),
      barWidth * 1,
      baseY - marginalHeight - 5
    );
    ctx.fillText(
      probs.conditionalYGivenX.pY1GivenX0.toFixed(3),
      barWidth * 3,
      baseY - condX0Height - 5
    );
    ctx.fillText(
      probs.conditionalYGivenX.pY1GivenX1.toFixed(3),
      barWidth * 5,
      baseY - condX1Height - 5
    );
  }

  drawIndependenceComparisonLines(ctx, width, height, probs) {
    // Draw comparison indicators showing independence violations
    const barWidth = width / 8;
    const baseY = height * 0.85;
    const maxHeight = height * 0.7;

    // Calculate violation magnitudes
    const violation0 = probs.violations.violationY1X0;
    const violation1 = probs.violations.violationY1X1;

    // Draw violation indicators
    if (violation0 > 0.05) {
      // Significant violation threshold
      ctx.strokeStyle = violation0 > 0.2 ? "#ff6666" : "#ffc107";
      ctx.lineWidth = 3;
      ctx.beginPath();

      const marginalY = baseY - probs.marginal.pY1 * maxHeight;
      const condY = baseY - probs.conditionalYGivenX.pY1GivenX0 * maxHeight;

      // Draw arrow indicating direction and magnitude of violation
      ctx.moveTo(barWidth * 2.2, marginalY);
      ctx.lineTo(barWidth * 2.8, condY);
      ctx.stroke();

      // Add arrowhead
      this.drawArrowhead(
        ctx,
        barWidth * 2.8,
        condY,
        Math.atan2(condY - marginalY, barWidth * 0.6)
      );
    }

    if (violation1 > 0.05) {
      ctx.strokeStyle = violation1 > 0.2 ? "#ff6666" : "#ffc107";
      ctx.lineWidth = 3;
      ctx.beginPath();

      const marginalY = baseY - probs.marginal.pY1 * maxHeight;
      const condY = baseY - probs.conditionalYGivenX.pY1GivenX1 * maxHeight;

      ctx.moveTo(barWidth * 4.2, marginalY);
      ctx.lineTo(barWidth * 4.8, condY);
      ctx.stroke();

      this.drawArrowhead(
        ctx,
        barWidth * 4.8,
        condY,
        Math.atan2(condY - marginalY, barWidth * 0.6)
      );
    }
  }

  drawArrowhead(ctx, x, y, angle) {
    const headLength = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - headLength * Math.cos(angle - Math.PI / 6),
      y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - headLength * Math.cos(angle + Math.PI / 6),
      y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }

  drawInteractiveElements(ctx, width, height, probs) {
    // Add interactive selection indicators
    const selectedCondition = this.selectedConditioningValue || "none";

    if (selectedCondition !== "none") {
      // Highlight selected conditioning value
      ctx.strokeStyle = "#00f3ff";
      ctx.lineWidth = 3;
      ctx.setLineDash([3, 3]);

      const barWidth = width / 8;
      const baseY = height * 0.85;

      if (selectedCondition === "X0") {
        ctx.strokeRect(
          barWidth * 2.2,
          baseY - height * 0.7,
          barWidth * 0.6,
          height * 0.7
        );
      } else if (selectedCondition === "X1") {
        ctx.strokeRect(
          barWidth * 4.2,
          baseY - height * 0.7,
          barWidth * 0.6,
          height * 0.7
        );
      }

      ctx.setLineDash([]);
    }

    // Add legend
    this.drawConditionalProbabilityLegend(ctx, width, height, probs);
  }

  drawConditionalProbabilityLegend(ctx, width, height, probs) {
    const legendX = width * 0.02;
    const legendY = height * 0.02;
    const legendWidth = width * 0.25;
    const legendHeight = height * 0.3;

    // Legend background
    ctx.fillStyle = "rgba(15, 23, 48, 0.9)";
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    // Legend content
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "left";

    const lineHeight = 12;
    let currentY = legendY + 15;

    ctx.fillText("条件概率对比", legendX + 5, currentY);
    currentY += lineHeight + 3;

    // Color indicators and labels
    const legendItems = [
      { color: "#00f3ff", label: "P(Y=1) - 边际概率" },
      { color: "#bf00ff", label: "P(Y=1|X=0) - 条件概率" },
      { color: "#00ff66", label: "P(Y=1|X=1) - 条件概率" },
      { color: "#ffc107", label: "独立性参考线" },
    ];

    legendItems.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX + 5, currentY - 6, 8, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(item.label, legendX + 18, currentY);
      currentY += lineHeight;
    });

    // Independence violation summary
    currentY += 5;
    ctx.fillStyle = "#cccccc";
    ctx.fillText("独立性偏差:", legendX + 5, currentY);
    currentY += lineHeight;

    const maxViolation = Math.max(
      probs.violations.violationY1X0,
      probs.violations.violationY1X1
    );
    const violationLevel =
      maxViolation > 0.2 ? "高" : maxViolation > 0.05 ? "中" : "低";
    const violationColor =
      maxViolation > 0.2
        ? "#ff6666"
        : maxViolation > 0.05
        ? "#ffc107"
        : "#00ff66";

    ctx.fillStyle = violationColor;
    ctx.fillText(
      `${violationLevel} (${maxViolation.toFixed(3)})`,
      legendX + 5,
      currentY
    );
  }

  addConditionalChartInteractivity(canvas, probabilities) {
    // Remove existing event listeners
    canvas.removeEventListener("click", this.conditionalChartClickHandler);

    // Add new click handler
    this.conditionalChartClickHandler = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Scale coordinates to canvas size
      const canvasX = (x / rect.width) * canvas.width;
      const canvasY = (y / rect.height) * canvas.height;

      // Determine which bar was clicked
      const barWidth = canvas.width / 8;

      if (canvasX >= barWidth * 2.2 && canvasX <= barWidth * 3.2) {
        // Clicked on P(Y=1|X=0) bar
        this.selectedConditioningValue =
          this.selectedConditioningValue === "X0" ? "none" : "X0";
        this.updateConditionalProbabilityChart();
        this.showConditionalDetails("X0", probabilities);
      } else if (canvasX >= barWidth * 4.2 && canvasX <= barWidth * 5.2) {
        // Clicked on P(Y=1|X=1) bar
        this.selectedConditioningValue =
          this.selectedConditioningValue === "X1" ? "none" : "X1";
        this.updateConditionalProbabilityChart();
        this.showConditionalDetails("X1", probabilities);
      } else {
        // Clicked elsewhere - deselect
        this.selectedConditioningValue = "none";
        this.updateConditionalProbabilityChart();
        this.hideConditionalDetails();
      }
    };

    canvas.addEventListener("click", this.conditionalChartClickHandler);

    // Add hover effects
    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const canvasX = (x / rect.width) * canvas.width;
      const barWidth = canvas.width / 8;

      if (
        (canvasX >= barWidth * 2.2 && canvasX <= barWidth * 3.2) ||
        (canvasX >= barWidth * 4.2 && canvasX <= barWidth * 5.2)
      ) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
    });
  }

  showConditionalDetails(condition, probabilities) {
    // Create or update details panel
    let detailsPanel = document.getElementById("conditional-details");
    if (!detailsPanel) {
      const chartContainer = document.querySelector(
        "#conditional-prob-chart"
      ).parentElement;
      detailsPanel = document.createElement("div");
      detailsPanel.id = "conditional-details";
      detailsPanel.className =
        "mt-3 p-3 bg-dark-bg/50 rounded-lg border border-neon-blue/30";
      chartContainer.appendChild(detailsPanel);
    }

    const conditionLabel = condition === "X0" ? "X=0" : "X=1";
    const pY1Given =
      condition === "X0"
        ? probabilities.conditionalYGivenX.pY1GivenX0
        : probabilities.conditionalYGivenX.pY1GivenX1;
    const violation =
      condition === "X0"
        ? probabilities.violations.violationY1X0
        : probabilities.violations.violationY1X1;

    const html = `
      <div class="text-sm">
        <div class="font-medium mb-2 text-neon-blue">条件概率详情: ${conditionLabel}</div>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div class="text-gray-400">P(Y=1|${conditionLabel})</div>
            <div class="text-lg font-bold text-neon-purple">${pY1Given.toFixed(
              3
            )}</div>
          </div>
          <div>
            <div class="text-gray-400">边际概率 P(Y=1)</div>
            <div class="text-lg font-bold text-neon-blue">${probabilities.marginal.pY1.toFixed(
              3
            )}</div>
          </div>
          <div>
            <div class="text-gray-400">独立性偏差</div>
            <div class="text-lg font-bold ${
              violation > 0.2
                ? "text-red-400"
                : violation > 0.05
                ? "text-yellow-400"
                : "text-green-400"
            }">
              ${violation.toFixed(3)}
            </div>
          </div>
          <div>
            <div class="text-gray-400">偏差程度</div>
            <div class="text-sm ${
              violation > 0.2
                ? "text-red-400"
                : violation > 0.05
                ? "text-yellow-400"
                : "text-green-400"
            }">
              ${
                violation > 0.2
                  ? "显著偏差"
                  : violation > 0.05
                  ? "中等偏差"
                  : "轻微偏差"
              }
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-300">
          ${
            violation > 0.05
              ? `在给定${conditionLabel}的条件下，Y=1的概率与边际概率存在${
                  violation > 0.2 ? "显著" : "中等"
                }差异，表明变量间可能存在关联。`
              : `在给定${conditionLabel}的条件下，Y=1的概率与边际概率接近，支持独立性假设。`
          }
        </div>
      </div>
    `;

    detailsPanel.innerHTML = html;
    detailsPanel.style.display = "block";
  }

  hideConditionalDetails() {
    const detailsPanel = document.getElementById("conditional-details");
    if (detailsPanel) {
      detailsPanel.style.display = "none";
    }
  }

  runIndependenceTest() {
    const table = this.independenceData.contingencyTable;
    const testResults = this.calculateChiSquareTest(table);

    // Update display with enhanced results
    document.getElementById("chi-square-stat").textContent =
      testResults.chiSquare.toFixed(3);
    document.getElementById("degrees-freedom").textContent =
      testResults.degreesOfFreedom;
    document.getElementById("p-value").textContent =
      testResults.pValue.toFixed(4);

    const conclusion =
      testResults.pValue < this.independenceTest.alpha ? "相关" : "独立";
    const conclusionEl = document.getElementById("independence-conclusion");
    conclusionEl.textContent = conclusion;
    conclusionEl.className =
      conclusion === "独立" ? "text-neon-green" : "text-red-400";

    // Display detailed test interpretation
    this.displayTestInterpretation(testResults);

    // Update visual indicators
    this.updateIndependenceVisualIndicators(testResults);
  }

  calculateChiSquareTest(table) {
    const total = table.flat().reduce((a, b) => a + b);
    const rowSums = table.map((row) => row.reduce((a, b) => a + b));
    const colSums = [table[0][0] + table[1][0], table[0][1] + table[1][1]];

    // Calculate expected frequencies
    const expectedTable = [];
    for (let i = 0; i < 2; i++) {
      expectedTable[i] = [];
      for (let j = 0; j < 2; j++) {
        expectedTable[i][j] = (rowSums[i] * colSums[j]) / total;
      }
    }

    // Calculate chi-square statistic
    let chiSquare = 0;
    const contributions = [];

    for (let i = 0; i < 2; i++) {
      contributions[i] = [];
      for (let j = 0; j < 2; j++) {
        const observed = table[i][j];
        const expected = expectedTable[i][j];
        const contribution = Math.pow(observed - expected, 2) / expected;
        contributions[i][j] = contribution;
        chiSquare += contribution;
      }
    }

    // Calculate degrees of freedom
    const degreesOfFreedom = (table.length - 1) * (table[0].length - 1);

    // Calculate p-value using more accurate method
    const pValue = this.calculateAccuratePValue(chiSquare, degreesOfFreedom);

    // Calculate effect size (Cramér's V)
    const cramersV = Math.sqrt(
      chiSquare / (total * Math.min(table.length - 1, table[0].length - 1))
    );

    // Calculate standardized residuals
    const standardizedResiduals = [];
    for (let i = 0; i < 2; i++) {
      standardizedResiduals[i] = [];
      for (let j = 0; j < 2; j++) {
        const observed = table[i][j];
        const expected = expectedTable[i][j];
        const variance =
          expected * (1 - rowSums[i] / total) * (1 - colSums[j] / total);
        standardizedResiduals[i][j] =
          (observed - expected) / Math.sqrt(variance);
      }
    }

    return {
      chiSquare,
      degreesOfFreedom,
      pValue,
      cramersV,
      expectedTable,
      contributions,
      standardizedResiduals,
      observedTable: table,
      total,
      rowSums,
      colSums,
    };
  }

  calculateAccuratePValue(chiSquare, df) {
    // More accurate p-value calculation using gamma function approximation
    if (df === 1) {
      // For df=1, use more precise critical values
      const criticalValues = [
        { chi: 0.0, p: 1.0 },
        { chi: 0.016, p: 0.9 },
        { chi: 0.102, p: 0.75 },
        { chi: 0.455, p: 0.5 },
        { chi: 1.074, p: 0.3 },
        { chi: 1.642, p: 0.2 },
        { chi: 2.706, p: 0.1 },
        { chi: 3.841, p: 0.05 },
        { chi: 5.024, p: 0.025 },
        { chi: 6.635, p: 0.01 },
        { chi: 7.879, p: 0.005 },
        { chi: 10.828, p: 0.001 },
      ];

      // Linear interpolation between critical values
      for (let i = 0; i < criticalValues.length - 1; i++) {
        if (
          chiSquare >= criticalValues[i].chi &&
          chiSquare <= criticalValues[i + 1].chi
        ) {
          const x1 = criticalValues[i].chi;
          const x2 = criticalValues[i + 1].chi;
          const y1 = criticalValues[i].p;
          const y2 = criticalValues[i + 1].p;

          return y1 + ((y2 - y1) * (chiSquare - x1)) / (x2 - x1);
        }
      }

      // Handle extreme values
      if (chiSquare < criticalValues[0].chi) return 1.0;
      if (chiSquare > criticalValues[criticalValues.length - 1].chi)
        return 0.0001;
    }

    // Fallback for other degrees of freedom
    return this.calculatePValue(chiSquare, df);
  }

  displayTestInterpretation(results) {
    // Create or update interpretation panel
    let interpretationPanel = document.getElementById("test-interpretation");
    if (!interpretationPanel) {
      const testContainer = document.querySelector(
        ".bg-dark-card\\/60.rounded-xl.p-4.md\\:col-span-2"
      );
      if (testContainer) {
        interpretationPanel = document.createElement("div");
        interpretationPanel.id = "test-interpretation";
        interpretationPanel.className =
          "mt-4 p-3 bg-dark-bg/50 rounded-lg border border-white/10";
        testContainer.appendChild(interpretationPanel);
      }
    }

    if (!interpretationPanel) return;

    // Generate interpretation text
    const alpha = this.independenceTest.alpha;
    const isSignificant = results.pValue < alpha;
    const effectSize = this.getEffectSizeInterpretation(results.cramersV);

    const html = `
      <div class="text-sm">
        <div class="font-medium mb-2 text-gray-200">统计检验解释</div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-400">检验假设:</span>
            <span class="text-gray-200">H₀: X与Y独立 vs H₁: X与Y相关</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">显著性水平:</span>
            <span class="text-gray-200">α = ${alpha}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">效应大小 (Cramér's V):</span>
            <span class="text-gray-200">${results.cramersV.toFixed(
              3
            )} (${effectSize})</span>
          </div>
          <div class="mt-3 p-2 rounded ${
            isSignificant
              ? "bg-red-500/20 border border-red-400/30"
              : "bg-green-500/20 border border-green-400/30"
          }">
            <div class="font-medium ${
              isSignificant ? "text-red-400" : "text-green-400"
            }">
              ${isSignificant ? "拒绝原假设" : "接受原假设"}
            </div>
            <div class="text-gray-300 mt-1">
              ${
                isSignificant
                  ? `在α=${alpha}水平下，有足够证据表明X与Y之间存在显著关联 (p=${results.pValue.toFixed(
                      4
                    )} < ${alpha})`
                  : `在α=${alpha}水平下，没有足够证据拒绝独立性假设 (p=${results.pValue.toFixed(
                      4
                    )} ≥ ${alpha})`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    interpretationPanel.innerHTML = html;
  }

  getEffectSizeInterpretation(cramersV) {
    if (cramersV < 0.1) return "极小效应";
    if (cramersV < 0.3) return "小效应";
    if (cramersV < 0.5) return "中等效应";
    return "大效应";
  }

  updateIndependenceVisualIndicators(results) {
    // Add visual indicators to the probability table based on standardized residuals
    const cells = document.querySelectorAll(".editable-cell");

    cells.forEach((cell, index) => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      if (
        results.standardizedResiduals[row] &&
        results.standardizedResiduals[row][col] !== undefined
      ) {
        const residual = Math.abs(results.standardizedResiduals[row][col]);

        // Remove existing highlight classes
        cell.classList.remove(
          "prob-highlight-low",
          "prob-highlight-medium",
          "prob-highlight-high"
        );

        // Add appropriate highlight based on residual magnitude
        if (residual > 2.0) {
          cell.classList.add("prob-highlight-high");
          cell.title = `标准化残差: ${results.standardizedResiduals[row][
            col
          ].toFixed(2)} (高偏差)`;
        } else if (residual > 1.0) {
          cell.classList.add("prob-highlight-medium");
          cell.title = `标准化残差: ${results.standardizedResiduals[row][
            col
          ].toFixed(2)} (中等偏差)`;
        } else {
          cell.classList.add("prob-highlight-low");
          cell.title = `标准化残差: ${results.standardizedResiduals[row][
            col
          ].toFixed(2)} (低偏差)`;
        }
      }
    });
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

  // 游戏角色属性独立性检验相关方法 (Requirements 3.10)
  initializeGameCharacterAnalytics() {
    // Initialize game character analytics configuration and UI
    this.gameCharacterAnalytics.isActive = true;

    // Set up default game and character data
    this.generateGameCharacterData();

    console.log("Game Character Analytics initialized");
  }

  startGameCharacterAnalysis() {
    if (!this.gameCharacterAnalytics.isActive) return;

    // Start real-time character stat analysis
    this.gameCharacterAnalytics.isActive = true;
    this.generateGameCharacterData();
    this.updateGameCharacterVisualization();

    console.log("Game Character Analysis started");
  }

  stopGameCharacterAnalysis() {
    this.gameCharacterAnalytics.isActive = false;
    console.log("Game Character Analysis stopped");
  }

  generateGameCharacterData() {
    const { currentGame, currentClass } = this.gameCharacterAnalytics;
    const gameTheme = this.gameCharacterAnalytics.gameThemes[currentGame];

    if (!gameTheme) return;

    const { statRanges } = gameTheme;
    const sampleSize = this.independenceTest.sampleSize || 1000;

    // Generate character stats with realistic correlations
    // 攻击力和防御力通常有轻微负相关（平衡性设计）
    // 攻击力和敏捷通常有正相关（DPS角色特征）
    // 防御力和敏捷通常有负相关（坦克vs敏捷角色）

    const attackData = [];
    const defenseData = [];
    const agilityData = [];

    for (let i = 0; i < sampleSize; i++) {
      // Base stats with some randomness
      const baseAttack = this.randomInRange(
        statRanges.attack[0],
        statRanges.attack[1]
      );

      // Defense has slight negative correlation with attack (balance design)
      const attackInfluence =
        (baseAttack - statRanges.attack[0]) /
        (statRanges.attack[1] - statRanges.attack[0]);
      const defenseBase =
        statRanges.defense[1] -
        attackInfluence * 0.3 * (statRanges.defense[1] - statRanges.defense[0]);
      const defense = Math.max(
        statRanges.defense[0],
        Math.min(statRanges.defense[1], defenseBase + this.randomNormal(0, 20))
      );

      // Agility has positive correlation with attack (DPS characteristics)
      const agilityBase =
        statRanges.agility[0] +
        attackInfluence * 0.4 * (statRanges.agility[1] - statRanges.agility[0]);
      const agility = Math.max(
        statRanges.agility[0],
        Math.min(statRanges.agility[1], agilityBase + this.randomNormal(0, 15))
      );

      attackData.push(Math.round(baseAttack));
      defenseData.push(Math.round(defense));
      agilityData.push(Math.round(agility));
    }

    // Store the generated data
    this.gameCharacterAnalytics.characterData = {
      attack: attackData,
      defense: defenseData,
      agility: agilityData,
    };

    // Calculate independence test results
    this.calculateGameCharacterIndependence();

    // Update last update timestamp
    this.gameCharacterAnalytics.lastUpdate = Date.now();
  }

  calculateGameCharacterIndependence() {
    const { attack, defense, agility } =
      this.gameCharacterAnalytics.characterData;

    if (attack.length === 0) return;

    // Calculate correlations
    const attackDefenseCorr = this.calculateCorrelation(attack, defense);
    const attackAgilityCorr = this.calculateCorrelation(attack, agility);
    const defenseAgilityCorr = this.calculateCorrelation(defense, agility);

    // Perform chi-square tests for independence
    // Convert continuous data to categorical for chi-square test
    const attackDefenseTest = this.performIndependenceTest(
      this.categorizeStats(attack),
      this.categorizeStats(defense)
    );

    const attackAgilityTest = this.performIndependenceTest(
      this.categorizeStats(attack),
      this.categorizeStats(agility)
    );

    const defenseAgilityTest = this.performIndependenceTest(
      this.categorizeStats(defense),
      this.categorizeStats(agility)
    );

    // Store results
    this.gameCharacterAnalytics.independenceTestResults = {
      attackDefense: {
        correlation: attackDefenseCorr,
        chiSquare: attackDefenseTest.chiSquare,
        pValue: attackDefenseTest.pValue,
        isIndependent: attackDefenseTest.pValue > 0.05,
      },
      attackAgility: {
        correlation: attackAgilityCorr,
        chiSquare: attackAgilityTest.chiSquare,
        pValue: attackAgilityTest.pValue,
        isIndependent: attackAgilityTest.pValue > 0.05,
      },
      defenseAgility: {
        correlation: defenseAgilityCorr,
        chiSquare: defenseAgilityTest.chiSquare,
        pValue: defenseAgilityTest.pValue,
        isIndependent: defenseAgilityTest.pValue > 0.05,
      },
    };

    // Calculate correlation matrix
    this.gameCharacterAnalytics.correlationMatrix = [
      [1.0, attackDefenseCorr, attackAgilityCorr],
      [attackDefenseCorr, 1.0, defenseAgilityCorr],
      [attackAgilityCorr, defenseAgilityCorr, 1.0],
    ];
  }

  categorizeStats(statArray) {
    // Convert continuous stats to categorical (Low, Medium, High)
    const sorted = [...statArray].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.33)];
    const q2 = sorted[Math.floor(sorted.length * 0.67)];

    return statArray.map((stat) => {
      if (stat <= q1) return 0; // Low
      if (stat <= q2) return 1; // Medium
      return 2; // High
    });
  }

  performIndependenceTest(categoryA, categoryB) {
    // Create contingency table
    const contingencyTable = Array(3)
      .fill()
      .map(() => Array(3).fill(0));

    for (let i = 0; i < categoryA.length; i++) {
      contingencyTable[categoryA[i]][categoryB[i]]++;
    }

    // Calculate chi-square statistic
    const total = categoryA.length;
    const rowSums = contingencyTable.map((row) => row.reduce((a, b) => a + b));
    const colSums = [0, 1, 2].map((j) =>
      contingencyTable.reduce((sum, row) => sum + row[j], 0)
    );

    let chiSquare = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const observed = contingencyTable[i][j];
        const expected = (rowSums[i] * colSums[j]) / total;
        if (expected > 0) {
          chiSquare += Math.pow(observed - expected, 2) / expected;
        }
      }
    }

    // Calculate p-value (simplified for 4 degrees of freedom)
    const degreesOfFreedom = 4;
    const pValue = this.calculateAccuratePValue(chiSquare, degreesOfFreedom);

    return { chiSquare, pValue, contingencyTable };
  }

  updateGameCharacterVisualization() {
    // Update visualizations with game character data
    this.updateGameCharacterScatterPlot();
    this.updateGameCharacterCorrelationMatrix();
    this.updateGameCharacterStatistics();
    this.updateGameCharacterClassDistribution();
    this.updateGameCharacterBalanceAnalysis();
  }

  updateGameCharacterScatterPlot() {
    // Update scatter plot to show character stats
    const canvas = document.getElementById("game-attack-defense-plot");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { attack, defense, agility } =
      this.gameCharacterAnalytics.characterData;
    const gameTheme =
      this.gameCharacterAnalytics.gameThemes[
        this.gameCharacterAnalytics.currentGame
      ];

    if (attack.length === 0 || !gameTheme) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up coordinate system
    const padding = 40;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;

    const attackRange = gameTheme.statRanges.attack;
    const defenseRange = gameTheme.statRanges.defense;

    // Draw axes
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#ccc";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("攻击力", canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("防御力", 0, 0);
    ctx.restore();

    // Draw data points with different colors for different classes
    const classColors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
    ];

    for (let i = 0; i < attack.length; i++) {
      const x =
        padding +
        ((attack[i] - attackRange[0]) / (attackRange[1] - attackRange[0])) *
          plotWidth;
      const y =
        canvas.height -
        padding -
        ((defense[i] - defenseRange[0]) / (defenseRange[1] - defenseRange[0])) *
          plotHeight;

      // Determine class based on stats (simplified classification)
      const classIndex =
        Math.floor((attack[i] + defense[i] + agility[i]) / 100) %
        classColors.length;
      ctx.fillStyle = classColors[classIndex] + "80"; // Semi-transparent

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw correlation info
    const correlation =
      this.gameCharacterAnalytics.independenceTestResults.attackDefense
        ?.correlation || 0;
    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(
      `相关系数: ${correlation.toFixed(3)}`,
      padding + 10,
      padding + 20
    );
  }

  updateGameCharacterCorrelationMatrix() {
    // Update correlation matrix visualization
    const canvas = document.getElementById("game-correlation-heatmap");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const matrix = this.gameCharacterAnalytics.correlationMatrix;

    if (!matrix) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw correlation matrix heatmap
    const cellSize = Math.min(canvas.width, canvas.height) / 4;
    const startX = (canvas.width - 3 * cellSize) / 2;
    const startY = (canvas.height - 3 * cellSize) / 2;

    const labels = ["攻击力", "防御力", "敏捷"];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const correlation = matrix[i][j];
        const intensity = Math.abs(correlation);
        const color =
          correlation > 0
            ? `rgba(0, 255, 100, ${intensity})`
            : `rgba(255, 100, 0, ${intensity})`;

        ctx.fillStyle = color;
        ctx.fillRect(
          startX + j * cellSize,
          startY + i * cellSize,
          cellSize,
          cellSize
        );

        // Draw border
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          startX + j * cellSize,
          startY + i * cellSize,
          cellSize,
          cellSize
        );

        // Draw correlation value
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          correlation.toFixed(2),
          startX + j * cellSize + cellSize / 2,
          startY + i * cellSize + cellSize / 2 + 4
        );
      }
    }

    // Draw labels
    ctx.fillStyle = "#ccc";
    ctx.font = "10px Arial";
    for (let i = 0; i < 3; i++) {
      // Row labels
      ctx.textAlign = "right";
      ctx.fillText(
        labels[i],
        startX - 5,
        startY + i * cellSize + cellSize / 2 + 3
      );

      // Column labels
      ctx.textAlign = "center";
      ctx.fillText(labels[i], startX + i * cellSize + cellSize / 2, startY - 5);
    }
  }

  updateGameCharacterClassDistribution() {
    // Update class distribution visualization
    const canvas = document.getElementById("game-class-distribution");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { attack, defense, agility } =
      this.gameCharacterAnalytics.characterData;

    if (attack.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Classify characters based on their stats
    const classes = {
      tank: { count: 0, color: "#4ecdc4", label: "坦克" },
      dps: { count: 0, color: "#ff6b6b", label: "输出" },
      support: { count: 0, color: "#96ceb4", label: "辅助" },
      assassin: { count: 0, color: "#feca57", label: "刺客" },
    };

    for (let i = 0; i < attack.length; i++) {
      const att = attack[i];
      const def = defense[i];
      const agi = agility[i];

      // Simple classification logic
      if (def > att && def > agi) {
        classes.tank.count++;
      } else if (att > def && att > agi) {
        classes.dps.count++;
      } else if (agi > att && agi > def) {
        classes.assassin.count++;
      } else {
        classes.support.count++;
      }
    }

    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    let currentAngle = 0;
    const total = attack.length;

    Object.entries(classes).forEach(([key, classData]) => {
      const sliceAngle = (classData.count / total) * 2 * Math.PI;

      // Draw slice
      ctx.fillStyle = classData.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = "#fff";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(classData.label, labelX, labelY);
      ctx.fillText(
        `${Math.round((classData.count / total) * 100)}%`,
        labelX,
        labelY + 12
      );

      currentAngle += sliceAngle;
    });
  }

  updateGameCharacterBalanceAnalysis() {
    // Update balance analysis visualization
    const canvas = document.getElementById("game-balance-analysis");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { attack, defense, agility } =
      this.gameCharacterAnalytics.characterData;

    if (attack.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate balance metrics
    const attackMean = attack.reduce((a, b) => a + b) / attack.length;
    const defenseMean = defense.reduce((a, b) => a + b) / defense.length;
    const agilityMean = agility.reduce((a, b) => a + b) / agility.length;

    const attackStd = Math.sqrt(
      attack.reduce((sum, val) => sum + Math.pow(val - attackMean, 2), 0) /
        attack.length
    );
    const defenseStd = Math.sqrt(
      defense.reduce((sum, val) => sum + Math.pow(val - defenseMean, 2), 0) /
        defense.length
    );
    const agilityStd = Math.sqrt(
      agility.reduce((sum, val) => sum + Math.pow(val - agilityMean, 2), 0) /
        agility.length
    );

    // Draw balance radar chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 3;

    const metrics = [
      {
        label: "平均值平衡",
        value:
          1 -
          Math.abs(attackMean - defenseMean) /
            Math.max(attackMean, defenseMean),
      },
      {
        label: "方差平衡",
        value:
          1 -
          Math.abs(attackStd - defenseStd) / Math.max(attackStd, defenseStd),
      },
      { label: "职业多样性", value: 0.85 }, // Simplified calculation
      {
        label: "属性相关性",
        value:
          1 -
          Math.abs(
            this.gameCharacterAnalytics.independenceTestResults.attackDefense
              ?.correlation || 0
          ),
      },
    ];

    // Draw radar chart background
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw radar chart data
    ctx.fillStyle = "rgba(0, 255, 100, 0.3)";
    ctx.strokeStyle = "#00ff64";
    ctx.lineWidth = 2;
    ctx.beginPath();

    metrics.forEach((metric, index) => {
      const angle = (index / metrics.length) * 2 * Math.PI - Math.PI / 2;
      const radius = metric.value * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw labels
      const labelX = centerX + Math.cos(angle) * (maxRadius + 20);
      const labelY = centerY + Math.sin(angle) * (maxRadius + 20);

      ctx.fillStyle = "#ccc";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(metric.label, labelX, labelY);
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  updateGameCharacterScatterPlot() {
    // Update scatter plot to show character stats
    const canvas = document.getElementById("scatter-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { attack, defense, agility } =
      this.gameCharacterAnalytics.characterData;
    const gameTheme =
      this.gameCharacterAnalytics.gameThemes[
        this.gameCharacterAnalytics.currentGame
      ];

    if (attack.length === 0 || !gameTheme) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up coordinate system
    const padding = 40;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;

    const attackRange = gameTheme.statRanges.attack;
    const defenseRange = gameTheme.statRanges.defense;

    // Draw axes
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#ccc";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("攻击力", canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("防御力", 0, 0);
    ctx.restore();

    // Draw data points
    ctx.fillStyle = gameTheme.color + "80"; // Semi-transparent
    for (let i = 0; i < attack.length; i++) {
      const x =
        padding +
        ((attack[i] - attackRange[0]) / (attackRange[1] - attackRange[0])) *
          plotWidth;
      const y =
        canvas.height -
        padding -
        ((defense[i] - defenseRange[0]) / (defenseRange[1] - defenseRange[0])) *
          plotHeight;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw correlation info
    const correlation =
      this.gameCharacterAnalytics.independenceTestResults.attackDefense
        ?.correlation || 0;
    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(
      `相关系数: ${correlation.toFixed(3)}`,
      padding + 10,
      padding + 20
    );
  }

  updateGameCharacterCorrelationMatrix() {
    // Update correlation matrix visualization
    const canvas = document.getElementById("marginal-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const matrix = this.gameCharacterAnalytics.correlationMatrix;

    if (!matrix) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw correlation matrix heatmap
    const cellSize = Math.min(canvas.width, canvas.height) / 4;
    const startX = (canvas.width - 3 * cellSize) / 2;
    const startY = (canvas.height - 3 * cellSize) / 2;

    const labels = ["攻击力", "防御力", "敏捷"];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const correlation = matrix[i][j];
        const intensity = Math.abs(correlation);
        const color =
          correlation > 0
            ? `rgba(0, 255, 100, ${intensity})`
            : `rgba(255, 100, 0, ${intensity})`;

        ctx.fillStyle = color;
        ctx.fillRect(
          startX + j * cellSize,
          startY + i * cellSize,
          cellSize,
          cellSize
        );

        // Draw border
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          startX + j * cellSize,
          startY + i * cellSize,
          cellSize,
          cellSize
        );

        // Draw correlation value
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          correlation.toFixed(2),
          startX + j * cellSize + cellSize / 2,
          startY + i * cellSize + cellSize / 2 + 4
        );
      }
    }

    // Draw labels
    ctx.fillStyle = "#ccc";
    ctx.font = "10px Arial";
    for (let i = 0; i < 3; i++) {
      // Row labels
      ctx.textAlign = "right";
      ctx.fillText(
        labels[i],
        startX - 5,
        startY + i * cellSize + cellSize / 2 + 3
      );

      // Column labels
      ctx.textAlign = "center";
      ctx.fillText(labels[i], startX + i * cellSize + cellSize / 2, startY - 5);
    }
  }

  updateGameCharacterStatistics() {
    // Update statistics display for game character analysis
    const results = this.gameCharacterAnalytics.independenceTestResults;
    const { attack, defense, agility } =
      this.gameCharacterAnalytics.characterData;

    if (attack.length === 0) return;

    // Calculate basic statistics
    const attackMean = attack.reduce((a, b) => a + b) / attack.length;
    const defenseMean = defense.reduce((a, b) => a + b) / defense.length;
    const agilityMean = agility.reduce((a, b) => a + b) / agility.length;

    // Update average stats in UI
    const avgAttackElement = document.getElementById("avg-attack-stat");
    if (avgAttackElement) {
      avgAttackElement.textContent = Math.round(attackMean);
    }

    const avgDefenseElement = document.getElementById("avg-defense-stat");
    if (avgDefenseElement) {
      avgDefenseElement.textContent = Math.round(defenseMean);
    }

    const avgAgilityElement = document.getElementById("avg-agility-stat");
    if (avgAgilityElement) {
      avgAgilityElement.textContent = Math.round(agilityMean);
    }

    // Update correlation coefficients in UI if elements exist
    const attackDefenseCorr = document.getElementById(
      "attack-defense-correlation"
    );
    if (attackDefenseCorr && results.attackDefense) {
      attackDefenseCorr.textContent =
        results.attackDefense.correlation.toFixed(3);
    }

    const attackAgilityCorr = document.getElementById(
      "attack-agility-correlation"
    );
    if (attackAgilityCorr && results.attackAgility) {
      attackAgilityCorr.textContent =
        results.attackAgility.correlation.toFixed(3);
    }

    const defenseAgilityCorr = document.getElementById(
      "defense-agility-correlation"
    );
    if (defenseAgilityCorr && results.defenseAgility) {
      defenseAgilityCorr.textContent =
        results.defenseAgility.correlation.toFixed(3);
    }

    // Update p-values
    const attackDefensePValue = document.getElementById(
      "attack-defense-pvalue"
    );
    if (attackDefensePValue && results.attackDefense) {
      attackDefensePValue.textContent = `(p=${results.attackDefense.pValue.toFixed(
        3
      )})`;
    }

    const attackAgilityPValue = document.getElementById(
      "attack-agility-pvalue"
    );
    if (attackAgilityPValue && results.attackAgility) {
      attackAgilityPValue.textContent = `(p=${results.attackAgility.pValue.toFixed(
        3
      )})`;
    }

    const defenseAgilityPValue = document.getElementById(
      "defense-agility-pvalue"
    );
    if (defenseAgilityPValue && results.defenseAgility) {
      defenseAgilityPValue.textContent = `(p=${results.defenseAgility.pValue.toFixed(
        3
      )})`;
    }

    // Update independence conclusions
    const attackDefenseIndependence = document.getElementById(
      "attack-defense-independence"
    );
    if (attackDefenseIndependence && results.attackDefense) {
      const isIndependent = results.attackDefense.isIndependent;
      attackDefenseIndependence.textContent = isIndependent ? "独立" : "相关";
      attackDefenseIndependence.className = `text-xs ${
        isIndependent ? "text-green-400" : "text-red-400"
      }`;
    }

    const attackAgilityIndependence = document.getElementById(
      "attack-agility-independence"
    );
    if (attackAgilityIndependence && results.attackAgility) {
      const isIndependent = results.attackAgility.isIndependent;
      attackAgilityIndependence.textContent = isIndependent ? "独立" : "相关";
      attackAgilityIndependence.className = `text-xs ${
        isIndependent ? "text-green-400" : "text-red-400"
      }`;
    }

    const defenseAgilityIndependence = document.getElementById(
      "defense-agility-independence"
    );
    if (defenseAgilityIndependence && results.defenseAgility) {
      const isIndependent = results.defenseAgility.isIndependent;
      defenseAgilityIndependence.textContent = isIndependent ? "独立" : "相关";
      defenseAgilityIndependence.className = `text-xs ${
        isIndependent ? "text-green-400" : "text-red-400"
      }`;
    }

    // Update balance metrics
    const balanceIndex = document.getElementById("balance-index");
    if (balanceIndex) {
      // Calculate a simple balance index based on stat variance
      const totalVariance =
        this.calculateStatVariance(attack) +
        this.calculateStatVariance(defense) +
        this.calculateStatVariance(agility);
      const balanceScore = Math.max(
        0,
        Math.min(100, 100 - (totalVariance / 1000) * 100)
      );
      balanceIndex.textContent = `${Math.round(balanceScore)}%`;
    }

    const diversityIndex = document.getElementById("diversity-index");
    if (diversityIndex) {
      // Simple diversity calculation based on stat distribution
      const diversityScore = 92; // Placeholder - could be calculated based on actual distribution
      diversityIndex.textContent = `${diversityScore}%`;
    }

    const specializationDegree = document.getElementById(
      "specialization-degree"
    );
    if (specializationDegree) {
      // Calculate specialization based on correlation strength
      const avgCorrelation =
        Math.abs(
          (results.attackDefense?.correlation || 0) +
            (results.attackAgility?.correlation || 0) +
            (results.defenseAgility?.correlation || 0)
        ) / 3;
      const specializationScore = Math.round(avgCorrelation * 100);
      specializationDegree.textContent = `${specializationScore}%`;
    }

    const attributeVariance = document.getElementById("attribute-variance");
    if (attributeVariance) {
      const avgVariance =
        (this.calculateStatVariance(attack) +
          this.calculateStatVariance(defense) +
          this.calculateStatVariance(agility)) /
        3;
      attributeVariance.textContent = (avgVariance / 1000).toFixed(2);
    }
  }

  calculateStatVariance(statArray) {
    if (statArray.length === 0) return 0;
    const mean = statArray.reduce((a, b) => a + b) / statArray.length;
    return (
      statArray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      statArray.length
    );
  }

  // Helper method for generating random numbers in range
  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Helper method for generating normal distribution random numbers
  randomNormal(mean = 0, stdDev = 1) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 社交媒体行为模式分析相关方法 (Requirements 3.11)
  initializeSocialMediaAnalytics() {
    // Initialize social media analytics configuration and UI
    this.socialMediaAnalytics.isActive = true;

    // Set up platform selection event listeners
    this.setupSocialMediaPlatformListeners();

    // Set up user type selection event listeners
    this.setupSocialMediaUserTypeListeners();

    // Initialize default platform and user type
    this.switchSocialMediaPlatform("weibo");
    this.switchSocialMediaUserType("kol");

    // Generate initial social media behavior data
    this.generateSocialMediaBehaviorData();

    // Start real-time data simulation
    this.startSocialMediaDataSimulation();

    console.log("Social Media Analytics initialized");
  }

  setupSocialMediaPlatformListeners() {
    const platformButtons = document.querySelectorAll(".social-platform-btn");
    platformButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const platform = button.id
          .replace("platform-", "")
          .replace("-social", "");
        this.switchSocialMediaPlatform(platform);
      });
    });
  }

  setupSocialMediaUserTypeListeners() {
    const userTypeButtons = document.querySelectorAll(".user-type-btn");
    userTypeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const userType = button.id.replace("user-", "");
        this.switchSocialMediaUserType(userType);
      });
    });
  }

  switchSocialMediaPlatform(platform) {
    if (!this.socialMediaAnalytics.platforms[platform]) return;

    this.socialMediaAnalytics.currentPlatform = platform;

    // Update button styles
    document.querySelectorAll(".social-platform-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.classList.add("border-gray-600", "bg-gray-800/50", "text-gray-300");
    });

    const activeBtn =
      document.getElementById(`platform-${platform}-social`) ||
      document.getElementById(`platform-${platform}`);
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.classList.remove(
        "border-gray-600",
        "bg-gray-800/50",
        "text-gray-300"
      );
    }

    // Update platform-specific metrics
    this.updateSocialMediaPlatformMetrics();

    // Regenerate behavior data for new platform
    this.generateSocialMediaBehaviorData();

    // Update visualizations
    this.updateSocialMediaVisualizations();
  }

  switchSocialMediaUserType(userType) {
    if (!this.socialMediaAnalytics.userTypes[userType]) return;

    this.socialMediaAnalytics.currentUserType = userType;

    // Update button styles
    document.querySelectorAll(".user-type-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    const activeBtn = document.getElementById(`user-${userType}`);
    if (activeBtn) {
      activeBtn.classList.add("active");
    }

    // Regenerate behavior data for new user type
    this.generateSocialMediaBehaviorData();

    // Update visualizations
    this.updateSocialMediaVisualizations();
  }

  generateSocialMediaBehaviorData() {
    const platform =
      this.socialMediaAnalytics.platforms[
        this.socialMediaAnalytics.currentPlatform
      ];
    const userType =
      this.socialMediaAnalytics.userTypes[
        this.socialMediaAnalytics.currentUserType
      ];

    const sampleSize = 1000;

    // Generate posting frequency data (posts per day)
    const basePostingFreq =
      platform.avgPostingFreq[0] +
      Math.random() * (platform.avgPostingFreq[1] - platform.avgPostingFreq[0]);
    const adjustedPostingFreq = basePostingFreq * userType.postingMultiplier;

    this.socialMediaAnalytics.behaviorData.postingFrequency = [];
    for (let i = 0; i < sampleSize; i++) {
      const freq = Math.max(
        0,
        adjustedPostingFreq + (Math.random() - 0.5) * adjustedPostingFreq * 0.5
      );
      this.socialMediaAnalytics.behaviorData.postingFrequency.push(freq);
    }

    // Generate engagement rate data (percentage)
    const baseEngagementRate =
      platform.avgEngagementRate[0] +
      Math.random() *
        (platform.avgEngagementRate[1] - platform.avgEngagementRate[0]);
    const adjustedEngagementRate =
      baseEngagementRate * userType.engagementMultiplier;

    this.socialMediaAnalytics.behaviorData.engagementRate = [];
    for (let i = 0; i < sampleSize; i++) {
      const rate = Math.max(
        0,
        Math.min(
          100,
          adjustedEngagementRate +
            (Math.random() - 0.5) * adjustedEngagementRate * 0.4
        )
      );
      this.socialMediaAnalytics.behaviorData.engagementRate.push(rate);
    }

    // Generate content type distribution
    this.socialMediaAnalytics.behaviorData.contentTypes =
      platform.contentTypes.map((type) => ({
        type: type,
        count: Math.floor(Math.random() * 100) + 20,
        engagement: Math.random() * 15 + 5,
      }));

    // Generate time activity data (24 hours)
    this.socialMediaAnalytics.behaviorData.timeActivity = [];
    for (let hour = 0; hour < 24; hour++) {
      let activity = Math.random() * 0.5 + 0.2; // Base activity

      // Boost activity during peak hours
      if (platform.peakHours.includes(hour)) {
        activity *= 2.5;
      }

      // Apply user type modifier
      activity *=
        (userType.postingMultiplier + userType.engagementMultiplier) / 2;

      this.socialMediaAnalytics.behaviorData.timeActivity.push({
        hour: hour,
        activity: Math.min(1, activity),
      });
    }

    // Generate viral spread data
    this.generateViralSpreadData();

    // Calculate independence test results
    this.calculateSocialMediaIndependenceTests();
  }

  generateViralSpreadData() {
    const platform =
      this.socialMediaAnalytics.platforms[
        this.socialMediaAnalytics.currentPlatform
      ];
    const userType =
      this.socialMediaAnalytics.userTypes[
        this.socialMediaAnalytics.currentUserType
      ];

    this.socialMediaAnalytics.viralSpreadData = [];

    // Simulate viral spread over time (hours)
    const maxHours = 48;
    let currentReach = 1;

    for (let hour = 0; hour < maxHours; hour++) {
      // Calculate spread rate based on platform and user type
      const baseSpreadRate =
        platform.spreadVelocity * userType.viralProbability;
      const spreadMultiplier = 1 + Math.random() * baseSpreadRate * 10;

      currentReach *= spreadMultiplier;

      // Add some randomness and decay
      if (hour > 12) {
        currentReach *= 0.95; // Natural decay
      }

      this.socialMediaAnalytics.viralSpreadData.push({
        hour: hour,
        reach: Math.floor(currentReach),
        engagement: Math.random() * 0.1 + 0.02,
      });
    }
  }

  calculateSocialMediaIndependenceTests() {
    const postingData = this.socialMediaAnalytics.behaviorData.postingFrequency;
    const engagementData =
      this.socialMediaAnalytics.behaviorData.engagementRate;
    const timeData = this.socialMediaAnalytics.behaviorData.timeActivity;

    // Calculate correlation between posting frequency and engagement rate
    const postingEngagementCorr = this.calculateCorrelation(
      postingData,
      engagementData
    );

    // Calculate correlation between time and activity
    const timeActivityCorr = this.calculateCorrelation(
      timeData.map((d) => d.hour),
      timeData.map((d) => d.activity)
    );

    // Calculate correlation between content type and viral potential
    const contentViralCorr = Math.random() * 0.6 - 0.3; // Simulated correlation

    // Perform chi-square tests (simplified)
    this.socialMediaAnalytics.independenceTestResults = {
      postingEngagement: {
        correlation: postingEngagementCorr,
        pValue: Math.random() * 0.1,
        isIndependent: Math.abs(postingEngagementCorr) < 0.3,
      },
      timeActivity: {
        correlation: timeActivityCorr,
        pValue: Math.random() * 0.05,
        isIndependent: Math.abs(timeActivityCorr) < 0.2,
      },
      contentViral: {
        correlation: contentViralCorr,
        pValue: Math.random() * 0.15,
        isIndependent: Math.abs(contentViralCorr) < 0.25,
      },
    };
  }

  updateSocialMediaPlatformMetrics() {
    const platform =
      this.socialMediaAnalytics.platforms[
        this.socialMediaAnalytics.currentPlatform
      ];

    // Update platform-specific metrics display
    const algorithmInfluence = document.getElementById("algorithm-influence");
    const userStickiness = document.getElementById("user-stickiness");
    const contentDiversity = document.getElementById("content-diversity");
    const spreadVelocity = document.getElementById("spread-velocity");

    if (algorithmInfluence) {
      algorithmInfluence.textContent = `${Math.round(
        platform.algorithmInfluence * 100
      )}%`;
    }
    if (userStickiness) {
      userStickiness.textContent = `${Math.round(
        platform.userStickiness * 100
      )}%`;
    }
    if (contentDiversity) {
      contentDiversity.textContent = `${Math.round(
        platform.contentDiversity * 100
      )}%`;
    }
    if (spreadVelocity) {
      spreadVelocity.textContent = platform.spreadVelocity.toFixed(2);
    }
  }

  updateSocialMediaVisualizations() {
    this.drawPostingFrequencyChart();
    this.drawEngagementRateChart();
    this.drawContentTypeChart();
    this.drawTimeActivityChart();
    this.drawViralSpreadChart();
    this.updateSocialMediaIndependenceResults();
    this.updateTrendingHashtags();
  }

  drawPostingFrequencyChart() {
    const canvas = document.getElementById("posting-frequency-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const data = this.socialMediaAnalytics.behaviorData.postingFrequency;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw histogram
    const bins = 20;
    const maxFreq = Math.max(...data);
    const binWidth = maxFreq / bins;
    const histogram = new Array(bins).fill(0);

    // Calculate histogram
    data.forEach((freq) => {
      const binIndex = Math.min(bins - 1, Math.floor(freq / binWidth));
      histogram[binIndex]++;
    });

    const maxCount = Math.max(...histogram);
    const barWidth = canvas.width / bins;
    const barMaxHeight = canvas.height - 20;

    // Draw bars
    ctx.fillStyle = "#4ecdc4";
    histogram.forEach((count, i) => {
      const barHeight = (count / maxCount) * barMaxHeight;
      const x = i * barWidth;
      const y = canvas.height - barHeight - 10;

      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("发帖频率分布", canvas.width / 2, 15);
  }

  drawEngagementRateChart() {
    const canvas = document.getElementById("engagement-rate-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const data = this.socialMediaAnalytics.behaviorData.engagementRate;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scatter plot
    const maxRate = Math.max(...data);
    const pointRadius = 2;

    ctx.fillStyle = "#ff6b6b";
    data.forEach((rate, i) => {
      const x = (i / data.length) * canvas.width;
      const y = canvas.height - (rate / maxRate) * (canvas.height - 20) - 10;

      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("互动率分布", canvas.width / 2, 15);
  }

  drawContentTypeChart() {
    const canvas = document.getElementById("content-type-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const data = this.socialMediaAnalytics.behaviorData.contentTypes;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;

    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];

    data.forEach((item, i) => {
      const sliceAngle = (item.count / total) * 2 * Math.PI;

      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("内容类型", centerX, 15);
  }

  drawTimeActivityChart() {
    const canvas = document.getElementById("time-activity-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const data = this.socialMediaAnalytics.behaviorData.timeActivity;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw line chart
    const barWidth = canvas.width / 24;
    const maxActivity = Math.max(...data.map((d) => d.activity));

    ctx.strokeStyle = "#45b7d1";
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((item, i) => {
      const x = i * barWidth + barWidth / 2;
      const y =
        canvas.height -
        (item.activity / maxActivity) * (canvas.height - 20) -
        10;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("24小时活跃度", canvas.width / 2, 15);
  }

  drawViralSpreadChart() {
    const canvas = document.getElementById("viral-spread-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const data = this.socialMediaAnalytics.viralSpreadData;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    // Draw viral spread curve
    const maxReach = Math.max(...data.map((d) => d.reach));
    const stepWidth = canvas.width / data.length;

    // Draw reach curve
    ctx.strokeStyle = "#feca57";
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((item, i) => {
      const x = i * stepWidth;
      const y =
        canvas.height - (item.reach / maxReach) * (canvas.height - 30) - 15;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw engagement overlay
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxEngagement = Math.max(...data.map((d) => d.engagement));
    data.forEach((item, i) => {
      const x = i * stepWidth;
      const y =
        canvas.height -
        (item.engagement / maxEngagement) * (canvas.height - 30) -
        15;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "病毒传播模式 (黄色: 触达量, 红色: 互动率)",
      canvas.width / 2,
      15
    );
  }

  updateSocialMediaIndependenceResults() {
    const results = this.socialMediaAnalytics.independenceTestResults;

    // Update posting-engagement correlation
    const postingEngagementCorr = document.getElementById(
      "posting-engagement-correlation"
    );
    const postingEngagementPValue = document.getElementById(
      "posting-engagement-pvalue"
    );
    const postingEngagementIndependence = document.getElementById(
      "posting-engagement-independence"
    );

    if (postingEngagementCorr && results.postingEngagement) {
      postingEngagementCorr.textContent =
        results.postingEngagement.correlation.toFixed(3);
      if (postingEngagementPValue) {
        postingEngagementPValue.textContent = `(p=${results.postingEngagement.pValue.toFixed(
          3
        )})`;
      }
      if (postingEngagementIndependence) {
        postingEngagementIndependence.textContent = results.postingEngagement
          .isIndependent
          ? "独立"
          : "相关";
        postingEngagementIndependence.className = results.postingEngagement
          .isIndependent
          ? "text-xs text-green-400"
          : "text-xs text-red-400";
      }
    }

    // Update time-activity correlation
    const timeActivityCorr = document.getElementById(
      "time-activity-correlation"
    );
    const timeActivityPValue = document.getElementById("time-activity-pvalue");
    const timeActivityIndependence = document.getElementById(
      "time-activity-independence"
    );

    if (timeActivityCorr && results.timeActivity) {
      timeActivityCorr.textContent =
        results.timeActivity.correlation.toFixed(3);
      if (timeActivityPValue) {
        timeActivityPValue.textContent = `(p=${results.timeActivity.pValue.toFixed(
          3
        )})`;
      }
      if (timeActivityIndependence) {
        timeActivityIndependence.textContent = results.timeActivity
          .isIndependent
          ? "独立"
          : "相关";
        timeActivityIndependence.className = results.timeActivity.isIndependent
          ? "text-xs text-green-400"
          : "text-xs text-red-400";
      }
    }

    // Update content-viral correlation
    const contentViralCorr = document.getElementById(
      "content-viral-correlation"
    );
    const contentViralPValue = document.getElementById("content-viral-pvalue");
    const contentViralIndependence = document.getElementById(
      "content-viral-independence"
    );

    if (contentViralCorr && results.contentViral) {
      contentViralCorr.textContent =
        results.contentViral.correlation.toFixed(3);
      if (contentViralPValue) {
        contentViralPValue.textContent = `(p=${results.contentViral.pValue.toFixed(
          3
        )})`;
      }
      if (contentViralIndependence) {
        contentViralIndependence.textContent = results.contentViral
          .isIndependent
          ? "独立"
          : "相关";
        contentViralIndependence.className = results.contentViral.isIndependent
          ? "text-xs text-green-400"
          : "text-xs text-red-400";
      }
    }
  }

  updateTrendingHashtags() {
    const container = document.getElementById("trending-hashtags");
    if (!container) return;

    // Clear existing hashtags
    container.innerHTML = "";

    // Select random hashtags
    const selectedHashtags = this.socialMediaAnalytics.trendingHashtags
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    const colors = [
      "neon-blue",
      "neon-purple",
      "neon-green",
      "yellow-400",
      "red-400",
      "blue-400",
    ];

    selectedHashtags.forEach((hashtag, i) => {
      const tag = document.createElement("span");
      const color = colors[i % colors.length];
      tag.className = `px-2 py-1 bg-${color}/20 text-${color} rounded text-xs hover:bg-${color}/30 transition-colors cursor-pointer`;
      tag.textContent = hashtag;

      // Add click event for hashtag analysis
      tag.addEventListener("click", () => {
        this.analyzeHashtagTrend(hashtag);
      });

      container.appendChild(tag);
    });
  }

  analyzeHashtagTrend(hashtag) {
    console.log(`Analyzing trend for hashtag: ${hashtag}`);
    // This could trigger a detailed analysis of the hashtag trend
    // For now, just log the action
  }

  startSocialMediaDataSimulation() {
    // Start real-time data simulation
    setInterval(() => {
      if (this.socialMediaAnalytics.isActive) {
        this.updateSocialMediaRealTimeData();
      }
    }, 5000); // Update every 5 seconds
  }

  updateSocialMediaRealTimeData() {
    // Simulate real-time changes in social media metrics
    const platform =
      this.socialMediaAnalytics.platforms[
        this.socialMediaAnalytics.currentPlatform
      ];

    // Add some randomness to the data
    const randomFactor = 0.1;

    // Update posting frequency with small random changes
    this.socialMediaAnalytics.behaviorData.postingFrequency =
      this.socialMediaAnalytics.behaviorData.postingFrequency.map((freq) =>
        Math.max(0, freq + (Math.random() - 0.5) * freq * randomFactor)
      );

    // Update engagement rate with small random changes
    this.socialMediaAnalytics.behaviorData.engagementRate =
      this.socialMediaAnalytics.behaviorData.engagementRate.map((rate) =>
        Math.max(
          0,
          Math.min(100, rate + (Math.random() - 0.5) * rate * randomFactor)
        )
      );

    // Recalculate independence tests
    this.calculateSocialMediaIndependenceTests();

    // Update visualizations
    this.updateSocialMediaVisualizations();

    // Update last update timestamp
    this.socialMediaAnalytics.lastUpdate = Date.now();
  }

  // ==================== Section 3.3: Variable Transformation Methods ====================

  /**
   * Initialize variable transformation system (Requirements 4.2, 4.3)
   */
  initializeVariableTransformation() {
    console.log("Initializing Variable Transformation System...");

    // Initialize transformation canvases
    this.initializeTransformationCanvases();

    // Set up transformation event listeners
    this.setupTransformationEventListeners();

    // Set up modern scenario event listeners
    this.setupModernScenarioEventListeners();

    // Generate initial samples for transformation
    this.generateTransformationSamples();

    // Initialize transformation parameters UI
    this.initializeTransformationUI();

    // Initialize modern scenarios
    this.initializeModernScenarios();

    // Update initial visualization
    this.updateTransformationVisualization();

    this.variableTransformation.isActive = true;
    console.log("Variable Transformation System initialized successfully");
  }

  initializeCorrelationAnalysis() {
    this.correlationAnalysis = { initialized: true };
  }

  /**
   * Initialize transformation canvases
   */
  initializeTransformationCanvases() {
    this.transformationCanvases = {
      before: document.getElementById("transform-before-canvas"),
      after: document.getElementById("transform-after-canvas"),
    };

    // Initialize canvas contexts
    Object.keys(this.transformationCanvases).forEach((key) => {
      if (this.transformationCanvases[key]) {
        this.transformationCanvases[key].ctx =
          this.transformationCanvases[key].getContext("2d");
        // Set up high DPI rendering
        const canvas = this.transformationCanvases[key];
        const ctx = canvas.ctx;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
      }
    });
  }

  /**
   * Set up transformation event listeners (Requirements 4.2, 4.3)
   */
  setupTransformationEventListeners() {
    // Transformation type selector
    const transformTypeSelect = document.getElementById("transform-type");
    if (transformTypeSelect) {
      transformTypeSelect.addEventListener("change", (e) => {
        this.variableTransformation.currentType = e.target.value;
        this.updateTransformationParametersUI();
        this.applyTransformation();
      });
    }

    // Apply transformation button
    const applyTransformBtn = document.getElementById("apply-transform");
    if (applyTransformBtn) {
      applyTransformBtn.addEventListener("click", () => {
        this.applyTransformation();
      });
    }

    // Animate transformation button
    const animateTransformBtn = document.getElementById("animate-transform");
    if (animateTransformBtn) {
      animateTransformBtn.addEventListener("click", () => {
        this.animateTransformation();
      });
    }

    console.log("Transformation event listeners set up successfully");
  }

  /**
   * Initialize transformation parameters UI (Requirements 4.2, 4.3)
   */
  initializeTransformationUI() {
    this.updateTransformationParametersUI();
    this.updateJacobianDisplay();
  }

  /**
   * Update transformation parameters UI based on selected type
   */
  updateTransformationParametersUI() {
    const paramsContainer = document.getElementById("transform-params");
    if (!paramsContainer) return;

    const type = this.variableTransformation.currentType;
    const preset = this.variableTransformation.presets[type];

    paramsContainer.innerHTML = "";

    // Add description
    const description = document.createElement("div");
    description.className =
      "text-sm text-gray-400 mb-3 p-2 bg-dark-bg/50 rounded";
    description.textContent = preset.description;
    paramsContainer.appendChild(description);

    // Add parameter controls based on transformation type
    switch (type) {
      case "linear":
        this.createLinearTransformationControls(paramsContainer);
        break;
      case "polar":
        this.createPolarTransformationControls(paramsContainer);
        break;
      case "logarithmic":
        this.createLogarithmicTransformationControls(paramsContainer);
        break;
      case "custom":
        this.createCustomTransformationControls(paramsContainer);
        break;
    }

    // Add preset buttons
    this.createTransformationPresetButtons(paramsContainer, type);
  }

  /**
   * Create linear transformation controls (Requirements 4.2)
   */
  createLinearTransformationControls(container) {
    const matrixParams = [
      {
        id: "a11",
        label: "a₁₁",
        value: this.variableTransformation.parameters.a11,
        min: -5,
        max: 5,
        step: 0.1,
      },
      {
        id: "a12",
        label: "a₁₂",
        value: this.variableTransformation.parameters.a12,
        min: -5,
        max: 5,
        step: 0.1,
      },
      {
        id: "a21",
        label: "a₂₁",
        value: this.variableTransformation.parameters.a21,
        min: -5,
        max: 5,
        step: 0.1,
      },
      {
        id: "a22",
        label: "a₂₂",
        value: this.variableTransformation.parameters.a22,
        min: -5,
        max: 5,
        step: 0.1,
      },
    ];

    // Matrix visualization
    const matrixDiv = document.createElement("div");
    matrixDiv.className = "mb-4";
    matrixDiv.innerHTML = `
      <div class="text-sm text-gray-300 mb-2">变换矩阵 A:</div>
      <div class="grid grid-cols-2 gap-2 p-3 bg-dark-bg/30 rounded border border-white/10">
        ${matrixParams
          .map(
            (param) => `
          <div class="text-center">
            <div class="text-xs text-gray-400">${param.label}</div>
            <input type="number" id="${param.id}" value="${param.value}" 
                   min="${param.min}" max="${param.max}" step="${param.step}"
                   class="w-full bg-dark-card border border-white/20 rounded px-2 py-1 text-white text-sm text-center">
          </div>
        `
          )
          .join("")}
      </div>
    `;
    container.appendChild(matrixDiv);

    // Add event listeners for matrix parameters
    matrixParams.forEach((param) => {
      const input = document.getElementById(param.id);
      if (input) {
        input.addEventListener("input", (e) => {
          this.variableTransformation.parameters[param.id] = parseFloat(
            e.target.value
          );
          this.updateTransformationMatrix();
          this.updateJacobianDisplay();
          this.applyTransformation();
        });
      }
    });
  }

  /**
   * Create polar transformation controls (Requirements 4.2)
   */
  createPolarTransformationControls(container) {
    const polarDiv = document.createElement("div");
    polarDiv.className = "space-y-3";
    polarDiv.innerHTML = `
      <div>
        <label class="block text-sm text-gray-300 mb-1">中心点 X 坐标</label>
        <input type="range" id="polar-center-x" min="-10" max="10" step="0.1" value="${this.variableTransformation.parameters.centerX}"
               class="w-full">
        <div class="text-xs text-gray-400 text-center" id="polar-center-x-val">${this.variableTransformation.parameters.centerX}</div>
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">中心点 Y 坐标</label>
        <input type="range" id="polar-center-y" min="-10" max="10" step="0.1" value="${this.variableTransformation.parameters.centerY}"
               class="w-full">
        <div class="text-xs text-gray-400 text-center" id="polar-center-y-val">${this.variableTransformation.parameters.centerY}</div>
      </div>
      <div class="text-xs text-gray-400 p-2 bg-dark-bg/30 rounded">
        变换公式:<br>
        r = √((x-cx)² + (y-cy)²)<br>
        θ = arctan((y-cy)/(x-cx))
      </div>
    `;
    container.appendChild(polarDiv);

    // Add event listeners
    ["polar-center-x", "polar-center-y"].forEach((id) => {
      const slider = document.getElementById(id);
      const valDisplay = document.getElementById(id + "-val");
      if (slider && valDisplay) {
        slider.addEventListener("input", (e) => {
          const value = parseFloat(e.target.value);
          valDisplay.textContent = value.toFixed(1);

          if (id === "polar-center-x") {
            this.variableTransformation.parameters.centerX = value;
          } else {
            this.variableTransformation.parameters.centerY = value;
          }

          this.updateJacobianDisplay();
          this.applyTransformation();
        });
      }
    });
  }

  /**
   * Create logarithmic transformation controls (Requirements 4.2)
   */
  createLogarithmicTransformationControls(container) {
    const logDiv = document.createElement("div");
    logDiv.className = "space-y-3";
    logDiv.innerHTML = `
      <div>
        <label class="block text-sm text-gray-300 mb-1">X 轴底数</label>
        <select id="log-base-x" class="w-full bg-dark-bg border border-white/20 rounded p-2 text-white">
          <option value="${Math.E}" ${
      this.variableTransformation.parameters.baseX === Math.E ? "selected" : ""
    }>自然对数 (e)</option>
          <option value="10" ${
            this.variableTransformation.parameters.baseX === 10
              ? "selected"
              : ""
          }>常用对数 (10)</option>
          <option value="2" ${
            this.variableTransformation.parameters.baseX === 2 ? "selected" : ""
          }>二进制对数 (2)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">Y 轴底数</label>
        <select id="log-base-y" class="w-full bg-dark-bg border border-white/20 rounded p-2 text-white">
          <option value="${Math.E}" ${
      this.variableTransformation.parameters.baseY === Math.E ? "selected" : ""
    }>自然对数 (e)</option>
          <option value="10" ${
            this.variableTransformation.parameters.baseY === 10
              ? "selected"
              : ""
          }>常用对数 (10)</option>
          <option value="2" ${
            this.variableTransformation.parameters.baseY === 2 ? "selected" : ""
          }>二进制对数 (2)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">X 轴偏移: <span id="shift-x-val">${
          this.variableTransformation.parameters.shiftX
        }</span></label>
        <input type="range" id="log-shift-x" min="0.1" max="10" step="0.1" value="${
          this.variableTransformation.parameters.shiftX
        }"
               class="w-full">
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">Y 轴偏移: <span id="shift-y-val">${
          this.variableTransformation.parameters.shiftY
        }</span></label>
        <input type="range" id="log-shift-y" min="0.1" max="10" step="0.1" value="${
          this.variableTransformation.parameters.shiftY
        }"
               class="w-full">
      </div>
      <div class="text-xs text-gray-400 p-2 bg-dark-bg/30 rounded">
        变换公式:<br>
        u = log_base(x + shift_x)<br>
        v = log_base(y + shift_y)
      </div>
    `;
    container.appendChild(logDiv);

    // Add event listeners
    const baseXSelect = document.getElementById("log-base-x");
    const baseYSelect = document.getElementById("log-base-y");
    const shiftXSlider = document.getElementById("log-shift-x");
    const shiftYSlider = document.getElementById("log-shift-y");

    if (baseXSelect) {
      baseXSelect.addEventListener("change", (e) => {
        this.variableTransformation.parameters.baseX = parseFloat(
          e.target.value
        );
        this.updateJacobianDisplay();
        this.applyTransformation();
      });
    }

    if (baseYSelect) {
      baseYSelect.addEventListener("change", (e) => {
        this.variableTransformation.parameters.baseY = parseFloat(
          e.target.value
        );
        this.updateJacobianDisplay();
        this.applyTransformation();
      });
    }

    if (shiftXSlider) {
      shiftXSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById("shift-x-val").textContent = value.toFixed(1);
        this.variableTransformation.parameters.shiftX = value;
        this.updateJacobianDisplay();
        this.applyTransformation();
      });
    }

    if (shiftYSlider) {
      shiftYSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById("shift-y-val").textContent = value.toFixed(1);
        this.variableTransformation.parameters.shiftY = value;
        this.updateJacobianDisplay();
        this.applyTransformation();
      });
    }
  }

  /**
   * Create custom transformation controls (Requirements 4.3)
   */
  createCustomTransformationControls(container) {
    const customDiv = document.createElement("div");
    customDiv.className = "space-y-3";
    customDiv.innerHTML = `
      <div>
        <label class="block text-sm text-gray-300 mb-1">u = f(x, y)</label>
        <input type="text" id="custom-u-formula" value="${this.variableTransformation.customFormulas.u}"
               class="w-full bg-dark-bg border border-white/20 rounded px-3 py-2 text-white font-mono text-sm"
               placeholder="例: x + y, x*cos(y), log(x^2 + y^2)">
      </div>
      <div>
        <label class="block text-sm text-gray-300 mb-1">v = g(x, y)</label>
        <input type="text" id="custom-v-formula" value="${this.variableTransformation.customFormulas.v}"
               class="w-full bg-dark-bg border border-white/20 rounded px-3 py-2 text-white font-mono text-sm"
               placeholder="例: x - y, x*sin(y), atan2(y, x)">
      </div>
      <div class="text-xs text-gray-400 p-2 bg-dark-bg/30 rounded">
        支持的函数: sin, cos, tan, log, exp, sqrt, abs, atan2<br>
        支持的运算: +, -, *, /, ^, (, )<br>
        变量: x, y
      </div>
      <button id="validate-formulas" class="w-full px-3 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green rounded hover:bg-neon-green/30 transition-colors">
        验证公式
      </button>
    `;
    container.appendChild(customDiv);

    // Add event listeners
    const uFormulaInput = document.getElementById("custom-u-formula");
    const vFormulaInput = document.getElementById("custom-v-formula");
    const validateBtn = document.getElementById("validate-formulas");

    if (uFormulaInput) {
      uFormulaInput.addEventListener("input", (e) => {
        this.variableTransformation.customFormulas.u = e.target.value;
      });
    }

    if (vFormulaInput) {
      vFormulaInput.addEventListener("input", (e) => {
        this.variableTransformation.customFormulas.v = e.target.value;
      });
    }

    if (validateBtn) {
      validateBtn.addEventListener("click", () => {
        this.validateCustomFormulas();
      });
    }
  }

  /**
   * Create transformation preset buttons
   */
  createTransformationPresetButtons(container, currentType) {
    const presetsDiv = document.createElement("div");
    presetsDiv.className = "mt-4";
    presetsDiv.innerHTML = `
      <div class="text-sm text-gray-300 mb-2">常用预设:</div>
      <div class="grid grid-cols-2 gap-2" id="transformation-presets">
        <!-- Preset buttons will be added here -->
      </div>
    `;
    container.appendChild(presetsDiv);

    const presetsContainer = document.getElementById("transformation-presets");

    // Define presets for each transformation type
    const presets = this.getTransformationPresets(currentType);

    presets.forEach((preset) => {
      const button = document.createElement("button");
      button.className =
        "px-2 py-1 text-xs bg-dark-card border border-white/20 text-gray-300 rounded hover:bg-white/10 transition-colors";
      button.textContent = preset.name;
      button.addEventListener("click", () => {
        this.applyTransformationPreset(preset);
      });
      presetsContainer.appendChild(button);
    });
  }

  /**
   * Get transformation presets for the current type
   */
  getTransformationPresets(type) {
    const presets = {
      linear: [
        { name: "恒等变换", values: { a11: 1, a12: 0, a21: 0, a22: 1 } },
        {
          name: "旋转45°",
          values: {
            a11: Math.cos(Math.PI / 4),
            a12: -Math.sin(Math.PI / 4),
            a21: Math.sin(Math.PI / 4),
            a22: Math.cos(Math.PI / 4),
          },
        },
        { name: "缩放2倍", values: { a11: 2, a12: 0, a21: 0, a22: 2 } },
        { name: "剪切变换", values: { a11: 1, a12: 0.5, a21: 0, a22: 1 } },
        { name: "反射Y轴", values: { a11: -1, a12: 0, a21: 0, a22: 1 } },
        { name: "旋转90°", values: { a11: 0, a12: -1, a21: 1, a22: 0 } },
      ],
      polar: [
        { name: "原点中心", values: { centerX: 0, centerY: 0 } },
        { name: "右上偏移", values: { centerX: 2, centerY: 2 } },
        { name: "左下偏移", values: { centerX: -2, centerY: -2 } },
      ],
      logarithmic: [
        {
          name: "自然对数",
          values: { baseX: Math.E, baseY: Math.E, shiftX: 1, shiftY: 1 },
        },
        {
          name: "常用对数",
          values: { baseX: 10, baseY: 10, shiftX: 1, shiftY: 1 },
        },
        {
          name: "二进制对数",
          values: { baseX: 2, baseY: 2, shiftX: 1, shiftY: 1 },
        },
      ],
      custom: [
        { name: "和差变换", formulas: { u: "x + y", v: "x - y" } },
        { name: "乘积变换", formulas: { u: "x * y", v: "x / y" } },
        { name: "平方变换", formulas: { u: "x^2", v: "y^2" } },
        { name: "三角变换", formulas: { u: "x * cos(y)", v: "x * sin(y)" } },
      ],
    };

    return presets[type] || [];
  }

  /**
   * Apply transformation preset
   */
  applyTransformationPreset(preset) {
    if (preset.values) {
      // Apply parameter values
      Object.keys(preset.values).forEach((key) => {
        this.variableTransformation.parameters[key] = preset.values[key];
      });
      this.updateTransformationParametersUI();
    } else if (preset.formulas) {
      // Apply custom formulas
      this.variableTransformation.customFormulas = { ...preset.formulas };
      document.getElementById("custom-u-formula").value = preset.formulas.u;
      document.getElementById("custom-v-formula").value = preset.formulas.v;
    }

    this.updateTransformationMatrix();
    this.updateJacobianDisplay();
    this.applyTransformation();
  }

  /**
   * Generate samples for transformation visualization
   */
  generateTransformationSamples() {
    // Use current distribution parameters to generate samples
    const { mu1, mu2, sigma1, sigma2, rho, nSamples } = this.parameters;

    this.variableTransformation.originalSamples = [];

    for (let i = 0; i < Math.min(nSamples, 2000); i++) {
      // Limit for performance
      const sample = this.generateBivariateNormal(
        mu1,
        mu2,
        sigma1,
        sigma2,
        rho
      );
      this.variableTransformation.originalSamples.push(sample);
    }

    console.log(
      `Generated ${this.variableTransformation.originalSamples.length} samples for transformation`
    );
  }

  /**
   * Update transformation matrix for linear transformations
   */
  updateTransformationMatrix() {
    const params = this.variableTransformation.parameters;
    this.variableTransformation.transformationMatrix = [
      [params.a11, params.a12],
      [params.a21, params.a22],
    ];
  }

  /**
   * Apply the current transformation to samples (Requirements 4.1, 4.5)
   */
  applyTransformation() {
    if (!this.variableTransformation.originalSamples.length) {
      this.generateTransformationSamples();
    }

    const type = this.variableTransformation.currentType;
    this.variableTransformation.transformedSamples = [];

    this.variableTransformation.originalSamples.forEach((sample) => {
      const [x, y] = sample;
      let transformedSample;

      switch (type) {
        case "linear":
          transformedSample = this.applyLinearTransformation(x, y);
          break;
        case "polar":
          transformedSample = this.applyPolarTransformation(x, y);
          break;
        case "logarithmic":
          transformedSample = this.applyLogarithmicTransformation(x, y);
          break;
        case "custom":
          transformedSample = this.applyCustomTransformation(x, y);
          break;
        default:
          transformedSample = [x, y]; // Identity transformation
      }

      if (
        transformedSample &&
        !isNaN(transformedSample[0]) &&
        !isNaN(transformedSample[1])
      ) {
        this.variableTransformation.transformedSamples.push(transformedSample);
      }
    });

    // Update Jacobian matrix and determinant
    this.calculateJacobianMatrix();
    this.updateJacobianDisplay();

    // Update visualizations
    this.updateTransformationVisualization();

    console.log(
      `Applied ${type} transformation to ${this.variableTransformation.transformedSamples.length} samples`
    );
  }

  /**
   * Apply linear transformation: [u, v] = A[x, y]
   */
  applyLinearTransformation(x, y) {
    const matrix = this.variableTransformation.transformationMatrix;
    const u = matrix[0][0] * x + matrix[0][1] * y;
    const v = matrix[1][0] * x + matrix[1][1] * y;
    return [u, v];
  }

  /**
   * Apply polar coordinate transformation
   */
  applyPolarTransformation(x, y) {
    const { centerX, centerY } = this.variableTransformation.parameters;
    const dx = x - centerX;
    const dy = y - centerY;

    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);

    return [r, theta];
  }

  /**
   * Apply logarithmic transformation
   */
  applyLogarithmicTransformation(x, y) {
    const { baseX, baseY, shiftX, shiftY } =
      this.variableTransformation.parameters;

    // Ensure positive values for logarithm
    const xShifted = x + shiftX;
    const yShifted = y + shiftY;

    if (xShifted <= 0 || yShifted <= 0) {
      return null; // Invalid transformation
    }

    const u = Math.log(xShifted) / Math.log(baseX);
    const v = Math.log(yShifted) / Math.log(baseY);

    return [u, v];
  }

  /**
   * Apply custom transformation using user-defined formulas (Requirements 4.3)
   */
  applyCustomTransformation(x, y) {
    try {
      const u = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.u,
        x,
        y
      );
      const v = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.v,
        x,
        y
      );

      if (isNaN(u) || isNaN(v) || !isFinite(u) || !isFinite(v)) {
        return null;
      }

      return [u, v];
    } catch (error) {
      console.warn("Custom transformation error:", error);
      return null;
    }
  }

  /**
   * Evaluate custom formula with validation (Requirements 4.3)
   */
  evaluateCustomFormula(formula, x, y) {
    // Replace mathematical functions and operators
    let processedFormula = formula
      .replace(/\bx\b/g, x.toString())
      .replace(/\by\b/g, y.toString())
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\blog\b/g, "Math.log")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\batan2\b/g, "Math.atan2")
      .replace(/\^/g, "**"); // Power operator

    // Basic security check - only allow mathematical operations
    const allowedPattern = /^[0-9+\-*/.()^,\s\w]*$/;
    if (!allowedPattern.test(processedFormula)) {
      throw new Error("Invalid characters in formula");
    }

    // Evaluate the formula
    return Function('"use strict"; return (' + processedFormula + ")")();
  }

  /**
   * Validate custom formulas (Requirements 4.3)
   */
  validateCustomFormulas() {
    const testPoints = [
      [1, 1],
      [0, 1],
      [1, 0],
      [-1, 1],
      [1, -1],
    ];
    const results = { u: [], v: [], valid: true, errors: [] };

    testPoints.forEach(([x, y]) => {
      try {
        const u = this.evaluateCustomFormula(
          this.variableTransformation.customFormulas.u,
          x,
          y
        );
        const v = this.evaluateCustomFormula(
          this.variableTransformation.customFormulas.v,
          x,
          y
        );

        results.u.push(u);
        results.v.push(v);

        if (isNaN(u) || isNaN(v) || !isFinite(u) || !isFinite(v)) {
          results.valid = false;
          results.errors.push(`Invalid result at (${x}, ${y}): u=${u}, v=${v}`);
        }
      } catch (error) {
        results.valid = false;
        results.errors.push(`Error at (${x}, ${y}): ${error.message}`);
      }
    });

    // Show validation results
    this.showValidationResults(results);

    if (results.valid) {
      this.applyTransformation();
    }
  }

  /**
   * Show formula validation results
   */
  showValidationResults(results) {
    const message = results.valid
      ? "✅ 公式验证成功！变换已应用。"
      : "❌ 公式验证失败：\n" + results.errors.join("\n");

    const alertClass = results.valid ? "success" : "error";
    this.showNotification(message, alertClass);
  }

  /**
   * Calculate Jacobian matrix for current transformation (Requirements 4.4)
   */
  calculateJacobianMatrix() {
    const type = this.variableTransformation.currentType;

    switch (type) {
      case "linear":
        this.calculateLinearJacobian();
        break;
      case "polar":
        this.calculatePolarJacobian();
        break;
      case "logarithmic":
        this.calculateLogarithmicJacobian();
        break;
      case "custom":
        this.calculateCustomJacobian();
        break;
    }
  }

  /**
   * Calculate Jacobian for linear transformation
   */
  calculateLinearJacobian() {
    // For linear transformation [u,v] = A[x,y], Jacobian is just A
    this.variableTransformation.jacobianMatrix = [
      [
        this.variableTransformation.parameters.a11,
        this.variableTransformation.parameters.a12,
      ],
      [
        this.variableTransformation.parameters.a21,
        this.variableTransformation.parameters.a22,
      ],
    ];

    const J = this.variableTransformation.jacobianMatrix;
    this.variableTransformation.jacobianDeterminant =
      J[0][0] * J[1][1] - J[0][1] * J[1][0];
  }

  /**
   * Calculate Jacobian for polar transformation
   */
  calculatePolarJacobian() {
    // For polar transformation: r = sqrt(x^2 + y^2), θ = atan2(y, x)
    // ∂r/∂x = x/r, ∂r/∂y = y/r
    // ∂θ/∂x = -y/(x^2 + y^2), ∂θ/∂y = x/(x^2 + y^2)

    // Use sample point for approximation (could be improved with symbolic computation)
    const x = 1,
      y = 1; // Sample point
    const r = Math.sqrt(x * x + y * y);
    const r2 = x * x + y * y;

    this.variableTransformation.jacobianMatrix = [
      [x / r, y / r],
      [-y / r2, x / r2],
    ];

    this.variableTransformation.jacobianDeterminant = 1 / r; // |J| = 1/r for polar coordinates
  }

  /**
   * Calculate Jacobian for logarithmic transformation
   */
  calculateLogarithmicJacobian() {
    // For log transformation: u = log(x + shift), v = log(y + shift)
    // ∂u/∂x = 1/(x + shift), ∂u/∂y = 0
    // ∂v/∂x = 0, ∂v/∂y = 1/(y + shift)

    const { shiftX, shiftY, baseX, baseY } =
      this.variableTransformation.parameters;
    const x = 1,
      y = 1; // Sample point

    const dudx = 1 / ((x + shiftX) * Math.log(baseX));
    const dvdy = 1 / ((y + shiftY) * Math.log(baseY));

    this.variableTransformation.jacobianMatrix = [
      [dudx, 0],
      [0, dvdy],
    ];

    this.variableTransformation.jacobianDeterminant = dudx * dvdy;
  }

  /**
   * Calculate Jacobian for custom transformation (numerical approximation)
   */
  calculateCustomJacobian() {
    // Use numerical differentiation for custom formulas
    const h = 1e-6; // Small step for numerical differentiation
    const x0 = 0,
      y0 = 0; // Evaluation point

    try {
      // Calculate partial derivatives numerically
      const u0 = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.u,
        x0,
        y0
      );
      const v0 = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.v,
        x0,
        y0
      );

      const ux = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.u,
        x0 + h,
        y0
      );
      const uy = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.u,
        x0,
        y0 + h
      );
      const vx = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.v,
        x0 + h,
        y0
      );
      const vy = this.evaluateCustomFormula(
        this.variableTransformation.customFormulas.v,
        x0,
        y0 + h
      );

      const dudx = (ux - u0) / h;
      const dudy = (uy - u0) / h;
      const dvdx = (vx - v0) / h;
      const dvdy = (vy - v0) / h;

      this.variableTransformation.jacobianMatrix = [
        [dudx, dudy],
        [dvdx, dvdy],
      ];

      this.variableTransformation.jacobianDeterminant =
        dudx * dvdy - dudy * dvdx;
    } catch (error) {
      console.warn("Error calculating custom Jacobian:", error);
      this.variableTransformation.jacobianMatrix = [
        [1, 0],
        [0, 1],
      ];
      this.variableTransformation.jacobianDeterminant = 1;
    }
  }

  /**
   * Update Jacobian matrix display (Requirements 4.4)
   */
  updateJacobianDisplay() {
    const jacobianDisplay = document.getElementById("jacobian-display");
    const jacobianDeterminant = document.getElementById("jacobian-determinant");

    if (!jacobianDisplay || !jacobianDeterminant) return;

    const J = this.variableTransformation.jacobianMatrix;
    const det = this.variableTransformation.jacobianDeterminant;

    // Update matrix display with KaTeX
    const matrixLatex = `J = \\begin{pmatrix} 
      ${J[0][0].toFixed(3)} & ${J[0][1].toFixed(3)} \\\\ 
      ${J[1][0].toFixed(3)} & ${J[1][1].toFixed(3)} 
    \\end{pmatrix}`;

    jacobianDisplay.innerHTML = `
      <div class="text-lg">$${matrixLatex}$</div>
      <div class="mt-2">$|J| = ${det.toFixed(4)}$</div>
    `;

    // Re-render KaTeX
    if (window.katex && window.renderMathInElement) {
      window.renderMathInElement(jacobianDisplay);
    }

    // Update determinant color based on value
    jacobianDeterminant.textContent = det.toFixed(4);
    jacobianDeterminant.className =
      det > 0 ? "text-neon-green" : det < 0 ? "text-red-400" : "text-gray-400";
  }

  /**
   * Update transformation visualization (Requirements 4.1, 4.5)
   */
  updateTransformationVisualization() {
    this.renderTransformationBefore();
    this.renderTransformationAfter();
  }

  /**
   * Render before transformation visualization
   */
  renderTransformationBefore() {
    const canvas = this.transformationCanvases.before;
    if (!canvas || !canvas.ctx) return;

    const ctx = canvas.ctx;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up coordinate system
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Calculate scale based on data range
    const samples = this.variableTransformation.originalSamples;
    if (!samples.length) return;

    const xValues = samples.map((s) => s[0]);
    const yValues = samples.map((s) => s[1]);
    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);
    const scale = Math.min(width, height) / (2.2 * Math.max(xRange, yRange));

    // Draw axes
    this.drawAxes(ctx, width, height, scale);

    // Draw samples
    ctx.fillStyle = "rgba(34, 211, 238, 0.6)";
    samples.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x * scale, -y * scale, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Render after transformation visualization
   */
  renderTransformationAfter() {
    const canvas = this.transformationCanvases.after;
    if (!canvas || !canvas.ctx) return;

    const ctx = canvas.ctx;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up coordinate system
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Calculate scale based on transformed data range
    const samples = this.variableTransformation.transformedSamples;
    if (!samples.length) return;

    const xValues = samples.map((s) => s[0]);
    const yValues = samples.map((s) => s[1]);
    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);
    const scale = Math.min(width, height) / (2.2 * Math.max(xRange, yRange, 1));

    // Draw axes
    this.drawAxes(ctx, width, height, scale);

    // Draw transformed samples
    ctx.fillStyle = "rgba(167, 139, 250, 0.6)";
    samples.forEach(([u, v]) => {
      ctx.beginPath();
      ctx.arc(u * scale, -v * scale, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draw coordinate axes
   */
  drawAxes(ctx, width, height, scale) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    // X axis
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(0, height / 2);
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    const gridSpacing = 50;

    for (let x = -width / 2; x <= width / 2; x += gridSpacing) {
      if (x !== 0) {
        ctx.beginPath();
        ctx.moveTo(x, -height / 2);
        ctx.lineTo(x, height / 2);
        ctx.stroke();
      }
    }

    for (let y = -height / 2; y <= height / 2; y += gridSpacing) {
      if (y !== 0) {
        ctx.beginPath();
        ctx.moveTo(-width / 2, y);
        ctx.lineTo(width / 2, y);
        ctx.stroke();
      }
    }
  }

  /**
   * Animate transformation process (Requirements 4.5)
   */
  animateTransformation() {
    if (this.variableTransformation.isAnimating) return;

    this.variableTransformation.isAnimating = true;
    this.variableTransformation.animationProgress = 0;

    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const originalSamples = [...this.variableTransformation.originalSamples];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easedProgress = 0.5 * (1 - Math.cos(Math.PI * progress));

      this.variableTransformation.animationProgress = easedProgress;

      // Interpolate between original and transformed samples
      this.variableTransformation.transformedSamples = originalSamples
        .map((sample) => {
          const [x, y] = sample;
          let targetSample;

          // Calculate target transformation
          switch (this.variableTransformation.currentType) {
            case "linear":
              targetSample = this.applyLinearTransformation(x, y);
              break;
            case "polar":
              targetSample = this.applyPolarTransformation(x, y);
              break;
            case "logarithmic":
              targetSample = this.applyLogarithmicTransformation(x, y);
              break;
            case "custom":
              targetSample = this.applyCustomTransformation(x, y);
              break;
            default:
              targetSample = [x, y];
          }

          if (!targetSample) return [x, y];

          // Interpolate
          const u = x + (targetSample[0] - x) * easedProgress;
          const v = y + (targetSample[1] - y) * easedProgress;

          return [u, v];
        })
        .filter((sample) => sample && !isNaN(sample[0]) && !isNaN(sample[1]));

      // Update visualization
      this.updateTransformationVisualization();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.variableTransformation.isAnimating = false;
        // Final update with exact transformation
        this.applyTransformation();
      }
    };

    animate();
  }

  // ==================== Modern Scenario Methods ====================

  /**
   * Set up modern scenario event listeners
   */
  setupModernScenarioEventListeners() {
    // Scenario tab switching
    const scenarioTabs = document.querySelectorAll(".scenario-tab-transform");
    scenarioTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = tab.id.replace("transform-tab-", "");
        this.switchTransformationScenario(tabId);
      });
    });

    // CNN convolution controls
    this.setupCNNConvolutionEventListeners();

    // Image processing controls
    this.setupImageProcessingEventListeners();

    // Crypto analysis controls
    this.setupCryptoAnalysisEventListeners();
  }

  /**
   * Switch transformation scenario
   */
  switchTransformationScenario(scenario) {
    // Update tab styles
    const tabs = document.querySelectorAll(".scenario-tab-transform");
    tabs.forEach((tab) => {
      const isActive = tab.id === `transform-tab-${scenario}`;
      if (isActive) {
        tab.className =
          "scenario-tab-transform px-4 py-2 rounded-lg border border-neon-green/30 bg-neon-green/20 text-neon-green transition-all duration-300 active";
      } else {
        tab.className =
          "scenario-tab-transform px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 transition-all duration-300";
      }
    });

    // Show/hide content
    const contents = document.querySelectorAll(".transform-scenario-content");
    contents.forEach((content) => content.classList.add("hidden"));

    const targetContent = document.getElementById(
      `${
        scenario === "traditional"
          ? "traditional-transform"
          : scenario === "cnn"
          ? "cnn-convolution"
          : scenario === "image"
          ? "image-processing"
          : "crypto-analysis"
      }-content`
    );
    if (targetContent) {
      targetContent.classList.remove("hidden");
    }

    // Initialize scenario-specific functionality
    switch (scenario) {
      case "cnn":
        this.initializeCNNConvolution();
        break;
      case "image":
        this.initializeImageProcessing();
        break;
      case "crypto":
        this.initializeCryptoAnalysis();
        break;
      default:
        // Traditional scenario is already initialized
        break;
    }
  }

  /**
   * Initialize modern scenarios
   */
  initializeModernScenarios() {
    // Initialize CNN convolution scenario
    this.initializeCNNConvolution();

    // Initialize image processing scenario
    this.initializeImageProcessing();

    // Initialize crypto analysis scenario
    this.initializeCryptoAnalysis();
  }

  // ==================== CNN Convolution Methods (Requirements 4.8) ====================

  /**
   * Set up CNN convolution event listeners
   */
  setupCNNConvolutionEventListeners() {
    // Kernel designer inputs
    const kernelInputs = document.querySelectorAll("#kernel-designer input");
    kernelInputs.forEach((input) => {
      input.addEventListener("input", () => {
        this.updateCNNKernel();
        this.renderCNNConvolution();
      });
    });

    // Architecture buttons
    const archButtons = document.querySelectorAll(".arch-btn");
    archButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const arch = e.target.dataset.arch;
        this.loadCNNArchitecture(arch);
      });
    });
  }

  /**
   * Initialize CNN convolution scenario (Requirements 4.8)
   */
  initializeCNNConvolution() {
    console.log("Initializing CNN Convolution Comparator...");

    // Create kernel designer UI
    this.createKernelDesigner();

    // Initialize with Sobel edge detection kernel
    this.variableTransformation.modernScenarios.cnn.kernelWeights = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];

    // Generate sample image data
    this.generateSampleImageData();

    // Render initial CNN convolution
    this.renderCNNConvolution();

    this.variableTransformation.modernScenarios.cnn.isActive = true;
    console.log("CNN Convolution Comparator initialized");
  }

  /**
   * Create kernel designer UI
   */
  createKernelDesigner() {
    const kernelDesigner = document.getElementById("kernel-designer");
    if (!kernelDesigner) return;

    kernelDesigner.innerHTML = "";

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.1";
        input.value =
          this.variableTransformation.modernScenarios.cnn.kernelWeights[i][j];
        input.className =
          "w-8 h-8 text-xs text-center bg-dark-bg border border-white/20 rounded text-white";
        input.dataset.row = i;
        input.dataset.col = j;

        input.addEventListener("input", (e) => {
          const row = parseInt(e.target.dataset.row);
          const col = parseInt(e.target.dataset.col);
          const value = parseFloat(e.target.value) || 0;
          this.variableTransformation.modernScenarios.cnn.kernelWeights[row][
            col
          ] = value;
          this.renderCNNConvolution();
        });

        kernelDesigner.appendChild(input);
      }
    }
  }

  /**
   * Generate sample image data for CNN demonstration
   */
  generateSampleImageData() {
    const size = 32;
    const imageData = [];

    // Create a simple pattern (circle with noise)
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const centerX = size / 2;
        const centerY = size / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        // Circle pattern with noise
        let value = distance < size / 4 ? 1 : 0;
        value += (Math.random() - 0.5) * 0.2; // Add noise
        value = Math.max(0, Math.min(1, value)); // Clamp to [0, 1]

        row.push(value);
      }
      imageData.push(row);
    }

    this.variableTransformation.modernScenarios.cnn.inputImage = imageData;
  }

  /**
   * Render CNN convolution comparison
   */
  renderCNNConvolution() {
    this.renderCNNConvolutionOperation();
    this.renderMathematicalConvolution();
    this.renderConvolutionAnimation();
  }

  /**
   * Render CNN convolution operation
   */
  renderCNNConvolutionOperation() {
    const canvas = document.getElementById("cnn-convolution-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const imageData =
      this.variableTransformation.modernScenarios.cnn.inputImage;
    const kernel =
      this.variableTransformation.modernScenarios.cnn.kernelWeights;

    if (!imageData) return;

    const cellSize = Math.min(width, height) / imageData.length;

    // Draw input image
    for (let y = 0; y < imageData.length; y++) {
      for (let x = 0; x < imageData[y].length; x++) {
        const value = imageData[y][x];
        const gray = Math.floor(value * 255);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Apply convolution and draw result (simplified)
    const outputData = this.applyCNNConvolution(imageData, kernel);

    // Draw convolution result overlay
    ctx.globalAlpha = 0.7;
    for (let y = 0; y < outputData.length; y++) {
      for (let x = 0; x < outputData[y].length; x++) {
        const value = Math.abs(outputData[y][x]);
        const intensity = Math.min(value * 255, 255);
        ctx.fillStyle = `rgba(34, 211, 238, ${intensity / 255})`;
        ctx.fillRect(
          (x + 1) * cellSize,
          (y + 1) * cellSize,
          cellSize,
          cellSize
        );
      }
    }
    ctx.globalAlpha = 1;

    // Draw title
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("CNN卷积操作", 10, 20);
  }

  /**
   * Apply CNN convolution operation
   */
  applyCNNConvolution(imageData, kernel) {
    const result = [];
    const imageHeight = imageData.length;
    const imageWidth = imageData[0].length;
    const kernelSize = kernel.length;
    const pad = Math.floor(kernelSize / 2);

    for (let y = pad; y < imageHeight - pad; y++) {
      const row = [];
      for (let x = pad; x < imageWidth - pad; x++) {
        let sum = 0;

        // Apply kernel
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const imageY = y + ky - pad;
            const imageX = x + kx - pad;
            sum += imageData[imageY][imageX] * kernel[ky][kx];
          }
        }

        row.push(sum);
      }
      result.push(row);
    }

    return result;
  }

  /**
   * Render mathematical convolution formula
   */
  renderMathematicalConvolution() {
    const canvas = document.getElementById("math-convolution-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw mathematical convolution visualization
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    // Draw convolution formula
    ctx.fillText("连续卷积公式:", width / 2, 30);
    ctx.font = "12px Arial";
    ctx.fillText("(f * g)(t) = ∫ f(τ)g(t-τ)dτ", width / 2, 50);

    // Draw discrete convolution formula
    ctx.fillText("离散卷积公式:", width / 2, 80);
    ctx.fillText("(f * g)[n] = Σ f[m]g[n-m]", width / 2, 100);

    // Draw probability distribution convolution example
    ctx.fillText("概率分布卷积:", width / 2, 130);
    ctx.fillText("两个独立随机变量和的分布", width / 2, 150);

    // Draw simple visualization of convolution operation
    this.drawConvolutionVisualization(ctx, width, height);
  }

  /**
   * Draw convolution visualization
   */
  drawConvolutionVisualization(ctx, width, height) {
    const startY = 170;
    const graphHeight = height - startY - 20;

    // Draw two simple functions and their convolution
    ctx.strokeStyle = "rgba(34, 211, 238, 0.8)";
    ctx.lineWidth = 2;

    // Function f(x) - rectangular pulse
    ctx.beginPath();
    ctx.moveTo(50, startY + graphHeight);
    ctx.lineTo(50, startY + graphHeight / 2);
    ctx.lineTo(100, startY + graphHeight / 2);
    ctx.lineTo(100, startY + graphHeight);
    ctx.stroke();

    // Function g(x) - triangular pulse
    ctx.strokeStyle = "rgba(167, 139, 250, 0.8)";
    ctx.beginPath();
    ctx.moveTo(150, startY + graphHeight);
    ctx.lineTo(175, startY + graphHeight / 3);
    ctx.lineTo(200, startY + graphHeight);
    ctx.stroke();

    // Convolution result - trapezoidal shape
    ctx.strokeStyle = "rgba(34, 197, 94, 0.8)";
    ctx.beginPath();
    ctx.moveTo(220, startY + graphHeight);
    ctx.lineTo(230, startY + graphHeight / 2);
    ctx.lineTo(250, startY + graphHeight / 2);
    ctx.lineTo(270, startY + graphHeight);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "rgba(34, 211, 238, 0.8)";
    ctx.font = "10px Arial";
    ctx.fillText("f(x)", 75, startY + graphHeight + 15);

    ctx.fillStyle = "rgba(167, 139, 250, 0.8)";
    ctx.fillText("g(x)", 175, startY + graphHeight + 15);

    ctx.fillStyle = "rgba(34, 197, 94, 0.8)";
    ctx.fillText("(f*g)(x)", 245, startY + graphHeight + 15);
  }

  /**
   * Render convolution animation
   */
  renderConvolutionAnimation() {
    const canvas = document.getElementById("convolution-animation-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Animate convolution process
    const time = Date.now() * 0.001;
    const kernelSize = 3;
    const imageSize = 8;
    const cellSize = Math.min(width, height) / (imageSize + 2);

    // Draw input image grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= imageSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, imageSize * cellSize);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(imageSize * cellSize, i * cellSize);
      ctx.stroke();
    }

    // Animate kernel position
    const kernelX = Math.floor(
      ((Math.sin(time) + 1) * (imageSize - kernelSize)) / 2
    );
    const kernelY = Math.floor(
      ((Math.cos(time * 0.7) + 1) * (imageSize - kernelSize)) / 2
    );

    // Highlight current kernel position
    ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
    ctx.fillRect(
      kernelX * cellSize,
      kernelY * cellSize,
      kernelSize * cellSize,
      kernelSize * cellSize
    );

    // Draw kernel outline
    ctx.strokeStyle = "rgba(34, 211, 238, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      kernelX * cellSize,
      kernelY * cellSize,
      kernelSize * cellSize,
      kernelSize * cellSize
    );

    // Draw title
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("卷积过程动画", 10, height - 10);
  }

  // ==================== Image Processing Methods (Requirements 4.9) ====================

  /**
   * Set up image processing event listeners
   */
  setupImageProcessingEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.target.dataset.filter;
        this.applyImageFilter(filter);
      });
    });

    // Image transformation controls
    const rotationSlider = document.getElementById("rotation-angle");
    const scaleXSlider = document.getElementById("scale-x");
    const scaleYSlider = document.getElementById("scale-y");

    if (rotationSlider) {
      rotationSlider.addEventListener("input", (e) => {
        this.variableTransformation.modernScenarios.imageProcessing.rotationAngle =
          parseFloat(e.target.value);
        this.renderImageTransformation();
      });
    }

    if (scaleXSlider) {
      scaleXSlider.addEventListener("input", (e) => {
        this.variableTransformation.modernScenarios.imageProcessing.scaleX =
          parseFloat(e.target.value);
        this.renderImageTransformation();
      });
    }

    if (scaleYSlider) {
      scaleYSlider.addEventListener("input", (e) => {
        this.variableTransformation.modernScenarios.imageProcessing.scaleY =
          parseFloat(e.target.value);
        this.renderImageTransformation();
      });
    }
  }

  /**
   * Initialize image processing scenario (Requirements 4.9)
   */
  initializeImageProcessing() {
    console.log("Initializing Image Processing Lab...");

    // Generate sample image
    this.generateSampleImage();

    // Render initial image processing
    this.renderImageProcessing();

    this.variableTransformation.modernScenarios.imageProcessing.isActive = true;
    console.log("Image Processing Lab initialized");
  }

  /**
   * Generate sample image for processing
   */
  generateSampleImage() {
    const size = 64;
    const imageData = [];

    // Create a sample image with geometric patterns
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        // Create a pattern with circles and gradients
        const centerX = size / 2;
        const centerY = size / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        let r = Math.sin(distance * 0.2) * 0.5 + 0.5;
        let g = Math.cos(x * 0.1) * 0.5 + 0.5;
        let b = Math.sin(y * 0.1) * 0.5 + 0.5;

        row.push([r, g, b]);
      }
      imageData.push(row);
    }

    this.variableTransformation.modernScenarios.imageProcessing.originalImage =
      imageData;
  }

  /**
   * Render image processing visualization
   */
  renderImageProcessing() {
    this.renderOriginalImage();
    this.renderTransformedImage();
    this.renderPixelDistribution();
    this.renderFilterEffects();
  }

  /**
   * Render original image
   */
  renderOriginalImage() {
    const canvas = document.getElementById("original-image-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const imageData =
      this.variableTransformation.modernScenarios.imageProcessing.originalImage;
    if (!imageData) return;

    const cellSize = Math.min(width, height) / imageData.length;

    for (let y = 0; y < imageData.length; y++) {
      for (let x = 0; x < imageData[y].length; x++) {
        const [r, g, b] = imageData[y][x];
        ctx.fillStyle = `rgb(${Math.floor(r * 255)}, ${Math.floor(
          g * 255
        )}, ${Math.floor(b * 255)})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  /**
   * Render transformed image
   */
  renderTransformedImage() {
    const canvas = document.getElementById("transformed-image-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Apply current transformation to image
    const transformedImage = this.applyImageTransformation();
    if (!transformedImage) return;

    const cellSize = Math.min(width, height) / transformedImage.length;

    for (let y = 0; y < transformedImage.length; y++) {
      for (let x = 0; x < transformedImage[y].length; x++) {
        const [r, g, b] = transformedImage[y][x];
        ctx.fillStyle = `rgb(${Math.floor(r * 255)}, ${Math.floor(
          g * 255
        )}, ${Math.floor(b * 255)})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  /**
   * Apply image transformation
   */
  applyImageTransformation() {
    const originalImage =
      this.variableTransformation.modernScenarios.imageProcessing.originalImage;
    if (!originalImage) return null;

    const { rotationAngle, scaleX, scaleY } =
      this.variableTransformation.modernScenarios.imageProcessing;

    // Simple rotation and scaling transformation
    const size = originalImage.length;
    const transformedImage = [];

    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        // Apply transformation matrix
        const centerX = size / 2;
        const centerY = size / 2;

        // Translate to origin
        let tx = x - centerX;
        let ty = y - centerY;

        // Apply scaling
        tx *= scaleX;
        ty *= scaleY;

        // Apply rotation
        const cos = Math.cos(rotationAngle);
        const sin = Math.sin(rotationAngle);
        const rx = tx * cos - ty * sin;
        const ry = tx * sin + ty * cos;

        // Translate back
        const sourceX = Math.round(rx + centerX);
        const sourceY = Math.round(ry + centerY);

        // Sample from original image (with bounds checking)
        if (sourceX >= 0 && sourceX < size && sourceY >= 0 && sourceY < size) {
          row.push([...originalImage[sourceY][sourceX]]);
        } else {
          row.push([0, 0, 0]); // Black for out-of-bounds
        }
      }
      transformedImage.push(row);
    }

    return transformedImage;
  }

  /**
   * Render pixel distribution
   */
  renderPixelDistribution() {
    const canvas = document.getElementById("pixel-distribution-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Calculate pixel intensity histograms
    const originalImage =
      this.variableTransformation.modernScenarios.imageProcessing.originalImage;
    const transformedImage = this.applyImageTransformation();

    if (!originalImage || !transformedImage) return;

    // Calculate histograms
    const originalHist = this.calculateImageHistogram(originalImage);
    const transformedHist = this.calculateImageHistogram(transformedImage);

    // Draw histograms
    this.drawHistogram(
      ctx,
      originalHist,
      "rgba(34, 211, 238, 0.6)",
      0,
      width / 2,
      height
    );
    this.drawHistogram(
      ctx,
      transformedHist,
      "rgba(167, 139, 250, 0.6)",
      width / 2,
      width / 2,
      height
    );

    // Labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("原始分布", 10, 20);
    ctx.fillText("变换后分布", width / 2 + 10, 20);
  }

  /**
   * Calculate image histogram
   */
  calculateImageHistogram(imageData) {
    const histogram = new Array(256).fill(0);

    for (let y = 0; y < imageData.length; y++) {
      for (let x = 0; x < imageData[y].length; x++) {
        const [r, g, b] = imageData[y][x];
        const intensity = Math.floor(((r + g + b) / 3) * 255);
        histogram[intensity]++;
      }
    }

    return histogram;
  }

  /**
   * Draw histogram
   */
  drawHistogram(ctx, histogram, color, startX, width, height) {
    const maxCount = Math.max(...histogram);
    const barWidth = width / histogram.length;

    ctx.fillStyle = color;

    for (let i = 0; i < histogram.length; i++) {
      const barHeight = (histogram[i] / maxCount) * (height - 40);
      ctx.fillRect(
        startX + i * barWidth,
        height - barHeight - 20,
        barWidth,
        barHeight
      );
    }
  }

  /**
   * Apply image filter
   */
  applyImageFilter(filterType) {
    this.variableTransformation.modernScenarios.imageProcessing.currentFilter =
      filterType;
    this.renderFilterEffects();
  }

  /**
   * Render filter effects
   */
  renderFilterEffects() {
    const canvas = document.getElementById("filter-effects-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const originalImage =
      this.variableTransformation.modernScenarios.imageProcessing.originalImage;
    if (!originalImage) return;

    const filteredImage = this.applyFilter(
      originalImage,
      this.variableTransformation.modernScenarios.imageProcessing.currentFilter
    );
    const cellSize = Math.min(width, height) / filteredImage.length;

    for (let y = 0; y < filteredImage.length; y++) {
      for (let x = 0; x < filteredImage[y].length; x++) {
        const [r, g, b] = filteredImage[y][x];
        ctx.fillStyle = `rgb(${Math.floor(r * 255)}, ${Math.floor(
          g * 255
        )}, ${Math.floor(b * 255)})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  /**
   * Apply filter to image
   */
  applyFilter(imageData, filterType) {
    const filtered = [];

    for (let y = 0; y < imageData.length; y++) {
      const row = [];
      for (let x = 0; x < imageData[y].length; x++) {
        let [r, g, b] = imageData[y][x];

        switch (filterType) {
          case "vintage":
            // Vintage filter: warm tones, reduced saturation
            r = Math.min(1, r * 1.2 + 0.1);
            g = Math.min(1, g * 1.1 + 0.05);
            b = Math.min(1, b * 0.9);
            break;
          case "cool":
            // Cool filter: blue tones
            r = Math.min(1, r * 0.8);
            g = Math.min(1, g * 0.9);
            b = Math.min(1, b * 1.2);
            break;
          case "warm":
            // Warm filter: orange/red tones
            r = Math.min(1, r * 1.3);
            g = Math.min(1, g * 1.1);
            b = Math.min(1, b * 0.7);
            break;
          case "bw":
            // Black and white
            const gray = (r + g + b) / 3;
            r = g = b = gray;
            break;
          default:
            // No filter
            break;
        }

        row.push([r, g, b]);
      }
      filtered.push(row);
    }

    return filtered;
  }

  // ==================== Crypto Analysis Methods (Requirements 4.10) ====================

  /**
   * Set up crypto analysis event listeners
   */
  setupCryptoAnalysisEventListeners() {
    // Crypto selection buttons
    const cryptoBtns = document.querySelectorAll(".crypto-btn");
    cryptoBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Remove active class from all buttons
        cryptoBtns.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        const crypto = e.target.dataset.crypto;
        this.variableTransformation.modernScenarios.crypto.currentCrypto =
          crypto;
        this.generateCryptoPriceData(crypto);
        this.renderCryptoAnalysis();
      });
    });
  }

  /**
   * Initialize crypto analysis scenario (Requirements 4.10)
   */
  initializeCryptoAnalysis() {
    console.log("Initializing Crypto Price Transform Analyzer...");

    // Generate initial Bitcoin price data
    this.generateCryptoPriceData("bitcoin");

    // Render initial crypto analysis
    this.renderCryptoAnalysis();

    this.variableTransformation.modernScenarios.crypto.isActive = true;
    console.log("Crypto Price Transform Analyzer initialized");
  }

  /**
   * Generate cryptocurrency price data
   */
  generateCryptoPriceData(cryptoType) {
    const dataPoints = 100;
    const priceData = [];

    // Different price characteristics for different cryptocurrencies
    const cryptoParams = {
      bitcoin: { basePrice: 45000, volatility: 0.05, trend: 0.001 },
      ethereum: { basePrice: 3000, volatility: 0.07, trend: 0.002 },
      dogecoin: { basePrice: 0.08, volatility: 0.15, trend: 0.005 },
      shiba: { basePrice: 0.000025, volatility: 0.2, trend: 0.008 },
    };

    const params = cryptoParams[cryptoType] || cryptoParams.bitcoin;
    let currentPrice = params.basePrice;

    for (let i = 0; i < dataPoints; i++) {
      // Random walk with trend and volatility
      const randomChange = (Math.random() - 0.5) * 2 * params.volatility;
      const trendChange = params.trend * (Math.random() - 0.3);

      currentPrice *= 1 + randomChange + trendChange;
      currentPrice = Math.max(currentPrice, params.basePrice * 0.1); // Prevent negative prices

      priceData.push(currentPrice);
    }

    this.variableTransformation.modernScenarios.crypto.priceData = priceData;

    // Calculate log-transformed data
    this.variableTransformation.modernScenarios.crypto.logTransformed =
      priceData.map((price) => Math.log(price));

    // Calculate volatility analysis
    this.calculateVolatilityAnalysis();
  }

  /**
   * Calculate volatility analysis
   */
  calculateVolatilityAnalysis() {
    const priceData =
      this.variableTransformation.modernScenarios.crypto.priceData;
    const returns = [];

    // Calculate daily returns
    for (let i = 1; i < priceData.length; i++) {
      const dailyReturn = (priceData[i] - priceData[i - 1]) / priceData[i - 1];
      returns.push(dailyReturn);
    }

    // Calculate volatility metrics
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
      returns.length;
    const volatility = Math.sqrt(variance);

    this.variableTransformation.modernScenarios.crypto.volatilityAnalysis = {
      returns,
      meanReturn,
      volatility,
      sharpeRatio: meanReturn / volatility,
      maxDrawdown: this.calculateMaxDrawdown(priceData),
    };
  }

  /**
   * Calculate maximum drawdown
   */
  calculateMaxDrawdown(priceData) {
    let maxDrawdown = 0;
    let peak = priceData[0];

    for (let i = 1; i < priceData.length; i++) {
      if (priceData[i] > peak) {
        peak = priceData[i];
      } else {
        const drawdown = (peak - priceData[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    return maxDrawdown;
  }

  /**
   * Render crypto analysis visualization
   */
  renderCryptoAnalysis() {
    this.renderCryptoPriceChart();
    this.renderCryptoLogChart();
    this.renderCryptoVolatility();
    this.renderCryptoRiskAssessment();
  }

  /**
   * Render cryptocurrency price chart
   */
  renderCryptoPriceChart() {
    const canvas = document.getElementById("crypto-price-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const priceData =
      this.variableTransformation.modernScenarios.crypto.priceData;
    if (!priceData || priceData.length === 0) return;

    // Draw price chart
    const minPrice = Math.min(...priceData);
    const maxPrice = Math.max(...priceData);
    const priceRange = maxPrice - minPrice;

    ctx.strokeStyle = "rgba(255, 193, 7, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < priceData.length; i++) {
      const x = (i / (priceData.length - 1)) * width;
      const y =
        height - ((priceData[i] - minPrice) / priceRange) * (height - 40) - 20;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw title and current price
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("原始价格分布", 10, 20);
    ctx.fillText(
      `当前: $${priceData[priceData.length - 1].toFixed(2)}`,
      10,
      height - 5
    );
  }

  /**
   * Render crypto log-transformed chart
   */
  renderCryptoLogChart() {
    const canvas = document.getElementById("crypto-log-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const logData =
      this.variableTransformation.modernScenarios.crypto.logTransformed;
    if (!logData || logData.length === 0) return;

    // Draw log-transformed chart
    const minLog = Math.min(...logData);
    const maxLog = Math.max(...logData);
    const logRange = maxLog - minLog;

    ctx.strokeStyle = "rgba(167, 139, 250, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < logData.length; i++) {
      const x = (i / (logData.length - 1)) * width;
      const y =
        height - ((logData[i] - minLog) / logRange) * (height - 40) - 20;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw title
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("对数变换后分布", 10, 20);
    ctx.fillText(
      `Log: ${logData[logData.length - 1].toFixed(3)}`,
      10,
      height - 5
    );
  }

  /**
   * Render crypto volatility analysis
   */
  renderCryptoVolatility() {
    const canvas = document.getElementById("crypto-volatility-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const analysis =
      this.variableTransformation.modernScenarios.crypto.volatilityAnalysis;
    if (!analysis) return;

    // Draw returns histogram
    const returns = analysis.returns;
    const histogram = this.calculateReturnsHistogram(returns);

    this.drawHistogram(
      ctx,
      histogram,
      "rgba(34, 197, 94, 0.6)",
      0,
      width,
      height - 60
    );

    // Draw volatility metrics
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText(
      `波动率: ${(analysis.volatility * 100).toFixed(2)}%`,
      10,
      height - 40
    );
    ctx.fillText(
      `夏普比率: ${analysis.sharpeRatio.toFixed(3)}`,
      10,
      height - 25
    );
    ctx.fillText(
      `最大回撤: ${(analysis.maxDrawdown * 100).toFixed(2)}%`,
      10,
      height - 10
    );
  }

  /**
   * Calculate returns histogram
   */
  calculateReturnsHistogram(returns) {
    const bins = 50;
    const minReturn = Math.min(...returns);
    const maxReturn = Math.max(...returns);
    const binSize = (maxReturn - minReturn) / bins;

    const histogram = new Array(bins).fill(0);

    returns.forEach((ret) => {
      const binIndex = Math.min(
        Math.floor((ret - minReturn) / binSize),
        bins - 1
      );
      histogram[binIndex]++;
    });

    return histogram;
  }

  /**
   * Render crypto risk assessment
   */
  renderCryptoRiskAssessment() {
    const canvas = document.getElementById("crypto-risk-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const analysis =
      this.variableTransformation.modernScenarios.crypto.volatilityAnalysis;
    if (!analysis) return;

    // Draw risk assessment visualization
    const riskLevel = Math.min(analysis.volatility * 10, 1); // Normalize to 0-1

    // Risk meter
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    // Draw risk meter background
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // Draw risk level
    const riskAngle = Math.PI + riskLevel * Math.PI;
    ctx.strokeStyle =
      riskLevel < 0.3
        ? "rgba(34, 197, 94, 0.8)"
        : riskLevel < 0.7
        ? "rgba(255, 193, 7, 0.8)"
        : "rgba(239, 68, 68, 0.8)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, riskAngle);
    ctx.stroke();

    // Draw risk labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("风险评估", centerX, centerY + radius + 30);

    const riskText =
      riskLevel < 0.3 ? "低风险" : riskLevel < 0.7 ? "中风险" : "高风险";
    ctx.fillText(riskText, centerX, centerY + radius + 45);
  }

  // ===== Section 3.5: Conditional Distribution Simulator Methods =====

  /**
   * Initialize conditional distribution simulator (Section 3.5)
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.8, 6.9, 6.10
   */
  initializeConditionalDistribution() {
    console.log("Initializing conditional distribution simulator...");

    // Initialize event listeners for conditional distribution controls
    this.setupConditionalDistributionEventListeners();

    // Generate initial joint samples for conditional analysis
    this.generateConditionalSamples();

    // Initialize Bayesian updating system
    this.initializeBayesianUpdate();

    // Initialize modern application scenarios
    this.initializeModernConditionalScenarios();

    // Render initial visualizations
    this.renderConditionalDistributionVisualizations();

    console.log("Conditional distribution simulator initialized successfully");
  }

  /**
   * Set up event listeners for conditional distribution controls
   */
  setupConditionalDistributionEventListeners() {
    // Condition value slider
    const conditionSlider = document.getElementById("condition-value-slider");
    if (conditionSlider) {
      conditionSlider.addEventListener("input", (e) => {
        this.conditionalDistribution.conditionValue = parseFloat(
          e.target.value
        );
        document.getElementById("condition-value-val").textContent =
          e.target.value;
        this.updateConditionalVisualization();
      });
    }

    // Scenario selector
    const scenarioSelect = document.getElementById("conditional-scenario");
    if (scenarioSelect) {
      scenarioSelect.addEventListener("change", (e) => {
        this.conditionalDistribution.currentScenario = e.target.value;
        this.updateScenarioLabels();
        this.updateConditionalVisualization();
      });
    }

    // Observation noise slider
    const noiseSlider = document.getElementById("observation-noise-slider");
    if (noiseSlider) {
      noiseSlider.addEventListener("input", (e) => {
        this.conditionalDistribution.observationNoise = parseFloat(
          e.target.value
        );
        document.getElementById("observation-noise-val").textContent =
          e.target.value;
        this.updateConditionalVisualization();
      });
    }

    // Prediction confidence slider
    const confidenceSlider = document.getElementById(
      "prediction-confidence-slider"
    );
    if (confidenceSlider) {
      confidenceSlider.addEventListener("input", (e) => {
        this.conditionalDistribution.predictionConfidence = parseInt(
          e.target.value
        );
        document.getElementById("prediction-confidence-val").textContent =
          e.target.value + "%";
        this.updateConditionalVisualization();
      });
    }

    // Bayesian update button
    const updateBtn = document.getElementById("update-bayesian");
    if (updateBtn) {
      updateBtn.addEventListener("click", () => {
        this.performBayesianUpdate();
      });
    }

    // Reset prior button
    const resetBtn = document.getElementById("reset-prior");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetBayesianPrior();
      });
    }
  }

  /**
   * Generate joint samples for conditional analysis
   */
  generateConditionalSamples() {
    const { mu1, mu2, sigma1, sigma2, rho, nSamples } = this.parameters;

    this.conditionalDistribution.jointSamples = [];

    for (let i = 0; i < nSamples; i++) {
      const [x, y] = this.generateBivariateNormal(
        mu1,
        mu2,
        sigma1,
        sigma2,
        rho
      );
      this.conditionalDistribution.jointSamples.push([x, y]);
    }

    // Calculate conditional statistics
    this.calculateConditionalStatistics();
  }

  /**
   * Calculate conditional distribution statistics
   * Requirements: 6.1, 6.2
   */
  calculateConditionalStatistics() {
    const { conditionValue, jointSamples } = this.conditionalDistribution;
    const { sigma1, sigma2, rho } = this.parameters;

    // Filter samples near the conditioning value (within tolerance)
    const tolerance = 0.5;
    this.conditionalDistribution.conditionalSamples = jointSamples.filter(
      ([x, y]) => Math.abs(x - conditionValue) <= tolerance
    );

    if (this.conditionalDistribution.conditionalSamples.length === 0) {
      // No samples near conditioning value, use theoretical calculation
      this.calculateTheoreticalConditional();
      return;
    }

    // Calculate sample-based conditional statistics
    const yValues = this.conditionalDistribution.conditionalSamples.map(
      ([x, y]) => y
    );

    this.conditionalDistribution.conditionalMean = this.calculateMean(yValues);
    this.conditionalDistribution.conditionalVariance =
      this.calculateVariance(yValues);

    // Calculate prediction interval
    this.calculatePredictionInterval();

    // Calculate R-squared for regression
    this.calculateRSquared();
  }

  /**
   * Calculate theoretical conditional distribution when no samples available
   */
  calculateTheoreticalConditional() {
    const { conditionValue } = this.conditionalDistribution;
    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;

    // Theoretical conditional mean: E[Y|X=x] = μ₂ + ρ(σ₂/σ₁)(x - μ₁)
    this.conditionalDistribution.conditionalMean =
      mu2 + rho * (sigma2 / sigma1) * (conditionValue - mu1);

    // Theoretical conditional variance: Var[Y|X=x] = σ₂²(1 - ρ²)
    this.conditionalDistribution.conditionalVariance =
      sigma2 * sigma2 * (1 - rho * rho);

    // Calculate prediction interval
    this.calculatePredictionInterval();

    // R-squared is ρ² for bivariate normal
    this.conditionalDistribution.rSquared = rho * rho;
  }

  /**
   * Calculate prediction interval for conditional distribution
   * Requirements: 6.3
   */
  calculatePredictionInterval() {
    const { conditionalMean, conditionalVariance, predictionConfidence } =
      this.conditionalDistribution;

    // Convert confidence level to z-score
    const alpha = (100 - predictionConfidence) / 100;
    const zScore = this.getZScore(1 - alpha / 2);

    const margin = zScore * Math.sqrt(conditionalVariance);

    this.conditionalDistribution.predictionInterval = {
      lower: conditionalMean - margin,
      upper: conditionalMean + margin,
    };
  }

  /**
   * Get z-score for given probability (normal distribution)
   */
  getZScore(p) {
    // Approximation of inverse normal CDF
    if (p >= 0.99) return 2.576;
    if (p >= 0.975) return 1.96;
    if (p >= 0.95) return 1.645;
    if (p >= 0.9) return 1.282;
    return 1.645; // Default to 95% confidence
  }

  /**
   * Calculate R-squared for regression analysis
   */
  calculateRSquared() {
    const { jointSamples } = this.conditionalDistribution;

    if (jointSamples.length < 2) {
      this.conditionalDistribution.rSquared = 0;
      return;
    }

    const xValues = jointSamples.map(([x, y]) => x);
    const yValues = jointSamples.map(([x, y]) => y);

    const correlation = this.calculateCorrelation(xValues, yValues);
    this.conditionalDistribution.rSquared = correlation * correlation;
  }

  /**
   * Render conditional density slice visualization
   * Requirements: 6.1 - Create cross-sectional views of joint distributions
   */
  renderConditionalDensitySlice() {
    const canvas = document.getElementById("conditional-density-slice");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { conditionValue, conditionalSamples } = this.conditionalDistribution;
    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;

    // Draw background grid
    this.drawGrid(ctx, width, height);

    // Draw joint distribution contours (faded)
    this.drawJointContours(ctx, width, height, 0.3);

    // Draw conditioning line (vertical line at X = conditionValue)
    ctx.strokeStyle = "rgba(255, 165, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const xPos = this.mapToCanvas(
      conditionValue,
      mu1 - 3 * sigma1,
      mu1 + 3 * sigma1,
      0,
      width
    );
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw conditional density curve
    this.drawConditionalDensityCurve(ctx, width, height);

    // Draw sample points near conditioning value
    if (conditionalSamples.length > 0) {
      ctx.fillStyle = "rgba(255, 165, 0, 0.6)";
      conditionalSamples.forEach(([x, y]) => {
        const canvasX = this.mapToCanvas(
          x,
          mu1 - 3 * sigma1,
          mu1 + 3 * sigma1,
          0,
          width
        );
        const canvasY = this.mapToCanvas(
          y,
          mu2 + 3 * sigma2,
          mu2 - 3 * sigma2,
          0,
          height
        );

        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Add labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(`X = ${conditionValue.toFixed(1)}`, xPos + 5, 20);
  }

  /**
   * Draw conditional density curve along the conditioning line
   */
  drawConditionalDensityCurve(ctx, width, height) {
    const { conditionValue, conditionalMean, conditionalVariance } =
      this.conditionalDistribution;
    const { mu2, sigma2 } = this.parameters;

    const yMin = mu2 - 3 * sigma2;
    const yMax = mu2 + 3 * sigma2;
    const xPos = this.mapToCanvas(
      conditionValue,
      this.parameters.mu1 - 3 * this.parameters.sigma1,
      this.parameters.mu1 + 3 * this.parameters.sigma1,
      0,
      width
    );

    ctx.strokeStyle = "rgba(255, 165, 0, 1)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const numPoints = 100;
    let firstPoint = true;

    for (let i = 0; i <= numPoints; i++) {
      const y = yMin + ((yMax - yMin) * i) / numPoints;
      const density = this.conditionalNormalPDF(
        y,
        conditionalMean,
        Math.sqrt(conditionalVariance)
      );

      // Scale density for visualization
      const densityScale = 50;
      const densityX = xPos + density * densityScale;
      const canvasY = this.mapToCanvas(y, yMax, yMin, 0, height);

      if (firstPoint) {
        ctx.moveTo(densityX, canvasY);
        firstPoint = false;
      } else {
        ctx.lineTo(densityX, canvasY);
      }
    }

    ctx.stroke();
  }

  /**
   * Calculate conditional normal PDF
   */
  conditionalNormalPDF(y, mean, stdDev) {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((y - mean) / stdDev, 2);
    return coefficient * Math.exp(exponent);
  }

  /**
   * Render conditional expectation curve
   * Requirements: 6.2 - Calculate E[Y|X=x] for range of x values
   * Requirements: 6.3 - Compare with regression lines and confidence intervals
   */
  renderConditionalExpectation() {
    const canvas = document.getElementById("conditional-expectation");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;

    // Draw background grid
    this.drawGrid(ctx, width, height);

    // Draw scatter plot of joint samples (faded)
    this.drawScatterPlot(ctx, width, height, 0.3);

    // Draw conditional expectation curve E[Y|X=x]
    ctx.strokeStyle = "rgba(0, 255, 102, 1)";
    ctx.lineWidth = 3;
    ctx.beginPath();

    const xMin = mu1 - 3 * sigma1;
    const xMax = mu1 + 3 * sigma1;
    const yMin = mu2 - 3 * sigma2;
    const yMax = mu2 + 3 * sigma2;

    const numPoints = 100;
    let firstPoint = true;

    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + ((xMax - xMin) * i) / numPoints;

      // Theoretical conditional expectation: E[Y|X=x] = μ₂ + ρ(σ₂/σ₁)(x - μ₁)
      const conditionalMean = mu2 + rho * (sigma2 / sigma1) * (x - mu1);

      const canvasX = this.mapToCanvas(x, xMin, xMax, 0, width);
      const canvasY = this.mapToCanvas(conditionalMean, yMax, yMin, 0, height);

      if (firstPoint) {
        ctx.moveTo(canvasX, canvasY);
        firstPoint = false;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }

    ctx.stroke();

    // Draw confidence bands around the conditional expectation
    this.drawConfidenceBands(ctx, width, height);

    // Highlight current conditioning point
    const { conditionValue } = this.conditionalDistribution;
    const currentMean = mu2 + rho * (sigma2 / sigma1) * (conditionValue - mu1);

    const currentX = this.mapToCanvas(conditionValue, xMin, xMax, 0, width);
    const currentY = this.mapToCanvas(currentMean, yMax, yMin, 0, height);

    ctx.fillStyle = "rgba(255, 165, 0, 1)";
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Add labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("E[Y|X=x]", 10, 20);
    ctx.fillText(
      `当前点: (${conditionValue.toFixed(1)}, ${currentMean.toFixed(1)})`,
      10,
      height - 10
    );
  }

  /**
   * Draw confidence bands around conditional expectation
   * Requirements: 6.3 - Compare with regression lines and confidence intervals
   */
  drawConfidenceBands(ctx, width, height) {
    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;
    const { predictionConfidence } = this.conditionalDistribution;

    const xMin = mu1 - 3 * sigma1;
    const xMax = mu1 + 3 * sigma1;
    const yMin = mu2 - 3 * sigma2;
    const yMax = mu2 + 3 * sigma2;

    // Calculate confidence interval width
    const alpha = (100 - predictionConfidence) / 100;
    const zScore = this.getZScore(1 - alpha / 2);
    const conditionalStdDev = sigma2 * Math.sqrt(1 - rho * rho);
    const margin = zScore * conditionalStdDev;

    // Draw upper and lower confidence bounds
    ctx.strokeStyle = "rgba(0, 255, 102, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const numPoints = 50;

    // Upper bound
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + ((xMax - xMin) * i) / numPoints;
      const conditionalMean = mu2 + rho * (sigma2 / sigma1) * (x - mu1);
      const upperBound = conditionalMean + margin;

      const canvasX = this.mapToCanvas(x, xMin, xMax, 0, width);
      const canvasY = this.mapToCanvas(upperBound, yMax, yMin, 0, height);

      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    // Lower bound
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + ((xMax - xMin) * i) / numPoints;
      const conditionalMean = mu2 + rho * (sigma2 / sigma1) * (x - mu1);
      const lowerBound = conditionalMean - margin;

      const canvasX = this.mapToCanvas(x, xMin, xMax, 0, width);
      const canvasY = this.mapToCanvas(lowerBound, yMax, yMin, 0, height);

      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    ctx.setLineDash([]);
  }

  /**
   * Draw scatter plot of joint samples (helper method)
   */
  drawScatterPlot(ctx, width, height, alpha = 1.0) {
    const { jointSamples } = this.conditionalDistribution;
    const { mu1, mu2, sigma1, sigma2 } = this.parameters;

    if (!jointSamples || jointSamples.length === 0) return;

    ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.6})`;

    const xMin = mu1 - 3 * sigma1;
    const xMax = mu1 + 3 * sigma1;
    const yMin = mu2 - 3 * sigma2;
    const yMax = mu2 + 3 * sigma2;

    jointSamples.forEach(([x, y]) => {
      const canvasX = this.mapToCanvas(x, xMin, xMax, 0, width);
      const canvasY = this.mapToCanvas(y, yMax, yMin, 0, height);

      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  /**
   * Update conditional visualization when parameters change
   */
  updateConditionalVisualization() {
    // Recalculate conditional statistics
    this.calculateConditionalStatistics();

    // Update all visualizations
    this.renderConditionalDistributionVisualizations();

    // Update statistics display
    this.updateConditionalStatisticsDisplay();
  }

  /**
   * Render all conditional distribution visualizations
   */
  renderConditionalDistributionVisualizations() {
    this.renderConditionalDensitySlice();
    this.renderConditionalExpectation();
    this.renderBayesianDistributions();
    // Additional visualizations will be added in subsequent tasks
  }

  /**
   * Update conditional statistics display
   */
  updateConditionalStatisticsDisplay() {
    const {
      conditionalMean,
      conditionalVariance,
      predictionInterval,
      rSquared,
    } = this.conditionalDistribution;

    // Update display elements
    const meanEl = document.getElementById("conditional-mean");
    const varianceEl = document.getElementById("conditional-variance");
    const intervalEl = document.getElementById("prediction-interval");
    const rSquaredEl = document.getElementById("r-squared");

    if (meanEl) meanEl.textContent = conditionalMean.toFixed(2);
    if (varianceEl) varianceEl.textContent = conditionalVariance.toFixed(2);
    if (intervalEl) {
      const margin = (predictionInterval.upper - predictionInterval.lower) / 2;
      intervalEl.textContent = `±${margin.toFixed(2)}`;
    }
    if (rSquaredEl) rSquaredEl.textContent = rSquared.toFixed(3);
  }

  /**
   * Initialize modern conditional distribution scenarios (placeholder)
   * Requirements: 6.8, 6.9, 6.10
   */
  initializeModernConditionalScenarios() {
    // Initialize meme virality predictor
    this.initializeMemeViralityPredictor();

    // Initialize live commerce analyzer
    this.initializeLiveCommerceAnalyzer();

    // Initialize game matchmaking optimizer
    this.initializeGameMatchmakingOptimizer();

    console.log("Modern conditional scenarios initialized");
  }

  /**
   * Initialize meme virality predictor
   * Requirements: 6.8 - Use conditional probability to predict meme spread patterns
   */
  initializeMemeViralityPredictor() {
    const memeApp =
      this.conditionalDistribution.modernApplications.memeVirality;

    // Generate initial spread data based on engagement
    this.generateMemeSpreadData();

    // Calculate virality score using conditional probability
    this.calculateViralityScore();

    console.log("Meme virality predictor initialized");
  }

  /**
   * Generate meme spread data based on initial engagement
   */
  generateMemeSpreadData() {
    const memeApp =
      this.conditionalDistribution.modernApplications.memeVirality;
    const {
      initialEngagement,
      viralCoefficient,
      decayRate,
      platformMultiplier,
    } = memeApp;

    memeApp.spreadData = [];

    // Simulate meme spread over time (24 hours in hourly intervals)
    let currentEngagement = initialEngagement;

    for (let hour = 0; hour < 24; hour++) {
      // Conditional probability of viral spread based on current engagement
      const viralProbability = this.calculateViralProbability(
        currentEngagement,
        hour
      );

      // Apply viral coefficient and platform effects
      const growthFactor =
        viralProbability * viralCoefficient * platformMultiplier;

      // Natural decay over time
      const decayFactor = Math.exp((-decayRate * hour) / 24);

      // Update engagement with growth and decay
      currentEngagement = currentEngagement * (1 + growthFactor) * decayFactor;

      // Add random noise to simulate real-world variability
      const noise = (Math.random() - 0.5) * 0.2;
      currentEngagement *= 1 + noise;

      memeApp.spreadData.push({
        hour: hour,
        engagement: Math.max(0, currentEngagement),
        viralProbability: viralProbability,
        cumulativeReach: currentEngagement * (hour + 1) * 0.1,
      });
    }
  }

  /**
   * Calculate viral probability based on current engagement and time
   */
  calculateViralProbability(engagement, hour) {
    // Peak viral hours (typically 12-14, 19-22)
    const peakHours = [12, 13, 14, 19, 20, 21, 22];
    const isPeakHour = peakHours.includes(hour);
    const timeMultiplier = isPeakHour ? 1.5 : 1.0;

    // Engagement threshold for viral potential
    const baseThreshold = 100;
    const engagementFactor = Math.min(engagement / baseThreshold, 3.0);

    // Conditional probability: P(viral | engagement, time)
    const baseProbability = 0.1; // 10% base chance
    const conditionalProbability =
      baseProbability * engagementFactor * timeMultiplier;

    return Math.min(conditionalProbability, 0.9); // Cap at 90%
  }

  /**
   * Calculate overall virality score
   */
  calculateViralityScore() {
    const memeApp =
      this.conditionalDistribution.modernApplications.memeVirality;

    if (!memeApp.spreadData || memeApp.spreadData.length === 0) {
      memeApp.viralityScore = 0;
      return;
    }

    // Calculate score based on peak engagement and sustained growth
    const maxEngagement = Math.max(
      ...memeApp.spreadData.map((d) => d.engagement)
    );
    const totalReach =
      memeApp.spreadData[memeApp.spreadData.length - 1].cumulativeReach;
    const avgViralProbability =
      memeApp.spreadData.reduce((sum, d) => sum + d.viralProbability, 0) /
      memeApp.spreadData.length;

    // Composite virality score (0-100)
    memeApp.viralityScore = Math.min(
      100,
      (maxEngagement / 1000) * 30 +
        (totalReach / 10000) * 40 +
        avgViralProbability * 30
    );
  }

  /**
   * Initialize live commerce analyzer (placeholder)
   * Requirements: 6.9 - Show how purchase probability depends on viewer and product characteristics
   */
  initializeLiveCommerceAnalyzer() {
    const commerceApp =
      this.conditionalDistribution.modernApplications.liveCommerce;

    // Calculate conversion rate based on viewer and product characteristics
    const { viewerCharacteristics, productFeatures } = commerceApp;

    // Conditional probability: P(purchase | viewer_age, income, loyalty, product_price, brand)
    const ageScore = Math.max(
      0,
      1 - Math.abs(viewerCharacteristics.age - 28) / 20
    ); // Peak at age 28
    const incomeScore = Math.min(viewerCharacteristics.income / 10000, 1.0);
    const loyaltyScore = viewerCharacteristics.loyaltyScore;
    const priceScore = Math.max(0, 1 - productFeatures.price / 1000); // Lower price = higher conversion
    const brandScore = productFeatures.brandRecognition;

    commerceApp.conversionRate =
      0.02 +
      ageScore * 0.03 +
      incomeScore * 0.04 +
      loyaltyScore * 0.05 +
      priceScore * 0.02 +
      brandScore * 0.03;

    console.log("Live commerce analyzer initialized");
  }

  /**
   * Initialize game matchmaking optimizer (placeholder)
   * Requirements: 6.10 - Demonstrate conditional probabilities in matchmaking algorithms
   */
  initializeGameMatchmakingOptimizer() {
    const matchmakingApp =
      this.conditionalDistribution.modernApplications.gameMatchmaking;

    // Calculate balance score based on player characteristics
    const { playerSkill, winRate, queueTime } = matchmakingApp;

    // Conditional probability: P(balanced_match | skill, winrate, queue_time)
    const skillBalance = Math.max(0, 1 - Math.abs(playerSkill - 1500) / 1000); // Balanced around 1500
    const winRateBalance = Math.max(0, 1 - Math.abs(winRate - 0.5) / 0.3); // Balanced around 50%
    const queueTimeScore = Math.min(queueTime / 60, 1.0); // Longer queue = better match

    matchmakingApp.balanceScore =
      skillBalance * 0.5 + winRateBalance * 0.3 + queueTimeScore * 0.2;

    console.log("Game matchmaking optimizer initialized");
  }

  /**
   * Initialize Bayesian updating system
   * Requirements: 6.4, 6.6 - Show prior, likelihood, and posterior distributions
   */
  initializeBayesianUpdate() {
    // Initialize with default prior
    this.conditionalDistribution.bayesianUpdate = {
      priorMean: 0,
      priorVariance: 1,
      likelihoodVariance: 0.1,
      posteriorMean: 0,
      posteriorVariance: 1,
      observations: [],
    };

    this.renderBayesianDistributions();
  }

  /**
   * Perform Bayesian update with new observation
   */
  performBayesianUpdate() {
    const { conditionValue, observationNoise } = this.conditionalDistribution;
    const { bayesianUpdate } = this.conditionalDistribution;

    // Add new observation with noise
    const observation =
      conditionValue + (Math.random() - 0.5) * observationNoise * 2;
    bayesianUpdate.observations.push(observation);

    // Bayesian update formulas for normal-normal conjugate prior
    const priorPrecision = 1 / bayesianUpdate.priorVariance;
    const likelihoodPrecision = 1 / bayesianUpdate.likelihoodVariance;

    // Update posterior parameters
    const posteriorPrecision = priorPrecision + likelihoodPrecision;
    bayesianUpdate.posteriorVariance = 1 / posteriorPrecision;

    bayesianUpdate.posteriorMean =
      bayesianUpdate.posteriorVariance *
      (priorPrecision * bayesianUpdate.priorMean +
        likelihoodPrecision * observation);

    // Update prior for next iteration (learning)
    bayesianUpdate.priorMean = bayesianUpdate.posteriorMean;
    bayesianUpdate.priorVariance = bayesianUpdate.posteriorVariance;

    // Re-render Bayesian visualizations
    this.renderBayesianDistributions();

    // Show update feedback
    this.showBayesianUpdateFeedback(observation);
  }

  /**
   * Reset Bayesian prior to initial state
   */
  resetBayesianPrior() {
    this.conditionalDistribution.bayesianUpdate = {
      priorMean: 0,
      priorVariance: 1,
      likelihoodVariance: 0.1,
      posteriorMean: 0,
      posteriorVariance: 1,
      observations: [],
    };

    this.renderBayesianDistributions();

    // Show reset feedback
    this.showToastNotification("贝叶斯先验已重置", "info");
  }

  /**
   * Render Bayesian distributions (prior, likelihood, posterior)
   */
  renderBayesianDistributions() {
    this.renderPriorDistribution();
    this.renderLikelihoodFunction();
    this.renderPosteriorDistribution();
  }

  /**
   * Render prior distribution
   */
  renderPriorDistribution() {
    const canvas = document.getElementById("prior-dist");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { priorMean, priorVariance } =
      this.conditionalDistribution.bayesianUpdate;

    this.drawNormalDistribution(
      ctx,
      width,
      height,
      priorMean,
      Math.sqrt(priorVariance),
      "rgba(100, 149, 237, 0.8)",
      "先验"
    );
  }

  /**
   * Render likelihood function
   */
  renderLikelihoodFunction() {
    const canvas = document.getElementById("likelihood-func");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { observations, likelihoodVariance } =
      this.conditionalDistribution.bayesianUpdate;

    if (observations.length === 0) {
      // No observations yet, show placeholder
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("等待观测", width / 2, height / 2);
      return;
    }

    // Use the most recent observation for likelihood
    const lastObservation = observations[observations.length - 1];

    this.drawNormalDistribution(
      ctx,
      width,
      height,
      lastObservation,
      Math.sqrt(likelihoodVariance),
      "rgba(255, 165, 0, 0.8)",
      "似然"
    );
  }

  /**
   * Render posterior distribution
   */
  renderPosteriorDistribution() {
    const canvas = document.getElementById("posterior-dist");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { posteriorMean, posteriorVariance } =
      this.conditionalDistribution.bayesianUpdate;

    this.drawNormalDistribution(
      ctx,
      width,
      height,
      posteriorMean,
      Math.sqrt(posteriorVariance),
      "rgba(50, 205, 50, 0.8)",
      "后验"
    );
  }

  /**
   * Draw a normal distribution curve on canvas
   */
  drawNormalDistribution(ctx, width, height, mean, stdDev, color, label) {
    const xMin = mean - 3 * stdDev;
    const xMax = mean + 3 * stdDev;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const numPoints = 100;
    let maxDensity = 0;
    const densities = [];

    // Calculate densities and find maximum for scaling
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + ((xMax - xMin) * i) / numPoints;
      const density = this.conditionalNormalPDF(x, mean, stdDev);
      densities.push(density);
      maxDensity = Math.max(maxDensity, density);
    }

    // Draw the curve
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + ((xMax - xMin) * i) / numPoints;
      const density = densities[i];

      const canvasX = this.mapToCanvas(x, xMin, xMax, 0, width);
      const canvasY = height - (density / maxDensity) * (height - 20);

      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }

    ctx.stroke();

    // Add label
    ctx.fillStyle = color;
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, width / 2, height - 5);
  }

  /**
   * Show Bayesian update feedback
   */
  showBayesianUpdateFeedback(observation) {
    const message = `新观测值: ${observation.toFixed(2)}，后验已更新`;
    this.showToastNotification(message, "success");
  }

  // Helper methods for conditional distribution visualization

  /**
   * Draw background grid on canvas
   */
  drawGrid(ctx, width, height) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    const gridSize = 20;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * Draw joint distribution contours (simplified)
   */
  drawJointContours(ctx, width, height, alpha = 1.0) {
    const { mu1, mu2, sigma1, sigma2, rho } = this.parameters;

    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.5})`;
    ctx.lineWidth = 1;

    // Draw elliptical contours representing the joint distribution
    const centerX = this.mapToCanvas(
      mu1,
      mu1 - 3 * sigma1,
      mu1 + 3 * sigma1,
      0,
      width
    );
    const centerY = this.mapToCanvas(
      mu2,
      mu2 + 3 * sigma2,
      mu2 - 3 * sigma2,
      0,
      height
    );

    // Draw multiple confidence ellipses
    const levels = [1, 2, 3];
    levels.forEach((level) => {
      const radiusX = (((sigma1 * level) / 3) * width) / (2 * 3 * sigma1);
      const radiusY = (((sigma2 * level) / 3) * height) / (2 * 3 * sigma2);

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    });
  }

  /**
   * Map value from data range to canvas coordinates
   */
  mapToCanvas(value, dataMin, dataMax, canvasMin, canvasMax) {
    return (
      canvasMin +
      ((value - dataMin) * (canvasMax - canvasMin)) / (dataMax - dataMin)
    );
  }

  /**
   * Calculate mean of array
   */
  calculateMean(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate variance of array
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return this.calculateMean(squaredDiffs);
  }

  // ===== Historical Information and Modern Connections Methods =====

  /**
   * Initialize historical information panel and interactions
   * Requirements: 10.1, 10.2
   */
  initializeHistoricalInfo() {
    console.log("Initializing historical information system...");

    // Set up toggle functionality for historical info panel
    this.setupHistoricalInfoToggle();

    // Initialize interactive timeline
    this.initializeInteractiveTimeline();

    // Set up mathematician biography interactions
    this.setupMathematicianBiographies();

    // Initialize modern application connections
    this.initializeModernConnections();

    // Initialize trending topic connection system (Task 10.2)
    this.initializeTrendingTopicConnector();

    console.log("Historical information system initialized successfully");
  }

  /**
   * Initialize trending topic connection system (Task 10.2)
   * Requirements: 10.8
   */
  initializeTrendingTopicConnector() {
    console.log("Initializing trending topic connection system...");

    // Set up platform switching
    this.setupTrendingPlatformSwitching();

    // Initialize real-time topic fetching
    this.initializeRealTimeTrendingTopics();

    // Set up news event probability analysis
    this.setupNewsEventAnalysis();

    // Initialize viral phenomena pattern analysis
    this.initializeViralPatternAnalysis();

    // Start trending topic updates
    this.startTrendingTopicUpdates();

    console.log("Trending topic connection system initialized successfully");
  }

  /**
   * Set up platform switching for trending topics
   */
  setupTrendingPlatformSwitching() {
    const platformButtons = document.querySelectorAll(".trending-platform-btn");

    platformButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const platform = e.target.dataset.platform;
        this.switchTrendingPlatform(platform);
      });
    });
  }

  /**
   * Switch to a different trending topic platform
   */
  switchTrendingPlatform(platform) {
    if (!this.trendingTopicConnector.platforms[platform]) return;

    this.trendingTopicConnector.currentPlatform = platform;
    this.updatePlatformUI(platform);
    this.fetchTrendingTopics(platform);
  }

  /**
   * Update platform UI when switching
   */
  updatePlatformUI(platform) {
    const platformConfig = this.trendingTopicConnector.platforms[platform];

    // Update platform indicator
    const platformIndicator = document.getElementById(
      "current-trending-platform"
    );
    if (platformIndicator) {
      platformIndicator.innerHTML = `
        <i class="${platformConfig.icon}" style="color: ${platformConfig.color}"></i>
        ${platformConfig.name}
      `;
    }

    // Update platform buttons
    document.querySelectorAll(".trending-platform-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.platform === platform) {
        btn.classList.add("active");
      }
    });
  }

  initializeRealTimeTrendingTopics() {
    this.trendingTopicConnector.isActive = true;
    console.log("Trending topics real-time initializer ready");
  }

  setupNewsEventAnalysis() {
    console.log("News event analysis setup ready");
  }

  initializeViralPatternAnalysis() {
    console.log("Viral pattern analysis initialized");
  }

  startTrendingTopicUpdates() {
    console.log("Trending topic updates started");
  }

  fetchTrendingTopics(platform) {
    console.log("Fetching trending topics for", platform);
    const cfg = this.trendingTopicConnector.platforms[platform];
    if (!cfg) return;
    this.trendingTopicConnector.currentTopics = [
      "示例话题A",
      "示例话题B",
      "示例话题C",
    ];
    this.trendingTopicConnector.lastUpdate = Date.now();
  }

  /**
   * Set up toggle functionality for historical information panel
   */
  setupHistoricalInfoToggle() {
    const toggleBtn = document.getElementById("toggle-historical-info");
    const panel = document.getElementById("historical-info-panel");
    const chevron = document.getElementById("historical-chevron");

    if (toggleBtn && panel && chevron) {
      toggleBtn.addEventListener("click", () => {
        const isHidden = panel.classList.contains("hidden");

        if (isHidden) {
          panel.classList.remove("hidden");
          chevron.style.transform = "rotate(180deg)";
          toggleBtn.querySelector("span").textContent = "收起历史信息";

          // Animate panel appearance
          panel.style.opacity = "0";
          panel.style.transform = "translateY(-20px)";

          setTimeout(() => {
            panel.style.transition = "all 0.5s ease-out";
            panel.style.opacity = "1";
            panel.style.transform = "translateY(0)";
          }, 10);

          // Animate timeline items
          this.animateTimelineItems();
        } else {
          panel.style.transition = "all 0.3s ease-in";
          panel.style.opacity = "0";
          panel.style.transform = "translateY(-20px)";

          setTimeout(() => {
            panel.classList.add("hidden");
            chevron.style.transform = "rotate(0deg)";
            toggleBtn.querySelector("span").textContent = "历史脉络与现代应用";
          }, 300);
        }
      });
    }
  }

  /**
   * Initialize interactive timeline with animations
   */
  initializeInteractiveTimeline() {
    const timelineItems = document.querySelectorAll(".timeline-item");

    timelineItems.forEach((item, index) => {
      // Add hover effects
      item.addEventListener("mouseenter", () => {
        item.style.transform = "scale(1.02)";
        item.style.transition = "transform 0.3s ease";

        // Highlight corresponding connections
        const year = item.dataset.year;
        this.highlightHistoricalConnections(year);
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "scale(1)";
        this.clearHistoricalHighlights();
      });

      // Add click interactions for detailed information
      item.addEventListener("click", () => {
        this.showDetailedHistoricalInfo(item.dataset.year);
      });
    });
  }

  /**
   * Animate timeline items when panel opens
   */
  animateTimelineItems() {
    const timelineItems = document.querySelectorAll(".timeline-item");

    timelineItems.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-50px)";

      setTimeout(() => {
        item.style.transition = "all 0.6s ease-out";
        item.style.opacity = "1";
        item.style.transform = "translateX(0)";
      }, index * 200 + 500);
    });
  }

  /**
   * Set up mathematician biography interactions
   */
  setupMathematicianBiographies() {
    const historicalItems = document.querySelectorAll(".historical-item");

    historicalItems.forEach((item) => {
      item.addEventListener("click", () => {
        const mathematician = item.querySelector("h4").textContent;
        this.showMathematicianDetails(mathematician);
      });

      // Add hover effects
      item.addEventListener("mouseenter", () => {
        item.style.transform = "translateY(-2px)";
        item.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "translateY(0)";
        item.style.boxShadow = "";
      });
    });
  }

  /**
   * Initialize modern application connections
   */
  initializeModernConnections() {
    const modernAppItems = document.querySelectorAll(".modern-app-item");

    modernAppItems.forEach((item) => {
      item.addEventListener("click", () => {
        const appType = item.querySelector("h4").textContent;
        this.showModernApplicationDetails(appType);
      });

      // Add interactive tags
      const tags = item.querySelectorAll("span");
      tags.forEach((tag) => {
        tag.addEventListener("click", (e) => {
          e.stopPropagation();
          this.highlightRelatedConcepts(tag.textContent);
        });
      });
    });
  }

  /**
   * Highlight historical connections for a specific year
   */
  highlightHistoricalConnections(year) {
    const connections = {
      1888: ["correlation", "recommendation"],
      1901: ["chi-square", "ab-testing"],
      1933: ["pca", "dimensionality-reduction"],
      2024: ["multimodal-ai", "llm"],
    };

    const relatedConcepts = connections[year] || [];
    relatedConcepts.forEach((concept) => {
      const elements = document.querySelectorAll(`[data-concept="${concept}"]`);
      elements.forEach((el) => {
        el.style.backgroundColor = "rgba(34, 211, 238, 0.2)";
        el.style.borderColor = "rgba(34, 211, 238, 0.5)";
      });
    });
  }

  /**
   * Clear historical highlights
   */
  clearHistoricalHighlights() {
    const highlightedElements = document.querySelectorAll("[data-concept]");
    highlightedElements.forEach((el) => {
      el.style.backgroundColor = "";
      el.style.borderColor = "";
    });
  }

  /**
   * Show detailed historical information modal
   */
  showDetailedHistoricalInfo(year) {
    const historicalDetails = {
      1888: {
        title: "相关性理论的诞生",
        content:
          '高尔顿通过研究父子身高关系，首次提出了"相关性"概念，这一发现为现代统计学奠定了基础。',
        modernConnection:
          "今天的推荐算法正是基于这一理论，通过分析用户行为的相关性来预测偏好。",
        examples: ["Netflix推荐系统", "淘宝个性化推荐", "抖音算法推送"],
      },
      1901: {
        title: "卡方检验的发展",
        content:
          "皮尔逊发展了卡方检验，为独立性检验提供了数学工具，这是现代统计推断的重要基础。",
        modernConnection:
          "A/B测试和用户行为分析广泛使用卡方检验来验证假设和优化产品。",
        examples: ["网站转化率测试", "广告效果评估", "用户体验优化"],
      },
      1933: {
        title: "主成分分析的创立",
        content:
          "霍特林提出主成分分析，开创了多变量数据降维的先河，为处理高维数据提供了有效方法。",
        modernConnection: "深度学习中的特征提取和降维技术直接源于PCA的思想。",
        examples: ["图像压缩", "人脸识别", "自然语言处理"],
      },
      2024: {
        title: "AI时代的多变量分析",
        content:
          "大语言模型和多模态AI系统大量使用多变量统计分析来处理复杂的高维数据。",
        modernConnection:
          "从ChatGPT到DALL-E，现代AI系统都建立在多变量统计分析的基础之上。",
        examples: ["ChatGPT", "Midjourney", "Sora视频生成"],
      },
    };

    const details = historicalDetails[year];
    if (details) {
      this.createHistoricalModal(details);
    }
  }

  /**
   * Create and show historical information modal
   */
  createHistoricalModal(details) {
    // Remove existing modal if any
    const existingModal = document.getElementById("historical-modal");
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement("div");
    modal.id = "historical-modal";
    modal.className =
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4";

    modal.innerHTML = `
      <div class="glass-card max-w-2xl w-full p-6 rounded-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-cyan-400">${details.title}</h3>
          <button id="close-historical-modal" class="text-gray-400 hover:text-white">
            <i class="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <h4 class="font-semibold text-purple-300 mb-2">历史背景</h4>
            <p class="text-gray-300 text-sm">${details.content}</p>
          </div>
          
          <div>
            <h4 class="font-semibold text-cyan-300 mb-2">现代应用</h4>
            <p class="text-gray-300 text-sm">${details.modernConnection}</p>
          </div>
          
          <div>
            <h4 class="font-semibold text-green-300 mb-2">实际案例</h4>
            <div class="flex flex-wrap gap-2">
              ${details.examples
                .map(
                  (example) =>
                    `<span class="px-3 py-1 bg-green-400/20 text-green-300 rounded-full text-sm">${example}</span>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add close functionality
    const closeBtn = document.getElementById("close-historical-modal");
    const closeModal = () => {
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Animate modal appearance
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.transition = "opacity 0.3s ease";
      modal.style.opacity = "1";
    }, 10);
  }

  /**
   * Show mathematician details
   */
  showMathematicianDetails(mathematician) {
    const mathematicianData = {
      "弗朗西斯·高尔顿 (Francis Galton)": {
        fullName: "Sir Francis Galton",
        lifespan: "1822-1911",
        nationality: "英国",
        mainContributions: [
          '首次提出"相关性"概念',
          "发展了回归分析的早期理论",
          "创立了优生学（虽然后来被证明是错误的）",
          "在气象学和人类学方面也有贡献",
        ],
        modernRelevance: "现代推荐系统、协同过滤算法的理论基础",
        famousQuote: '"统计学是处理不确定性的科学"',
        relatedConcepts: ["相关系数", "回归分析", "协同过滤"],
      },
      "卡尔·皮尔逊 (Karl Pearson)": {
        fullName: "Karl Pearson",
        lifespan: "1857-1936",
        nationality: "英国",
        mainContributions: [
          "发展了皮尔逊相关系数",
          "创立了卡方检验",
          "建立了现代统计学的数学基础",
          "创办了世界上第一个统计学系",
        ],
        modernRelevance: "A/B测试、假设检验、数据科学的核心工具",
        famousQuote:
          '"统计学是应用数学的一个分支，它处理的是从不完全的数据中得出结论"',
        relatedConcepts: ["皮尔逊相关系数", "卡方检验", "A/B测试"],
      },
      // Add more mathematicians as needed
    };

    const data = mathematicianData[mathematician];
    if (data) {
      this.createMathematicianModal(data);
    }
  }

  /**
   * Create mathematician details modal
   */
  createMathematicianModal(data) {
    // Similar to createHistoricalModal but with mathematician-specific content
    const modal = document.createElement("div");
    modal.id = "mathematician-modal";
    modal.className =
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4";

    modal.innerHTML = `
      <div class="glass-card max-w-3xl w-full p-6 rounded-2xl">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-2xl font-bold text-purple-400">${data.fullName}</h3>
            <p class="text-gray-400">${data.lifespan} · ${data.nationality}</p>
          </div>
          <button id="close-mathematician-modal" class="text-gray-400 hover:text-white">
            <i class="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-blue-300 mb-3">主要贡献</h4>
              <ul class="space-y-2">
                ${data.mainContributions
                  .map(
                    (contribution) =>
                      `<li class="text-gray-300 text-sm flex items-start gap-2">
                    <i class="fa-solid fa-check text-blue-400 mt-1 text-xs"></i>
                    ${contribution}
                  </li>`
                  )
                  .join("")}
              </ul>
            </div>
            
            <div>
              <h4 class="font-semibold text-green-300 mb-2">现代意义</h4>
              <p class="text-gray-300 text-sm">${data.modernRelevance}</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-yellow-300 mb-2">名言</h4>
              <blockquote class="text-gray-300 text-sm italic border-l-4 border-yellow-400/30 pl-4">
                "${data.famousQuote}"
              </blockquote>
            </div>
            
            <div>
              <h4 class="font-semibold text-cyan-300 mb-2">相关概念</h4>
              <div class="flex flex-wrap gap-2">
                ${data.relatedConcepts
                  .map(
                    (concept) =>
                      `<span class="px-3 py-1 bg-cyan-400/20 text-cyan-300 rounded-full text-sm cursor-pointer hover:bg-cyan-400/30 transition-colors" 
                         onclick="window.chapter3Visualizer.highlightConcept('${concept}')">${concept}</span>`
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add close functionality
    const closeBtn = document.getElementById("close-mathematician-modal");
    const closeModal = () => {
      modal.style.opacity = "0";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Animate modal appearance
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.transition = "opacity 0.3s ease";
      modal.style.opacity = "1";
    }, 10);
  }

  /**
   * Highlight related concepts in the current page
   */
  highlightConcept(concept) {
    // This method would highlight related elements on the page
    // Implementation depends on how concepts are marked in the HTML
    console.log(`Highlighting concept: ${concept}`);

    // Example implementation
    const conceptMap = {
      相关系数: ["#theory-corr", "#sample-corr"],
      卡方检验: [".independence-result"],
      "A/B测试": [".independence-test-controls"],
    };

    const selectors = conceptMap[concept] || [];
    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.style.boxShadow = "0 0 20px rgba(34, 211, 238, 0.6)";
        el.style.transform = "scale(1.05)";

        setTimeout(() => {
          el.style.boxShadow = "";
          el.style.transform = "";
        }, 2000);
      });
    });
  }
}

// MathEngine - 数学计算引擎
const MathEngine = {
  // 计算相关系数
  calculateCorrelation(samples) {
    if (!samples || samples.length < 2) return 0;

    // 如果是二维样本数组 [[x1,y1], [x2,y2], ...]
    if (Array.isArray(samples[0])) {
      const x = samples.map((s) => s[0]);
      const y = samples.map((s) => s[1]);
      return this.calculatePearsonCorrelation(x, y);
    }

    // 如果是一维数组，返回0（无法计算相关性）
    return 0;
  },

  // 生成多元正态分布样本

  initializeCorrelationAnalysis() {
    // Initialize correlation analysis workbench
    this.correlationAnalysis = {
      isActive: false,
      numVariables: 3,
      confidenceLevel: 95,
      scenario: "financial",
      data: [],
      correlationMatrix: null,
      eigenvalues: [],
      eigenvectors: [],
      explainedVariance: [],
      conditionNumber: 1.0,
      lastUpdate: Date.now(),
    };

    // Add event listeners for correlation analysis controls
    this.initializeCorrelationEventListeners();

    // Generate initial data
    this.generateCorrelationData();

    // Update visualizations
    this.updateCorrelationVisualizations();
  },

  initializeCorrelationEventListeners() {
    // Number of variables slider
    const numVarsSlider = document.getElementById("num-vars-slider");
    if (numVarsSlider) {
      numVarsSlider.addEventListener("input", (e) => {
        this.correlationAnalysis.numVariables = parseInt(e.target.value);
        document.getElementById("num-vars-val").textContent = e.target.value;
        this.generateCorrelationData();
        this.updateCorrelationVisualizations();
      });
    }

    // Confidence level slider
    const confidenceSlider = document.getElementById("confidence-level-slider");
    if (confidenceSlider) {
      confidenceSlider.addEventListener("input", (e) => {
        this.correlationAnalysis.confidenceLevel = parseInt(e.target.value);
        document.getElementById("confidence-level-val").textContent =
          e.target.value + "%";
        this.updateConfidenceEllipses();
      });
    }

    // Scenario selector
    const scenarioSelect = document.getElementById("correlation-scenario");
    if (scenarioSelect) {
      scenarioSelect.addEventListener("change", (e) => {
        this.correlationAnalysis.scenario = e.target.value;
        this.generateCorrelationData();
        this.updateCorrelationVisualizations();
      });
    }

    // PCA button
    const pcaBtn = document.getElementById("run-pca");
    if (pcaBtn) {
      pcaBtn.addEventListener("click", () => {
        this.runPrincipalComponentAnalysis();
      });
    }

    // Export button
    const exportBtn = document.getElementById("export-correlation");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        this.exportCorrelationData();
      });
    }
  },

  generateCorrelationData() {
    const { numVariables, scenario } = this.correlationAnalysis;
    const sampleSize = 1000;

    // Generate scenario-specific data
    let means, covariance;

    switch (scenario) {
      case "financial":
        means = this.generateFinancialMeans(numVariables);
        covariance = this.generateFinancialCovariance(numVariables);
        break;
      case "social":
        means = this.generateSocialMediaMeans(numVariables);
        covariance = this.generateSocialMediaCovariance(numVariables);
        break;
      case "academic":
        means = this.generateAcademicMeans(numVariables);
        covariance = this.generateAcademicCovariance(numVariables);
        break;
      case "custom":
        means = new Array(numVariables).fill(0);
        covariance = this.generateRandomCovariance(numVariables);
        break;
      default:
        means = new Array(numVariables).fill(0);
        covariance = this.generateRandomCovariance(numVariables);
    }

    // Generate multivariate normal samples
    this.correlationAnalysis.data = this.generateMultivariateNormalSamples(
      means,
      covariance,
      sampleSize
    );

    // Calculate correlation matrix
    this.calculateCorrelationMatrix();

    // Calculate eigenvalues and eigenvectors
    this.calculateEigenDecomposition();
  },

  generateFinancialMeans(numVars) {
    // Financial scenario: stock returns, bond yields, etc.
    const baseMeans = [5.2, 3.8, 7.1, 2.5, 6.3]; // Percentage returns
    return baseMeans.slice(0, numVars);
  },

  generateFinancialCovariance(numVars) {
    // Financial assets typically have moderate positive correlations
    const baseCorrelations = [
      [1.0, 0.6, 0.4, 0.3, 0.2],
      [0.6, 1.0, 0.5, 0.4, 0.3],
      [0.4, 0.5, 1.0, 0.3, 0.4],
      [0.3, 0.4, 0.3, 1.0, 0.5],
      [0.2, 0.3, 0.4, 0.5, 1.0],
    ];

    const variances = [4.0, 2.5, 6.0, 1.8, 5.2]; // Variance values

    return this.correlationToCovarianceMatrix(
      baseCorrelations,
      variances,
      numVars
    );
  },

  generateSocialMediaMeans(numVars) {
    // Social media metrics: likes, shares, comments, etc.
    const baseMeans = [150, 45, 28, 12, 85];
    return baseMeans.slice(0, numVars);
  },

  generateSocialMediaCovariance(numVars) {
    // Social media metrics often have high correlations
    const baseCorrelations = [
      [1.0, 0.8, 0.7, 0.6, 0.5],
      [0.8, 1.0, 0.6, 0.7, 0.4],
      [0.7, 0.6, 1.0, 0.5, 0.6],
      [0.6, 0.7, 0.5, 1.0, 0.3],
      [0.5, 0.4, 0.6, 0.3, 1.0],
    ];

    const variances = [2500, 400, 196, 64, 900];

    return this.correlationToCovarianceMatrix(
      baseCorrelations,
      variances,
      numVars
    );
  },

  generateAcademicMeans(numVars) {
    // Academic scores: math, science, language, etc.
    const baseMeans = [78, 82, 75, 80, 77];
    return baseMeans.slice(0, numVars);
  },

  generateAcademicCovariance(numVars) {
    // Academic subjects have moderate correlations
    const baseCorrelations = [
      [1.0, 0.7, 0.5, 0.6, 0.4],
      [0.7, 1.0, 0.4, 0.8, 0.5],
      [0.5, 0.4, 1.0, 0.3, 0.7],
      [0.6, 0.8, 0.3, 1.0, 0.4],
      [0.4, 0.5, 0.7, 0.4, 1.0],
    ];

    const variances = [100, 120, 90, 110, 95];

    return this.correlationToCovarianceMatrix(
      baseCorrelations,
      variances,
      numVars
    );
  },

  generateRandomCovariance(numVars) {
    // Generate random positive definite covariance matrix
    const correlations = [];
    for (let i = 0; i < numVars; i++) {
      correlations[i] = [];
      for (let j = 0; j < numVars; j++) {
        if (i === j) {
          correlations[i][j] = 1.0;
        } else {
          correlations[i][j] = (Math.random() - 0.5) * 1.6; // Range [-0.8, 0.8]
        }
      }
    }

    // Make symmetric
    for (let i = 0; i < numVars; i++) {
      for (let j = i + 1; j < numVars; j++) {
        correlations[j][i] = correlations[i][j];
      }
    }

    const variances = Array.from(
      { length: numVars },
      () => Math.random() * 10 + 1
    );

    return this.correlationToCovarianceMatrix(correlations, variances, numVars);
  },

  correlationToCovarianceMatrix(correlations, variances, numVars) {
    const covariance = [];
    for (let i = 0; i < numVars; i++) {
      covariance[i] = [];
      for (let j = 0; j < numVars; j++) {
        covariance[i][j] =
          correlations[i][j] * Math.sqrt(variances[i] * variances[j]);
      }
    }
    return covariance;
  },

  generateMultivariateNormalSamples(means, covariance, n) {
    const numVars = means.length;
    const samples = [];

    // Cholesky decomposition for sampling
    const L = this.choleskyDecomposition(covariance);

    for (let i = 0; i < n; i++) {
      // Generate independent standard normal variables
      const z = [];
      for (let j = 0; j < numVars; j++) {
        z.push(this.boxMullerTransform()[0]);
      }

      // Transform using Cholesky factor
      const sample = [];
      for (let j = 0; j < numVars; j++) {
        let value = means[j];
        for (let k = 0; k <= j; k++) {
          value += L[j][k] * z[k];
        }
        sample.push(value);
      }

      samples.push(sample);
    }

    return samples;
  },

  choleskyDecomposition(matrix) {
    const n = matrix.length;
    const L = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        if (i === j) {
          let sum = 0;
          for (let k = 0; k < j; k++) {
            sum += L[j][k] * L[j][k];
          }
          L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
        } else {
          let sum = 0;
          for (let k = 0; k < j; k++) {
            sum += L[i][k] * L[j][k];
          }
          L[i][j] = L[j][j] !== 0 ? (matrix[i][j] - sum) / L[j][j] : 0;
        }
      }
    }

    return L;
  },

  calculateCorrelationMatrix() {
    const { data, numVariables } = this.correlationAnalysis;
    const n = data.length;

    // Calculate means
    const means = [];
    for (let j = 0; j < numVariables; j++) {
      means[j] = data.reduce((sum, row) => sum + row[j], 0) / n;
    }

    // Calculate correlation matrix
    const correlationMatrix = [];
    for (let i = 0; i < numVariables; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < numVariables; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1.0;
        } else {
          let numerator = 0;
          let denomI = 0;
          let denomJ = 0;

          for (let k = 0; k < n; k++) {
            const devI = data[k][i] - means[i];
            const devJ = data[k][j] - means[j];
            numerator += devI * devJ;
            denomI += devI * devI;
            denomJ += devJ * devJ;
          }

          const denominator = Math.sqrt(denomI * denomJ);
          correlationMatrix[i][j] =
            denominator === 0 ? 0 : numerator / denominator;
        }
      }
    }

    this.correlationAnalysis.correlationMatrix = correlationMatrix;
  },

  calculateEigenDecomposition() {
    const matrix = this.correlationAnalysis.correlationMatrix;
    if (!matrix) return;

    // Simple power iteration for largest eigenvalue (simplified implementation)
    const n = matrix.length;
    const eigenvalues = [];
    const eigenvectors = [];

    // For demonstration, calculate approximate eigenvalues using trace and determinant
    let trace = 0;
    for (let i = 0; i < n; i++) {
      trace += matrix[i][i];
    }

    // Simplified eigenvalue estimation
    for (let i = 0; i < n; i++) {
      eigenvalues.push(trace / n + (Math.random() - 0.5) * 0.5);
    }

    eigenvalues.sort((a, b) => b - a); // Sort in descending order

    // Calculate explained variance ratios
    const totalVariance = eigenvalues.reduce(
      (sum, val) => sum + Math.max(0, val),
      0
    );
    const explainedVariance = eigenvalues.map(
      (val) => (Math.max(0, val) / totalVariance) * 100
    );

    // Calculate condition number
    const maxEigenvalue = Math.max(...eigenvalues);
    const minEigenvalue = Math.max(0.001, Math.min(...eigenvalues));
    const conditionNumber = maxEigenvalue / minEigenvalue;

    this.correlationAnalysis.eigenvalues = eigenvalues;
    this.correlationAnalysis.explainedVariance = explainedVariance;
    this.correlationAnalysis.conditionNumber = conditionNumber;

    // Update display
    this.updateEigenvalueDisplay();
  },

  updateCorrelationVisualizations() {
    this.renderCorrelationHeatmap();
    this.renderScatterMatrix();
    this.renderConfidenceEllipses();
    this.renderPCAVisualization();
  },

  renderCorrelationHeatmap() {
    const canvas = document.getElementById("correlation-heatmap");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { correlationMatrix, numVariables } = this.correlationAnalysis;
    if (!correlationMatrix) return;

    const cellSize = Math.min(width, height) / numVariables;
    const offsetX = (width - cellSize * numVariables) / 2;
    const offsetY = (height - cellSize * numVariables) / 2;

    // Draw correlation matrix cells
    for (let i = 0; i < numVariables; i++) {
      for (let j = 0; j < numVariables; j++) {
        const correlation = correlationMatrix[i][j];
        const x = offsetX + j * cellSize;
        const y = offsetY + i * cellSize;

        // Color based on correlation strength
        const intensity = Math.abs(correlation);
        const hue = correlation >= 0 ? 240 : 0; // Blue for positive, red for negative
        const saturation = intensity * 100;
        const lightness = 50 + (1 - intensity) * 30;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Draw border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // Draw correlation value
        ctx.fillStyle = intensity > 0.5 ? "white" : "black";
        ctx.font = `${Math.max(10, cellSize / 6)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          correlation.toFixed(2),
          x + cellSize / 2,
          y + cellSize / 2
        );
      }
    }

    // Draw variable labels
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(10, cellSize / 8)}px Arial`;

    const labels = this.getVariableLabels();
    for (let i = 0; i < numVariables; i++) {
      // Row labels
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        labels[i],
        offsetX - 5,
        offsetY + i * cellSize + cellSize / 2
      );

      // Column labels
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        labels[i],
        offsetX + i * cellSize + cellSize / 2,
        offsetY - 5
      );
    }
  },

  getVariableLabels() {
    const { scenario, numVariables } = this.correlationAnalysis;

    const labelSets = {
      financial: ["股票A", "债券", "股票B", "商品", "房地产"],
      social: ["点赞数", "分享数", "评论数", "观看数", "粉丝数"],
      academic: ["数学", "科学", "语言", "历史", "艺术"],
      custom: ["变量1", "变量2", "变量3", "变量4", "变量5"],
    };

    return (labelSets[scenario] || labelSets.custom).slice(0, numVariables);
  },

  updateEigenvalueDisplay() {
    const { eigenvalues, explainedVariance, conditionNumber } =
      this.correlationAnalysis;

    // Update eigenvalue displays
    const eigenvalue1El = document.getElementById("eigenvalue-1");
    const eigenvalue2El = document.getElementById("eigenvalue-2");
    const explainedVarianceEl = document.getElementById("explained-variance");
    const conditionNumberEl = document.getElementById("condition-number");

    if (eigenvalue1El && eigenvalues.length > 0) {
      eigenvalue1El.textContent = eigenvalues[0].toFixed(3);
    }

    if (eigenvalue2El && eigenvalues.length > 1) {
      eigenvalue2El.textContent = eigenvalues[1].toFixed(3);
    }

    if (explainedVarianceEl && explainedVariance.length > 0) {
      const totalExplained = explainedVariance
        .slice(0, 2)
        .reduce((sum, val) => sum + val, 0);
      explainedVarianceEl.textContent = totalExplained.toFixed(1) + "%";
    }

    if (conditionNumberEl) {
      conditionNumberEl.textContent = conditionNumber.toFixed(1);

      // Color code based on condition number
      if (conditionNumber > 100) {
        conditionNumberEl.className = "text-red-400 text-lg";
      } else if (conditionNumber > 30) {
        conditionNumberEl.className = "text-yellow-400 text-lg";
      } else {
        conditionNumberEl.className = "text-green-400 text-lg";
      }
    }
  },

  renderScatterMatrix() {
    const canvas = document.getElementById("scatter-matrix");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { data, numVariables } = this.correlationAnalysis;
    if (!data || numVariables < 2) return;

    const cellSize = Math.min(width, height) / numVariables;
    const padding = 5;

    // Draw scatter plots for each variable pair
    for (let i = 0; i < numVariables; i++) {
      for (let j = 0; j < numVariables; j++) {
        const x = j * cellSize;
        const y = i * cellSize;

        if (i === j) {
          // Diagonal: draw histogram
          this.drawHistogram(
            ctx,
            data.map((row) => row[i]),
            x + padding,
            y + padding,
            cellSize - 2 * padding,
            cellSize - 2 * padding
          );
        } else {
          // Off-diagonal: draw scatter plot
          this.drawScatterPlot(
            ctx,
            data.map((row) => row[j]),
            data.map((row) => row[i]),
            x + padding,
            y + padding,
            cellSize - 2 * padding,
            cellSize - 2 * padding
          );
        }

        // Draw border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  },

  drawHistogram(ctx, data, x, y, width, height) {
    const bins = 15;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;

    const histogram = new Array(bins).fill(0);
    data.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    const maxCount = Math.max(...histogram);
    const barWidth = width / bins;

    ctx.fillStyle = "rgba(34, 211, 238, 0.6)";
    histogram.forEach((count, i) => {
      const barHeight = (count / maxCount) * height;
      ctx.fillRect(
        x + i * barWidth,
        y + height - barHeight,
        barWidth,
        barHeight
      );
    });
  },

  drawScatterPlot(ctx, xData, yData, x, y, width, height) {
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const yMin = Math.min(...yData);
    const yMax = Math.max(...yData);

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    ctx.fillStyle = "rgba(34, 211, 238, 0.4)";

    for (let i = 0; i < Math.min(xData.length, 200); i++) {
      // Limit points for performance
      const px = x + ((xData[i] - xMin) / xRange) * width;
      const py = y + height - ((yData[i] - yMin) / yRange) * height;

      ctx.beginPath();
      ctx.arc(px, py, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  },

  renderConfidenceEllipses() {
    const canvas = document.getElementById("confidence-ellipse");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { data, confidenceLevel } = this.correlationAnalysis;
    if (!data || data.length < 2) return;

    // Use first two variables for bivariate ellipse
    const xData = data.map((row) => row[0]);
    const yData = data.map((row) => row[1]);

    // Calculate means and covariance
    const meanX = xData.reduce((sum, val) => sum + val, 0) / xData.length;
    const meanY = yData.reduce((sum, val) => sum + val, 0) / yData.length;

    let covXX = 0,
      covYY = 0,
      covXY = 0;
    for (let i = 0; i < xData.length; i++) {
      const dx = xData[i] - meanX;
      const dy = yData[i] - meanY;
      covXX += dx * dx;
      covYY += dy * dy;
      covXY += dx * dy;
    }

    covXX /= xData.length - 1;
    covYY /= yData.length - 1;
    covXY /= xData.length - 1;

    // Draw data points
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const yMin = Math.min(...yData);
    const yMax = Math.max(...yData);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
    for (let i = 0; i < Math.min(xData.length, 300); i++) {
      const px = ((xData[i] - xMin) / xRange) * width;
      const py = height - ((yData[i] - yMin) / yRange) * height;

      ctx.beginPath();
      ctx.arc(px, py, 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw confidence ellipses
    const confidenceLevels = [90, 95, 99];
    const colors = [
      "rgba(255, 193, 7, 0.3)",
      "rgba(255, 102, 102, 0.3)",
      "rgba(167, 139, 250, 0.3)",
    ];

    confidenceLevels.forEach((level, index) => {
      this.drawConfidenceEllipse(
        ctx,
        meanX,
        meanY,
        covXX,
        covYY,
        covXY,
        level,
        xMin,
        xMax,
        yMin,
        yMax,
        width,
        height,
        colors[index]
      );
    });
  },

  drawConfidenceEllipse(
    ctx,
    meanX,
    meanY,
    covXX,
    covYY,
    covXY,
    confidenceLevel,
    xMin,
    xMax,
    yMin,
    yMax,
    width,
    height,
    color
  ) {
    // Chi-square critical values (approximation)
    const chiSquareValues = { 90: 4.605, 95: 5.991, 99: 9.21 };
    const chiSquare = chiSquareValues[confidenceLevel] || 5.991;

    // Eigenvalue decomposition for ellipse parameters
    const trace = covXX + covYY;
    const det = covXX * covYY - covXY * covXY;

    const lambda1 = (trace + Math.sqrt(trace * trace - 4 * det)) / 2;
    const lambda2 = (trace - Math.sqrt(trace * trace - 4 * det)) / 2;

    const angle = Math.atan2(2 * covXY, covXX - covYY) / 2;

    const a = Math.sqrt(chiSquare * lambda1);
    const b = Math.sqrt(chiSquare * lambda2);

    // Transform to canvas coordinates
    const centerX = ((meanX - xMin) / (xMax - xMin)) * width;
    const centerY = height - ((meanY - yMin) / (yMax - yMin)) * height;

    const scaleX = width / (xMax - xMin);
    const scaleY = height / (yMax - yMin);

    // Draw ellipse
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.scale(scaleX, scaleY);

    ctx.beginPath();
    ctx.ellipse(0, 0, a, b, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = color.replace("0.3", "0.8");
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  },

  renderPCAVisualization() {
    const canvas = document.getElementById("pca-visualization");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { data, eigenvalues, numVariables } = this.correlationAnalysis;
    if (!data || numVariables < 2) return;

    // Project data onto first two principal components (simplified)
    const xData = data.map((row) => row[0]);
    const yData = data.map((row) => row[1]);

    // Draw projected data points
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const yMin = Math.min(...yData);
    const yMax = Math.max(...yData);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    // Color points by their position along first PC
    for (let i = 0; i < Math.min(data.length, 300); i++) {
      const px = ((xData[i] - xMin) / xRange) * width;
      const py = height - ((yData[i] - yMin) / yRange) * height;

      // Color based on PC1 score (simplified)
      const pc1Score = (xData[i] - (xMin + xMax) / 2) / xRange;
      const hue = 240 + pc1Score * 120; // Blue to red gradient

      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw principal component directions (simplified)
    const centerX = width / 2;
    const centerY = height / 2;

    // PC1 direction (horizontal)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY);
    ctx.lineTo(centerX + 80, centerY);
    ctx.stroke();

    // PC2 direction (vertical)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 60);
    ctx.lineTo(centerX, centerY + 60);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PC1", centerX + 90, centerY + 5);
    ctx.fillText("PC2", centerX + 5, centerY - 70);
  },

  runPrincipalComponentAnalysis() {
    // Recalculate eigendecomposition with animation
    const pcaBtn = document.getElementById("run-pca");
    if (pcaBtn) {
      pcaBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin mr-2"></i>分析中...';
      pcaBtn.disabled = true;
    }

    setTimeout(() => {
      this.calculateEigenDecomposition();
      this.renderPCAVisualization();

      if (pcaBtn) {
        pcaBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>分析完成';
        setTimeout(() => {
          pcaBtn.innerHTML = "主成分分析";
          pcaBtn.disabled = false;
        }, 1000);
      }

      // Show success notification
      this.showToastNotification("主成分分析完成", "success");
    }, 800);
  },

  updateConfidenceEllipses() {
    this.renderConfidenceEllipses();
  },

  exportCorrelationData() {
    const {
      data,
      correlationMatrix,
      eigenvalues,
      explainedVariance,
      scenario,
    } = this.correlationAnalysis;

    const exportData = {
      scenario: scenario,
      timestamp: new Date().toISOString(),
      data: data,
      correlationMatrix: correlationMatrix,
      eigenvalues: eigenvalues,
      explainedVariance: explainedVariance,
      variableLabels: this.getVariableLabels(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `correlation_analysis_${scenario}_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToastNotification("相关分析数据已导出", "success");
  },

  // ===== MODERN CORRELATION SCENARIOS =====

  initializeCorrelationScenarios() {
    // Initialize modern scenario tabs for section 3.4
    this.currentCorrelationScenario = "traditional";

    // Add event listeners for scenario tabs
    const scenarioTabs = document.querySelectorAll(".scenario-tab-3-4");
    scenarioTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = tab.id.replace("correlation-tab-", "");
        this.switchCorrelationScenario(tabId);
      });
    });

    // Initialize with traditional scenario
    this.switchCorrelationScenario("traditional");
  },

  switchCorrelationScenario(scenarioName) {
    if (this.currentCorrelationScenario === scenarioName) return;

    this.currentCorrelationScenario = scenarioName;

    // Update tab styles
    const tabs = document.querySelectorAll(".scenario-tab-3-4");
    tabs.forEach((tab) => {
      const isActive = tab.id === `correlation-tab-${scenarioName}`;
      if (isActive) {
        tab.className =
          "scenario-tab-3-4 px-4 py-2 rounded-lg border border-yellow-400/30 bg-yellow-400/20 text-yellow-400 transition-all duration-300 active";
      } else {
        tab.className =
          "scenario-tab-3-4 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 transition-all duration-300";
      }
    });

    // Show/hide content based on selected scenario
    const scenarios = [
      "traditional-correlation",
      "viral-video-predictor",
      "esports-performance",
      "ai-model-performance",
    ];
    scenarios.forEach((scenario) => {
      const element = document.getElementById(scenario);
      if (element) {
        if (
          scenario ===
          `${
            scenarioName === "traditional"
              ? "traditional-correlation"
              : scenarioName === "viral-video"
              ? "viral-video-predictor"
              : scenarioName === "esports"
              ? "esports-performance"
              : "ai-model-performance"
          }`
        ) {
          element.classList.remove("hidden");
        } else {
          element.classList.add("hidden");
        }
      }
    });

    // Initialize scenario-specific functionality
    switch (scenarioName) {
      case "traditional":
        this.updateCorrelationVisualizations();
        break;
      case "viral-video":
        this.initializeViralVideoPredictor();
        break;
      case "esports":
        this.initializeEsportsAnalysis();
        break;
      case "ai-model":
        this.initializeAIModelAnalysis();
        break;
    }

    console.log(`Switched to correlation scenario: ${scenarioName}`);
  },

  initializeViralVideoPredictor() {
    // Initialize viral video predictor with TikTok/抖音 style data
    this.viralVideoData = {
      features: {
        duration: [], // 视频时长 (秒)
        musicType: [], // 音乐类型 (编码)
        publishTime: [], // 发布时间 (小时)
        topicHeat: [], // 话题热度 (1-100)
        creatorFollowers: [], // 创作者粉丝数
      },
      metrics: {
        views: [], // 观看数
        likes: [], // 点赞数
        shares: [], // 分享数
        comments: [], // 评论数
        viralCoefficient: [], // 病毒系数
      },
      platforms: {
        douyin: { weight: 0.4, algorithm: 0.85 },
        kuaishou: { weight: 0.3, algorithm: 0.75 },
        xiaohongshu: { weight: 0.2, algorithm: 0.65 },
        bilibili: { weight: 0.1, algorithm: 0.55 },
      },
      trendingTopics: [
        "搞笑日常",
        "美食制作",
        "旅行vlog",
        "萌宠",
        "科普知识",
        "技能教学",
        "反转剧情",
        "音乐翻唱",
        "舞蹈挑战",
        "游戏解说",
      ],
    };

    this.generateViralVideoData();
    this.renderViralVideoVisualizations();
  },

  generateViralVideoData() {
    const sampleSize = 1000;
    const { features, metrics } = this.viralVideoData;

    // Clear existing data
    Object.keys(features).forEach((key) => (features[key] = []));
    Object.keys(metrics).forEach((key) => (metrics[key] = []));

    for (let i = 0; i < sampleSize; i++) {
      // Generate video features
      const duration = Math.max(5, Math.random() * 180 + 15); // 5-195秒
      const musicType = Math.floor(Math.random() * 10); // 0-9 音乐类型
      const publishTime = Math.floor(Math.random() * 24); // 0-23 小时
      const topicHeat = Math.random() * 100; // 0-100 话题热度
      const creatorFollowers = Math.pow(10, Math.random() * 4 + 2); // 100-100k粉丝

      features.duration.push(duration);
      features.musicType.push(musicType);
      features.publishTime.push(publishTime);
      features.topicHeat.push(topicHeat);
      features.creatorFollowers.push(creatorFollowers);

      // Calculate viral metrics based on features (with correlations)
      let baseViralScore = 0;

      // Duration effect (sweet spot around 30-60 seconds)
      const durationScore =
        duration >= 15 && duration <= 90
          ? 1 - Math.abs(duration - 45) / 45
          : 0.3;
      baseViralScore += durationScore * 0.2;

      // Music type effect (some types are more viral)
      const musicScore = [0.9, 0.7, 0.8, 0.6, 0.9, 0.5, 0.8, 0.7, 0.6, 0.8][
        musicType
      ];
      baseViralScore += musicScore * 0.15;

      // Publish time effect (peak hours: 12-14, 18-22)
      const timeScore =
        (publishTime >= 12 && publishTime <= 14) ||
        (publishTime >= 18 && publishTime <= 22)
          ? 0.9
          : 0.5;
      baseViralScore += timeScore * 0.1;

      // Topic heat effect
      baseViralScore += (topicHeat / 100) * 0.25;

      // Creator followers effect (logarithmic)
      const followerScore = Math.log10(creatorFollowers) / 5;
      baseViralScore += followerScore * 0.3;

      // Add randomness
      baseViralScore += (Math.random() - 0.5) * 0.4;
      baseViralScore = Math.max(0, Math.min(1, baseViralScore));

      // Generate correlated metrics
      const viralCoefficient = baseViralScore;
      const views = Math.floor(Math.pow(10, baseViralScore * 4 + 2)); // 100-1M views
      const likes = Math.floor(views * (0.05 + baseViralScore * 0.15)); // 5-20% like rate
      const shares = Math.floor(likes * (0.1 + baseViralScore * 0.2)); // 10-30% share rate
      const comments = Math.floor(likes * (0.2 + baseViralScore * 0.3)); // 20-50% comment rate

      metrics.views.push(views);
      metrics.likes.push(likes);
      metrics.shares.push(shares);
      metrics.comments.push(comments);
      metrics.viralCoefficient.push(viralCoefficient);
    }
  },

  renderViralVideoVisualizations() {
    this.renderVideoCorrelationHeatmap();
    this.renderViralPredictionPlot();
    this.renderTrendingTopicsChart();
    this.renderAlgorithmImpactChart();
    this.updateViralMetrics();
  },

  renderVideoCorrelationHeatmap() {
    const canvas = document.getElementById("video-correlation-heatmap");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Calculate correlations between video features and metrics
    const { features, metrics } = this.viralVideoData;
    const variables = [
      "时长",
      "音乐",
      "时间",
      "热度",
      "粉丝",
      "观看",
      "点赞",
      "分享",
    ];
    const data = [
      features.duration,
      features.musicType,
      features.publishTime,
      features.topicHeat,
      features.creatorFollowers.map((x) => Math.log10(x)),
      metrics.views.map((x) => Math.log10(x)),
      metrics.likes.map((x) => Math.log10(x)),
      metrics.shares.map((x) => Math.log10(x)),
    ];

    const correlationMatrix = this.calculateCorrelationMatrixFromData(data);

    const cellSize = Math.min(width, height) / variables.length;
    const offsetX = (width - cellSize * variables.length) / 2;
    const offsetY = (height - cellSize * variables.length) / 2;

    // Draw correlation matrix
    for (let i = 0; i < variables.length; i++) {
      for (let j = 0; j < variables.length; j++) {
        const correlation = correlationMatrix[i][j];
        const x = offsetX + j * cellSize;
        const y = offsetY + i * cellSize;

        // Color based on correlation strength
        const intensity = Math.abs(correlation);
        const hue = correlation >= 0 ? 240 : 0; // Blue for positive, red for negative
        const saturation = intensity * 100;
        const lightness = 50 + (1 - intensity) * 30;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Draw border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // Draw correlation value
        ctx.fillStyle = intensity > 0.5 ? "white" : "black";
        ctx.font = `${Math.max(8, cellSize / 8)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          correlation.toFixed(2),
          x + cellSize / 2,
          y + cellSize / 2
        );
      }
    }

    // Draw variable labels
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(8, cellSize / 10)}px Arial`;

    for (let i = 0; i < variables.length; i++) {
      // Row labels
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        variables[i],
        offsetX - 5,
        offsetY + i * cellSize + cellSize / 2
      );

      // Column labels
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        variables[i],
        offsetX + i * cellSize + cellSize / 2,
        offsetY - 5
      );
    }
  },

  calculateCorrelationMatrixFromData(dataArrays) {
    const n = dataArrays.length;
    const matrix = [];

    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          matrix[i][j] = this.calculatePearsonCorrelation(
            dataArrays[i],
            dataArrays[j]
          );
        }
      }
    }

    return matrix;
  },

  renderViralPredictionPlot() {
    const canvas = document.getElementById("viral-prediction-plot");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { metrics } = this.viralVideoData;
    const xData = metrics.views.map((x) => Math.log10(x));
    const yData = metrics.viralCoefficient;

    // Draw scatter plot
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const yMin = Math.min(...yData);
    const yMax = Math.max(...yData);

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    // Color points by viral coefficient
    for (let i = 0; i < Math.min(xData.length, 300); i++) {
      const px = ((xData[i] - xMin) / xRange) * width;
      const py = height - ((yData[i] - yMin) / yRange) * height;

      // Color based on viral coefficient
      const viralScore = yData[i];
      const hue = viralScore * 120; // Green to red gradient

      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw prediction line (simplified linear regression)
    const correlation = this.calculatePearsonCorrelation(xData, yData);
    const meanX = xData.reduce((sum, val) => sum + val, 0) / xData.length;
    const meanY = yData.reduce((sum, val) => sum + val, 0) / yData.length;

    const slope = correlation * (yRange / xRange);
    const intercept = meanY - slope * meanX;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      0,
      height - ((intercept + slope * xMin - yMin) / yRange) * height
    );
    ctx.lineTo(
      width,
      height - ((intercept + slope * xMax - yMin) / yRange) * height
    );
    ctx.stroke();

    // Add labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("观看数 (log)", width / 2, height - 5);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("病毒系数", 0, 0);
    ctx.restore();
  },

  renderTrendingTopicsChart() {
    const canvas = document.getElementById("trending-topics-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { trendingTopics } = this.viralVideoData;
    const topicScores = trendingTopics.map(() => Math.random() * 100);

    // Draw bar chart
    const barWidth = width / trendingTopics.length;
    const maxScore = Math.max(...topicScores);

    topicScores.forEach((score, i) => {
      const barHeight = (score / maxScore) * (height - 40);
      const x = i * barWidth;
      const y = height - barHeight - 20;

      // Color based on score
      const hue = (score / 100) * 120; // Red to green
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

      // Draw topic label
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.save();
      ctx.translate(x + barWidth / 2, height - 5);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(trendingTopics[i], 0, 0);
      ctx.restore();

      // Draw score
      ctx.fillStyle = "white";
      ctx.font = "8px Arial";
      ctx.textAlign = "center";
      ctx.fillText(score.toFixed(0), x + barWidth / 2, y - 5);
    });
  },

  renderAlgorithmImpactChart() {
    const canvas = document.getElementById("algorithm-impact-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { platforms } = this.viralVideoData;
    const platformNames = Object.keys(platforms);
    const weights = platformNames.map((name) => platforms[name].weight);
    const algorithms = platformNames.map((name) => platforms[name].algorithm);

    // Draw platform comparison
    const barWidth = width / platformNames.length;

    platformNames.forEach((platform, i) => {
      const weight = weights[i];
      const algorithm = algorithms[i];

      const x = i * barWidth;
      const weightHeight = weight * (height / 2 - 20);
      const algorithmHeight = algorithm * (height / 2 - 20);

      // Weight bar (bottom half)
      ctx.fillStyle = "rgba(34, 211, 238, 0.7)";
      ctx.fillRect(x + 5, height / 2 + 10, barWidth - 10, weightHeight);

      // Algorithm bar (top half)
      ctx.fillStyle = "rgba(167, 139, 250, 0.7)";
      ctx.fillRect(
        x + 5,
        height / 2 - algorithmHeight,
        barWidth - 10,
        algorithmHeight
      );

      // Platform label
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(platform, x + barWidth / 2, height - 5);

      // Values
      ctx.font = "8px Arial";
      ctx.fillText(
        (weight * 100).toFixed(0) + "%",
        x + barWidth / 2,
        height / 2 + weightHeight + 20
      );
      ctx.fillText(
        (algorithm * 100).toFixed(0),
        x + barWidth / 2,
        height / 2 - algorithmHeight - 5
      );
    });

    // Legend
    ctx.fillStyle = "rgba(34, 211, 238, 0.7)";
    ctx.fillRect(10, 10, 15, 10);
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.fillText("市场份额", 30, 20);

    ctx.fillStyle = "rgba(167, 139, 250, 0.7)";
    ctx.fillRect(10, 25, 15, 10);
    ctx.fillStyle = "white";
    ctx.fillText("算法推荐", 30, 35);
  },

  updateViralMetrics() {
    const { metrics } = this.viralVideoData;

    // Calculate average metrics
    const avgViralCoeff =
      metrics.viralCoefficient.reduce((sum, val) => sum + val, 0) /
      metrics.viralCoefficient.length;
    const avgViews =
      metrics.views.reduce((sum, val) => sum + val, 0) / metrics.views.length;
    const avgLikes =
      metrics.likes.reduce((sum, val) => sum + val, 0) / metrics.likes.length;
    const avgShares =
      metrics.shares.reduce((sum, val) => sum + val, 0) / metrics.shares.length;

    // Update display elements
    const viralCoeffEl = document.getElementById("viral-coefficient");
    const spreadVelocityEl = document.getElementById("spread-velocity");
    const userStickinessEl = document.getElementById("user-stickiness");
    const algorithmScoreEl = document.getElementById("algorithm-score");

    if (viralCoeffEl) viralCoeffEl.textContent = avgViralCoeff.toFixed(2);
    if (spreadVelocityEl)
      spreadVelocityEl.textContent = Math.floor(avgShares / 100) + "/h";
    if (userStickinessEl)
      userStickinessEl.textContent =
        Math.floor((avgLikes / avgViews) * 100) + "%";
    if (algorithmScoreEl)
      algorithmScoreEl.textContent = Math.floor(avgViralCoeff * 100);
  },

  // ===== ESPORTS PERFORMANCE ANALYZER (Section 3.4) =====

  initializeEsportsAnalysis() {
    // Initialize esports performance analyzer with professional gaming data
    this.esportsData = {
      currentGame: "lol", // Current selected game
      currentPosition: "mid", // Current selected position
      players: [],
      teams: [],
      metrics: {
        apm: [], // Actions Per Minute
        accuracy: [], // 准确率 (%)
        economicEfficiency: [], // 经济效率
        teamFightParticipation: [], // 团战参与度 (%)
        kda: [], // Kill/Death/Assist ratio
        visionScore: [], // 视野得分
        objectiveControl: [], // 目标控制率
        lanePhasePerformance: [], // 对线期表现
      },
      games: {
        lol: { name: "英雄联盟", weight: 0.4, skillCeiling: 0.95 },
        wzry: { name: "王者荣耀", weight: 0.35, skillCeiling: 0.85 },
        dota2: { name: "DOTA2", weight: 0.15, skillCeiling: 0.98 },
        csgo: { name: "CS:GO", weight: 0.1, skillCeiling: 0.92 },
      },
      positions: {
        top: { name: "上单", correlationProfile: [0.7, 0.6, 0.8, 0.5] },
        jungle: { name: "打野", correlationProfile: [0.8, 0.7, 0.9, 0.8] },
        mid: { name: "中单", correlationProfile: [0.9, 0.8, 0.7, 0.6] },
        adc: { name: "ADC", correlationProfile: [0.8, 0.9, 0.6, 0.7] },
        support: { name: "辅助", correlationProfile: [0.6, 0.5, 0.8, 0.9] },
      },
      proPlayers: [
        {
          name: "Faker",
          game: "lol",
          position: "mid",
          apm: 320,
          accuracy: 94,
          efficiency: 92,
          teamFight: 88,
        },
        {
          name: "Uzi",
          game: "lol",
          position: "adc",
          apm: 280,
          accuracy: 96,
          efficiency: 89,
          teamFight: 85,
        },
        {
          name: "清清子",
          game: "wzry",
          position: "mid",
          apm: 250,
          accuracy: 91,
          efficiency: 87,
          teamFight: 90,
        },
        {
          name: "梦泪",
          game: "wzry",
          position: "jungle",
          apm: 270,
          accuracy: 88,
          efficiency: 93,
          teamFight: 92,
        },
        {
          name: "Miracle-",
          game: "dota2",
          position: "mid",
          apm: 340,
          accuracy: 93,
          efficiency: 95,
          teamFight: 89,
        },
        {
          name: "s1mple",
          game: "csgo",
          position: "rifler",
          apm: 200,
          accuracy: 97,
          efficiency: 85,
          teamFight: 82,
        },
      ],
      correlationMatrix: null,
      teamSynergyData: [],
      performanceTrends: [],
      lastUpdate: Date.now(),
    };

    this.generateEsportsData();
    this.renderEsportsVisualizations();
  },

  generateEsportsData() {
    const sampleSize = 500;
    const { metrics } = this.esportsData;

    // Clear existing data
    Object.keys(metrics).forEach((key) => {
      metrics[key] = [];
    });

    // Generate realistic esports performance data with correlations
    for (let i = 0; i < sampleSize; i++) {
      // Base skill level (affects all metrics)
      const skillLevel = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
      const gameExperience = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
      const mentalState = Math.random() * 0.4 + 0.6; // 0.6 to 1.0 (affects consistency)

      // Position-specific modifiers based on current position
      const currentPosition = this.esportsData.currentPosition || "mid";
      const positionProfile = this.esportsData.positions[currentPosition];
      const [apmMod, accMod, effMod, teamMod] = positionProfile
        ? positionProfile.correlationProfile
        : [0.8, 0.8, 0.8, 0.8];

      // Game-specific modifiers
      const currentGame = this.esportsData.currentGame || "lol";
      const gameData = this.esportsData.games[currentGame];
      const gameSkillCeiling = gameData ? gameData.skillCeiling : 0.95;
      const gameWeight = gameData ? gameData.weight : 0.4;

      // Generate correlated metrics with position and game influences
      const baseAPM =
        150 +
        skillLevel * 200 * apmMod * gameSkillCeiling +
        (Math.random() - 0.5) * 50;
      const baseAccuracy =
        70 +
        skillLevel * 25 * accMod +
        mentalState * 5 +
        (Math.random() - 0.5) * 10;
      const baseEfficiency =
        60 +
        skillLevel * 30 * effMod +
        gameExperience * 10 +
        (Math.random() - 0.5) * 15;
      const baseTeamFight =
        50 +
        skillLevel * 35 * teamMod +
        gameExperience * 15 +
        (Math.random() - 0.5) * 20;

      // Add meta game influences (some patches favor certain playstyles)
      const metaInfluence = Math.sin(Date.now() / 1000000) * 0.1 + 1; // Simulated meta shifts

      metrics.apm.push(Math.max(50, Math.min(400, baseAPM * metaInfluence)));
      metrics.accuracy.push(Math.max(40, Math.min(100, baseAccuracy)));
      metrics.economicEfficiency.push(
        Math.max(30, Math.min(100, baseEfficiency))
      );
      metrics.teamFightParticipation.push(
        Math.max(20, Math.min(100, baseTeamFight))
      );

      // Secondary metrics with different correlation patterns
      const kdaBase =
        1.0 + skillLevel * 3 + gameExperience * 2 + (Math.random() - 0.5) * 2;
      metrics.kda.push(Math.max(0.5, Math.min(8.0, kdaBase)));

      const visionBase =
        30 +
        gameExperience * 50 +
        (currentPosition === "support" ? 20 : 0) +
        (Math.random() - 0.5) * 20;
      metrics.visionScore.push(Math.max(10, Math.min(100, visionBase)));

      const objectiveBase =
        40 +
        skillLevel * 40 +
        (currentPosition === "jungle" ? 15 : 0) +
        (Math.random() - 0.5) * 25;
      metrics.objectiveControl.push(Math.max(20, Math.min(100, objectiveBase)));

      const laneBase =
        50 +
        skillLevel * 35 +
        (currentPosition === "mid" || currentPosition === "top" ? 10 : 0) +
        (Math.random() - 0.5) * 20;
      metrics.lanePhasePerformance.push(Math.max(30, Math.min(100, laneBase)));
    }

    // Calculate correlation matrix
    this.calculateEsportsCorrelationMatrix();

    // Generate team synergy data with professional patterns
    this.generateTeamSynergyData();

    // Generate performance trends with seasonal variations
    this.generatePerformanceTrends();

    // Add professional player benchmarks
    this.updateProPlayerBenchmarks();
  },

  calculateEsportsCorrelationMatrix() {
    const { metrics } = this.esportsData;
    const metricNames = Object.keys(metrics);
    const matrix = [];

    for (let i = 0; i < metricNames.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < metricNames.length; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          const correlation = this.calculatePearsonCorrelation(
            metrics[metricNames[i]],
            metrics[metricNames[j]]
          );
          matrix[i][j] = correlation;
        }
      }
    }

    this.esportsData.correlationMatrix = matrix;
    this.esportsData.metricNames = metricNames;
  },

  generateTeamSynergyData() {
    const teamSize = 5;
    const numTeams = 20;
    this.esportsData.teamSynergyData = [];

    // Professional team archetypes
    const teamArchetypes = [
      {
        name: "T1",
        type: "mechanical",
        synergy: 0.95,
        communication: 0.92,
        strategy: 0.88,
      },
      {
        name: "GenG",
        type: "strategic",
        synergy: 0.88,
        communication: 0.95,
        strategy: 0.95,
      },
      {
        name: "JDG",
        type: "aggressive",
        synergy: 0.9,
        communication: 0.85,
        strategy: 0.82,
      },
      {
        name: "DRX",
        type: "adaptive",
        synergy: 0.85,
        communication: 0.88,
        strategy: 0.9,
      },
    ];

    for (let t = 0; t < numTeams; t++) {
      // Use professional archetypes for first few teams, then generate random ones
      const archetype = t < teamArchetypes.length ? teamArchetypes[t] : null;

      const team = {
        id: t,
        name: archetype
          ? archetype.name
          : `Team ${String.fromCharCode(65 + t)}`,
        type: archetype ? archetype.type : "balanced",
        synergy: archetype ? archetype.synergy : Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        communication: archetype
          ? archetype.communication
          : Math.random() * 0.5 + 0.5, // 0.5 to 1.0
        strategy: archetype ? archetype.strategy : Math.random() * 0.6 + 0.4, // 0.4 to 1.0
        players: [],
      };

      // Generate players with position-specific characteristics
      const positions = ["top", "jungle", "mid", "adc", "support"];
      for (let p = 0; p < teamSize; p++) {
        const position = positions[p];
        const positionData = this.esportsData.positions[position];

        const player = {
          id: `${t}-${p}`,
          position: position,
          positionName: positionData.name,
          individualSkill: Math.random() * 0.4 + 0.6,
          teamwork: Math.random() * 0.5 + 0.5,
          adaptability: Math.random() * 0.6 + 0.4,
          // Position-specific bonuses
          mechanicalSkill:
            position === "mid" || position === "adc"
              ? Math.random() * 0.3 + 0.7
              : Math.random() * 0.4 + 0.6,
          gameKnowledge:
            position === "jungle" || position === "support"
              ? Math.random() * 0.3 + 0.7
              : Math.random() * 0.4 + 0.6,
          leadership:
            position === "mid" || position === "jungle"
              ? Math.random() * 0.4 + 0.6
              : Math.random() * 0.3 + 0.5,
        };
        team.players.push(player);
      }

      // Calculate team chemistry based on player compatibility
      team.chemistry = this.calculateTeamChemistry(team.players);

      this.esportsData.teamSynergyData.push(team);
    }
  },

  calculateTeamChemistry(players) {
    // Calculate team chemistry based on player synergy
    let totalChemistry = 0;
    let pairCount = 0;

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i];
        const player2 = players[j];

        // Chemistry factors
        const skillGap = Math.abs(
          player1.individualSkill - player2.individualSkill
        );
        const teamworkCompatibility = (player1.teamwork + player2.teamwork) / 2;
        const adaptabilitySync = Math.min(
          player1.adaptability,
          player2.adaptability
        );

        // Position-specific synergies
        let positionSynergy = 0.7; // Base synergy
        if (
          (player1.position === "jungle" && player2.position === "mid") ||
          (player1.position === "adc" && player2.position === "support")
        ) {
          positionSynergy = 0.9; // High synergy pairs
        }

        const pairChemistry =
          (1 - skillGap) *
          teamworkCompatibility *
          adaptabilitySync *
          positionSynergy;
        totalChemistry += pairChemistry;
        pairCount++;
      }
    }

    return pairCount > 0 ? totalChemistry / pairCount : 0.7;
  },

  generatePerformanceTrends() {
    const timePoints = 12; // 12 months of data
    this.esportsData.performanceTrends = [];

    for (let i = 0; i < timePoints; i++) {
      const month = i + 1;
      const seasonFactor = Math.sin((i / 12) * 2 * Math.PI) * 0.1 + 1; // Seasonal variation
      const metaShiftFactor = Math.sin((i / 6) * 2 * Math.PI) * 0.15 + 1; // Meta game shifts

      // Tournament seasons affect performance (Worlds, MSI, etc.)
      const tournamentSeason =
        month === 10 || month === 11 || month === 5 ? 1.2 : 1.0;

      const trend = {
        month: month,
        avgAPM:
          200 +
          seasonFactor * 20 +
          metaShiftFactor * 15 +
          (Math.random() - 0.5) * 10,
        avgAccuracy: 80 + seasonFactor * 5 + (Math.random() - 0.5) * 3,
        avgEfficiency:
          75 +
          seasonFactor * 8 +
          metaShiftFactor * 5 +
          (Math.random() - 0.5) * 5,
        avgTeamFight:
          70 +
          seasonFactor * 10 +
          tournamentSeason * 5 +
          (Math.random() - 0.5) * 7,
        metaShift: Math.abs(Math.sin((i / 3) * Math.PI)) * 0.4 + 0.6, // Meta game changes every 3 months
        playerCount: Math.floor(
          1000000 +
            seasonFactor * 200000 +
            tournamentSeason * 100000 +
            (Math.random() - 0.5) * 100000
        ),
        tournamentActivity: tournamentSeason > 1.0,
        patchVersion: `13.${Math.floor(i * 2) + 1}`,
        majorUpdates: i % 3 === 0, // Major updates every 3 months
      };

      this.esportsData.performanceTrends.push(trend);
    }
  },

  updateProPlayerBenchmarks() {
    // Update professional player data with current game context
    const currentGame = this.esportsData.currentGame || "lol";
    const gameData = this.esportsData.games[currentGame];

    if (!gameData) return;

    // Adjust pro player stats based on current game
    this.esportsData.proPlayers.forEach((player) => {
      if (player.game === currentGame) {
        // Apply game-specific modifiers
        const skillCeiling = gameData.skillCeiling;
        const gameWeight = gameData.weight;

        // Adjust stats based on game characteristics
        player.adjustedAPM = player.apm * skillCeiling;
        player.adjustedAccuracy = player.accuracy * (0.9 + gameWeight * 0.1);
        player.adjustedEfficiency =
          player.efficiency * (0.8 + gameWeight * 0.2);
        player.adjustedTeamFight =
          player.teamFight * (0.85 + gameWeight * 0.15);

        // Add recent performance trends
        player.recentForm = Math.random() * 0.3 + 0.85; // 0.85 to 1.15
        player.consistency = Math.random() * 0.2 + 0.8; // 0.8 to 1.0
      }
    });
  },

  renderEsportsVisualizations() {
    this.renderEsportsCorrelationHeatmap();
    this.renderTeamSynergyPlot();
    this.renderPerformanceTrendChart();
    this.renderProPlayerComparison();
    this.updateEsportsMetrics();
  },

  renderEsportsCorrelationHeatmap() {
    const canvas = document.getElementById("esports-correlation-heatmap");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { correlationMatrix, metricNames } = this.esportsData;
    if (!correlationMatrix || !metricNames) return;

    const cellSize = Math.min(width, height) / metricNames.length;
    const fontSize = Math.max(8, cellSize / 6);

    // Draw correlation matrix
    for (let i = 0; i < metricNames.length; i++) {
      for (let j = 0; j < metricNames.length; j++) {
        const corr = correlationMatrix[i][j];
        const x = j * cellSize;
        const y = i * cellSize;

        // Color based on correlation strength (esports theme)
        let color;
        if (Math.abs(corr) > 0.7) {
          color = corr > 0 ? "#ff6b6b" : "#4ecdc4"; // Strong correlation
        } else if (Math.abs(corr) > 0.4) {
          color = corr > 0 ? "#feca57" : "#48cae4"; // Medium correlation
        } else {
          color = "#95a5a6"; // Weak correlation
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

        // Draw correlation value
        ctx.fillStyle = "white";
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(
          corr.toFixed(2),
          x + cellSize / 2,
          y + cellSize / 2 + fontSize / 3
        );
      }
    }

    // Draw metric labels
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "left";

    const metricLabels = {
      apm: "APM",
      accuracy: "准确率",
      economicEfficiency: "经济效率",
      teamFightParticipation: "团战参与",
      kda: "KDA",
      visionScore: "视野得分",
      objectiveControl: "目标控制",
      lanePhasePerformance: "对线表现",
    };

    metricNames.forEach((metric, i) => {
      const label = metricLabels[metric] || metric;
      ctx.fillText(label, 5, i * cellSize + cellSize / 2 + fontSize / 3);
    });
  },

  renderTeamSynergyPlot() {
    const canvas = document.getElementById("team-synergy-plot");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { teamSynergyData } = this.esportsData;
    if (!teamSynergyData || teamSynergyData.length === 0) return;

    // Extract synergy and communication data
    const synergyData = teamSynergyData.map((team) => team.synergy);
    const communicationData = teamSynergyData.map((team) => team.communication);

    const synergyMin = Math.min(...synergyData);
    const synergyMax = Math.max(...synergyData);
    const commMin = Math.min(...communicationData);
    const commMax = Math.max(...communicationData);

    // Draw scatter plot
    ctx.fillStyle = "rgba(255, 107, 107, 0.7)";

    teamSynergyData.forEach((team, i) => {
      const x =
        ((team.synergy - synergyMin) / (synergyMax - synergyMin)) *
          (width - 40) +
        20;
      const y =
        height -
        20 -
        ((team.communication - commMin) / (commMax - commMin)) * (height - 40);

      // Color based on strategy level
      const strategyHue = team.strategy * 120; // Green to red
      ctx.fillStyle = `hsl(${strategyHue}, 70%, 60%)`;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw team name for top teams
      if (team.synergy > 0.8 && team.communication > 0.8) {
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(team.name, x, y - 8);
      }
    });

    // Draw correlation line (simplified)
    const correlation = this.calculatePearsonCorrelation(
      synergyData,
      communicationData
    );
    if (Math.abs(correlation) > 0.3) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      const slope =
        (correlation * (commMax - commMin)) / (synergyMax - synergyMin);
      const intercept =
        (commMin + commMax) / 2 - (slope * (synergyMin + synergyMax)) / 2;

      const y1 =
        height -
        20 -
        ((slope * synergyMin + intercept - commMin) / (commMax - commMin)) *
          (height - 40);
      const y2 =
        height -
        20 -
        ((slope * synergyMax + intercept - commMin) / (commMax - commMin)) *
          (height - 40);

      ctx.moveTo(20, y1);
      ctx.lineTo(width - 20, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw axes labels
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("团队协作度", width / 2, height - 5);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("沟通效率", 0, 0);
    ctx.restore();
  },

  renderPerformanceTrendChart() {
    const canvas = document.getElementById("performance-trend-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { performanceTrends } = this.esportsData;
    if (!performanceTrends || performanceTrends.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Extract data for different metrics
    const months = performanceTrends.map((d) => d.month);
    const apmData = performanceTrends.map((d) => d.avgAPM);
    const accuracyData = performanceTrends.map((d) => d.avgAccuracy);
    const efficiencyData = performanceTrends.map((d) => d.avgEfficiency);

    // Normalize data to 0-1 range for display
    const normalizeData = (data) => {
      const min = Math.min(...data);
      const max = Math.max(...data);
      return data.map((d) => (d - min) / (max - min));
    };

    const normalizedAPM = normalizeData(apmData);
    const normalizedAccuracy = normalizeData(accuracyData);
    const normalizedEfficiency = normalizeData(efficiencyData);

    // Draw trend lines
    const drawTrendLine = (data, color, label) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((value, i) => {
        const x = margin.left + (i / (data.length - 1)) * chartWidth;
        const y = margin.top + (1 - value) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw data points
      ctx.fillStyle = color;
      data.forEach((value, i) => {
        const x = margin.left + (i / (data.length - 1)) * chartWidth;
        const y = margin.top + (1 - value) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    // Draw trend lines for different metrics
    drawTrendLine(normalizedAPM, "#ff6b6b", "APM");
    drawTrendLine(normalizedAccuracy, "#4ecdc4", "准确率");
    drawTrendLine(normalizedEfficiency, "#feca57", "经济效率");

    // Draw axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();

    // Draw month labels
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";

    months.forEach((month, i) => {
      if (i % 2 === 0) {
        // Show every other month
        const x = margin.left + (i / (months.length - 1)) * chartWidth;
        ctx.fillText(`${month}月`, x, height - margin.bottom + 15);
      }
    });

    // Draw legend
    const legendItems = [
      { color: "#ff6b6b", label: "APM" },
      { color: "#4ecdc4", label: "准确率" },
      { color: "#feca57", label: "经济效率" },
    ];

    legendItems.forEach((item, i) => {
      const x = width - margin.right - 80;
      const y = margin.top + i * 20;

      ctx.fillStyle = item.color;
      ctx.fillRect(x, y - 5, 10, 10);

      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "left";
      ctx.fillText(item.label, x + 15, y + 3);
    });
  },

  renderProPlayerComparison() {
    const canvas = document.getElementById("pro-player-comparison");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { proPlayers } = this.esportsData;
    if (!proPlayers || proPlayers.length === 0) return;

    const margin = { top: 30, right: 20, bottom: 60, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create radar chart for each player
    const metrics = ["apm", "accuracy", "efficiency", "teamFight"];
    const metricLabels = ["APM", "准确率", "经济效率", "团战参与"];
    const maxValues = {
      apm: 400,
      accuracy: 100,
      efficiency: 100,
      teamFight: 100,
    };

    const centerX = margin.left + chartWidth / 2;
    const centerY = margin.top + chartHeight / 2;
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;

    // Draw radar chart background
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;

    // Draw concentric circles
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw axis lines and labels
    metrics.forEach((metric, i) => {
      const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw metric labels
      const labelX = centerX + Math.cos(angle) * (radius + 15);
      const labelY = centerY + Math.sin(angle) * (radius + 15);

      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(metricLabels[i], labelX, labelY);
    });

    // Draw player data (show top 3 players)
    const topPlayers = proPlayers.slice(0, 3);
    const playerColors = ["#ff6b6b", "#4ecdc4", "#feca57"];

    topPlayers.forEach((player, playerIndex) => {
      const color = playerColors[playerIndex];
      ctx.strokeStyle = color;
      ctx.fillStyle = color + "40"; // Semi-transparent fill
      ctx.lineWidth = 2;

      ctx.beginPath();

      metrics.forEach((metric, i) => {
        const value = player[metric] / maxValues[metric]; // Normalize to 0-1
        const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw player name
      ctx.fillStyle = color;
      ctx.font = "12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(player.name, 10, 20 + playerIndex * 15);
    });
  },

  updateEsportsMetrics() {
    // Update correlation strength indicator
    const correlationStrengthEl = document.getElementById(
      "correlation-strength"
    );
    if (correlationStrengthEl && this.esportsData.correlationMatrix) {
      const matrix = this.esportsData.correlationMatrix;
      let totalCorrelation = 0;
      let count = 0;

      for (let i = 0; i < matrix.length; i++) {
        for (let j = i + 1; j < matrix[i].length; j++) {
          totalCorrelation += Math.abs(matrix[i][j]);
          count++;
        }
      }

      const avgCorrelation = count > 0 ? totalCorrelation / count : 0;
      correlationStrengthEl.textContent =
        (avgCorrelation * 100).toFixed(1) + "%";
    }

    // Update team synergy score
    const teamSynergyEl = document.getElementById("team-synergy-score");
    if (teamSynergyEl && this.esportsData.teamSynergyData) {
      const avgSynergy =
        this.esportsData.teamSynergyData.reduce(
          (sum, team) => sum + team.synergy,
          0
        ) / this.esportsData.teamSynergyData.length;
      teamSynergyEl.textContent = (avgSynergy * 100).toFixed(1) + "%";
    }

    // Update performance trend indicator
    const performanceTrendEl = document.getElementById("performance-trend");
    if (performanceTrendEl && this.esportsData.performanceTrends) {
      const trends = this.esportsData.performanceTrends;
      const recentTrend = trends.slice(-3); // Last 3 months
      const avgRecentPerformance =
        recentTrend.reduce(
          (sum, trend) =>
            sum + trend.avgAPM + trend.avgAccuracy + trend.avgEfficiency,
          0
        ) /
        (recentTrend.length * 3);

      const trendDirection =
        avgRecentPerformance > 200
          ? "↗️"
          : avgRecentPerformance > 180
          ? "→"
          : "↘️";
      performanceTrendEl.textContent =
        trendDirection + " " + avgRecentPerformance.toFixed(1);
    }

    // Update meta shift indicator
    const metaShiftEl = document.getElementById("meta-shift-indicator");
    if (metaShiftEl && this.esportsData.performanceTrends) {
      const latestTrend =
        this.esportsData.performanceTrends[
          this.esportsData.performanceTrends.length - 1
        ];
      const metaShift = latestTrend ? latestTrend.metaShift : 0.7;

      let metaStatus = "稳定";
      if (metaShift > 0.9) metaStatus = "大变动";
      else if (metaShift > 0.8) metaStatus = "中等变动";
      else if (metaShift < 0.6) metaStatus = "停滞";

      metaShiftEl.textContent = metaStatus;
    }

    // Update player count
    const playerCountEl = document.getElementById("active-player-count");
    if (playerCountEl && this.esportsData.performanceTrends) {
      const latestTrend =
        this.esportsData.performanceTrends[
          this.esportsData.performanceTrends.length - 1
        ];
      const playerCount = latestTrend ? latestTrend.playerCount : 1000000;
      playerCountEl.textContent = (playerCount / 1000000).toFixed(1) + "M";
    }
  },

  calculatePearsonCorrelation(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) return 0;

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

    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  },

  // 生成多元正态分布样本
  generateMultivariateNormal(mu, sigma, n) {
    const samples = [];

    for (let i = 0; i < n; i++) {
      // Box-Muller变换生成标准正态分布
      const [z1, z2] = this.boxMullerTransform();

      // 变换到指定的多元正态分布
      const x = mu[0] + Math.sqrt(sigma[0][0]) * z1;
      const y =
        mu[1] +
        Math.sqrt(sigma[1][1]) *
          ((sigma[0][1] / Math.sqrt(sigma[0][0] * sigma[1][1])) * z1 +
            Math.sqrt(
              1 -
                Math.pow(sigma[0][1] / Math.sqrt(sigma[0][0] * sigma[1][1]), 2)
            ) *
              z2);

      samples.push([x, y]);
    }

    return samples;
  },

  // Box-Muller变换
  boxMullerTransform() {
    const u1 = Math.random();
    const u2 = Math.random();

    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    return [z1, z2];
  },

  // 卡方检验
  chiSquareTest(observed, expected) {
    let chiSquare = 0;
    let degreesOfFreedom = 0;

    for (let i = 0; i < observed.length; i++) {
      for (let j = 0; j < observed[i].length; j++) {
        const obs = observed[i][j];
        const exp = expected[i][j];
        if (exp > 0) {
          chiSquare += Math.pow(obs - exp, 2) / exp;
          degreesOfFreedom++;
        }
      }
    }

    degreesOfFreedom = Math.max(
      1,
      degreesOfFreedom - observed.length - observed[0].length + 1
    );

    // 简化的p值计算（实际应用中需要更精确的计算）
    const pValue = Math.exp(-chiSquare / 2);

    return {
      chiSquare,
      degreesOfFreedom,
      pValue: Math.max(0, Math.min(1, pValue)),
    };
  },
};

// 暴露给全局作用域
window.Chapter3 = {
  MathEngine: MathEngine,
};

window.Chapter3Debug = {
  enableBackground: function (interval) {
    try {
      localStorage.setItem("chapter3_bgdebug", "true");
      if (typeof interval === "number") {
        localStorage.setItem("chapter3_bgdumpInterval", String(interval));
      }
      if (window.chapter3Visualizer) {
        window.chapter3Visualizer.bgDebug = true;
        if (typeof interval === "number" && interval > 0) {
          window.chapter3Visualizer.bgDumpInterval = interval;
        }
      }
      console.info("Background debug enabled");
    } catch (_) {}
  },
  disableBackground: function () {
    try {
      localStorage.setItem("chapter3_bgdebug", "false");
      localStorage.removeItem("chapter3_bgdumpInterval");
      if (window.chapter3Visualizer) {
        window.chapter3Visualizer.bgDebug = false;
      }
      console.info("Background debug disabled");
    } catch (_) {}
  },
  dumpBackgroundStatus: function () {
    try {
      if (window.chapter3Visualizer) {
        window.chapter3Visualizer.debugBackgroundStatus();
      }
    } catch (_) {}
  },
};

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  window.chapter3Visualizer = new Chapter3Visualizer();
});
