/**
 * URL点击参数处理工具
 * 支持通过URL参数自动触发页面元素的点击事件
 * 
 * 使用方法:
 * 1. 在HTML页面中引入此脚本
 * 2. URL格式: http://example.com/page.html?click=#btn-id 或 ?click=.btn-class
 * 3. 支持多个点击: ?click=#btn1,#btn2,.class1
 */

class URLClickHandler {
    constructor() {
        this.init();
    }

    /**
     * 初始化URL点击处理器
     */
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.processURLClicks());
        } else {
            this.processURLClicks();
        }
    }

    /**
     * 解析URL参数
     * @returns {Object} URL参数对象
     */
    getURLParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    /**
     * 处理URL中的点击参数
     */
    processURLClicks() {
        const params = this.getURLParams();
        const clickParam = params.click;

        if (!clickParam) {
            return;
        }

        console.log('检测到点击参数:', clickParam);

        // 支持多个选择器，用逗号分隔
        const selectors = clickParam.split(',').map(s => s.trim());

        // 延迟执行，确保页面完全加载
        setTimeout(() => {
            selectors.forEach(selector => {
                this.triggerClick(selector);
            });
        }, 100);
    }

    /**
     * 触发指定选择器的点击事件
     * @param {string} selector - CSS选择器
     */
    triggerClick(selector) {
        try {
            // 处理不同类型的选择器
            let elements;

            if (selector.startsWith('#')) {
                // ID选择器
                const element = document.getElementById(selector.substring(1));
                elements = element ? [element] : [];
            } else if (selector.startsWith('.')) {
                // 类选择器
                elements = Array.from(document.querySelectorAll(selector));
            } else {
                // 其他选择器
                elements = Array.from(document.querySelectorAll(selector));
            }

            if (elements.length === 0) {
                console.warn(`未找到元素: ${selector}`);
                return;
            }

            elements.forEach(element => {
                this.clickElement(element, selector);
            });

        } catch (error) {
            console.error(`处理选择器 ${selector} 时出错:`, error);
        }
    }

    /**
     * 点击指定元素
     * @param {HTMLElement} element - 要点击的元素
     * @param {string} selector - 选择器字符串（用于日志）
     */
    clickElement(element, selector) {
        try {
            // 检查元素是否可见和可点击
            if (!this.isElementClickable(element)) {
                console.warn(`元素不可点击: ${selector}`, element);
                return;
            }

            console.log(`触发点击: ${selector}`, element);

            // 滚动到元素位置
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });

            // 延迟点击，确保滚动完成
            setTimeout(() => {
                // 尝试多种点击方式
                if (element.onclick) {
                    // 如果有onclick事件处理器
                    element.onclick();
                } else if (element.click) {
                    // 标准点击方法
                    element.click();
                } else {
                    // 手动触发点击事件
                    const event = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    element.dispatchEvent(event);
                }

                // 添加视觉反馈
                this.addClickFeedback(element);

            }, 300);

        } catch (error) {
            console.error(`点击元素时出错:`, error);
        }
    }

    /**
     * 检查元素是否可点击
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否可点击
     */
    isElementClickable(element) {
        if (!element) return false;

        const style = window.getComputedStyle(element);
        
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !element.disabled &&
               element.offsetParent !== null;
    }

    /**
     * 添加点击视觉反馈
     * @param {HTMLElement} element - 被点击的元素
     */
  addClickFeedback(element) {
        // 添加更科幻的临时高亮与脉冲效果
        const originalStyle = element.style.cssText;
        element.style.transition = 'all 0.35s ease';
        element.style.boxShadow = '0 0 0 2px rgba(167,139,250,0.7), 0 0 16px rgba(0, 232, 255, 0.6), 0 0 28px rgba(167,139,250,0.4)';
        element.style.transform = 'scale(1.06)';
        element.style.filter = 'drop-shadow(0 0 6px rgba(165,243,252,0.6))';

        // 轻微呼吸脉冲
        let up = true;
        const start = Date.now();
        const duration = 900;
        const pulse = () => {
            const t = Date.now() - start;
            if (t > duration) return;
            element.style.transform = up ? 'scale(1.065)' : 'scale(1.055)';
            up = !up;
            setTimeout(pulse, 110);
        };
        pulse();

        setTimeout(() => {
            element.style.cssText = originalStyle;
        }, 1100);
  }

    /**
     * 手动触发点击（供外部调用）
     * @param {string} selector - CSS选择器
     */
    static triggerClick(selector) {
        const handler = new URLClickHandler();
        handler.triggerClick(selector);
    }

    /**
     * 更新URL参数而不刷新页面
     * @param {string} clickParam - 点击参数值
     */
    static updateURLClick(clickParam) {
        const url = new URL(window.location);
        if (clickParam) {
            url.searchParams.set('click', clickParam);
        } else {
            url.searchParams.delete('click');
        }
        window.history.replaceState({}, '', url);
    }
}

// 自动初始化
const urlClickHandler = new URLClickHandler();

// 导出到全局作用域
window.URLClickHandler = URLClickHandler;

// 兼容性函数
window.triggerURLClick = (selector) => URLClickHandler.triggerClick(selector);
window.updateURLClick = (clickParam) => URLClickHandler.updateURLClick(clickParam);