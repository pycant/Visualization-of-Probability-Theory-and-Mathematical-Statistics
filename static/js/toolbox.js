/**
 * 通用工具箱组件
 * 包含AI智能助手、假设检验、分位数表等工具
 */

// 轻量日志开关：通过 URL 参数 tbdebug=1 或设置 window.TOOLBOX_DEBUG=true 启用
globalThis.TB_DEBUG =
  /[?&]tbdebug=1/.test(location.search) || !!globalThis.TOOLBOX_DEBUG;
globalThis.TB_LOG = function () {
  if (globalThis.TB_DEBUG) {
    try {
      console.log.apply(console, arguments);
    } catch (_) {}
  }
};
globalThis.TB_WARN = function () {
  if (globalThis.TB_DEBUG) {
    try {
      console.warn.apply(console, arguments);
    } catch (_) {}
  }
};
globalThis.TB_ERROR = function () {
  if (globalThis.TB_DEBUG) {
    try {
      console.error.apply(console, arguments);
    } catch (_) {}
  }
};

function TB_getExistingSelectors() {
  const set = new Set();
  const sheets = Array.from(document.styleSheets || []);
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    let rules;
    try {
      rules = sheet.cssRules || sheet.rules;
    } catch (_) {
      rules = null;
    }
    if (!rules) continue;
    for (let j = 0; j < rules.length; j++) {
      const r = rules[j];
      if (r && r.selectorText) set.add(r.selectorText.trim());
    }
  }
  return set;
}

function TB_buildDefaultsFor(list) {
  const m = {
    ".font-future":
      'font-family: "Roboto", sans-serif; letter-spacing: 0.05em;',
    ".text-neon-blue": "color: var(--neon-blue);",
    ".text-neon-purple": "color: var(--neon-purple);",
    ".text-neon-green": "color: var(--neon-green);",
    ".bg-neon-blue": "background-color: var(--neon-blue);",
    ".bg-neon-purple": "background-color: var(--neon-purple);",
    ".bg-neon-green": "background-color: var(--neon-green);",
    ".bg-dark-bg": "background-color: var(--dark-bg);",
    ".bg-dark-card": "background-color: var(--dark-card);",
    ".accent-neon-blue": "accent-color: var(--neon-blue);",
    ".accent-neon-purple": "accent-color: var(--neon-purple);",
    ".accent-neon-green": "accent-color: var(--neon-green);",
    ".border-glow": "box-shadow: 0 0 10px rgba(0,243,255,0.3);",
  };
  let css = "";
  for (let i = 0; i < list.length; i++) {
    const sel = list[i];
    const decl = m[sel];
    if (decl) css += sel + "{" + decl + "}\n";
  }
  return css;
}

function TB_needSelectors() {
  const required = [
    ".font-future",
    ".text-neon-blue",
    ".text-neon-purple",
    ".text-neon-green",
    ".bg-neon-blue",
    ".bg-neon-purple",
    ".bg-neon-green",
    ".bg-dark-bg",
    ".bg-dark-card",
    ".accent-neon-blue",
    ".accent-neon-purple",
    ".accent-neon-green",
    ".border-glow",
  ];
  const existing = TB_getExistingSelectors();
  const missing = [];
  for (let i = 0; i < required.length; i++) {
    const sel = required[i];
    if (!existing.has(sel)) missing.push(sel);
  }
  return missing;
}

function ensureToolboxStyles() {
  const root = document.documentElement;
  const getVar = function (name) {
    const v = getComputedStyle(root).getPropertyValue(name);
    return (v || "").trim();
  };
  const defaults = [
    ["--dark-bg", "#0f172a"],
    ["--dark-card", "#1e293b"],
    ["--neon-blue", "#00f3ff"],
    ["--neon-purple", "#bf00ff"],
    ["--neon-green", "#00ff66"],
  ];
  const missingVars = [];
  for (let i = 0; i < defaults.length; i++) {
    const name = defaults[i][0];
    if (!getVar(name)) missingVars.push(defaults[i]);
  }
  const missingSelectors = TB_needSelectors();
  if (!missingVars.length && !missingSelectors.length) return;
  let style = document.getElementById("toolbox-default-styles");
  if (!style) {
    style = document.createElement("style");
    style.id = "toolbox-default-styles";
  }
  let css = "";
  if (missingVars.length) {
    css += ":root{";
    for (let i = 0; i < missingVars.length; i++) {
      css += missingVars[i][0] + ":" + missingVars[i][1] + ";";
    }
    css += "}\n";
  }
  if (missingSelectors.length) css += TB_buildDefaultsFor(missingSelectors);
  style.textContent += css;
  if (!style.parentNode) document.head.appendChild(style);
}

class ProbabilityToolbox {
  constructor() {
    this.isOpen = false;
    this.currentTool = null;
    this.chatHistory = this.loadChatHistory();
    // 原文显示开关（false: 显示渲染版；true: 显示原文）
    this.showRaw = false;
    this.apiKey = "sk-fbc4de9c1fd949aea95d4cd1a5bf48e2";
    this.defaultPrompt =
      "你是一个专业的概率论与数理统计助手，擅长解答相关的数学问题，提供清晰的解释和计算步骤。请用中文回答问题。所有数学公式必须使用标准 LaTeX 定界：行内统一使用 \\(" +
      " ... \\)，陈列公式统一使用 \\[ ... \\]；严禁使用 $...$ 或 $$...$$ 作为定界，也不要使用 [ ... ] 作为公式定界。概率统计中的符号请使用规范写法（如 \\mathbb{E}, \\operatorname{Var}, \\Pr, \\chi^2, \\Lambda 等）。在使用可伸缩括号时确保 \\left 与 \\right 成对（例如 \\left( ... \\right)），不要写成 \\right\\) 之类的错误形式。必要时给出关键推导与结论。";

    // 计算器状态
    this.previousValue = 0;
    this.lastOperator = null;
    this.shouldResetDisplay = false;

    this.init();
  }

  init() {
    try {
      ensureToolboxStyles();
    } catch (e) {
      globalThis.TB_WARN("ensureToolboxStyles", e);
    }
    this.createToolboxHTML();
    this.initPageIntro();
    this.bindEvents();
    this.initDistributionTables();
    // 显示聊天历史并强制渲染LaTeX和markdown
    this.displayChatHistory();
  }

