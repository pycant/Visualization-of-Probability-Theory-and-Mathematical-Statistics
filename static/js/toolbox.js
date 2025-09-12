/**
 * 通用工具箱组件
 * 包含AI智能助手、假设检验、分位数表等工具
 */

class ProbabilityToolbox {
    constructor() {
        this.isOpen = false;
        this.currentTool = null;
        this.chatHistory = this.loadChatHistory();
        this.apiKey = 'sk-fbc4de9c1fd949aea95d4cd1a5bf48e2';
        this.defaultPrompt = '你是一个专业的概率论与数理统计助手，擅长解答相关的数学问题，提供清晰的解释和计算步骤。请用中文回答问题。';
        
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
    }

    createToolboxHTML() {
        // 创建工具箱触发按钮
        const triggerButton = document.createElement('div');
        triggerButton.id = 'toolbox-trigger';
        triggerButton.innerHTML = `
            <div class="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
                <button class="bg-neon-blue hover:bg-neon-purple text-dark-bg font-bold p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 border-glow">
                    <i class="fa fa-toolbox text-xl"></i>
                </button>
            </div>
        `;
        document.body.appendChild(triggerButton);

        // 创建侧边栏
        const sidebar = document.createElement('div');
        sidebar.id = 'toolbox-sidebar';
        sidebar.innerHTML = `
            <div class="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-dark-card border-l border-gray-800 transform translate-x-full transition-transform duration-300 z-40 overflow-y-auto">
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
                                    <div id="chat-messages" class="h-64 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
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
                                    <div>
                                        <label class="block text-gray-300 mb-2">检验类型:</label>
                                        <select id="test-type" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none">
                                            <option value="t-test">t检验</option>
                                            <option value="z-test">z检验</option>
                                            <option value="chi-square">卡方检验</option>
                                            <option value="f-test">F检验</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-gray-300 mb-2">显著性水平 (α):</label>
                                        <select id="significance-level" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none">
                                            <option value="0.01">0.01</option>
                                            <option value="0.05" selected>0.05</option>
                                            <option value="0.10">0.10</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-gray-300 mb-2">样本数据 (用逗号分隔):</label>
                                        <textarea id="sample-data" placeholder="例如: 1.2, 1.5, 1.8, 2.1, 1.9" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none h-20 resize-none"></textarea>
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
        document.getElementById('toolbox-trigger').addEventListener('click', () => {
            this.toggleToolbox();
        });

        // 关闭按钮
        document.getElementById('close-toolbox').addEventListener('click', () => {
            this.closeToolbox();
        });

        // 绑定工具项点击事件（展开栏）
        const toolHeaders = document.querySelectorAll('.tool-header');
        toolHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const toolName = header.getAttribute('data-tool');
                this.toggleTool(toolName);
            });
        });
        
        // 绑定计算器按钮事件
        this.bindCalculatorEvents();

        // AI助手相关事件
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        document.getElementById('clear-chat').addEventListener('click', () => {
            this.clearChat();
        });

        // 假设检验相关事件
        document.getElementById('run-test').addEventListener('click', () => {
            this.runHypothesisTest();
        });

        // 分位数表相关事件
        document.getElementById('distribution-type').addEventListener('change', () => {
            this.updateDistributionParams();
        });

        document.getElementById('calculate-quantile').addEventListener('click', () => {
            this.calculateQuantile();
        });

        // 点击侧边栏外部关闭
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('toolbox-sidebar');
            const trigger = document.getElementById('toolbox-trigger');
            if (this.isOpen && !sidebar.contains(e.target) && !trigger.contains(e.target)) {
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
        const sidebar = document.getElementById('toolbox-sidebar');
        const sidebarContent = sidebar.querySelector('div');
        const body = document.body;
        
        sidebarContent.classList.remove('translate-x-full');
        body.style.marginRight = '384px'; // 24rem = 384px
        body.style.transition = 'margin-right 0.3s ease-in-out';
        this.isOpen = true;
    }

    closeToolbox() {
        const sidebar = document.getElementById('toolbox-sidebar');
        const sidebarContent = sidebar.querySelector('div');
        const body = document.body;
        
        sidebarContent.classList.add('translate-x-full');
        body.style.marginRight = '0';
        this.isOpen = false;
        this.hideTool();
    }

    toggleTool(toolName) {
        const content = document.getElementById(`${toolName}-content`);
        const chevron = document.getElementById(`${toolName}-chevron`);
        
        if (content && chevron) {
            const isHidden = content.classList.contains('hidden');
            
            if (isHidden) {
                // 展开
                content.classList.remove('hidden');
                chevron.style.transform = 'rotate(180deg)';
                
                // 如果是AI助手，加载聊天历史
                if (toolName === 'ai-assistant') {
                    this.displayChatHistory();
                }
            } else {
                // 收起
                content.classList.add('hidden');
                chevron.style.transform = 'rotate(0deg)';
            }
        }
    }



    // 计算器功能
    bindCalculatorEvents() {
        // 等待DOM加载完成后绑定事件
        setTimeout(() => {
            const calcButtons = document.querySelectorAll('.calc-btn');
            calcButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this.handleCalculatorInput(e.target);
                });
            });
        }, 100);
    }
    
    handleCalculatorInput(button) {
        const action = button.getAttribute('data-action');
        const value = button.getAttribute('data-value');
        const display = document.getElementById('calc-display');
        const history = document.getElementById('calc-history');
        
        if (!display) return;
        
        switch (action) {
            case 'number':
                this.inputNumber(display, value);
                break;
            case 'operator':
                this.inputOperator(display, history, value);
                break;
            case 'decimal':
                this.inputDecimal(display);
                break;
            case 'equals':
                this.calculate(display, history);
                break;
            case 'clear':
                this.clearCalculator(display, history);
                break;
            case 'backspace':
                this.backspace(display);
                break;
            case 'function':
                this.applyFunction(display, value);
                break;
            case 'constant':
                this.inputConstant(display, value);
                break;
            case 'stat':
                this.calculateStatistic(value);
                break;
        }
    }
    
    inputNumber(display, number) {
        if (display.value === '0' || this.shouldResetDisplay) {
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
        
        history.textContent = `${this.previousValue} ${this.getOperatorSymbol(operator)}`;
    }
    
    inputDecimal(display) {
        if (this.shouldResetDisplay) {
            display.value = '0.';
            this.shouldResetDisplay = false;
        } else if (display.value.indexOf('.') === -1) {
            display.value += '.';
        }
    }
    
    calculate(display, history) {
        if (!this.lastOperator || this.shouldResetDisplay) return;
        
        const currentValue = parseFloat(display.value);
        let result;
        
        try {
            switch (this.lastOperator) {
                case '+':
                    result = this.previousValue + currentValue;
                    break;
                case '-':
                    result = this.previousValue - currentValue;
                    break;
                case '*':
                    result = this.previousValue * currentValue;
                    break;
                case '/':
                    if (currentValue === 0) {
                        throw new Error('除零错误');
                    }
                    result = this.previousValue / currentValue;
                    break;
                case '%':
                    result = this.previousValue % currentValue;
                    break;
                case '^':
                    result = Math.pow(this.previousValue, currentValue);
                    break;
                default:
                    return;
            }
            
            display.value = this.formatResult(result);
            history.textContent = `${this.previousValue} ${this.getOperatorSymbol(this.lastOperator)} ${currentValue} =`;
            
        } catch (error) {
            display.value = 'Error';
            history.textContent = error.message;
        }
        
        this.lastOperator = null;
        this.shouldResetDisplay = true;
    }
    
    clearCalculator(display, history) {
        display.value = '0';
        history.textContent = '';
        this.previousValue = 0;
        this.lastOperator = null;
        this.shouldResetDisplay = false;
    }
    
    backspace(display) {
        if (display.value.length > 1) {
            display.value = display.value.slice(0, -1);
        } else {
            display.value = '0';
        }
    }
    
    applyFunction(display, func) {
        const value = parseFloat(display.value);
        let result;
        
        try {
            switch (func) {
                case 'sin':
                    result = Math.sin(value * Math.PI / 180); // 转换为弧度
                    break;
                case 'cos':
                    result = Math.cos(value * Math.PI / 180);
                    break;
                case 'tan':
                    result = Math.tan(value * Math.PI / 180);
                    break;
                case 'log':
                    if (value <= 0) throw new Error('对数函数输入必须大于0');
                    result = Math.log10(value);
                    break;
                case 'ln':
                    if (value <= 0) throw new Error('自然对数输入必须大于0');
                    result = Math.log(value);
                    break;
                case 'sqrt':
                    if (value < 0) throw new Error('平方根输入不能为负数');
                    result = Math.sqrt(value);
                    break;
                default:
                    return;
            }
            
            display.value = this.formatResult(result);
            this.shouldResetDisplay = true;
            
        } catch (error) {
            display.value = 'Error';
            document.getElementById('calc-history').textContent = error.message;
        }
    }
    
    inputConstant(display, constant) {
        display.value = constant;
        this.shouldResetDisplay = true;
    }
    
    calculateStatistic(statType) {
        const dataInput = document.getElementById('stat-data');
        const display = document.getElementById('calc-display');
        const history = document.getElementById('calc-history');
        
        if (!dataInput || !display) return;
        
        const dataStr = dataInput.value.trim();
        if (!dataStr) {
            history.textContent = '请输入数据';
            return;
        }
        
        try {
            const data = dataStr.split(',').map(x => {
                const num = parseFloat(x.trim());
                if (isNaN(num)) throw new Error(`无效数字: ${x.trim()}`);
                return num;
            });
            
            let result;
            
            switch (statType) {
                case 'mean':
                    result = data.reduce((a, b) => a + b, 0) / data.length;
                    break;
                case 'median':
                    const sorted = [...data].sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    result = sorted.length % 2 === 0 
                        ? (sorted[mid - 1] + sorted[mid]) / 2 
                        : sorted[mid];
                    break;
                case 'std':
                    const mean = data.reduce((a, b) => a + b, 0) / data.length;
                    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
                    result = Math.sqrt(variance);
                    break;
                case 'var':
                    const meanVar = data.reduce((a, b) => a + b, 0) / data.length;
                    result = data.reduce((a, b) => a + Math.pow(b - meanVar, 2), 0) / data.length;
                    break;
                case 'sum':
                    result = data.reduce((a, b) => a + b, 0);
                    break;
                case 'count':
                    result = data.length;
                    break;
                default:
                    return;
            }
            
            display.value = this.formatResult(result);
            history.textContent = `${this.getStatName(statType)}: ${data.length}个数据`;
            this.shouldResetDisplay = true;
            
        } catch (error) {
            display.value = 'Error';
            history.textContent = error.message;
        }
    }
    
    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            '%': '%',
            '^': '^'
        };
        return symbols[operator] || operator;
    }
    
    getStatName(statType) {
        const names = {
            'mean': '平均值',
            'median': '中位数',
            'std': '标准差',
            'var': '方差',
            'sum': '求和',
            'count': '计数'
        };
        return names[statType] || statType;
    }
    
    formatResult(result) {
        if (isNaN(result) || !isFinite(result)) {
            return 'Error';
        }
        
        // 保留合适的小数位数
        if (Math.abs(result) < 1e-10) {
            return '0';
        }
        
        if (Number.isInteger(result)) {
            return result.toString();
        }
        
        return parseFloat(result.toFixed(10)).toString();
    }

    // AI助手功能
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        // 添加用户消息到聊天历史
        this.addMessageToChat('user', message);
        input.value = '';

        // 显示加载状态
        this.addMessageToChat('assistant', '正在思考中...', true);

        try {
            const response = await this.callDeepSeekAPI(message);
            // 移除加载消息
            this.removeLoadingMessage();
            // 添加AI回复
            this.addMessageToChat('assistant', response);
        } catch (error) {
            this.removeLoadingMessage();
            this.addMessageToChat('assistant', '抱歉，发生了错误，请稍后再试。');
            console.error('AI API调用失败:', error);
        }
    }

    async callDeepSeekAPI(message) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: this.defaultPrompt },
                    ...this.chatHistory.slice(-10), // 只保留最近10条消息作为上下文
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    addMessageToChat(role, content, isLoading = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role} ${isLoading ? 'loading' : ''}`;
        
        const roleClass = role === 'user' ? 'text-neon-blue' : 'text-neon-green';
        const roleName = role === 'user' ? '您' : 'AI助手';
        
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 mb-3">
                <div class="w-8 h-8 rounded-full bg-${role === 'user' ? 'neon-blue' : 'neon-green'}/10 flex items-center justify-center flex-shrink-0">
                    <i class="fa fa-${role === 'user' ? 'user' : 'robot'} ${roleClass} text-sm"></i>
                </div>
                <div class="flex-1">
                    <div class="${roleClass} text-sm font-semibold mb-1">${roleName}</div>
                    <div class="text-gray-300 text-sm leading-relaxed">${content}</div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 如果不是加载消息，保存到历史记录
        if (!isLoading) {
            this.chatHistory.push({ role, content });
            this.saveChatHistory();
        }
    }

