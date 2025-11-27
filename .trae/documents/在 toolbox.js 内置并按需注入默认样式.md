## 目标
- 将 `random_variables.html` 中与工具箱相关的样式（霓虹色、深色卡片、字体等）内置进 `static/js/toolbox.js`，避免各页面重复定义。
- 严格遵循“有则不改、无则补齐”原则：页面已定义样式则保持不变；缺失时由 `toolbox.js` 注入默认样式。

## 核心思路
- 在 `toolbox.js` 顶部新增 `ensureToolboxStyles()` 并在脚本初始化时调用。
- 分两类检测与注入：
  - CSS变量：检测 `:root` 的 `--dark-bg`、`--dark-card`、`--neon-blue`、`--neon-purple`、`--neon-green`；若未定义（值为空），注入默认变量值。
  - 选择器规则：遍历可访问的 `document.styleSheets`，构建已存在选择器集合；若页面未定义以下选择器则注入默认规则：
    - `.font-future`
    - `.text-neon-blue`、`.text-neon-purple`、`.text-neon-green`
    - `.bg-neon-blue`、`.bg-neon-purple`、`.bg-neon-green`
    - `.bg-dark-bg`、`.bg-dark-card`
    - `.accent-neon-blue`、`.accent-neon-purple`、`.accent-neon-green`
    - `.border-glow`
- 样式注入以 `<style id="toolbox-default-styles">` 汇总，确保不重复注入。
- 对跨域样式表（如 Tailwind CDN）读取规则时使用 try/catch 跳过，避免安全错误。

## 默认样式（与现有页面一致）
- 变量默认值：
  - `--dark-bg: #0f172a`
  - `--dark-card: #1e293b`
  - `--neon-blue: #00f3ff`
  - `--neon-purple: #bf00ff`
  - `--neon-green: #00ff66`
- 规则示例：
  - `.font-future { font-family: "Roboto", sans-serif; letter-spacing: 0.05em; }`
  - `.text-neon-blue { color: var(--neon-blue); }`（紫/绿同理）
  - `.bg-neon-blue { background-color: var(--neon-blue); }`（紫/绿同理）
  - `.bg-dark-bg { background-color: var(--dark-bg); }`
  - `.bg-dark-card { background-color: var(--dark-card); }`
  - `.accent-neon-blue { accent-color: var(--neon-blue); }`（紫/绿同理）
  - `.border-glow { box-shadow: 0 0 10px rgba(0,243,255,0.3); }`

## 代码轮廓
- 新增：
```
function ensureToolboxStyles() {
  const root = document.documentElement;
  const getVar = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const missingVars = [
    ['--dark-bg', '#0f172a'],
    ['--dark-card', '#1e293b'],
    ['--neon-blue', '#00f3ff'],
    ['--neon-purple', '#bf00ff'],
    ['--neon-green', '#00ff66'],
  ].filter(([n]) => !getVar(n));
  const styleId = 'toolbox-default-styles';
  if (missingVars.length || !hasSelectors([...])) {
    const style = document.getElementById(styleId) || Object.assign(document.createElement('style'), { id: styleId });
    const rules = [];
    if (missingVars.length) rules.push(`:root{${missingVars.map(([n,v])=>`${n}:${v}`).join(';')}}`);
    const need = needSelectors(); // 计算缺失的选择器
    rules.push(buildDefaultsFor(need));
    style.textContent += rules.join('\n');
    document.head.appendChild(style);
  }
}
```
- 辅助：
  - `hasSelectors(selectors)`：遍历可访问样式表，判断是否存在对应规则。
  - `needSelectors()`：返回缺失的选择器列表。
  - `buildDefaultsFor(list)`：拼接对应 CSS 文本。
- 调用：在工具箱UI渲染前先执行 `ensureToolboxStyles()`。

## 兼容性与安全
- 不覆盖已定义样式：仅在缺失时注入；避免强制 `!important`。
- 注入一次：使用固定 `style id` 防重复。
- 与 Tailwind 共存：默认规则仅为补齐；不依赖 Tailwind 的 `theme()`，用固定色值。

## 验证
- 随机抽取页面：
  - 已有样式页（如 `random_variables.html`）：注入应为空或极少；外观不变。
  - 缺失样式页（如部分 `chapterX.html`）：工具箱按钮与侧栏颜色、卡片背景、霓虹文本正确显示。
- 控制台无安全错误（跨域样式跳过）。

## 交付
- 修改 `static/js/toolbox.js`（仅新增样式保障逻辑），不改动任意页面 HTML。
- 提供差异说明与验证结果。