  createToolboxHTML() {
    // 创建工具箱触发按钮
    const triggerButton = document.createElement("div");
    triggerButton.id = "toolbox-trigger";
    triggerButton.innerHTML = `
            <div class="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
                <button class="bg-neon-blue hover:bg-neon-purple text-dark-bg font-bold p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 border-glow" aria-label="打开工具箱" title="打开工具箱">
                    <i class="fa fa-toolbox text-xl"></i>
                </button>
            </div>
        `;
    document.body.appendChild(triggerButton);

    // 创建侧边栏
    const sidebar = document.createElement("div");
    sidebar.id = "toolbox-sidebar";
    sidebar.innerHTML = `
            <div class="fixed right-0 top-16 h-[calc(100vh-4rem)] w-[600px] bg-dark-card border-l border-gray-800 transform translate-x-full transition-transform duration-300 z-40 overflow-y-auto shadow-2xl">
                <!-- 侧边栏头部 -->
                <div class="p-6 border-b border-gray-800">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-future font-bold text-neon-blue">工具箱</h2>
                        <button id="close-toolbox" class="text-gray-400 hover:text-white transition-colors" aria-label="关闭工具箱" title="关闭工具箱">
                            <i class="fa fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- 工具列表 -->
                <div class="p-6">
                    <div class="space-y-4">
                        <!-- AI智能助手 -->
                        <div class="tool-accordion">
                            <div class="tool-header bg-dark-bg rounded-lg p-4 border border-gray-700 hover:border-neon-blue transition-all duration-300 cursor-pointer" data-tool="ai-assistant">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                                            <i class="fa fa-robot text-neon-blue text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">AI智能助手</h3>
                                            <p class="text-sm text-gray-400">概率统计专业问答</p>
                                        </div>
                                    </div>
                                    <i class="fa fa-chevron-down text-gray-400 transition-transform duration-300" id="ai-assistant-chevron"></i>
                                </div>
                            </div>
                            <div class="tool-content hidden mt-2 p-4 bg-dark-bg rounded-lg border border-gray-700" id="ai-assistant-content">
                                <div class="mb-4">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="text-lg font-semibold text-neon-blue">AI智能助手</h3>
                                        <div class="flex items-center space-x-2">
                                            <button id="toggle-raw" class="text-sm text-gray-400 hover:text-white transition-colors" title="原文开关">
                                                <i class="fa fa-file-alt mr-1"></i>显示原文
                                            </button>
                                            <button id="clear-chat" class="text-sm text-gray-400 hover:text-white transition-colors">
                                                <i class="fa fa-trash mr-1"></i>清空对话
                                            </button>
                                        </div>
                                    </div>
                                    <div id="chat-messages" class="h-96 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
                                        <!-- 聊天消息将在这里显示 -->
                                    </div>
                                    <div class="flex space-x-2">
                                        <input type="text" id="chat-input" placeholder="请输入您的问题..." class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none">
                                        <button id="send-message" class="bg-neon-blue text-dark-bg px-4 py-2 rounded-lg hover:bg-neon-blue/80 transition-colors" aria-label="发送消息" title="发送消息">
                                            <i class="fa fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 网页介绍栏 -->
                        <div class="tool-accordion">
                            <div class="tool-header bg-dark-bg rounded-lg p-4 border border-gray-700 hover:border-neon-green transition-all duration-300 cursor-pointer" data-tool="page-intro">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
                                            <i class="fa fa-film text-neon-green text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">网页介绍栏</h3>
                                            <p class="text-sm text-gray-400">各页面视频介绍</p>
                                        </div>
                                    </div>
                                    <i class="fa fa-chevron-down text-gray-400 transition-transform duration-300" id="page-intro-chevron"></i>
                                </div>
                            </div>
                            <div class="tool-content hidden mt-2 p-4 bg-dark-bg rounded-lg border border-gray-700" id="page-intro-content">
                                <div class="space-y-4">
                                    <div class="flex items-center gap-3">
                                        <label class="text-gray-300 text-sm">选择页面:</label>
                                        <select id="page-intro-select" class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none">
                                            <option value="index">首页</option>
                                            <option value="random_variables">随机变量</option>
                                            <option value="probability_distributions">概率分布</option>
                                            <option value="hypothesis_testing">假设检验</option>
                                            <option value="interval_estimation">区间估计</option>
                                            <option value="law_of_large_numbers">大数定律</option>
                                        </select>
                                    </div>
                                    <div class="bg-gray-800 rounded-lg overflow-hidden">
                                        <video id="page-intro-video" controls class="w-full rounded-lg" preload="metadata">
                                            <source id="page-intro-video-src" src="">
                                            您的浏览器不支持视频播放。
                                        </video>
                                    </div>
                                    <div class="flex items-center justify-between text-sm">
                                        <div id="page-intro-error" class="text-yellow-400 hidden">⚠️ 视频无法播放，请检查文件或格式。</div>
                                        <a id="page-intro-download" href="#" target="_blank" class="text-neon-green hover:text-white transition-colors">下载当前视频</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 假设检验 -->
                        <div class="tool-accordion">
                            <div class="tool-header bg-dark-bg rounded-lg p-4 border border-gray-700 hover:border-neon-purple transition-all duration-300 cursor-pointer" data-tool="hypothesis-test">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center">
                                            <i class="fa fa-flask text-neon-purple text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">假设检验</h3>
                                            <p class="text-sm text-gray-400">统计假设检验工具</p>
                                        </div>
                                    </div>
                                    <i class="fa fa-chevron-down text-gray-400 transition-transform duration-300" id="hypothesis-test-chevron"></i>
                                </div>
                            </div>
                            <div class="tool-content hidden mt-2 p-4 bg-dark-bg rounded-lg border border-gray-700" id="hypothesis-test-content">
                                <h3 class="text-lg font-semibold text-neon-purple mb-4">假设检验</h3>
                                <div class="space-y-4">
                                    <!-- 检验方法分类 -->
                                    <div>
                                        <label class="block text-gray-300 mb-2">检验方法分类:</label>
                                        <select id="test-category" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none">
                                            <option value="single-sample">单样本检验</option>
                                            <option value="two-sample">两样本检验</option>
                                            <option value="variance-test">方差检验</option>
                                            <option value="anova">双因素方差分析</option>
                                        </select>
                                    </div>
                                    
                                    <!-- 具体检验类型 -->
                                    <div>
                                        <label class="block text-gray-300 mb-2">检验类型:</label>
                                        <select id="test-type" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none">
                                            <option value="one-sample-z">单样本Z检验</option>
                                            <option value="one-sample-t">单样本t检验</option>
                                        </select>
                                    </div>
                                    
                                    <!-- 数据输入方式 -->
                                    <div>
                                        <label class="block text-gray-300 mb-2">数据输入方式:</label>
                                        <div class="flex space-x-2">
                                            <button id="raw-data-btn" class="flex-1 bg-neon-purple text-white py-2 rounded-lg hover:bg-neon-purple/80 transition-colors">
                                                原始数据
                                            </button>
                                            <button id="summary-data-btn" class="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors">
                                                汇总数据
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- 原始数据输入区域 -->
                                    <div id="raw-data-section" class="space-y-3">
                                        <div>
                                            <label class="block text-gray-300 mb-2">样本数据 (用逗号分隔):</label>
                                            <textarea id="sample-data" placeholder="例如: 1.2, 1.5, 1.8, 2.1, 1.9" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none h-20 resize-none"></textarea>
                                        </div>
                                    </div>
                                    
                                    <!-- 汇总数据输入区域 -->
                                    <div id="summary-data-section" class="space-y-3 hidden">
                                        <!-- 单样本数据 -->
                                        <div id="single-sample-summary" class="space-y-3">
                                            <div class="text-sm text-gray-400 font-medium">样本数据</div>
                                            <div class="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label class="block text-gray-300 mb-1">样本均值:</label>
                                                    <input type="number" id="sample-mean" step="0.01" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                                <div>
                                                    <label class="block text-gray-300 mb-1">样本标准差:</label>
                                                    <input type="number" id="sample-std" step="0.01" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                                <div>
                                                    <label class="block text-gray-300 mb-1">样本量:</label>
                                                    <input type="number" id="sample-size" min="1" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                                <div>
                                                    <label class="block text-gray-300 mb-1">假设均值:</label>
                                                    <input type="number" id="hypothesis-mean" step="0.01" value="0" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 两样本数据 -->
                                        <div id="two-sample-summary" class="space-y-3 hidden">
                                            <div class="text-sm text-gray-400 font-medium">第一组样本</div>
                                            <div class="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label class="block text-gray-300 mb-1">均值:</label>
                                                    <input type="number" id="sample1-mean" step="0.01" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                                <div>
                                                    <label class="block text-gray-300 mb-1">标准差:</label>
                                                    <input type="number" id="sample1-std" step="0.01" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                                <div>
                                                    <label class="block text-gray-300 mb-1">样本量:</label>
                                                    <input type="number" id="sample1-size" min="1" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                            </div>
                                            
                                            <div class="text-sm text-gray-400 font-medium">第二组样本</div>
                                            <div class="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label class="block text-gray-300 mb-1">均值:</label>
                                                    <input type="number" id="sample2-mean" step="0.01" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                                <div>
                                                    <label class="block text-gray-300 mb-1">标准差:</label>
                                                    <input type="number" id="sample2-std" step="0.01" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                                <div>
                                                    <label class="block text-gray-300 mb-1">样本量:</label>
                                                    <input type="number" id="sample2-size" min="1" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-gray-300 mb-1">假设差值 (μ₁ - μ₂):</label>
                                                <input type="number" id="hypothesis-diff" step="0.01" value="0" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-purple focus:outline-none">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- 参数配置 -->
                                    <div class="space-y-3">
                                        <div>
                                            <label class="block text-gray-300 mb-2">显著性水平 (α):</label>
                                            <div class="flex space-x-2">
                                                <select id="significance-level" class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                    <option value="0.01">0.01</option>
                                                    <option value="0.05" selected>0.05</option>
                                                    <option value="0.10">0.10</option>
                                                    <option value="custom">自定义</option>
                                                </select>
                                                <input type="number" id="custom-alpha" step="0.001" min="0.001" max="0.999" placeholder="0.05" class="w-20 bg-gray-800 border border-gray-600 rounded-lg px-2 py-2 text-white focus:border-neon-purple focus:outline-none hidden">
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-gray-300 mb-2">检验方向:</label>
                                            <select id="test-direction" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none">
                                                <option value="two-tailed">双侧检验</option>
                                                <option value="left-tailed">左侧检验</option>
                                                <option value="right-tailed">右侧检验</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <button id="run-test" class="w-full bg-neon-purple text-white py-2 rounded-lg hover:bg-neon-purple/80 transition-colors">
                                        执行检验
                                    </button>
                                    
                                    <div id="test-result" class="mt-4 p-4 bg-gray-800 rounded-lg hidden">
                                        <!-- 检验结果将在这里显示 -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 分位数表 -->
                        <div class="tool-accordion">
                            <div class="tool-header bg-dark-bg rounded-lg p-4 border border-gray-700 hover:border-neon-green transition-all duration-300 cursor-pointer" data-tool="quantile-table">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
                                            <i class="fa fa-table text-neon-green text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">分位数表</h3>
                                            <p class="text-sm text-gray-400">常见分布分位数查询</p>
                                        </div>
                                    </div>
                                    <i class="fa fa-chevron-down text-gray-400 transition-transform duration-300" id="quantile-table-chevron"></i>
                                </div>
                            </div>
                            <div class="tool-content hidden mt-2 p-4 bg-dark-bg rounded-lg border border-gray-700" id="quantile-table-content">
                                <h3 class="text-lg font-semibold text-neon-green mb-4">分位数表</h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-gray-300 mb-2">分布类型:</label>
                                        <select id="distribution-type" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-green focus:outline-none">
                                            <option value="normal">标准正态分布</option>
                                            <option value="t">t分布</option>
                                            <option value="chi-square">卡方分布</option>
                                            <option value="f">F分布</option>
                                        </select>
                                    </div>
                                    <div id="distribution-params" class="space-y-2">
                                        <!-- 分布参数将根据选择的分布类型动态显示 -->
                                    </div>
                                    <div>
                                        <label class="block text-gray-300 mb-2">概率/分位数:</label>
                                        <input type="number" id="probability-input" placeholder="输入概率值 (0-1)" step="0.01" min="0" max="1" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-green focus:outline-none">
                                    </div>
                                    <button id="calculate-quantile" class="w-full bg-neon-green text-dark-bg py-2 rounded-lg hover:bg-neon-green/80 transition-colors">
                                        计算分位数
                                    </button>
                                    <div id="quantile-result" class="mt-4 p-4 bg-gray-800 rounded-lg hidden">
                                        <!-- 计算结果将在这里显示 -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 科学计算器 -->
                        <div class="tool-accordion">
                            <div class="tool-header bg-dark-bg rounded-lg p-4 border border-gray-700 hover:border-neon-orange transition-all duration-300 cursor-pointer" data-tool="calculator">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 rounded-lg bg-neon-orange/10 flex items-center justify-center">
                                            <i class="fa fa-calculator text-neon-orange text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">科学计算器</h3>
                                            <p class="text-sm text-gray-400">数学运算与统计计算</p>
                                        </div>
                                    </div>
                                    <i class="fa fa-chevron-down text-gray-400 transition-transform duration-300" id="calculator-chevron"></i>
                                </div>
                            </div>
                            <div class="tool-content hidden mt-2 p-4 bg-dark-bg rounded-lg border border-gray-700" id="calculator-content">
                                <h3 class="text-lg font-semibold text-neon-orange mb-4">科学计算器</h3>
                                <div class="space-y-4">
                                    <!-- 计算器显示屏 -->
                                     <div class="bg-gray-800 rounded-lg p-4">
                                         <input type="text" id="calc-display" readonly class="w-full bg-transparent text-right text-white text-xl font-mono focus:outline-none" value="0">
                                         <div id="calc-history" class="text-sm text-gray-400 text-right mt-1 min-h-[20px]"></div>
                                     </div>
                                     
                                     <!-- 计算器按钮 -->
                                     <div class="grid grid-cols-4 gap-2">
                                         <!-- 第一行 -->
                                         <button class="calc-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors" data-action="clear">C</button>
                                         <button class="calc-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors" data-action="backspace">⌫</button>
                                         <button class="calc-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors" data-action="operator" data-value="%">%</button>
                                         <button class="calc-btn bg-neon-orange hover:bg-neon-orange/80 text-white p-3 rounded-lg transition-colors" data-action="operator" data-value="/">÷</button>
                                         
                                         <!-- 第二行 -->
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="7">7</button>
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="8">8</button>
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="9">9</button>
                                         <button class="calc-btn bg-neon-orange hover:bg-neon-orange/80 text-white p-3 rounded-lg transition-colors" data-action="operator" data-value="*">×</button>
                                         
                                         <!-- 第三行 -->
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="4">4</button>
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="5">5</button>
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="6">6</button>
                                         <button class="calc-btn bg-neon-orange hover:bg-neon-orange/80 text-white p-3 rounded-lg transition-colors" data-action="operator" data-value="-">−</button>
                                         
                                         <!-- 第四行 -->
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="1">1</button>
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="2">2</button>
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="number" data-value="3">3</button>
                                         <button class="calc-btn bg-neon-orange hover:bg-neon-orange/80 text-white p-3 rounded-lg transition-colors" data-action="operator" data-value="+">+</button>
                                         
                                         <!-- 第五行 -->
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors col-span-2" data-action="number" data-value="0">0</button>
                                         <button class="calc-btn bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors" data-action="decimal">.</button>
                                         <button class="calc-btn bg-neon-orange hover:bg-neon-orange/80 text-white p-3 rounded-lg transition-colors" data-action="equals">=</button>
                                     </div>
                                     
                                     <!-- 科学函数按钮 -->
                                     <div class="mt-4">
                                         <h4 class="text-sm font-semibold text-gray-300 mb-2">科学函数</h4>
                                         <div class="grid grid-cols-3 gap-2">
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="function" data-value="sin">sin</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="function" data-value="cos">cos</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="function" data-value="tan">tan</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="function" data-value="log">log</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="function" data-value="ln">ln</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="function" data-value="sqrt">√</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="operator" data-value="^">x^y</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="constant" data-value="3.14159">π</button>
                                             <button class="calc-btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-sm transition-colors" data-action="constant" data-value="2.71828">e</button>
                                         </div>
                                     </div>
                                     
                                     <!-- 统计功能 -->
                                     <div class="mt-4">
                                         <h4 class="text-sm font-semibold text-gray-300 mb-2">统计计算</h4>
                                         <div class="space-y-2">
                                             <textarea id="stat-data" placeholder="输入数据，用逗号分隔，例如: 1,2,3,4,5" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-orange focus:outline-none h-16 resize-none"></textarea>
                                             <div class="grid grid-cols-2 gap-2">
                                                 <button class="calc-btn bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm transition-colors" data-action="stat" data-value="mean">平均值</button>
                                                 <button class="calc-btn bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm transition-colors" data-action="stat" data-value="median">中位数</button>
                                                 <button class="calc-btn bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm transition-colors" data-action="stat" data-value="std">标准差</button>
                                                 <button class="calc-btn bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm transition-colors" data-action="stat" data-value="var">方差</button>
                                                 <button class="calc-btn bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm transition-colors" data-action="stat" data-value="sum">求和</button>
                                                 <button class="calc-btn bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm transition-colors" data-action="stat" data-value="count">计数</button>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>

                        <!-- 测试工具 -->
                        <div class="tool-accordion">
                            <div class="tool-header bg-dark-bg rounded-lg p-4 border border-gray-700 hover:border-neon-green transition-all duration-300 cursor-pointer" data-tool="test-tools">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
                                            <i class="fa fa-vial text-neon-green text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-white">测试工具</h3>
                                            <p class="text-sm text-gray-400">系统功能测试与验证</p>
                                        </div>
                                    </div>
                                    <i class="fa fa-chevron-down text-gray-400 transition-transform duration-300" id="test-tools-chevron"></i>
                                </div>
                            </div>
                            <div class="tool-content hidden mt-2 p-4 bg-dark-bg rounded-lg border border-gray-700" id="test-tools-content">
                                <h3 class="text-lg font-semibold text-neon-green mb-4">测试工具</h3>
                                <div class="space-y-4">
                                    <!-- LaTeX渲染测试 -->
                                    <div class="bg-gray-800 rounded-lg p-4">
                                        <h4 class="text-sm font-semibold text-gray-300 mb-2">LaTeX渲染测试</h4>
                                        <p class="text-xs text-gray-400 mb-3">测试全局LaTeX渲染函数是否正常工作</p>
                                        <button id="test-latex-render" class="w-full bg-neon-green hover:bg-neon-green/80 text-dark-bg p-2 rounded text-sm font-medium transition-colors">
                                            <i class="fa fa-play mr-2"></i>运行LaTeX渲染测试
                                        </button>
                                        <div id="latex-test-result" class="mt-2 text-xs text-gray-400"></div>
                                    </div>
                                    
                                    <!-- 聊天记录测试 -->
                                    <div class="bg-gray-800 rounded-lg p-4">
                                        <h4 class="text-sm font-semibold text-gray-300 mb-2">聊天记录测试</h4>
                                        <p class="text-xs text-gray-400 mb-3">测试页面切换时聊天记录是否重复</p>
                                        <button id="test-chat-history" class="w-full bg-neon-green hover:bg-neon-green/80 text-dark-bg p-2 rounded text-sm font-medium transition-colors">
                                            <i class="fa fa-play mr-2"></i>运行聊天记录测试
                                        </button>
                                        <div id="chat-test-result" class="mt-2 text-xs text-gray-400"></div>
                                    </div>
                                    
                                    <!-- 系统状态检查 -->
                                    <div class="bg-gray-800 rounded-lg p-4">
                                        <h4 class="text-sm font-semibold text-gray-300 mb-2">系统状态检查</h4>
                                        <p class="text-xs text-gray-400 mb-3">检查各项功能模块的运行状态</p>
                                        <button id="test-system-status" class="w-full bg-neon-green hover:bg-neon-green/80 text-dark-bg p-2 rounded text-sm font-medium transition-colors">
                                            <i class="fa fa-play mr-2"></i>检查系统状态
                                        </button>
                                        <div id="system-test-result" class="mt-2 text-xs text-gray-400"></div>
                                    </div>

                                    <!-- AI消息LaTeX诊断 -->
                                    <div class="bg-gray-800 rounded-lg p-4">
                                        <h4 class="text-sm font-semibold text-gray-300 mb-2">AI消息LaTeX诊断</h4>
                                        <p class="text-xs text-gray-400 mb-3">自动构造多种公式示例并检查渲染</p>
                                        <button id="test-chat-latex" class="w-full bg-neon-green hover:bg-neon-green/80 text-dark-bg p-2 rounded text-sm font-medium transition-colors">
                                            <i class="fa fa-play mr-2"></i>运行AI消息LaTeX诊断
                                        </button>
                                        <div id="latex-diagnostic-result" class="mt-2 text-xs text-gray-400"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        `;
    document.body.appendChild(sidebar);
  }