    removeLoadingMessage() {
        const loadingMessage = document.querySelector('.message.loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    displayChatHistory() {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        
        this.chatHistory.forEach(message => {
            this.addMessageToChat(message.role, message.content);
        });
    }

    clearChat() {
        this.chatHistory = [];
        this.saveChatHistory();
        document.getElementById('chat-messages').innerHTML = '';
    }

    loadChatHistory() {
        const saved = localStorage.getItem('probability-toolbox-chat');
        return saved ? JSON.parse(saved) : [];
    }

    saveChatHistory() {
        localStorage.setItem('probability-toolbox-chat', JSON.stringify(this.chatHistory));
    }

    // 假设检验功能
    runHypothesisTest() {
        const testType = document.getElementById('test-type').value;
        const alpha = parseFloat(document.getElementById('significance-level').value);
        const dataText = document.getElementById('sample-data').value;
        
        if (!dataText.trim()) {
            this.showTestResult('请输入样本数据', 'error');
            return;
        }

        try {
            const data = dataText.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
            if (data.length === 0) {
                this.showTestResult('请输入有效的数值数据', 'error');
                return;
            }

            let result;
            switch (testType) {
                case 't-test':
                    result = this.performTTest(data, alpha);
                    break;
                case 'z-test':
                    result = this.performZTest(data, alpha);
                    break;
                case 'chi-square':
                    result = this.performChiSquareTest(data, alpha);
                    break;
                case 'f-test':
                    result = this.performFTest(data, alpha);
                    break;
                default:
                    result = { error: '不支持的检验类型' };
            }

            this.showTestResult(result);
        } catch (error) {
            this.showTestResult('计算过程中发生错误', 'error');
            console.error('假设检验错误:', error);
        }
    }

    performTTest(data, alpha) {
        const n = data.length;
        const mean = data.reduce((a, b) => a + b, 0) / n;
        const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
        const std = Math.sqrt(variance);
        const se = std / Math.sqrt(n);
        const t = mean / se; // 假设检验均值为0
        const df = n - 1;
        
        // 简化的临界值计算（实际应用中应使用更精确的t分布表）
        const criticalValue = this.getTCriticalValue(df, alpha);
        const pValue = this.getTTestPValue(Math.abs(t), df);
        
        return {
            testType: 't检验',
            statistic: t.toFixed(4),
            criticalValue: criticalValue.toFixed(4),
            pValue: pValue.toFixed(4),
            alpha: alpha,
            reject: Math.abs(t) > criticalValue,
            sampleSize: n,
            sampleMean: mean.toFixed(4),
            sampleStd: std.toFixed(4)
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
            testType: 'z检验',
            statistic: z.toFixed(4),
            criticalValue: criticalValue.toFixed(4),
            pValue: pValue.toFixed(4),
            alpha: alpha,
            reject: Math.abs(z) > criticalValue,
            sampleSize: n,
            sampleMean: mean.toFixed(4),
            sampleStd: std.toFixed(4)
        };
    }

    performChiSquareTest(data, alpha) {
        // 简化的卡方拟合优度检验
        const n = data.length;
        const mean = data.reduce((a, b) => a + b, 0) / n;
        const expected = mean; // 假设期望值等于样本均值
        
        const chiSquare = data.reduce((sum, x) => sum + Math.pow(x - expected, 2) / expected, 0);
        const df = n - 1;
        const criticalValue = this.getChiSquareCriticalValue(df, alpha);
        
        return {
            testType: '卡方检验',
            statistic: chiSquare.toFixed(4),
            criticalValue: criticalValue.toFixed(4),
            alpha: alpha,
            reject: chiSquare > criticalValue,
            degreesOfFreedom: df,
            sampleSize: n
        };
    }

    performFTest(data, alpha) {
        // 简化的F检验（需要两组数据，这里假设与理论方差比较）
        const n = data.length;
        const variance = data.reduce((a, b) => a + Math.pow(b - data.reduce((x, y) => x + y, 0) / n, 2), 0) / (n - 1);
        const theoreticalVariance = 1; // 假设理论方差为1
        const f = variance / theoreticalVariance;
        const df1 = n - 1;
        const df2 = n - 1;
        
        return {
            testType: 'F检验',
            statistic: f.toFixed(4),
            alpha: alpha,
            degreesOfFreedom1: df1,
            degreesOfFreedom2: df2,
            sampleVariance: variance.toFixed(4)
        };
    }

    showTestResult(result, type = 'success') {
        const resultDiv = document.getElementById('test-result');
        resultDiv.classList.remove('hidden');
        
        if (type === 'error') {
            resultDiv.innerHTML = `<div class="text-red-400">${result}</div>`;
            return;
        }

        const rejectText = result.reject ? 
            '<span class="text-red-400">拒绝原假设</span>' : 
            '<span class="text-green-400">不拒绝原假设</span>';

        resultDiv.innerHTML = `
            <div class="space-y-2 text-sm">
                <div><strong>检验类型:</strong> ${result.testType}</div>
                <div><strong>检验统计量:</strong> ${result.statistic}</div>
                ${result.criticalValue ? `<div><strong>临界值:</strong> ${result.criticalValue}</div>` : ''}
                ${result.pValue ? `<div><strong>p值:</strong> ${result.pValue}</div>` : ''}
                <div><strong>显著性水平:</strong> ${result.alpha}</div>
                <div><strong>结论:</strong> ${rejectText}</div>
                ${result.sampleSize ? `<div><strong>样本大小:</strong> ${result.sampleSize}</div>` : ''}
                ${result.sampleMean ? `<div><strong>样本均值:</strong> ${result.sampleMean}</div>` : ''}
                ${result.sampleStd ? `<div><strong>样本标准差:</strong> ${result.sampleStd}</div>` : ''}
            </div>
        `;
    }

    // 分位数表功能
    initDistributionTables() {
        this.updateDistributionParams();
    }

    updateDistributionParams() {
        const distributionType = document.getElementById('distribution-type').value;
        const paramsDiv = document.getElementById('distribution-params');
        
        let paramsHTML = '';
        switch (distributionType) {
            case 'normal':
                paramsHTML = ''; // 标准正态分布无需额外参数
                break;
            case 't':
                paramsHTML = `
                    <div>
                        <label class="block text-gray-300 mb-1">自由度:</label>
                        <input type="number" id="df-param" value="10" min="1" class="w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none">
                    </div>
                `;
                break;
            case 'chi-square':
                paramsHTML = `
                    <div>
                        <label class="block text-gray-300 mb-1">自由度:</label>
                        <input type="number" id="df-param" value="10" min="1" class="w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none">
                    </div>
                `;
                break;
            case 'f':
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
        const distributionType = document.getElementById('distribution-type').value;
        const probability = parseFloat(document.getElementById('probability-input').value);
        
        if (isNaN(probability) || probability < 0 || probability > 1) {
            this.showQuantileResult('请输入有效的概率值 (0-1)', 'error');
            return;
        }

        let result;
        try {
            switch (distributionType) {
                case 'normal':
                    result = this.normalInverseCDF(probability);
                    break;
                case 't':
                    const df = parseInt(document.getElementById('df-param').value);
                    result = this.tInverseCDF(probability, df);
                    break;
                case 'chi-square':
                    const dfChi = parseInt(document.getElementById('df-param').value);
                    result = this.chiSquareInverseCDF(probability, dfChi);
                    break;
                case 'f':
                    const df1 = parseInt(document.getElementById('df1-param').value);
                    const df2 = parseInt(document.getElementById('df2-param').value);
                    result = this.fInverseCDF(probability, df1, df2);
                    break;
                default:
                    throw new Error('不支持的分布类型');
            }
            
            this.showQuantileResult({
                distribution: this.getDistributionName(distributionType),
                probability: probability,
                quantile: result.toFixed(6)
            });
        } catch (error) {
            this.showQuantileResult('计算过程中发生错误', 'error');
            console.error('分位数计算错误:', error);
        }
    }

    showQuantileResult(result, type = 'success') {
        const resultDiv = document.getElementById('quantile-result');
        resultDiv.classList.remove('hidden');
        
        if (type === 'error') {
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
            'normal': '标准正态分布',
            't': 't分布',
            'chi-square': '卡方分布',
            'f': 'F分布'
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
        if (p <= 0 || p >= 1) throw new Error('概率值必须在(0,1)区间内');
        
        // 使用Beasley-Springer-Moro算法的简化版本
        const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
        const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
        const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
        const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
        
        let x;
        if (p < 0.02425) {
            const q = Math.sqrt(-2 * Math.log(p));
            x = (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
        } else if (p <= 0.97575) {
            const q = p - 0.5;
            const r = q * q;
            x = (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q / (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
        } else {
            const q = Math.sqrt(-2 * Math.log(1 - p));
            x = -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
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
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }

    tInverseCDF(p, df) {
        // t分布分位数的近似（基于正态分布的修正）
        const z = this.normalInverseCDF(p);
        if (df >= 30) return z; // 大样本时近似为正态分布
        
        // 简化的t分布修正
        const correction = z * z * z / (4 * df) + z * (5 * z * z * z + 16 * z) / (96 * df * df);
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
        return (chi1 / df1) / (chi2 / df2);
    }

    getTCriticalValue(df, alpha) {
        // t分布临界值的简化查表
        const criticalValues = {
            0.01: { 1: 63.657, 2: 9.925, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.750 },
            0.05: { 1: 12.706, 2: 4.303, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042 },
            0.10: { 1: 6.314, 2: 2.920, 5: 2.015, 10: 1.812, 20: 1.725, 30: 1.697 }
        };
        
        const table = criticalValues[alpha];
        if (!table) return 2.0; // 默认值
        
        // 找到最接近的自由度
        const dfs = Object.keys(table).map(Number).sort((a, b) => a - b);
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
            0.05: 1.960,
            0.10: 1.645
        };
        return criticalValues[alpha] || 1.960;
    }

    getChiSquareCriticalValue(df, alpha) {
        // 卡方分布临界值的简化查表
        const criticalValues = {
            0.01: { 1: 6.635, 2: 9.210, 5: 15.086, 10: 23.209, 20: 37.566, 30: 50.892 },
            0.05: { 1: 3.841, 2: 5.991, 5: 11.070, 10: 18.307, 20: 31.410, 30: 43.773 },
            0.10: { 1: 2.706, 2: 4.605, 5: 9.236, 10: 15.987, 20: 28.412, 30: 40.256 }
        };
        
        const table = criticalValues[alpha];
        if (!table) return 10.0; // 默认值
        
        // 找到最接近的自由度
        const dfs = Object.keys(table).map(Number).sort((a, b) => a - b);
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
document.addEventListener('DOMContentLoaded', () => {
    new ProbabilityToolbox();
});