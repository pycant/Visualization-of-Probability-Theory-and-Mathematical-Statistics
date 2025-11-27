## 目标
- 在 `chapter3.html`、`chapter5.html`、`chapter8.html` 接入统一导航栏与页脚，样式与交互对齐 `random_variables.html`。
- 依据 `index.html` 中对应章节卡片的描述，丰富每页内容结构与锚点，便于导航下拉的“页面内跳转”使用。

## 关键改动
- 移除每页现有的简易 Header/Footer，改为统一 partial 注入：
  - 在 `<body>` 开头自动插入 `templates/partials/navbar.html`（通过 `../static/js/include-navbar.js`）。
  - 在 `<body>` 末尾注入 `templates/partials/footer.html`（通过 `../static/js/include-footer.js`）。
- 统一资源与样式：
  - 在 `<head>` 引入本地 `font-awesome.min.css`：`../static/libs/fontawesome/font-awesome.min.css`（与 `random_variables.html` 一致）。
  - 保留 Tailwind CDN；延续深色主题、霓虹配色与卡片风格（`bg-dark-bg`、`bg-dark-card`、`text-neon-*`）。
- 为每页定义 `window.NAV_CONFIG.sectionLinks`，在导航右侧生成“页面内跳转”下拉；锚点按章节内容布局设置。

## 页面结构与内容
### Chapter 3（多维随机变量及其分布）
- 头部区域：章节图标、标题、副标题，配色以 `neon-purple` 为主，保持 `index.html` 风格。
- 分区与锚点：
  - `#overview`：概述（联合分布、边缘/条件分布、协方差/相关）。
  - `#key-topics`：要点清单（含“正态向量与线性变换”）。
  - `#learn-tips`：学习建议（结合热图与PCA，理解相关性）。
  - `#resources`：后续学习资源占位。
- `NAV_CONFIG.sectionLinks`：`[{label:'概述',href:'#overview'}, {label:'核心要点',href:'#key-topics'}, {label:'学习建议',href:'#learn-tips'}, {label:'资源',href:'#resources'}]`。

### Chapter 5（统计量及其分布）
- 头部区域：章节图标、标题、副标题，配色以 `neon-orange` 为主。
- 分区与锚点：
  - `#overview`：概述（样本均值/方差与抽样分布作用）。
  - `#key-topics`：要点清单（t、卡方、F 分布；推导与应用）。
  - `#videos`：相关视频展示（使用现有 `../static/videos/t分布.mp4`、`卡方分布.mp4`、`F分布.mp4`）。
  - `#learn-tips`：学习建议（与区间估计/假设检验联动）。
- `NAV_CONFIG.sectionLinks`：`[{label:'概述',href:'#overview'}, {label:'核心要点',href:'#key-topics'}, {label:'分布视频',href:'#videos'}, {label:'学习建议',href:'#learn-tips'}]`。

### Chapter 8（方差分析与回归分析）
- 头部区域：章节图标、标题、副标题，配色以 `neon-green` 为主。
- 分区与锚点：
  - `#overview`：概述（单/双因素 ANOVA 与回归）。
  - `#anova`：ANOVA 模型要点与 F 检验说明。
  - `#regression`：回归模型与估计（简单/多元线性回归）。
  - `#diagnostics`：模型诊断与可视化建议。
- `NAV_CONFIG.sectionLinks`：`[{label:'概述',href:'#overview'}, {label:'ANOVA',href:'#anova'}, {label:'回归',href:'#regression'}, {label:'诊断',href:'#diagnostics'}]`。

## 页面实现细节
- 在三页 `<head>`：
  - 替换 FontAwesome CDN 为 `../static/libs/fontawesome/font-awesome.min.css`；保留 `https://cdn.tailwindcss.com`。
- 在三页 `<body>`：
  - 删除原 `<header>` 区块（包含“返回主页”链接）；保留主体 wrapper：`<div class="min-h-screen bg-gradient-to-b from-dark-bg to-dark-card/50">`。
  - 删除原 `<footer>`；在最末尾添加 `<script src="../static/js/include-footer.js" defer></script>`。
  - 在末尾添加 `<script>` 定义 `window.NAV_CONFIG`（含 `sectionLinks`），再引入 `<script src="../static/js/include-navbar.js"></script>`。
- 主体内容使用 `bg-dark-card` 容器、网格与图标卡片增强，文案依据 `index.html` 中对应章节卡片说明整理，保留现有中文措辞风格。

## 兼容与交互
- 导航注入脚本会在无 `<nav>` 时自动插入；有 `<nav>` 时替换；下拉目录通过 `include-navbar.js` 的委托与固定定位保证不被裁剪。
- 页脚注入脚本若无 `footer.bg-dark-card` 会自动追加到页面底部，避免重复；我们将移除旧 `<footer>`，确保只保留统一页脚。

## 验证
- 本地打开三页，检查：
  - 导航显示、下拉目录展开与“页面内跳转”生效。
  - 旧 Header/Footer 已移除且未出现重复页脚。
  - 章节配色与卡片样式与 `index.html`/`random_variables.html` 一致。
  - 视频块能正常加载并播放（第5章）。

确认后我将按以上方案在三个文件中实施具体修改并回传差异。