  bindEvents() {
    // 工具箱触发按钮
    document.getElementById("toolbox-trigger").addEventListener("click", () => {
      this.toggleToolbox();
    });

    // 关闭按钮
    document.getElementById("close-toolbox").addEventListener("click", () => {
      this.closeToolbox();
    });

    // 绑定工具项点击事件（展开栏）
    const toolHeaders = document.querySelectorAll(".tool-header");
    toolHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const toolName = header.getAttribute("data-tool");
        this.toggleTool(toolName);
      });
    });

    // 绑定计算器按钮事件
    this.bindCalculatorEvents();

    // AI助手相关事件
    document.getElementById("send-message").addEventListener("click", () => {
      this.sendMessage();
    });

    document.getElementById("chat-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });

    document.getElementById("clear-chat").addEventListener("click", () => {
      this.clearChat();
    });

    // 原文开关：切换显示原始文本或渲染内容
    const toggleBtn = document.getElementById("toggle-raw");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.showRaw = !this.showRaw;
        // 更新按钮文案
        toggleBtn.innerHTML = this.showRaw
          ? '<i class="fa fa-eye mr-1"></i>显示渲染'
          : '<i class="fa fa-file-alt mr-1"></i>显示原文';
        // 应用到所有已存在消息
        this.updateRawToggleView();
      });
    }

    // 假设检验相关事件
    document.getElementById("run-test").addEventListener("click", () => {
      this.runHypothesisTest();
    });

    // 网页介绍栏选择事件与视频错误提示
    const pageIntroSelect = document.getElementById("page-intro-select");
    const pageIntroVideo = document.getElementById("page-intro-video");
    const pageIntroSource = document.getElementById("page-intro-video-src");
    const pageIntroDownload = document.getElementById("page-intro-download");
    const pageIntroError = document.getElementById("page-intro-error");

    if (pageIntroSelect) {
      pageIntroSelect.addEventListener("change", (e) => {
        const key = e.target.value;
        this.setPageIntroVideo(key);
      });
    }

    if (pageIntroVideo) {
      const describeSupport = () => {
        try {
          const v = document.createElement("video");
          const support = {
            mp4_avc1:
              v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') || "",
            mp4_hvc1: v.canPlayType('video/mp4; codecs="hvc1"') || "",
            webm_vp9: v.canPlayType('video/webm; codecs="vp9,opus"') || "",
            quicktime: v.canPlayType("video/quicktime") || "",
          };
          return `支持检测 mp4(avc1)=${support.mp4_avc1 || "no"}, mp4(hvc1)=${
            support.mp4_hvc1 || "no"
          }, webm(vp9)=${support.webm_vp9 || "no"}, mov(quicktime)=${
            support.quicktime || "no"
          }`;
        } catch (_) {
          return "支持检测不可用";
        }
      };

      const getErrorText = () => {
        const err = pageIntroVideo.error;
        const codes = {
          1: "用户中止",
          2: "网络错误",
          3: "解码错误",
          4: "资源不支持",
        };
        const src = pageIntroSource ? decodeURI(pageIntroSource.src || "") : "";
        if (!err) {
          return `视频加载失败，原因未知。源: ${src}. ${describeSupport()}`;
        }
        return `视频错误 code=${err.code}(${
          codes[err.code] || "未知"
        }), 源: ${src}。${describeSupport()}`;
      };

      const showError = (extra = "") => {
        const text = `${getErrorText()}${extra ? "（" + extra + "）" : ""}`;
        TB_ERROR(text);
        if (pageIntroError) {
          pageIntroError.textContent = text;
          pageIntroError.classList.remove("hidden");
        }
      };

      const hideError = () => {
        if (pageIntroError) {
          pageIntroError.classList.add("hidden");
        }
      };

      // 仅在真正的 error 事件时展示错误文案
      pageIntroVideo.addEventListener("error", () => showError());
      // 以下状态在切换 source 或重新 load() 时正常出现，不作为错误提示，仅记录日志
      pageIntroVideo.addEventListener("stalled", () => {
        TB_WARN("video stalled: 数据获取暂时停滞（非致命）");
      });
      pageIntroVideo.addEventListener("abort", () => {
        TB_WARN("video abort: 加载被中止（通常由于切换源或重新加载）");
      });
      pageIntroVideo.addEventListener("emptied", () => {
        TB_WARN("video emptied: 媒体被清空（重新设置 src 的正常现象）");
      });
      pageIntroVideo.addEventListener("waiting", () => {
        TB_WARN("video waiting: 正在缓冲...");
      });
      pageIntroVideo.addEventListener("loadedmetadata", hideError);
      pageIntroVideo.addEventListener("loadeddata", hideError);
      pageIntroVideo.addEventListener("canplay", hideError);
      pageIntroVideo.addEventListener("canplaythrough", hideError);
    }

    // 测试工具相关事件
    document
      .getElementById("test-latex-render")
      .addEventListener("click", () => {
        this.testLatexRender();
      });

    document
      .getElementById("test-chat-history")
      .addEventListener("click", () => {
        this.testChatHistory();
      });

    document
      .getElementById("test-system-status")
      .addEventListener("click", () => {
        this.testSystemStatus();
      });

    document.getElementById("test-chat-latex").addEventListener("click", () => {
      this.testChatLatexDiagnosis();
    });

    // 检验方法分类变化事件
    document.getElementById("test-category").addEventListener("change", () => {
      this.updateTestTypes();
    });

    // 数据输入方式切换事件
    document.getElementById("raw-data-btn").addEventListener("click", () => {
      this.switchDataInputMode("raw");
    });

    document
      .getElementById("summary-data-btn")
      .addEventListener("click", () => {
        this.switchDataInputMode("summary");
      });

    // 显著性水平自定义选项事件
    document
      .getElementById("significance-level")
      .addEventListener("change", (e) => {
        const customAlpha = document.getElementById("custom-alpha");
        if (e.target.value === "custom") {
          customAlpha.classList.remove("hidden");
        } else {
          customAlpha.classList.add("hidden");
        }
      });

    // 分位数表相关事件
    document
      .getElementById("distribution-type")
      .addEventListener("change", () => {
        this.updateDistributionParams();
      });

    document
      .getElementById("calculate-quantile")
      .addEventListener("click", () => {
        this.calculateQuantile();
      });

    // 点击侧边栏外部关闭
    document.addEventListener("click", (e) => {
      const sidebar = document.getElementById("toolbox-sidebar");
      const trigger = document.getElementById("toolbox-trigger");
      if (
        this.isOpen &&
        !sidebar.contains(e.target) &&
        !trigger.contains(e.target)
      ) {
        this.closeToolbox();
      }
    });
  }

  // 初始化网页介绍栏：设置视频映射与默认加载当前页面视频
  initPageIntro() {
    try {
      // 首选可播放 MP4 资产（占位），保留 MOV 作为兜底
      this.pageIntroMap = {
        index: "/static/videos/正态分布.mp4",
        random_variables: "/static/videos/泊松分布.mp4",
        probability_distributions: "/static/videos/正态分布.mp4",
        hypothesis_testing: "/static/videos/t分布.mp4",
        interval_estimation: "/static/videos/t分布.mp4",
        law_of_large_numbers: "/static/videos/正态分布.mp4",
      };

      // 原始 MOV 资源映射，用于最后回退
      this.pageIntroMovMap = {
        index: "/static/videos/概率维度.mov",
        random_variables: "/static/videos/随机变量.mov",
        probability_distributions: "/static/videos/概率分布.mov",
        hypothesis_testing: "/static/videos/假设检验.mov",
        interval_estimation: "/static/videos/区间估计.mov",
        law_of_large_numbers: "/static/videos/大数定律.mov",
      };

      const path = (globalThis.location && globalThis.location.pathname) || "/";
      let key = "index";
      if (path.endsWith("random_variables.html")) key = "random_variables";
      else if (path.endsWith("probability_distributions.html"))
        key = "probability_distributions";
      else if (path.endsWith("hypothesis_testing.html"))
        key = "hypothesis_testing";
      else if (path.endsWith("interval_estimation.html"))
        key = "interval_estimation";
      else if (path.endsWith("law_of_large_numbers.html"))
        key = "law_of_large_numbers";
      else if (path === "/" || path.endsWith("index.html")) key = "index";

      const pageIntroSelect = document.getElementById("page-intro-select");
      const pageIntroVideo = document.getElementById("page-intro-video");
      const pageIntroSource = document.getElementById("page-intro-video-src");
      const pageIntroDownload = document.getElementById("page-intro-download");

      if (pageIntroSelect) {
        pageIntroSelect.value = key;
      }
      this.setPageIntroVideo(key, true);
    } catch (e) {
      // 安静失败，不影响其他工具
      TB_WARN("初始化网页介绍栏失败:", e);
    }
  }

  // 设置网页介绍视频，精简回退：优先使用本地 MP4，必要时再尝试 MOV（仅在浏览器支持时）
  setPageIntroVideo(key, quiet = false) {
    try {
      const pageIntroVideo = document.getElementById("page-intro-video");
      const pageIntroSource = document.getElementById("page-intro-video-src");
      const pageIntroDownload = document.getElementById("page-intro-download");
      const pageIntroError = document.getElementById("page-intro-error");

      if (!pageIntroVideo || !pageIntroSource) return;

      const v = document.createElement("video");
      const supportMp4 = v.canPlayType(
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
      );
      const supportQuickTime = v.canPlayType("video/quicktime");

      const primary =
        this.pageIntroMap && this.pageIntroMap[key]
          ? this.pageIntroMap[key]
          : null;
      const altMov =
        this.pageIntroMovMap && this.pageIntroMovMap[key]
          ? this.pageIntroMovMap[key]
          : null;

      // 仅使用实际存在的本地 MP4 作为首选，避免无文件的 .webm/.mp4 组合导致 404 与反复重载
      const candidates = [];
      if (primary) {
        candidates.push(primary);
      }
      // 如浏览器宣称支持 QuickTime（Safari 等），再追加 MOV 作为兜底
      if (altMov && supportQuickTime) {
        candidates.push(altMov);
      }

      let attemptIndex = 0;

      const applySrc = (src) => {
        const enc = encodeURI(src);
        pageIntroSource.src = enc;
        try {
          const lower = enc.toLowerCase();
          if (lower.endsWith(".mp4")) {
            pageIntroSource.type = "video/mp4";
          } else if (lower.endsWith(".webm")) {
            pageIntroSource.type = "video/webm";
          } else if (lower.endsWith(".mov")) {
            pageIntroSource.type = "video/quicktime";
          } else {
            pageIntroSource.removeAttribute("type");
          }
        } catch (_) {}
        pageIntroVideo.load();
        if (pageIntroDownload) pageIntroDownload.href = enc;
        if (pageIntroError) pageIntroError.classList.add("hidden");
      };

      const tryNext = () => {
        if (attemptIndex >= candidates.length) {
          if (!quiet) TB_ERROR("所有候选视频源均无法播放:", candidates);
          if (pageIntroError) {
            pageIntroError.classList.remove("hidden");
            pageIntroError.textContent = `⚠️ 所有候选视频源均无法播放，请提供 MP4(H.264) 或 WebM(VP9) 版本。尝试过: ${candidates.join(
              ", "
            )}`;
          }
          return;
        }
        const nextSrc = candidates[attemptIndex++];
        applySrc(nextSrc);
        // 为当前尝试绑定一次性错误监听，失败则自动尝试下一个
        const onErr = () => {
          pageIntroVideo.removeEventListener("error", onErr);
          if (!quiet) TB_WARN("视频源失败，尝试下一个:", nextSrc);
          tryNext();
        };
        pageIntroVideo.addEventListener("error", onErr, { once: true });
      };

      tryNext();
    } catch (e) {
      if (!quiet) TB_WARN("设置网页介绍视频失败:", e);
    }
  }

  toggleToolbox() {
    if (this.isOpen) {
      this.closeToolbox();
    } else {
      this.openToolbox();
    }
  }

  openToolbox() {
    const sidebar = document.getElementById("toolbox-sidebar");
    const sidebarContent = sidebar.querySelector("div");
    const body = document.body;

    // 动态计算导航栏高度，避免遮挡
    try {
      const nav =
        document.getElementById("global-nav") || document.querySelector("nav");
      const navRect = nav ? nav.getBoundingClientRect() : null;
      const navHeight = navRect ? Math.ceil(navRect.height) : 64; // 默认4rem
      // 设置顶部偏移与可视高度，确保侧边栏紧贴导航栏下方
      sidebarContent.style.top = navHeight + "px";
      sidebarContent.style.height = `calc(100vh - ${navHeight}px)`;
    } catch (e) {
      // 静默失败，保留原有样式
    }

    sidebarContent.classList.remove("translate-x-full");
    body.style.marginRight = "600px"; // 匹配侧边栏宽度
    body.style.transition = "margin-right 0.3s ease-in-out";
    this.isOpen = true;
  }

  closeToolbox() {
    const sidebar = document.getElementById("toolbox-sidebar");
    const sidebarContent = sidebar.querySelector("div");
    const body = document.body;

    sidebarContent.classList.add("translate-x-full");
    body.style.marginRight = "0";
    this.isOpen = false;
  }

  toggleTool(toolName) {
    const content = document.getElementById(`${toolName}-content`);
    const chevron = document.getElementById(`${toolName}-chevron`);

    if (content && chevron) {
      const isHidden = content.classList.contains("hidden");

      if (isHidden) {
        // 展开
        content.classList.remove("hidden");
        chevron.style.transform = "rotate(180deg)";

        // 如果是AI助手，检查是否需要加载聊天历史
        if (toolName === "ai-assistant") {
          const chatMessages = document.getElementById("chat-messages");
          // 只有当聊天容器为空时才加载历史记录，避免重复显示
          if (chatMessages && chatMessages.children.length === 0) {
            this.displayChatHistory();
          }
        }
      } else {
        // 收起
        content.classList.add("hidden");
        chevron.style.transform = "rotate(0deg)";
      }
    }
  }

  // 计算器功能
  bindCalculatorEvents() {
    // 等待DOM加载完成后绑定事件
    setTimeout(() => {
      const calcButtons = document.querySelectorAll(".calc-btn");
      calcButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          this.handleCalculatorInput(e.target);
        });
      });
    }, 100);
  }

  handleCalculatorInput(button) {
    const action = button.getAttribute("data-action");
    const value = button.getAttribute("data-value");
    const display = document.getElementById("calc-display");
    const history = document.getElementById("calc-history");

    if (!display) return;

    switch (action) {
      case "number":
        this.inputNumber(display, value);
        break;
      case "operator":
        this.inputOperator(display, history, value);
        break;
      case "decimal":
        this.inputDecimal(display);
        break;
      case "equals":
        this.calculate(display, history);
        break;
      case "clear":
        this.clearCalculator(display, history);
        break;
      case "backspace":
        this.backspace(display);
        break;
      case "function":
        this.applyFunction(display, value);
        break;
      case "constant":
        this.inputConstant(display, value);
        break;
      case "stat":
        this.calculateStatistic(value);
        break;
    }
  }

  inputNumber(display, number) {
    if (display.value === "0" || this.shouldResetDisplay) {
      display.value = number;
      this.shouldResetDisplay = false;
    } else {
      display.value += number;
    }
  }

  inputOperator(display, history, operator) {
    if (this.lastOperator && !this.shouldResetDisplay) {
      this.calculate(display, history);
    }

    this.previousValue = parseFloat(display.value);
    this.lastOperator = operator;
    this.shouldResetDisplay = true;

    history.textContent = `${this.previousValue} ${this.getOperatorSymbol(
      operator
    )}`;
  }

  inputDecimal(display) {
    if (this.shouldResetDisplay) {
      display.value = "0.";
      this.shouldResetDisplay = false;
    } else if (display.value.indexOf(".") === -1) {
      display.value += ".";
    }
  }

  calculate(display, history) {
    if (!this.lastOperator || this.shouldResetDisplay) return;

    const currentValue = parseFloat(display.value);
    let result;

    try {
      switch (this.lastOperator) {
        case "+":
          result = this.previousValue + currentValue;
          break;
        case "-":
          result = this.previousValue - currentValue;
          break;
        case "*":
          result = this.previousValue * currentValue;
          break;
        case "/":
          if (currentValue === 0) {
            throw new Error("除零错误");
          }
          result = this.previousValue / currentValue;
          break;
        case "%":
          result = this.previousValue % currentValue;
          break;
        case "^":
          result = Math.pow(this.previousValue, currentValue);
          break;
        default:
          return;
      }

      display.value = this.formatResult(result);
      history.textContent = `${this.previousValue} ${this.getOperatorSymbol(
        this.lastOperator
      )} ${currentValue} =`;
    } catch (error) {
      display.value = "Error";
      history.textContent = error.message;
    }

    this.lastOperator = null;
    this.shouldResetDisplay = true;
  }

  clearCalculator(display, history) {
    display.value = "0";
    history.textContent = "";
    this.previousValue = 0;
    this.lastOperator = null;
    this.shouldResetDisplay = false;
  }

  backspace(display) {
    if (display.value.length > 1) {
      display.value = display.value.slice(0, -1);
    } else {
      display.value = "0";
    }
  }

  applyFunction(display, func) {
    const value = parseFloat(display.value);
    let result;

    try {
      switch (func) {
        case "sin":
          result = Math.sin((value * Math.PI) / 180); // 转换为弧度
          break;
        case "cos":
          result = Math.cos((value * Math.PI) / 180);
          break;
        case "tan":
          result = Math.tan((value * Math.PI) / 180);
          break;
        case "log":
          if (value <= 0) throw new Error("对数函数输入必须大于0");
          result = Math.log10(value);
          break;
        case "ln":
          if (value <= 0) throw new Error("自然对数输入必须大于0");
          result = Math.log(value);
          break;
        case "sqrt":
          if (value < 0) throw new Error("平方根输入不能为负数");
          result = Math.sqrt(value);
          break;
        default:
          return;
      }

      display.value = this.formatResult(result);
      this.shouldResetDisplay = true;
    } catch (error) {
      display.value = "Error";
      document.getElementById("calc-history").textContent = error.message;
    }
  }

  inputConstant(display, constant) {
    display.value = constant;
    this.shouldResetDisplay = true;
  }

  calculateStatistic(statType) {
    const dataInput = document.getElementById("stat-data");
    const display = document.getElementById("calc-display");
    const history = document.getElementById("calc-history");

    if (!dataInput || !display) return;

    const dataStr = dataInput.value.trim();
    if (!dataStr) {
      history.textContent = "请输入数据";
      return;
    }

    try {
      const data = dataStr.split(",").map((x) => {
        const num = parseFloat(x.trim());
        if (isNaN(num)) throw new Error(`无效数字: ${x.trim()}`);
        return num;
      });

      let result;

      switch (statType) {
        case "mean":
          result = data.reduce((a, b) => a + b, 0) / data.length;
          break;
        case "median":
          const sorted = [...data].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          result =
            sorted.length % 2 === 0
              ? (sorted[mid - 1] + sorted[mid]) / 2
              : sorted[mid];
          break;
        case "std":
          const mean = data.reduce((a, b) => a + b, 0) / data.length;
          const variance =
            data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
          result = Math.sqrt(variance);
          break;
        case "var":
          const meanVar = data.reduce((a, b) => a + b, 0) / data.length;
          result =
            data.reduce((a, b) => a + Math.pow(b - meanVar, 2), 0) /
            data.length;
          break;
        case "sum":
          result = data.reduce((a, b) => a + b, 0);
          break;
        case "count":
          result = data.length;
          break;
        default:
          return;
      }

      display.value = this.formatResult(result);
      history.textContent = `${this.getStatName(statType)}: ${
        data.length
      }个数据`;
      this.shouldResetDisplay = true;
    } catch (error) {
      display.value = "Error";
      history.textContent = error.message;
    }
  }

  getOperatorSymbol(operator) {
    const symbols = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
      "%": "%",
      "^": "^",
    };
    return symbols[operator] || operator;
  }

  getStatName(statType) {
    const names = {
      mean: "平均值",
      median: "中位数",
      std: "标准差",
      var: "方差",
      sum: "求和",
      count: "计数",
    };
    return names[statType] || statType;
  }

  formatResult(result) {
    if (isNaN(result) || !isFinite(result)) {
      return "Error";
    }

    // 保留合适的小数位数
    if (Math.abs(result) < 1e-10) {
      return "0";
    }

    if (Number.isInteger(result)) {
      return result.toString();
    }

    return parseFloat(result.toFixed(10)).toString();
  }

  // AI助手功能
  async sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    // 添加用户消息到聊天历史
    this.addMessageToChat("user", message);
    input.value = "";

    // 显示加载状态
    this.addMessageToChat("assistant", "正在思考中...", true);

    try {
      const response = await this.callDeepSeekAPI(message);
      // 移除加载消息
      this.removeLoadingMessage();
      // 添加AI回复
      this.addMessageToChat("assistant", response);
      // 延迟渲染确保DOM完全更新
      setTimeout(() => {
        this.forceRerenderMath();
      }, 200);
    } catch (error) {
      this.removeLoadingMessage();
      this.addMessageToChat("assistant", "抱歉，发生了错误，请稍后再试。");
      console.error("AI API调用失败:", error);
    }
  }

  async callDeepSeekAPI(message) {
    console.log("发送API请求:", message);

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: this.defaultPrompt },
            ...this.chatHistory.slice(-10), // 只保留最近10条消息作为上下文
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    console.log("API响应状态:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API错误详情:", errorText);
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API响应数据:", data);

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      console.error("API响应格式异常:", data);
      throw new Error("API响应格式异常");
    }
  }

  addMessageToChat(role, content, isLoading = false, skipSave = false) {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role} ${isLoading ? "loading" : ""}`;

    const roleClass = role === "user" ? "text-neon-blue" : "text-neon-green";
    // 统一预处理：标点标准化 + 方括号规范化 + 括号内未定界TeX包裹 + 定界修复
    let renderContent = this.preprocessLatex(content);
    const roleName = role === "user" ? "您" : "AI助手";

    // 创建消息内容总容器
    const contentContainer = document.createElement("div");
    contentContainer.className = "message-content max-w-none";

    // 渲染版容器（用于Markdown/LaTeX）
    const renderedDiv = document.createElement("div");
    renderedDiv.className =
      "message-rendered text-gray-300 text-sm leading-relaxed";

    // 原文容器（严格显示原始文本）
    const rawDiv = document.createElement("pre");
    rawDiv.className =
      "message-raw hidden whitespace-pre-wrap break-words bg-gray-900/50 rounded p-2 text-xs text-gray-400";
    rawDiv.textContent = content; // 原始内容不做任何预处理

    // 填充渲染版内容
    if (isLoading) {
      renderedDiv.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="thinking-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <span class="text-gray-400">${content}</span>
        </div>
      `;
    } else if (role !== "user") {
      try {
        // 保护数学片段，避免Markdown解析阶段移除反斜杠导致定界失效
        const protectedSeg = this.protectMathSegments(renderContent);
        if (globalThis.marked && globalThis.marked.parse) {
          const htmlContent = marked.parse(protectedSeg.protectedText);
          const restoredHtml = this.restoreMathSegments(
            htmlContent,
            protectedSeg.segments
          );
          renderedDiv.innerHTML = restoredHtml;
        } else if (globalThis.marked) {
          const htmlContent = marked(protectedSeg.protectedText);
          const restoredHtml = this.restoreMathSegments(
            htmlContent,
            protectedSeg.segments
          );
          renderedDiv.innerHTML = restoredHtml;
        } else {
          TB_WARN("marked库未加载，使用简单换行处理");
          renderedDiv.innerHTML = renderContent.replace(/\n/g, "<br>");
        }
      } catch (error) {
        TB_ERROR("Markdown渲染错误:", error);
        TB_LOG("marked对象:", globalThis.marked);
        renderedDiv.innerHTML = renderContent.replace(/\n/g, "<br>");
      }
    } else {
      // 用户消息渲染版以纯文本呈现
      renderedDiv.textContent = renderContent;
    }

    messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-${
                  role === "user" ? "neon-blue" : "neon-green"
                }/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <i class="fa fa-${
                      role === "user" ? "user" : "robot"
                    } ${roleClass} text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="${roleClass} text-sm font-semibold mb-2">${roleName}</div>
                    <div class="message-content"></div>
                </div>
            </div>
        `;

    // 将渲染好的内容插入到消息容器中
    const messageContentDiv = messageDiv.querySelector(".message-content");
    // 根据当前开关设置显示哪一种
    if (this.showRaw) {
      renderedDiv.classList.add("hidden");
      rawDiv.classList.remove("hidden");
    } else {
      renderedDiv.classList.remove("hidden");
      rawDiv.classList.add("hidden");
    }

    contentContainer.appendChild(renderedDiv);
    contentContainer.appendChild(rawDiv);

    messageContentDiv.appendChild(contentContainer);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // LaTeX渲染将由forceRerenderMath统一处理

    // 如果不是加载消息且不跳过保存，保存到历史记录
    if (!isLoading && !skipSave) {
      this.chatHistory.push({ role, content });
      this.saveChatHistory();
    }

    // 返回创建的消息DOM节点，便于测试诊断定位
    return messageDiv;
  }

  // 将类似“[ \Lambda = ... ]”的非标准写法自动规范为“\[ ... \]”以便KaTeX解析
  normalizeLatexBrackets(content) {
    try {
      if (typeof content !== "string") return content;
      let result = content;
      // 匹配方括号中含有常见LaTeX命令的片段，转换为 \\[ ... \\]
      result = result.replace(
        /\[([^\]]*\\(frac|sqrt|int|sum|prod|lim|log|ln|exp|Lambda|lambda|chi|alpha|beta|gamma|theta|mu|sigma|mathbb|mathcal|operatorname)[^\]]*)\]/g,
        "\\[$1\\]"
      );
      // 针对整行的方括号公式进行兜底转换（避免误伤Markdown链接）
      result = result.replace(
        /(^|\n)\s*\[\s*([\s\S]*?)\s*\]\s*(?=\n|$)/g,
        "$1\\[ $2 \\]"
      );
      return result;
    } catch (e) {
      console.warn("normalizeLatexBrackets error:", e);
      return content;
    }
  }

  // 额外的稳健方括号规范化：使用函数替换，确保右端生成"\\]"
  normalizeBlockBracketsRobust(content) {
    try {
      if (typeof content !== "string") return content;
      return content.replace(
        /(^|\n)\s*\[\s*([\s\S]*?)\s*\]\s*(?=\n|$)/g,
        (m, pre, inner) => `${pre}\\[ ${inner} \\]`
      );
    } catch (e) {
      console.warn("normalizeBlockBracketsRobust error:", e);
      return content;
    }
  }

  // 规范化常见错配定界："( ... \)" => "\( ... \)"；"\[ ... ]" => "\[ ... \]"
  normalizeMismatchedDelimiters(content) {
    try {
      if (typeof content !== "string") return content;
      let result = content;
      // 将普通左括号 + LaTeX右定界 \) 的片段修正为标准内联定界
      result = result.replace(/\(\s*([^)]*?)\s*\\\)/g, "\\($1\\)");
      // 将 display 起始 \\[ 与普通右方括号 ] 搭配的片段补齐为 \\]
      result = result.replace(/\\\[\s*([\s\S]*?)\s*\](?=\s|$)/g, "\\[ $1 \\]");
      return result;
    } catch (e) {
      console.warn("normalizeMismatchedDelimiters error:", e);
      return content;
    }
  }

  // 自动识别括号中的TeX片段并包裹为 \( ... \) 以便作为内联公式渲染
  autoWrapInlineLaTeX(content) {
    try {
      if (typeof content !== "string") return content;
      let result = content;

      // 仅对圆括号内容进行检查：若存在明显TeX特征且未定界，则包裹为 \( ... \)
      result = result.replace(/\(([^)]+)\)/g, (m, inner) => {
        // 跳过包含HTML标签的片段，避免破坏结构
        if (/<[^>]+>/.test(inner)) return m;
        // 跳过已存在数学定界的片段（包含左右定界）
        if (/(\$|\\\(|\\\[|\\\)|\\\])/.test(inner)) return m;
        // 识别常见TeX特征
        const texLike =
          /\\[a-zA-Z]+|[_^]\{|\\left|\\right|\\frac|\\exp|\\mathbf|\\mathbb|\\mathcal|\\sigma|\\mu|\\Lambda|\\Sigma|\\det|\\log|\\top/.test(
            inner
          );
        if (texLike) {
          return `\\(${inner}\\)`;
        }
        return m;
      });

      return result;
    } catch (e) {
      console.warn("autoWrapInlineLaTeX error:", e);
      return content;
    }
  }

  // 将常见中文全角标点标准化为ASCII，避免LaTeX定界解析失败
  standardizeTextPunctuation(content) {
    try {
      if (typeof content !== "string") return content;
      return content
        .replace(/（/g, "(")
        .replace(/）/g, ")")
        .replace(/【/g, "[")
        .replace(/】/g, "]")
        .replace(/，/g, ",")
        .replace(/：/g, ":");
    } catch (e) {
      console.warn("standardizeTextPunctuation error:", e);
      return content;
    }
  }

  // 修复未闭合或不匹配的LaTeX定界符（\( ... \)、\[ ... \]、\left( ... \right)）
  repairUnbalancedLatexDelimiters(content) {
    try {
      if (typeof content !== "string") return content;
      let result = content;

      // 1) 将 "\( ... )" 这种缺少 "\)" 的形式修复为 "\( ... \)"
      result = result.replace(/\\\(([^)]*?)\)(?!\s*\\\))/g, "\\($1\\)");

      // 2) 修复 "\\left( ... \\right" 缺少右括号的情况
      result = result.replace(
        /\\left\(([^)]*?)\\right(?!\))/g,
        "\\left($1\\right)"
      );

      // 3) 统计并补齐块级定界 "\\[ ... \\]" 的右端
      const openBlock = (result.match(/\\\[/g) || []).length;
      const closeBlock = (result.match(/\\\]/g) || []).length;
      if (openBlock > closeBlock) {
        result += " ".repeat(openBlock - closeBlock).replace(/ /g, " \\]");
      }

      // 4) 统计并补齐内联定界 "\\( ... \\)" 的右端
      const openInline = (result.match(/\\\(/g) || []).length;
      const closeInline = (result.match(/\\\)/g) || []).length;
      if (openInline > closeInline) {
        result += " ".repeat(openInline - closeInline).replace(/ /g, " \\)");
      }

      return result;
    } catch (e) {
      console.warn("repairUnbalancedLatexDelimiters error:", e);
      return content;
    }
  }

  // 更安全的本地定界修复：只修正就地缺失，不进行全局补齐
  repairLocalLatexDelimiters(content) {
    try {
      if (typeof content !== "string") return content;
      let result = content;
      // 将 "\\( ... )" 这种缺少 "\\)" 的形式修复为 "\\( ... \\)"
      result = result.replace(/\\\(([^)]*?)\)(?!\s*\\\))/g, "\\($1\\)");
      // 修复 "\\left( ... \\right" 缺少右括号的情况
      result = result.replace(
        /\\left\(([^)]*?)\\right(?!\))/g,
        "\\left($1\\right)"
      );
      return result;
    } catch (e) {
      console.warn("repairLocalLatexDelimiters error:", e);
      return content;
    }
  }

  // 保护已定界的数学片段，避免预处理破坏原始LaTeX
  protectMathSegments(content) {
    try {
      if (typeof content !== "string")
        return { protectedText: content, segments: [] };
      const segments = [];
      let protectedText = content;

      const pushSeg = (m) => {
        const ph = `__MATH_SEG_${segments.length}__`;
        segments.push({ ph, text: m });
        return ph;
      };

      // 优先保护块级 $$ ... $$
      protectedText = protectedText.replace(/\$\$([\s\S]*?)\$\$/g, (m) =>
        pushSeg(m)
      );
      // 保护 \\[ ... \\]
      protectedText = protectedText.replace(/\\\[[\s\S]*?\\\]/g, (m) =>
        pushSeg(m)
      );
      // 保护 \\( ... \\)
      protectedText = protectedText.replace(/\\\([\s\S]*?\\\)/g, (m) =>
        pushSeg(m)
      );
      // 保护单美元 $ ... $（不匹配 $$）
      protectedText = protectedText.replace(
        /\$(?!\$)([\s\S]*?)\$(?!\$)/g,
        (m) => pushSeg(m)
      );

      return { protectedText, segments };
    } catch (e) {
      console.warn("protectMathSegments error:", e);
      return { protectedText: content, segments: [] };
    }
  }

  // 恢复被保护的数学片段占位符
  restoreMathSegments(text, segments) {
    try {
      if (!Array.isArray(segments) || !segments.length) return text;
      let result = text;
      segments.forEach((seg) => {
        result = result.replace(seg.ph, seg.text);
      });
      return result;
    } catch (e) {
      console.warn("restoreMathSegments error:", e);
      return text;
    }
  }

  // 统一的LaTeX预处理管线：先标准化标点，再规范方括号，再自动包裹未定界的TeX，最后修复未闭合定界
  preprocessLatex(content) {
    try {
      if (typeof content !== "string") return content;
      // 先保护已定界的数学片段，避免误改
      const { protectedText, segments } = this.protectMathSegments(content);
      let remainder = this.standardizeTextPunctuation(protectedText);
      remainder = this.normalizeLatexBrackets(remainder);
      // 额外兜底，保证块级方括号转换的右端是 \\]
      remainder = this.normalizeBlockBracketsRobust(remainder);
      // 修正常见错配定界（如 (p\) 与 \\[ ... ]）
      remainder = this.normalizeMismatchedDelimiters(remainder);
      // 仅对非数学片段尝试自动包裹内联TeX
      remainder = this.autoWrapInlineLaTeX(remainder);
      // 进行本地修复，避免全局闭合符号的强行补齐
      remainder = this.repairLocalLatexDelimiters(remainder);
      // 恢复已保护的数学片段
      const result = this.restoreMathSegments(remainder, segments);
      return result;
    } catch (e) {
      console.warn("preprocessLatex error:", e);
      return content;
    }
  }

  removeLoadingMessage() {
    const loadingMessage = document.querySelector(".message.loading");
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  // 渲染单个容器中的LaTeX公式
  renderMathInContainer(container) {
    if (!container) {
      TB_WARN("renderMathInContainer: 容器为空");
      return;
    }

    // 检查容器中是否包含LaTeX内容
    const content = container.textContent || container.innerText || "";
    const hasLatex = /\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\)/.test(content);
    TB_LOG(
      `容器内容检查 - 包含LaTeX: ${hasLatex}, 内容长度: ${content.length}`
    );

    if (!hasLatex) {
      TB_LOG("容器中未发现LaTeX内容，跳过渲染");
      return;
    }

    // 渲染LaTeX公式 - 支持KaTeX和MathJax
    if (globalThis.renderMathInElement) {
      // 使用KaTeX渲染
      TB_LOG("使用KaTeX渲染LaTeX");
      try {
        renderMathInElement(container, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
          ],
          throwOnError: false,
          strict: false,
          ignoredTags: [
            "script",
            "noscript",
            "style",
            "textarea",
            "pre",
            "code",
          ],
        });
        TB_LOG("KaTeX渲染成功");
      } catch (error) {
        TB_ERROR("KaTeX单容器渲染错误:", error);
      }
    } else if (globalThis.MathJax && globalThis.MathJax.typesetPromise) {
      // 使用MathJax渲染
      TB_LOG("使用MathJax (新版) 渲染LaTeX");
      globalThis.MathJax.typesetPromise([container])
        .then(() => {
          TB_LOG("MathJax渲染成功");
        })
        .catch((err) => {
          TB_ERROR("MathJax单容器渲染错误:", err);
        });
    } else if (globalThis.MathJax && globalThis.MathJax.Hub) {
      // 兼容旧版MathJax
      TB_LOG("使用MathJax (旧版Hub) 渲染LaTeX");
      try {
        globalThis.MathJax.Hub.Queue([
          "Typeset",
          globalThis.MathJax.Hub,
          container,
        ]);
        TB_LOG("MathJax Hub渲染已排队");
      } catch (error) {
        TB_ERROR("MathJax Hub单容器渲染错误:", error);
      }
    } else {
      TB_WARN("未找到可用的LaTeX渲染库 (KaTeX或MathJax)");
    }
  }

  // 强制重新渲染所有LaTeX和Markdown内容
  forceRerenderMath() {
    TB_LOG("开始强制重新渲染LaTeX和Markdown");

    // 使用多次尝试确保渲染成功
    const attemptRender = (attempt = 0) => {
      const chatMessages = document.getElementById("chat-messages");
      if (!chatMessages) {
        TB_WARN(`尝试 ${attempt + 1}: 未找到chat-messages容器`);
        if (attempt < 5) {
          setTimeout(() => attemptRender(attempt + 1), 100);
        }
        return;
      }

      // 获取所有消息内容容器
      const messageContents = chatMessages.querySelectorAll(".message-content");
      console.log(`找到 ${messageContents.length} 个消息容器`);

      if (messageContents.length === 0) {
        console.warn("没有找到消息内容容器");
        return;
      }

      messageContents.forEach((container, index) => {
        // 仅针对渲染版容器进行LaTeX渲染，避免影响原文
        const target = container.querySelector(".message-rendered");
        if (!target) return;
        console.log(`渲染第 ${index + 1} 个容器（渲染版）`);
        this.renderMathInContainer(target);
      });

      // 检查渲染库状态
      const hasKaTeX = !!globalThis.renderMathInElement;
      const hasMathJax = !!(
        globalThis.MathJax &&
        (globalThis.MathJax.typesetPromise || globalThis.MathJax.Hub)
      );
      console.log(`渲染库状态 - KaTeX: ${hasKaTeX}, MathJax: ${hasMathJax}`);

      // 如果渲染库还未加载完成，进行重试
      if (!hasKaTeX && !hasMathJax && attempt < 10) {
        console.log(`渲染库未就绪，${300}ms后重试 (尝试 ${attempt + 1}/10)`);
        setTimeout(() => attemptRender(attempt + 1), 300);
      } else {
        console.log("LaTeX渲染完成");
      }
    };

    // 延迟执行确保DOM完全更新
    setTimeout(() => attemptRender(), 100);
  }

  // 应用原文/渲染视图切换到所有已有消息
  updateRawToggleView() {
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return;
    const renderedNodes = chatMessages.querySelectorAll(".message-rendered");
    const rawNodes = chatMessages.querySelectorAll(".message-raw");
    if (this.showRaw) {
      renderedNodes.forEach((el) => el.classList.add("hidden"));
      rawNodes.forEach((el) => el.classList.remove("hidden"));
    } else {
      renderedNodes.forEach((el) => el.classList.remove("hidden"));
      rawNodes.forEach((el) => el.classList.add("hidden"));
    }
  }

  displayChatHistory() {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";

    this.chatHistory.forEach((message) => {
      this.addMessageToChat(message.role, message.content, false, true); // 添加skipSave参数
    });

    // 使用统一的重新渲染函数
    this.forceRerenderMath();
  }

  clearChat() {
    this.chatHistory = [];
    this.saveChatHistory();
    document.getElementById("chat-messages").innerHTML = "";
  }

  loadChatHistory() {
    const saved = localStorage.getItem("probability-toolbox-chat");
    return saved ? JSON.parse(saved) : [];
  }

  saveChatHistory() {
    localStorage.setItem(
      "probability-toolbox-chat",
      JSON.stringify(this.chatHistory)
    );
  }

  // 假设检验功能
  // 更新检验类型选项
  updateTestTypes() {
    const category = document.getElementById("test-category").value;
    const testTypeSelect = document.getElementById("test-type");

    let options = "";
    switch (category) {
      case "single-sample":
        options = `
          <option value="one-sample-z">单样本Z检验</option>
          <option value="one-sample-t">单样本t检验</option>
        `;
        this.updateDataInputInterface("single");
        break;
      case "two-sample":
        options = `
          <option value="independent-t-equal">独立样本t检验（等方差）</option>
          <option value="independent-t-unequal">独立样本t检验（不等方差）</option>
          <option value="paired-t">配对样本t检验</option>
        `;
        this.updateDataInputInterface("two");
        break;
      case "variance-test":
        options = `
          <option value="f-test">等方差检验（F检验）</option>
          <option value="levene-test">方差齐性检验（Levene检验）</option>
        `;
        this.updateDataInputInterface("two");
        break;
      case "anova":
        options = `
          <option value="two-way-anova">双因素方差分析</option>
        `;
        this.updateDataInputInterface("multiple");
        break;
    }

    testTypeSelect.innerHTML = options;
  }

  // 更新数据输入界面
  updateDataInputInterface(sampleType) {
    const singleSampleSummary = document.getElementById(
      "single-sample-summary"
    );
    const twoSampleSummary = document.getElementById("two-sample-summary");

    // 隐藏所有汇总数据界面
    if (singleSampleSummary) singleSampleSummary.classList.add("hidden");
    if (twoSampleSummary) twoSampleSummary.classList.add("hidden");

    // 根据样本类型显示对应界面
    switch (sampleType) {
      case "single":
        if (singleSampleSummary) singleSampleSummary.classList.remove("hidden");
        break;
      case "two":
      case "multiple":
        if (twoSampleSummary) twoSampleSummary.classList.remove("hidden");
        break;
    }
  }

  // 切换数据输入模式
  switchDataInputMode(mode) {
    const rawDataBtn = document.getElementById("raw-data-btn");
    const summaryDataBtn = document.getElementById("summary-data-btn");
    const rawDataSection = document.getElementById("raw-data-section");
    const summaryDataSection = document.getElementById("summary-data-section");

    if (mode === "raw") {
      rawDataBtn.classList.remove("bg-gray-600");
      rawDataBtn.classList.add("bg-neon-purple");
      summaryDataBtn.classList.remove("bg-neon-purple");
      summaryDataBtn.classList.add("bg-gray-600");

      rawDataSection.classList.remove("hidden");
      summaryDataSection.classList.add("hidden");
    } else {
      summaryDataBtn.classList.remove("bg-gray-600");
      summaryDataBtn.classList.add("bg-neon-purple");
      rawDataBtn.classList.remove("bg-neon-purple");
      rawDataBtn.classList.add("bg-gray-600");

      summaryDataSection.classList.remove("hidden");
      rawDataSection.classList.add("hidden");
    }
  }

  runHypothesisTest() {
    const testType = document.getElementById("test-type").value;
    const testDirection = document.getElementById("test-direction").value;

    // 获取显著性水平
    let alpha;
    const significanceLevel =
      document.getElementById("significance-level").value;
    if (significanceLevel === "custom") {
      alpha = parseFloat(document.getElementById("custom-alpha").value);
      if (isNaN(alpha) || alpha <= 0 || alpha >= 1) {
        this.showTestResult("请输入有效的显著性水平 (0-1)", "error");
        return;
      }
    } else {
      alpha = parseFloat(significanceLevel);
    }

    // 检查数据输入模式
    const rawDataSection = document.getElementById("raw-data-section");
    const isRawData = !rawDataSection.classList.contains("hidden");

    // 检查是否为两样本检验
    const category = document.getElementById("test-category").value;
    const isTwoSample =
      category === "two-sample" || category === "variance-test";

    let testData;
    if (isRawData) {
      // 原始数据模式
      const dataText = document.getElementById("sample-data").value;
      if (!dataText.trim()) {
        this.showTestResult("请输入样本数据", "error");
        return;
      }

      const data = dataText
        .split(",")
        .map((x) => parseFloat(x.trim()))
        .filter((x) => !isNaN(x));
      if (data.length === 0) {
        this.showTestResult("请输入有效的数值数据", "error");
        return;
      }

      testData = {
        type: "raw",
        data: data,
        n: data.length,
        mean: data.reduce((a, b) => a + b, 0) / data.length,
        std: Math.sqrt(
          data.reduce(
            (a, b) =>
              a +
              Math.pow(b - data.reduce((x, y) => x + y, 0) / data.length, 2),
            0
          ) /
            (data.length - 1)
        ),
      };
    } else {
      // 汇总数据模式
      if (isTwoSample) {
        // 两样本数据
        const mean1 = parseFloat(document.getElementById("sample1-mean").value);
        const std1 = parseFloat(document.getElementById("sample1-std").value);
        const n1 = parseInt(document.getElementById("sample1-size").value);
        const mean2 = parseFloat(document.getElementById("sample2-mean").value);
        const std2 = parseFloat(document.getElementById("sample2-std").value);
        const n2 = parseInt(document.getElementById("sample2-size").value);

        if (
          isNaN(mean1) ||
          isNaN(std1) ||
          isNaN(n1) ||
          n1 <= 0 ||
          isNaN(mean2) ||
          isNaN(std2) ||
          isNaN(n2) ||
          n2 <= 0
        ) {
          this.showTestResult("请输入有效的两组样本统计量", "error");
          return;
        }

        testData = {
          type: "summary",
          sample1: { mean: mean1, std: std1, n: n1 },
          sample2: { mean: mean2, std: std2, n: n2 },
        };
      } else {
        // 单样本数据
        const sampleMean = parseFloat(
          document.getElementById("sample-mean").value
        );
        const sampleStd = parseFloat(
          document.getElementById("sample-std").value
        );
        const sampleSize = parseInt(
          document.getElementById("sample-size").value
        );

        if (
          isNaN(sampleMean) ||
          isNaN(sampleStd) ||
          isNaN(sampleSize) ||
          sampleSize <= 0
        ) {
          this.showTestResult("请输入有效的汇总统计量", "error");
          return;
        }

        testData = {
          type: "summary",
          n: sampleSize,
          mean: sampleMean,
          std: sampleStd,
        };
      }
    }

    // 获取假设参数
    let hypothesisValue = 0;
    if (isTwoSample) {
      hypothesisValue =
        parseFloat(document.getElementById("hypothesis-diff").value) || 0;
    } else {
      hypothesisValue =
        parseFloat(document.getElementById("hypothesis-mean").value) || 0;
    }

    try {
      let result;
      switch (testType) {
        case "one-sample-z":
          result = this.performOneSampleZTest(
            testData,
            hypothesisValue,
            alpha,
            testDirection
          );
          break;
        case "one-sample-t":
          result = this.performOneSampleTTest(
            testData,
            hypothesisValue,
            alpha,
            testDirection
          );
          break;
        case "independent-t-equal":
          result = this.performIndependentTTestEqual(
            testData,
            hypothesisValue,
            alpha,
            testDirection
          );
          break;
        case "independent-t-unequal":
          result = this.performIndependentTTestUnequal(
            testData,
            hypothesisValue,
            alpha,
            testDirection
          );
          break;
        case "paired-t":
          result = this.performPairedTTest(
            testData,
            hypothesisValue,
            alpha,
            testDirection
          );
          break;
        case "f-test":
          result = this.performFTest(testData, alpha);
          break;
        case "levene-test":
          result = this.performLeveneTest(testData, alpha);
          break;
        case "two-way-anova":
          result = this.performTwoWayANOVA(testData, alpha);
          break;
        default:
          result = { error: "不支持的检验类型" };
      }

      this.showTestResult(result);
    } catch (error) {
      this.showTestResult("计算过程中发生错误", "error");
      console.error("假设检验错误:", error);
    }
  }

  performOneSampleZTest(testData, hypothesisMean, alpha, testDirection) {
    const { n, mean, std } = testData;

    // 需要总体标准差，这里假设样本标准差就是总体标准差
    const se = std / Math.sqrt(n);
    const z = (mean - hypothesisMean) / se;

    let critical, pValue, significant;

    switch (testDirection) {
      case "two-tailed":
        critical = this.getZCriticalValue(alpha / 2);
        pValue = 2 * (1 - this.normalCDF(Math.abs(z)));
        significant = Math.abs(z) > critical;
        break;
      case "left-tailed":
        critical = -this.getZCriticalValue(alpha);
        pValue = this.normalCDF(z);
        significant = z < critical;
        break;
      case "right-tailed":
        critical = this.getZCriticalValue(alpha);
        pValue = 1 - this.normalCDF(z);
        significant = z > critical;
        break;
    }

    return {
      testType: "单样本Z检验",
      statistic: z.toFixed(4),
      criticalValue: critical.toFixed(4),
      pValue: pValue.toFixed(4),
      alpha: alpha,
      direction: testDirection,
      hypothesisMean: hypothesisMean,
      sampleMean: mean.toFixed(4),
      sampleStd: std.toFixed(4),
      sampleSize: n,
      reject: significant,
      conclusion: significant
        ? `在α=${alpha}水平下，拒绝原假设H₀: μ = ${hypothesisMean}`
        : `在α=${alpha}水平下，不能拒绝原假设H₀: μ = ${hypothesisMean}`,
    };
  }

  performOneSampleTTest(testData, hypothesisMean, alpha, testDirection) {
    const { n, mean, std } = testData;
    const se = std / Math.sqrt(n);
    const t = (mean - hypothesisMean) / se;
    const df = n - 1;

    let critical, pValue, significant;

    switch (testDirection) {
      case "two-tailed":
        critical = this.getTCriticalValue(df, alpha / 2);
        pValue = 2 * this.getTTestPValue(Math.abs(t), df);
        significant = Math.abs(t) > critical;
        break;
      case "left-tailed":
        critical = -this.getTCriticalValue(df, alpha);
        pValue = this.getTTestPValue(-t, df);
        significant = t < critical;
        break;
      case "right-tailed":
        critical = this.getTCriticalValue(df, alpha);
        pValue = this.getTTestPValue(-t, df);
        significant = t > critical;
        break;
    }

    return {
      testType: "单样本t检验",
      statistic: t.toFixed(4),
      criticalValue: critical.toFixed(4),
      pValue: pValue.toFixed(4),
      alpha: alpha,
      direction: testDirection,
      hypothesisMean: hypothesisMean,
      sampleMean: mean.toFixed(4),
      sampleStd: std.toFixed(4),
      sampleSize: n,
      degreesOfFreedom: df,
      reject: significant,
      conclusion: significant
        ? `在α=${alpha}水平下，拒绝原假设H₀: μ = ${hypothesisMean}`
        : `在α=${alpha}水平下，不能拒绝原假设H₀: μ = ${hypothesisMean}`,
    };
  }

  performTTest(data, alpha) {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance =
      data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const std = Math.sqrt(variance);
    const se = std / Math.sqrt(n);
    const t = mean / se; // 假设检验均值为0
    const df = n - 1;

    // 简化的临界值计算（实际应用中应使用更精确的t分布表）
    const criticalValue = this.getTCriticalValue(df, alpha);
    const pValue = this.getTTestPValue(Math.abs(t), df);

    return {
      testType: "t检验",
      statistic: t.toFixed(4),
      criticalValue: criticalValue.toFixed(4),
      pValue: pValue.toFixed(4),
      alpha: alpha,
      reject: Math.abs(t) > criticalValue,
      sampleSize: n,
      sampleMean: mean.toFixed(4),
      sampleStd: std.toFixed(4),
    };
  }

  performZTest(data, alpha) {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    const se = std / Math.sqrt(n);
    const z = mean / se; // 假设检验均值为0

    const criticalValue = this.getZCriticalValue(alpha);
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));

    return {
      testType: "z检验",
      statistic: z.toFixed(4),
      criticalValue: criticalValue.toFixed(4),
      pValue: pValue.toFixed(4),
      alpha: alpha,
      reject: Math.abs(z) > criticalValue,
      sampleSize: n,
      sampleMean: mean.toFixed(4),
      sampleStd: std.toFixed(4),
    };
  }

  performChiSquareTest(data, alpha) {
    // 简化的卡方拟合优度检验
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const expected = mean; // 假设期望值等于样本均值

    const chiSquare = data.reduce(
      (sum, x) => sum + Math.pow(x - expected, 2) / expected,
      0
    );
    const df = n - 1;
    const criticalValue = this.getChiSquareCriticalValue(df, alpha);

    return {
      testType: "卡方检验",
      statistic: chiSquare.toFixed(4),
      criticalValue: criticalValue.toFixed(4),
      alpha: alpha,
      reject: chiSquare > criticalValue,
      degreesOfFreedom: df,
      sampleSize: n,
    };
  }

  performIndependentTTestEqual(testData, hypothesisDiff, alpha, testDirection) {
    let sample1, sample2;

    if (testData.type === "summary") {
      sample1 = testData.sample1;
      sample2 = testData.sample2;
    } else {
      // 原始数据模式暂不支持两样本
      return {
        testType: "独立样本t检验（等方差）",
        error: "原始数据模式暂不支持两样本检验，请使用汇总数据模式",
      };
    }

    const n1 = sample1.n;
    const n2 = sample2.n;
    const mean1 = sample1.mean;
    const mean2 = sample2.mean;
    const std1 = sample1.std;
    const std2 = sample2.std;

    // 计算合并标准差
    const pooledVariance =
      ((n1 - 1) * std1 * std1 + (n2 - 1) * std2 * std2) / (n1 + n2 - 2);
    const pooledStd = Math.sqrt(pooledVariance);
    const standardError = pooledStd * Math.sqrt(1 / n1 + 1 / n2);

    // 计算t统计量
    const tStatistic = (mean1 - mean2 - hypothesisDiff) / standardError;
    const df = n1 + n2 - 2;

    // 获取临界值和p值
    let criticalValue, pValue;
    if (testDirection === "two-tailed") {
      criticalValue = this.getTCriticalValue(df, alpha / 2);
      pValue = 2 * (1 - this.getTCDF(Math.abs(tStatistic), df));
    } else if (testDirection === "left-tailed") {
      criticalValue = -this.getTCriticalValue(df, alpha);
      pValue = this.getTCDF(tStatistic, df);
    } else {
      // right-tailed
      criticalValue = this.getTCriticalValue(df, alpha);
      pValue = 1 - this.getTCDF(tStatistic, df);
    }

    const reject = pValue < alpha;

    // 生成结论
    let conclusion;
    const directionText =
      testDirection === "two-tailed"
        ? "不等于"
        : testDirection === "left-tailed"
        ? "小于"
        : "大于";

    if (reject) {
      conclusion = `在显著性水平${alpha}下，拒绝原假设，认为两组均值差${directionText}${hypothesisDiff}`;
    } else {
      conclusion = `在显著性水平${alpha}下，不能拒绝原假设，没有足够证据表明两组均值差${directionText}${hypothesisDiff}`;
    }

    return {
      testType: "独立样本t检验（等方差）",
      statistic: tStatistic.toFixed(4),
      criticalValue: criticalValue.toFixed(4),
      pValue: pValue.toFixed(4),
      alpha: alpha,
      reject: reject,
      conclusion: conclusion,
      degreesOfFreedom: df,
      testDirection: testDirection,
      hypothesisValue: hypothesisDiff,
      sample1Stats: { mean: mean1, std: std1, n: n1 },
      sample2Stats: { mean: mean2, std: std2, n: n2 },
      pooledStd: pooledStd.toFixed(4),
      standardError: standardError.toFixed(4),
    };
  }

  performIndependentTTestUnequal(
    testData,
    hypothesisDiff,
    alpha,
    testDirection
  ) {
    let sample1, sample2;

    if (testData.type === "summary") {
      sample1 = testData.sample1;
      sample2 = testData.sample2;
    } else {
      // 原始数据模式暂不支持两样本
      return {
        testType: "独立样本t检验（不等方差）",
        error: "原始数据模式暂不支持两样本检验，请使用汇总数据模式",
      };
    }

    const n1 = sample1.n;
    const n2 = sample2.n;
    const mean1 = sample1.mean;
    const mean2 = sample2.mean;
    const std1 = sample1.std;
    const std2 = sample2.std;

    // 计算标准误差（Welch's t-test）
    const se1 = (std1 * std1) / n1;
    const se2 = (std2 * std2) / n2;
    const standardError = Math.sqrt(se1 + se2);

    // 计算t统计量
    const tStatistic = (mean1 - mean2 - hypothesisDiff) / standardError;

    // 计算Welch-Satterthwaite自由度
    const df =
      Math.pow(se1 + se2, 2) /
      (Math.pow(se1, 2) / (n1 - 1) + Math.pow(se2, 2) / (n2 - 1));

    // 获取临界值和p值
    let criticalValue, pValue;
    if (testDirection === "two-tailed") {
      criticalValue = this.getTCriticalValue(df, alpha / 2);
      pValue = 2 * (1 - this.getTCDF(Math.abs(tStatistic), df));
    } else if (testDirection === "left-tailed") {
      criticalValue = -this.getTCriticalValue(df, alpha);
      pValue = this.getTCDF(tStatistic, df);
    } else {
      // right-tailed
      criticalValue = this.getTCriticalValue(df, alpha);
      pValue = 1 - this.getTCDF(tStatistic, df);
    }

    const reject = pValue < alpha;

    // 生成结论
    let conclusion;
    const directionText =
      testDirection === "two-tailed"
        ? "不等于"
        : testDirection === "left-tailed"
        ? "小于"
        : "大于";

    if (reject) {
      conclusion = `在显著性水平${alpha}下，拒绝原假设，认为两组均值差${directionText}${hypothesisDiff}`;
    } else {
      conclusion = `在显著性水平${alpha}下，不能拒绝原假设，没有足够证据表明两组均值差${directionText}${hypothesisDiff}`;
    }

    return {
      testType: "独立样本t检验（不等方差）",
      statistic: tStatistic.toFixed(4),
      criticalValue: criticalValue.toFixed(4),
      pValue: pValue.toFixed(4),
      alpha: alpha,
      reject: reject,
      conclusion: conclusion,
      degreesOfFreedom: df.toFixed(2),
      testDirection: testDirection,
      hypothesisValue: hypothesisDiff,
      sample1Stats: { mean: mean1, std: std1, n: n1 },
      sample2Stats: { mean: mean2, std: std2, n: n2 },
      standardError: standardError.toFixed(4),
    };
  }

  performPairedTTest(testData, hypothesisDiff, alpha, testDirection) {
    let sample1, sample2;

    if (testData.type === "summary") {
      sample1 = testData.sample1;
      sample2 = testData.sample2;
    } else {
      // 原始数据模式暂不支持两样本
      return {
        testType: "配对样本t检验",
        error: "原始数据模式暂不支持两样本检验，请使用汇总数据模式",
      };
    }

    // 配对t检验要求样本量相等
    if (sample1.n !== sample2.n) {
      return {
        testType: "配对样本t检验",
        error: "配对样本t检验要求两组样本量相等",
      };
    }

    const n = sample1.n;
    const mean1 = sample1.mean;
    const mean2 = sample2.mean;
    const std1 = sample1.std;
    const std2 = sample2.std;

    // 计算差值的均值和标准差
    // 注意：这里假设两组数据不相关（相关系数为0），实际应用中需要相关系数
    const meanDiff = mean1 - mean2;
    const stdDiff = Math.sqrt(std1 * std1 + std2 * std2); // 假设独立
    const standardError = stdDiff / Math.sqrt(n);

    // 计算t统计量
    const tStatistic = (meanDiff - hypothesisDiff) / standardError;
    const df = n - 1;

    // 获取临界值和p值
    let criticalValue, pValue;
    if (testDirection === "two-tailed") {
      criticalValue = this.getTCriticalValue(df, alpha / 2);
      pValue = 2 * (1 - this.getTCDF(Math.abs(tStatistic), df));
    } else if (testDirection === "left-tailed") {
      criticalValue = -this.getTCriticalValue(df, alpha);
      pValue = this.getTCDF(tStatistic, df);
    } else {
      // right-tailed
      criticalValue = this.getTCriticalValue(df, alpha);
      pValue = 1 - this.getTCDF(tStatistic, df);
    }

    const reject = pValue < alpha;

    // 生成结论
    let conclusion;
    const directionText =
      testDirection === "two-tailed"
        ? "不等于"
        : testDirection === "left-tailed"
        ? "小于"
        : "大于";

    if (reject) {
      conclusion = `在显著性水平${alpha}下，拒绝原假设，认为配对差值${directionText}${hypothesisDiff}`;
    } else {
      conclusion = `在显著性水平${alpha}下，不能拒绝原假设，没有足够证据表明配对差值${directionText}${hypothesisDiff}`;
    }

    return {
      testType: "配对样本t检验",
      statistic: tStatistic.toFixed(4),
      criticalValue: criticalValue.toFixed(4),
      pValue: pValue.toFixed(4),
      alpha: alpha,
      reject: reject,
      conclusion: conclusion,
      degreesOfFreedom: df,
      testDirection: testDirection,
      hypothesisValue: hypothesisDiff,
      sample1Stats: { mean: mean1, std: std1, n: n },
      sample2Stats: { mean: mean2, std: std2, n: n },
      meanDiff: meanDiff.toFixed(4),
      stdDiff: stdDiff.toFixed(4),
      standardError: standardError.toFixed(4),
    };
  }

  performLeveneTest(testData, alpha) {
    // 占位符方法 - 待实现
    return {
      testType: "Levene方差齐性检验",
      statistic: "0.0000",
      criticalValue: "0.0000",
      pValue: "0.0000",
      alpha: alpha,
      reject: false,
      conclusion: "功能开发中...",
    };
  }

  performTwoWayANOVA(testData, alpha) {
    // 占位符方法 - 待实现
    return {
      testType: "双因素方差分析",
      statistic: "0.0000",
      criticalValue: "0.0000",
      pValue: "0.0000",
      alpha: alpha,
      reject: false,
      conclusion: "功能开发中...",
    };
  }

  performFTest(testData, alpha) {
    // 更新F检验以支持新的数据格式
    if (testData && testData.type === "raw") {
      const data = testData.data;
      const n = data.length;
      const variance =
        data.reduce(
          (a, b) => a + Math.pow(b - data.reduce((x, y) => x + y, 0) / n, 2),
          0
        ) /
        (n - 1);
      const theoreticalVariance = 1; // 假设理论方差为1
      const f = variance / theoreticalVariance;
      const df1 = n - 1;
      const df2 = n - 1;

      return {
        testType: "F检验",
        statistic: f.toFixed(4),
        alpha: alpha,
        degreesOfFreedom1: df1,
        degreesOfFreedom2: df2,
        sampleVariance: variance.toFixed(4),
      };
    } else {
      // 兼容旧格式或处理汇总数据
      return {
        testType: "F检验",
        statistic: "0.0000",
        criticalValue: "N/A",
        pValue: "N/A",
        alpha: alpha,
        reject: false,
        conclusion: "功能开发中...",
      };
    }
  }

  showTestResult(result, type = "success") {
    const resultDiv = document.getElementById("test-result");
    resultDiv.classList.remove("hidden");

    if (type === "error") {
      resultDiv.innerHTML = `<div class="text-red-400">${result}</div>`;
      return;
    }

    const rejectText = result.reject
      ? '<span class="text-red-400">拒绝原假设</span>'
      : '<span class="text-green-400">不拒绝原假设</span>';

    // 检验方向的中文显示
    const directionText = {
      "two-tailed": "双侧检验",
      "left-tailed": "左侧检验",
      "right-tailed": "右侧检验",
    };

    resultDiv.innerHTML = `
            <div class="space-y-2 text-sm">
                <div><strong>检验类型:</strong> ${result.testType}</div>
                ${
                  result.testDirection
                    ? `<div><strong>检验方向:</strong> ${
                        directionText[result.testDirection] ||
                        result.testDirection
                      }</div>`
                    : ""
                }
                ${
                  result.hypothesisMean !== undefined
                    ? `<div><strong>假设均值:</strong> ${result.hypothesisMean}</div>`
                    : ""
                }
                ${
                  result.hypothesisValue !== undefined &&
                  result.hypothesisMean === undefined
                    ? `<div><strong>假设差值:</strong> ${result.hypothesisValue}</div>`
                    : ""
                }
                <div><strong>检验统计量:</strong> ${result.statistic}</div>
                ${
                  result.criticalValue
                    ? `<div><strong>临界值:</strong> ${result.criticalValue}</div>`
                    : ""
                }
                ${
                  result.pValue
                    ? `<div><strong>p值:</strong> ${result.pValue}</div>`
                    : ""
                }
                <div><strong>显著性水平:</strong> ${result.alpha}</div>
                ${
                  result.degreesOfFreedom
                    ? `<div><strong>自由度:</strong> ${result.degreesOfFreedom}</div>`
                    : ""
                }
                <div><strong>结论:</strong> ${rejectText}</div>
                ${
                  result.conclusion
                    ? `<div class="mt-2 p-2 bg-gray-700 rounded"><strong>详细结论:</strong> ${result.conclusion}</div>`
                    : ""
                }
                <div class="mt-3 text-xs text-gray-400">
                    ${
                      result.sample1Stats && result.sample2Stats
                        ? `<div><strong>样本信息:</strong></div>
                           <div>• 第一组: 均值=${
                             result.sample1Stats.mean
                           }, 标准差=${result.sample1Stats.std}, 样本量=${
                            result.sample1Stats.n
                          }</div>
                           <div>• 第二组: 均值=${
                             result.sample2Stats.mean
                           }, 标准差=${result.sample2Stats.std}, 样本量=${
                            result.sample2Stats.n
                          }</div>
                           ${
                             result.pooledStd
                               ? `<div>• 合并标准差: ${result.pooledStd}</div>`
                               : ""
                           }
                           ${
                             result.standardError
                               ? `<div>• 标准误差: ${result.standardError}</div>`
                               : ""
                           }
                           ${
                             result.meanDiff
                               ? `<div>• 均值差: ${result.meanDiff}</div>`
                               : ""
                           }`
                        : `<div><strong>样本信息:</strong></div>
                           ${
                             result.sampleSize
                               ? `<div>• 样本大小: ${result.sampleSize}</div>`
                               : ""
                           }
                           ${
                             result.sampleMean
                               ? `<div>• 样本均值: ${result.sampleMean}</div>`
                               : ""
                           }
                           ${
                             result.sampleStd
                               ? `<div>• 样本标准差: ${result.sampleStd}</div>`
                               : ""
                           }`
                    }
                </div>
            </div>
        `;
  }

  // 分位数表功能
  initDistributionTables() {
    this.updateDistributionParams();
  }

  updateDistributionParams() {
    const distributionType = document.getElementById("distribution-type").value;
    const paramsDiv = document.getElementById("distribution-params");

    let paramsHTML = "";
    switch (distributionType) {
      case "normal":
        paramsHTML = ""; // 标准正态分布无需额外参数
        break;
      case "t":
        paramsHTML = `
                    <div>
                        <label class="block text-gray-300 mb-1">自由度:</label>
                        <input type="number" id="df-param" value="10" min="1" class="w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none">
                    </div>
                `;
        break;
      case "chi-square":
        paramsHTML = `
                    <div>
                        <label class="block text-gray-300 mb-1">自由度:</label>
                        <input type="number" id="df-param" value="10" min="1" class="w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none">
                    </div>
                `;
        break;
      case "f":
        paramsHTML = `
                    <div>
                        <label class="block text-gray-300 mb-1">分子自由度:</label>
                        <input type="number" id="df1-param" value="5" min="1" class="w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-gray-300 mb-1">分母自由度:</label>
                        <input type="number" id="df2-param" value="10" min="1" class="w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none">
                    </div>
                `;
        break;
    }

    paramsDiv.innerHTML = paramsHTML;
  }

  calculateQuantile() {
    const distributionType = document.getElementById("distribution-type").value;
    const probability = parseFloat(
      document.getElementById("probability-input").value
    );

    if (isNaN(probability) || probability < 0 || probability > 1) {
      this.showQuantileResult("请输入有效的概率值 (0-1)", "error");
      return;
    }

    let result;
    try {
      switch (distributionType) {
        case "normal":
          result = this.normalInverseCDF(probability);
          break;
        case "t":
          const df = parseInt(document.getElementById("df-param").value);
          result = this.tInverseCDF(probability, df);
          break;
        case "chi-square":
          const dfChi = parseInt(document.getElementById("df-param").value);
          result = this.chiSquareInverseCDF(probability, dfChi);
          break;
        case "f":
          const df1 = parseInt(document.getElementById("df1-param").value);
          const df2 = parseInt(document.getElementById("df2-param").value);
          result = this.fInverseCDF(probability, df1, df2);
          break;
        default:
          throw new Error("不支持的分布类型");
      }

      this.showQuantileResult({
        distribution: this.getDistributionName(distributionType),
        probability: probability,
        quantile: result.toFixed(6),
      });
    } catch (error) {
      this.showQuantileResult("计算过程中发生错误", "error");
      console.error("分位数计算错误:", error);
    }
  }

  showQuantileResult(result, type = "success") {
    const resultDiv = document.getElementById("quantile-result");
    resultDiv.classList.remove("hidden");

    if (type === "error") {
      resultDiv.innerHTML = `<div class="text-red-400">${result}</div>`;
      return;
    }

    resultDiv.innerHTML = `
            <div class="space-y-2 text-sm">
                <div><strong>分布类型:</strong> ${result.distribution}</div>
                <div><strong>概率:</strong> ${result.probability}</div>
                <div><strong>分位数:</strong> <span class="text-neon-green font-mono">${result.quantile}</span></div>
            </div>
        `;
  }

  getDistributionName(type) {
    const names = {
      normal: "标准正态分布",
      t: "t分布",
      "chi-square": "卡方分布",
      f: "F分布",
    };
    return names[type] || type;
  }

  // 数学函数（简化版本，实际应用中应使用更精确的算法）
  normalCDF(x) {
    // 标准正态分布累积分布函数的近似
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  normalInverseCDF(p) {
    // 标准正态分布分位数函数的近似（Box-Muller变换的逆）
    if (p <= 0 || p >= 1) throw new Error("概率值必须在(0,1)区间内");

    // 使用Beasley-Springer-Moro算法的简化版本
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

  erf(x) {
    // 误差函数的近似
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  tInverseCDF(p, df) {
    // t分布分位数的近似（基于正态分布的修正）
    const z = this.normalInverseCDF(p);
    if (df >= 30) return z; // 大样本时近似为正态分布

    // 简化的t分布修正
    const correction =
      (z * z * z) / (4 * df) + (z * (5 * z * z * z + 16 * z)) / (96 * df * df);
    return z + correction;
  }

  chiSquareInverseCDF(p, df) {
    // 卡方分布分位数的近似
    if (df === 1) {
      const z = this.normalInverseCDF((p + 1) / 2);
      return z * z;
    }

    // Wilson-Hilferty变换
    const h = 2 / (9 * df);
    const z = this.normalInverseCDF(p);
    const x = 1 - h + z * Math.sqrt(h);
    return df * x * x * x;
  }

  fInverseCDF(p, df1, df2) {
    // F分布分位数的近似（非常简化）
    const chi1 = this.chiSquareInverseCDF(p, df1);
    const chi2 = this.chiSquareInverseCDF(0.5, df2); // 使用中位数作为近似
    return chi1 / df1 / (chi2 / df2);
  }

  getTCriticalValue(df, alpha) {
    // t分布临界值的简化查表
    const criticalValues = {
      0.01: { 1: 63.657, 2: 9.925, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.75 },
      0.05: { 1: 12.706, 2: 4.303, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042 },
      0.1: { 1: 6.314, 2: 2.92, 5: 2.015, 10: 1.812, 20: 1.725, 30: 1.697 },
    };

    const table = criticalValues[alpha];
    if (!table) return 2.0; // 默认值

    // 找到最接近的自由度
    const dfs = Object.keys(table)
      .map(Number)
      .sort((a, b) => a - b);
    let closestDf = dfs[0];
    for (let i = 0; i < dfs.length; i++) {
      if (df >= dfs[i]) closestDf = dfs[i];
    }

    return table[closestDf];
  }

  getZCriticalValue(alpha) {
    // 标准正态分布临界值
    const criticalValues = {
      0.01: 2.576,
      0.05: 1.96,
      0.1: 1.645,
    };
    return criticalValues[alpha] || 1.96;
  }

  getChiSquareCriticalValue(df, alpha) {
    // 卡方分布临界值的简化查表
    const criticalValues = {
      0.01: {
        1: 6.635,
        2: 9.21,
        5: 15.086,
        10: 23.209,
        20: 37.566,
        30: 50.892,
      },
      0.05: { 1: 3.841, 2: 5.991, 5: 11.07, 10: 18.307, 20: 31.41, 30: 43.773 },
      0.1: { 1: 2.706, 2: 4.605, 5: 9.236, 10: 15.987, 20: 28.412, 30: 40.256 },
    };

    const table = criticalValues[alpha];
    if (!table) return 10.0; // 默认值

    // 找到最接近的自由度
    const dfs = Object.keys(table)
      .map(Number)
      .sort((a, b) => a - b);
    let closestDf = dfs[0];
    for (let i = 0; i < dfs.length; i++) {
      if (df >= dfs[i]) closestDf = dfs[i];
    }

    return table[closestDf];
  }

  getTTestPValue(t, df) {
    // t检验p值的简化计算
    // 这是一个非常简化的版本，实际应用中应使用更精确的算法
    if (df >= 30) {
      return 2 * (1 - this.normalCDF(t));
    }

    // 简化的t分布p值计算
    const normalP = 2 * (1 - this.normalCDF(t));
    const correction = 1 + (t * t) / (4 * df);
    return Math.min(1, normalP * correction);
  }

  // 测试工具方法
  testLatexRender() {
    const resultDiv = document.getElementById("latex-test-result");
    resultDiv.innerHTML =
      '<i class="fa fa-spinner fa-spin mr-1"></i>正在测试LaTeX渲染...';

    try {
      // 创建测试元素
      const testElement = document.createElement("div");
      testElement.innerHTML =
        "测试公式: $E = mc^2$ 和 $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$";
      document.body.appendChild(testElement);

      // 测试全局渲染函数
      if (typeof globalThis.renderLatexInElement === "function") {
        globalThis.renderLatexInElement(testElement);

        setTimeout(() => {
          const hasRendered = testElement.querySelector(".katex") !== null;
          document.body.removeChild(testElement);

          if (hasRendered) {
            resultDiv.innerHTML =
              '<i class="fa fa-check text-green-400 mr-1"></i>LaTeX渲染测试通过';
          } else {
            resultDiv.innerHTML =
              '<i class="fa fa-times text-red-400 mr-1"></i>LaTeX渲染失败';
          }
        }, 200);
      } else {
        document.body.removeChild(testElement);
        resultDiv.innerHTML =
          '<i class="fa fa-times text-red-400 mr-1"></i>全局渲染函数不存在';
      }
    } catch (error) {
      resultDiv.innerHTML = `<i class="fa fa-times text-red-400 mr-1"></i>测试出错: ${error.message}`;
    }
  }

  testChatHistory() {
    const resultDiv = document.getElementById("chat-test-result");
    resultDiv.innerHTML =
      '<i class="fa fa-spinner fa-spin mr-1"></i>正在测试聊天记录...';

    try {
      // 清空聊天记录
      this.clearChat();

      // 添加测试消息
      this.addMessageToChat("user", "测试消息1", false, false);
      this.addMessageToChat("assistant", "测试回复1", false, false);

      const initialCount = document.querySelectorAll(
        "#chat-messages .message"
      ).length;

      // 模拟切换工具（这会触发displayChatHistory）
      this.toggleTool("calculator");
      this.toggleTool("ai-assistant");

      setTimeout(() => {
        const finalCount = document.querySelectorAll(
          "#chat-messages .message"
        ).length;

        if (finalCount === initialCount) {
          resultDiv.innerHTML =
            '<i class="fa fa-check text-green-400 mr-1"></i>聊天记录测试通过，无重复';
        } else {
          resultDiv.innerHTML = `<i class="fa fa-times text-red-400 mr-1"></i>检测到重复，消息数量从${initialCount}变为${finalCount}`;
        }
      }, 100);
    } catch (error) {
      resultDiv.innerHTML = `<i class="fa fa-times text-red-400 mr-1"></i>测试出错: ${error.message}`;
    }
  }

  // 诊断AI消息中的LaTeX渲染情况：构造多种公式写法并检测是否成功渲染
  testChatLatexDiagnosis() {
    const resultDiv = document.getElementById("latex-diagnostic-result");
    resultDiv.innerHTML =
      '<i class="fa fa-spinner fa-spin mr-1"></i>正在运行诊断...';
    // 使用“纯文本消息”注入，贴近真实AI输出路径
    const tests = [
      {
        id: "inline_plain",
        content: "$a^2 + b^2 = c^2$",
      },
      {
        id: "display_plain",
        content:
          "\\[\n\\Phi(x) = \\frac{1}{\\sqrt{2\\pi}} \\int_{-\\infty}^x e^{-\\frac{t^2}{2}} , dt.\n\\]",
      },
      {
        id: "expect_var_plain",
        content:
          "\\[\n\\mathbb{E}[X_i] = \\mu, \\quad \\operatorname{Var}(X_i) = \\sigma^2 > 0,\n\\]",
      },
      {
        id: "brackets_plain",
        content:
          "[ \\Lambda = \\frac{1}{(2\\pi)^{p/2} |\\Sigma|^{1/2}} \\exp\\left( -\\frac{1}{2} (\\mathbf{x}-\\boldsymbol{\\mu})^\\top \\boldsymbol{\\Sigma}^{-1} (\\mathbf{x}-\\boldsymbol{\\mu}) \\right) ]",
      },
      {
        id: "paren_plain",
        content: "( \\mu + \\sigma \\)",
      },
    ];

    // 诊断时强制切换到“渲染版”以检测KaTeX输出
    if (this.showRaw) {
      this.showRaw = false;
      this.updateRawToggleView();
    }

    // 插入消息但不写入历史，记录DOM节点用于判定
    const nodes = tests.map((t) => {
      const node = this.addMessageToChat("assistant", t.content, false, true);
      if (node) node.setAttribute("data-test-id", t.id);
      return { id: t.id, node };
    });

    // 强制渲染后收集结果（延时确保DOM完成）
    setTimeout(() => {
      this.forceRerenderMath();
      setTimeout(() => {
        const results = nodes.map((n) => {
          const container = n.node
            ? n.node.querySelector(".message-rendered")
            : null;
          const rendered = container
            ? !!(
                container.querySelector(".katex") ||
                container.querySelector("mjx-container")
              )
            : false;
          return { id: n.id, rendered, note: n.node ? "" : "未找到消息元素" };
        });

        const total = results.length;
        const passed = results.filter((r) => r.rendered).length;
        let html = `<div class="text-xs"><div class="font-medium">渲染通过 ${passed}/${total}</div>`;
        results.forEach((r) => {
          const icon = r.rendered
            ? "fa-check text-green-400"
            : "fa-times text-red-400";
          html += `<div><i class="fa ${icon} mr-1"></i>${r.id}${
            r.note ? "（" + r.note + "）" : ""
          }</div>`;
        });
        html += `</div>`;
        resultDiv.innerHTML = html;
      }, 250);
    }, 100);
  }

  testSystemStatus() {
    const resultDiv = document.getElementById("system-test-result");
    resultDiv.innerHTML =
      '<i class="fa fa-spinner fa-spin mr-1"></i>正在检查系统状态...';

    const checks = [];

    // 检查KaTeX
    checks.push({
      name: "KaTeX",
      status: typeof katex !== "undefined",
      message: typeof katex !== "undefined" ? "已加载" : "未加载",
    });

    // 检查全局渲染函数
    checks.push({
      name: "全局LaTeX渲染",
      status: typeof globalThis.renderLatexInElement === "function",
      message:
        typeof globalThis.renderLatexInElement === "function"
          ? "可用"
          : "不可用",
    });

    // 检查聊天历史
    checks.push({
      name: "聊天历史",
      status: Array.isArray(this.chatHistory),
      message: Array.isArray(this.chatHistory)
        ? `${this.chatHistory.length}条记录`
        : "异常",
    });

    // 检查工具箱元素
    checks.push({
      name: "工具箱界面",
      status: document.getElementById("toolbox-sidebar") !== null,
      message:
        document.getElementById("toolbox-sidebar") !== null ? "正常" : "缺失",
    });

    setTimeout(() => {
      const passedChecks = checks.filter((check) => check.status).length;
      const totalChecks = checks.length;

      let statusHtml = `<div class="text-xs">`;
      checks.forEach((check) => {
        const icon = check.status
          ? "fa-check text-green-400"
          : "fa-times text-red-400";
        statusHtml += `<div><i class="fa ${icon} mr-1"></i>${check.name}: ${check.message}</div>`;
      });
      statusHtml += `<div class="mt-1 font-medium">总体状态: ${passedChecks}/${totalChecks} 项正常</div></div>`;

      resultDiv.innerHTML = statusHtml;
    }, 500);
  }

  async loadChapterVideos(mdPath) {
    const container = document.getElementById("chapters-container");
    if (!container) return;

    try {
      const response = await fetch(mdPath);
      if (!response.ok) throw new Error("无法加载目录文件");
      const text = await response.text();

      const chapters = [];
      const lines = text.split("\n");
      let currentChapter = null;

      lines.forEach((line) => {
        const match = line.match(/^##\s+(.+)/);
        if (match) {
          if (currentChapter) chapters.push(currentChapter);
          currentChapter = {
            title: match[1].trim(),
            description: "",
            sections: [],
          };
        } else if (currentChapter) {
          if (line.trim().startsWith("-") || line.trim().match(/^\d+\./)) {
            currentChapter.sections.push(line.trim());
          } else if (
            line.trim() &&
            !line.startsWith("---") &&
            currentChapter.sections.length === 0
          ) {
            currentChapter.description += line.trim() + " ";
          }
        }
      });
      if (currentChapter) chapters.push(currentChapter);

      container.innerHTML = "";
      chapters.forEach((chapter, index) => {
        const card = document.createElement("div");
        card.className =
          "bg-dark-card rounded-lg p-6 border border-gray-700 hover:border-neon-blue transition-all duration-300 cursor-pointer group";
        card.onclick = () => {
          const player = document.getElementById("course-video-player");
          const placeholder = document.getElementById("video-placeholder");
          const title = document.getElementById("video-title");
          const desc = document.getElementById("video-desc");

          // 模拟视频播放
          if (player && placeholder) {
            // 实际项目中应替换为真实视频URL
            // player.src = "static/videos/chapter" + (index + 1) + ".mp4";
            // player.style.display = "block";
            // placeholder.style.display = "none";
          }

          if (title) title.textContent = chapter.title;
          if (desc)
            desc.textContent =
              chapter.description ||
              "本章包含 " + chapter.sections.length + " 个小节";

          // 滚动到顶部
          const videoSection = document.getElementById("video-section");
          if (videoSection) videoSection.scrollIntoView({ behavior: "smooth" });
        };

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-full bg-neon-blue/10 flex items-center justify-center group-hover:bg-neon-blue/20 transition-colors">
                    <span class="text-neon-blue font-future font-bold text-xl">${
                      index + 1
                    }</span>
                </div>
                <i class="fa fa-play-circle text-gray-600 group-hover:text-neon-blue text-2xl transition-colors"></i>
            </div>
            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">${
              chapter.title
            }</h3>
            <p class="text-gray-400 text-sm line-clamp-3 mb-4">${
              chapter.description || "暂无简介"
            }</p>
            <div class="text-xs text-gray-500 border-t border-gray-700 pt-3">
                ${chapter.sections.length} 个小节
            </div>
        `;
        container.appendChild(card);
      });
    } catch (e) {
      console.error("加载课程目录失败:", e);
      container.innerHTML = `<div class="col-span-full text-center text-red-400">加载课程目录失败: ${e.message}</div>`;
    }
  }
}

