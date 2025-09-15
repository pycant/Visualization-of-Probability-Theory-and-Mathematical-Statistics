/**
 * 通用工具箱组件
 * 包含AI智能助手、假设检验、分位数表等工具
 */

class ProbabilityToolbox {
  constructor() {
    this.isOpen = false;
    this.currentTool = null;
    this.chatHistory = this.loadChatHistory();
    this.apiKey = "sk-fbc4de9c1fd949aea95d4cd1a5bf48e2";
    this.defaultPrompt =
      "你是一个专业的概率论与数理统计助手，擅长解答相关的数学问题，提供清晰的解释和计算步骤。请用中文回答问题。";

    // 计算器状态
    this.previousValue = 0;
    this.lastOperator = null;
    this.shouldResetDisplay = false;

    this.init();
  }

  init() {
    this.createToolboxHTML();
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
                <button class="bg-neon-blue hover:bg-neon-purple text-dark-bg font-bold p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 border-glow">
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
                        <button id="close-toolbox" class="text-gray-400 hover:text-white transition-colors">
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
                                        <button id="clear-chat" class="text-sm text-gray-400 hover:text-white transition-colors">
                                            <i class="fa fa-trash mr-1"></i>清空对话
                                        </button>
                                    </div>
                                    <div id="chat-messages" class="h-96 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
                                        <!-- 聊天消息将在这里显示 -->
                                    </div>
                                    <div class="flex space-x-2">
                                        <input type="text" id="chat-input" placeholder="请输入您的问题..." class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none">
                                        <button id="send-message" class="bg-neon-blue text-dark-bg px-4 py-2 rounded-lg hover:bg-neon-blue/80 transition-colors">
                                            <i class="fa fa-paper-plane"></i>
                                        </button>
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

    // 假设检验相关事件
    document.getElementById("run-test").addEventListener("click", () => {
      this.runHypothesisTest();
    });
    
    // 检验方法分类变化事件
    document.getElementById("test-category").addEventListener("change", () => {
      this.updateTestTypes();
    });
    
    // 数据输入方式切换事件
    document.getElementById("raw-data-btn").addEventListener("click", () => {
      this.switchDataInputMode('raw');
    });
    
    document.getElementById("summary-data-btn").addEventListener("click", () => {
      this.switchDataInputMode('summary');
    });
    
    // 显著性水平自定义选项事件
    document.getElementById("significance-level").addEventListener("change", (e) => {
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
    this.hideTool();
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

        // 如果是AI助手，加载聊天历史
        if (toolName === "ai-assistant") {
          this.displayChatHistory();
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
      // 强制重新渲染LaTeX和Markdown
      this.forceRerenderMath();
    } catch (error) {
      this.removeLoadingMessage();
      this.addMessageToChat("assistant", "抱歉，发生了错误，请稍后再试。");
      console.error("AI API调用失败:", error);
    }
  }

  async callDeepSeekAPI(message) {
    console.log('发送API请求:', message);
    
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

    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误详情:', errorText);
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API响应数据:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      console.error('API响应格式异常:', data);
      throw new Error('API响应格式异常');
    }
  }

  addMessageToChat(role, content, isLoading = false) {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role} ${isLoading ? "loading" : ""}`;

    const roleClass = role === "user" ? "text-neon-blue" : "text-neon-green";
    const roleName = role === "user" ? "您" : "AI助手";

    // 创建消息内容容器
    const contentContainer = document.createElement("div");
    contentContainer.className = "message-content text-gray-300 text-sm leading-relaxed max-w-none";
    
    // 如果是加载状态，添加思考动画
    if (isLoading) {
      contentContainer.innerHTML = `
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
      // 如果是AI助手的回复，渲染Markdown和LaTeX
      try {
        if (window.marked) {
          // marked 4.3.0版本使用marked()函数
          const htmlContent = marked(content);
          contentContainer.innerHTML = htmlContent;
        } else {
          contentContainer.innerHTML = content.replace(/\n/g, '<br>');
        }
      } catch (error) {
        console.error('Markdown渲染错误:', error);
        contentContainer.innerHTML = content.replace(/\n/g, '<br>');
      }
    } else {
      contentContainer.textContent = content;
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
    const messageContentDiv = messageDiv.querySelector('.message-content');
    messageContentDiv.appendChild(contentContainer);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 如果是AI助手的回复且不是加载状态，立即渲染LaTeX
    if (role !== "user" && !isLoading) {
      setTimeout(() => {
        this.renderMathInContainer(contentContainer);
      }, 100);
    }

    // 如果不是加载消息，保存到历史记录
    if (!isLoading) {
      this.chatHistory.push({ role, content });
      this.saveChatHistory();
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
    if (!container) return;
    
    // 渲染LaTeX公式 - 支持KaTeX和MathJax
    if (window.renderMathInElement) {
      // 使用KaTeX渲染
      try {
        renderMathInElement(container, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\[', right: '\\]', display: true},
            {left: '\\(', right: '\\)', display: false}
          ],
          throwOnError: false,
          strict: false
        });
      } catch (error) {
        console.warn('KaTeX单容器渲染错误:', error);
      }
    } else if (window.MathJax && window.MathJax.typesetPromise) {
      // 使用MathJax渲染
      window.MathJax.typesetPromise([container]).catch((err) => {
        console.warn('MathJax单容器渲染错误:', err);
      });
    } else if (window.MathJax && window.MathJax.Hub) {
      // 兼容旧版MathJax
      try {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, container]);
      } catch (error) {
        console.warn('MathJax Hub单容器渲染错误:', error);
      }
    }
  }

  // 强制重新渲染所有LaTeX和Markdown内容
  forceRerenderMath() {
    // 使用多次尝试确保渲染成功
    const attemptRender = (attempt = 0) => {
      const chatMessages = document.getElementById("chat-messages");
      if (!chatMessages) {
        if (attempt < 5) {
          setTimeout(() => attemptRender(attempt + 1), 100);
        }
        return;
      }
      
      // 获取所有消息内容容器
      const messageContents = chatMessages.querySelectorAll('.message-content');
      
      messageContents.forEach(container => {
        this.renderMathInContainer(container);
      });
      
      // 如果渲染库还未加载完成，进行重试
      if (!window.renderMathInElement && !window.MathJax && attempt < 10) {
        setTimeout(() => attemptRender(attempt + 1), 300);
      }
    };
    
    // 延迟执行确保DOM完全更新
    setTimeout(() => attemptRender(), 300);
  }

  displayChatHistory() {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";

    this.chatHistory.forEach((message) => {
      this.addMessageToChat(message.role, message.content);
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
    const singleSampleSummary = document.getElementById("single-sample-summary");
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
    
    if (mode === 'raw') {
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
    const significanceLevel = document.getElementById("significance-level").value;
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
    const isTwoSample = category === "two-sample" || category === "variance-test";
    
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
        type: 'raw',
        data: data,
        n: data.length,
        mean: data.reduce((a, b) => a + b, 0) / data.length,
        std: Math.sqrt(data.reduce((a, b) => a + Math.pow(b - (data.reduce((x, y) => x + y, 0) / data.length), 2), 0) / (data.length - 1))
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
        
        if (isNaN(mean1) || isNaN(std1) || isNaN(n1) || n1 <= 0 ||
            isNaN(mean2) || isNaN(std2) || isNaN(n2) || n2 <= 0) {
          this.showTestResult("请输入有效的两组样本统计量", "error");
          return;
        }
        
        testData = {
          type: 'summary',
          sample1: { mean: mean1, std: std1, n: n1 },
          sample2: { mean: mean2, std: std2, n: n2 }
        };
      } else {
        // 单样本数据
        const sampleMean = parseFloat(document.getElementById("sample-mean").value);
        const sampleStd = parseFloat(document.getElementById("sample-std").value);
        const sampleSize = parseInt(document.getElementById("sample-size").value);
        
        if (isNaN(sampleMean) || isNaN(sampleStd) || isNaN(sampleSize) || sampleSize <= 0) {
          this.showTestResult("请输入有效的汇总统计量", "error");
          return;
        }
        
        testData = {
          type: 'summary',
          n: sampleSize,
          mean: sampleMean,
          std: sampleStd
        };
      }
    }
    
    // 获取假设参数
    let hypothesisValue = 0;
    if (isTwoSample) {
      hypothesisValue = parseFloat(document.getElementById("hypothesis-diff").value) || 0;
    } else {
      hypothesisValue = parseFloat(document.getElementById("hypothesis-mean").value) || 0;
    }
    
    try {
      let result;
      switch (testType) {
        case "one-sample-z":
          result = this.performOneSampleZTest(testData, hypothesisValue, alpha, testDirection);
          break;
        case "one-sample-t":
          result = this.performOneSampleTTest(testData, hypothesisValue, alpha, testDirection);
          break;
        case "independent-t-equal":
          result = this.performIndependentTTestEqual(testData, hypothesisValue, alpha, testDirection);
          break;
        case "independent-t-unequal":
          result = this.performIndependentTTestUnequal(testData, hypothesisValue, alpha, testDirection);
          break;
        case "paired-t":
          result = this.performPairedTTest(testData, hypothesisValue, alpha, testDirection);
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
      case 'two-tailed':
        critical = this.getZCriticalValue(alpha / 2);
        pValue = 2 * (1 - this.normalCDF(Math.abs(z)));
        significant = Math.abs(z) > critical;
        break;
      case 'left-tailed':
        critical = -this.getZCriticalValue(alpha);
        pValue = this.normalCDF(z);
        significant = z < critical;
        break;
      case 'right-tailed':
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
      case 'two-tailed':
        critical = this.getTCriticalValue(df, alpha / 2);
        pValue = 2 * this.getTTestPValue(Math.abs(t), df);
        significant = Math.abs(t) > critical;
        break;
      case 'left-tailed':
        critical = -this.getTCriticalValue(df, alpha);
        pValue = this.getTTestPValue(-t, df);
        significant = t < critical;
        break;
      case 'right-tailed':
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
    
    if (testData.type === 'summary') {
      sample1 = testData.sample1;
      sample2 = testData.sample2;
    } else {
      // 原始数据模式暂不支持两样本
      return {
        testType: "独立样本t检验（等方差）",
        error: "原始数据模式暂不支持两样本检验，请使用汇总数据模式"
      };
    }
    
    const n1 = sample1.n;
    const n2 = sample2.n;
    const mean1 = sample1.mean;
    const mean2 = sample2.mean;
    const std1 = sample1.std;
    const std2 = sample2.std;
    
    // 计算合并标准差
    const pooledVariance = ((n1 - 1) * std1 * std1 + (n2 - 1) * std2 * std2) / (n1 + n2 - 2);
    const pooledStd = Math.sqrt(pooledVariance);
    const standardError = pooledStd * Math.sqrt(1/n1 + 1/n2);
    
    // 计算t统计量
    const tStatistic = (mean1 - mean2 - hypothesisDiff) / standardError;
    const df = n1 + n2 - 2;
    
    // 获取临界值和p值
    let criticalValue, pValue;
    if (testDirection === 'two-tailed') {
      criticalValue = this.getTCriticalValue(df, alpha / 2);
      pValue = 2 * (1 - this.getTCDF(Math.abs(tStatistic), df));
    } else if (testDirection === 'left-tailed') {
      criticalValue = -this.getTCriticalValue(df, alpha);
      pValue = this.getTCDF(tStatistic, df);
    } else { // right-tailed
      criticalValue = this.getTCriticalValue(df, alpha);
      pValue = 1 - this.getTCDF(tStatistic, df);
    }
    
    const reject = pValue < alpha;
    
    // 生成结论
    let conclusion;
    const directionText = testDirection === 'two-tailed' ? '不等于' : 
                         testDirection === 'left-tailed' ? '小于' : '大于';
    
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
      standardError: standardError.toFixed(4)
    };
  }

  performIndependentTTestUnequal(testData, hypothesisDiff, alpha, testDirection) {
    let sample1, sample2;
    
    if (testData.type === 'summary') {
      sample1 = testData.sample1;
      sample2 = testData.sample2;
    } else {
      // 原始数据模式暂不支持两样本
      return {
        testType: "独立样本t检验（不等方差）",
        error: "原始数据模式暂不支持两样本检验，请使用汇总数据模式"
      };
    }
    
    const n1 = sample1.n;
    const n2 = sample2.n;
    const mean1 = sample1.mean;
    const mean2 = sample2.mean;
    const std1 = sample1.std;
    const std2 = sample2.std;
    
    // 计算标准误差（Welch's t-test）
    const se1 = std1 * std1 / n1;
    const se2 = std2 * std2 / n2;
    const standardError = Math.sqrt(se1 + se2);
    
    // 计算t统计量
    const tStatistic = (mean1 - mean2 - hypothesisDiff) / standardError;
    
    // 计算Welch-Satterthwaite自由度
    const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2) / (n1 - 1) + Math.pow(se2, 2) / (n2 - 1));
    
    // 获取临界值和p值
    let criticalValue, pValue;
    if (testDirection === 'two-tailed') {
      criticalValue = this.getTCriticalValue(df, alpha / 2);
      pValue = 2 * (1 - this.getTCDF(Math.abs(tStatistic), df));
    } else if (testDirection === 'left-tailed') {
      criticalValue = -this.getTCriticalValue(df, alpha);
      pValue = this.getTCDF(tStatistic, df);
    } else { // right-tailed
      criticalValue = this.getTCriticalValue(df, alpha);
      pValue = 1 - this.getTCDF(tStatistic, df);
    }
    
    const reject = pValue < alpha;
    
    // 生成结论
    let conclusion;
    const directionText = testDirection === 'two-tailed' ? '不等于' : 
                         testDirection === 'left-tailed' ? '小于' : '大于';
    
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
      standardError: standardError.toFixed(4)
    };
  }

  performPairedTTest(testData, hypothesisDiff, alpha, testDirection) {
    let sample1, sample2;
    
    if (testData.type === 'summary') {
      sample1 = testData.sample1;
      sample2 = testData.sample2;
    } else {
      // 原始数据模式暂不支持两样本
      return {
        testType: "配对样本t检验",
        error: "原始数据模式暂不支持两样本检验，请使用汇总数据模式"
      };
    }
    
    // 配对t检验要求样本量相等
    if (sample1.n !== sample2.n) {
      return {
        testType: "配对样本t检验",
        error: "配对样本t检验要求两组样本量相等"
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
    if (testDirection === 'two-tailed') {
      criticalValue = this.getTCriticalValue(df, alpha / 2);
      pValue = 2 * (1 - this.getTCDF(Math.abs(tStatistic), df));
    } else if (testDirection === 'left-tailed') {
      criticalValue = -this.getTCriticalValue(df, alpha);
      pValue = this.getTCDF(tStatistic, df);
    } else { // right-tailed
      criticalValue = this.getTCriticalValue(df, alpha);
      pValue = 1 - this.getTCDF(tStatistic, df);
    }
    
    const reject = pValue < alpha;
    
    // 生成结论
    let conclusion;
    const directionText = testDirection === 'two-tailed' ? '不等于' : 
                         testDirection === 'left-tailed' ? '小于' : '大于';
    
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
      standardError: standardError.toFixed(4)
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
      conclusion: "功能开发中..."
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
      conclusion: "功能开发中..."
    };
  }

  performFTest(testData, alpha) {
    // 更新F检验以支持新的数据格式
    if (testData && testData.type === 'raw') {
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
        conclusion: "功能开发中..."
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
      'two-tailed': '双侧检验',
      'left-tailed': '左侧检验', 
      'right-tailed': '右侧检验'
    };

    resultDiv.innerHTML = `
            <div class="space-y-2 text-sm">
                <div><strong>检验类型:</strong> ${result.testType}</div>
                ${
                  result.testDirection
                    ? `<div><strong>检验方向:</strong> ${directionText[result.testDirection] || result.testDirection}</div>`
                    : ""
                }
                ${
                  result.hypothesisMean !== undefined
                    ? `<div><strong>假设均值:</strong> ${result.hypothesisMean}</div>`
                    : ""
                }
                ${
                  result.hypothesisValue !== undefined && result.hypothesisMean === undefined
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
                           <div>• 第一组: 均值=${result.sample1Stats.mean}, 标准差=${result.sample1Stats.std}, 样本量=${result.sample1Stats.n}</div>
                           <div>• 第二组: 均值=${result.sample2Stats.mean}, 标准差=${result.sample2Stats.std}, 样本量=${result.sample2Stats.n}</div>
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
}

// 初始化工具箱
document.addEventListener("DOMContentLoaded", () => {
  new ProbabilityToolbox();
});