// 全局LaTeX渲染函数，可在其他页面中调用
globalThis.renderLatexInElement = function (element, options = {}) {
  if (!element) {
    console.warn("renderLatexInElement: 元素为空");
    return;
  }

  const defaultOptions = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
    strict: false,
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
  };

  const finalOptions = Object.assign(defaultOptions, options);

  // 检查是否包含LaTeX内容
  const content = element.textContent || element.innerText || "";
  const hasLatex = /\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\)/.test(content);

  if (!hasLatex) {
    TB_LOG("元素中未发现LaTeX内容，跳过渲染");
    return false;
  }

  TB_LOG("开始渲染LaTeX内容");

  // 尝试使用KaTeX渲染
  if (globalThis.renderMathInElement) {
    try {
      renderMathInElement(element, finalOptions);
      TB_LOG("KaTeX渲染成功");
      return true;
    } catch (error) {
      TB_ERROR("KaTeX渲染失败:", error);
    }
  }

  // 尝试使用MathJax渲染
  if (globalThis.MathJax && globalThis.MathJax.typesetPromise) {
    globalThis.MathJax.typesetPromise([element])
      .then(() => {
        TB_LOG("MathJax渲染成功");
      })
      .catch((err) => {
        TB_ERROR("MathJax渲染失败:", err);
      });
    return true;
  }

  // 尝试使用旧版MathJax
  if (globalThis.MathJax && globalThis.MathJax.Hub) {
    try {
      globalThis.MathJax.Hub.Queue([
        "Typeset",
        globalThis.MathJax.Hub,
        element,
      ]);
      TB_LOG("MathJax Hub渲染已排队");
      return true;
    } catch (error) {
      TB_ERROR("MathJax Hub渲染失败:", error);
    }
  }

  TB_WARN("未找到可用的LaTeX渲染库");
  return false;
};

// 全局Markdown渲染函数
globalThis.renderMarkdownInElement = function (element, content) {
  if (!element) {
    TB_WARN("renderMarkdownInElement: 元素为空");
    return false;
  }

  try {
    if (globalThis.marked && globalThis.marked.parse) {
      element.innerHTML = marked.parse(content);
      TB_LOG("Markdown渲染成功 (marked.parse)");
      return true;
    } else if (globalThis.marked) {
      element.innerHTML = marked(content);
      TB_LOG("Markdown渲染成功 (marked)");
      return true;
    } else {
      TB_WARN("marked库未加载，使用简单换行处理");
      element.innerHTML = content.replace(/\n/g, "<br>");
      return false;
    }
  } catch (error) {
    TB_ERROR("Markdown渲染错误:", error);
    element.innerHTML = content.replace(/\n/g, "<br>");
    return false;
  }
};

// 页面加载完成后初始化工具箱
document.addEventListener("DOMContentLoaded", () => {
  try {
    ensureToolboxStyles();
  } catch (_) {}
  globalThis.probabilityToolbox = new ProbabilityToolbox();
  try {
    const path = (globalThis.location && globalThis.location.pathname) || "";
    if (path.endsWith("/templates/random_variables.html")) {
      // 页面加载后小延时执行诊断，避免未就绪的DOM导致找不到节点
      setTimeout(() => {
        if (
          globalThis.probabilityToolbox &&
          typeof globalThis.probabilityToolbox.testChatLatexDiagnosis ===
            "function"
        ) {
          globalThis.probabilityToolbox.testChatLatexDiagnosis();
        }
      }, 500);
    }
  } catch (_) {}
});
