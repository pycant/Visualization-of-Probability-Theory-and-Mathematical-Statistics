## 目标概述
- 用二维柏林噪声生成随时间变化的标量场，在 `contour-canvas` 上实时绘制等高线，颜色映射表示二维分布强度。
- 在网页四条边缘叠加“分布边际光效”：亮度与色相随边际分布强度（pX/pY）平滑变化，整体呈现更具科技感的霓虹与玻璃态风格。
- 复用第1章的噪声核心，抽出为全局可复用模块；在第3章中以差异化的色板、线型与滤镜打造风格区分。

## 现有代码锚点
- 第3章可视化：`static/js/chapter3.js`
  - 等高线入口：`updateContourPlot()` d:\Desktop\可视化教学案例\static\js\chapter3.js:382
  - 等高线绘制：`drawContourLevel()` d:\Desktop\可视化教学案例\static\js\chapter3.js:414
  - 边际直方图：`updateMarginalPlot()` d:\Desktop\可视化教学案例\static\js\chapter3.js:492 与 `drawMarginalDistribution()` d:\Desktop\可视化教学案例\static\js\chapter3.js:531
  - 交互高亮：`showMarginalDistribution()` d:\Desktop\可视化教学案例\static\js\chapter3.js:953
- 第1章噪声实现：`static/js/chapter1.js`
  - 背景初始化：`setupPerlinBackground()` d:\Desktop\可视化教学案例\static\js\chapter1.js:10
  - 噪声核心：`noise2(x,y)` d:\Desktop\可视化教学案例\static\js\chapter1.js:49、`buildPermutationTable()` d:\Desktop\可视化教学案例\static\js\chapter1.js:83
  - 颜色查表：`hslToRgb()` d:\Desktop\可视化教学案例\static\js\chapter1.js:101、`buildLUT()` d:\Desktop\可视化教学案例\static\js\chapter1.js:137

## 技术路线
- 标量场生成：以 `noise2(x, y + t)` 构造随时间变化的二维栅格值，空间频率与时间相位可控。
- 等高线计算：将栅格值输入等高线库生成 iso-lines/iso-bands；颜色随阈值层级渐变。
- 边缘光效：根据 X/Y 边际分布密度分别在顶部/底部与左/右边缘绘制线性渐变的发光条，亮度与色相由密度映射，形成“丝滑”反馈。
- 性能：低分辨率栅格 + 插值绘制；必要时使用 WebGL 滤镜加速发光与模糊。

## 第1章噪声抽取与复用
- 新建全局模块 `window.Noise2D`（或 `static/js/lib/noise2d.js`）：
  - 暴露 `create(noiseConfig)` 返回 `{ noise2, perm, fade, lerp, grad }`，兼容原 `noise2` 的调用参数。
  - 暴露色彩工具：`buildLUT(h, s)` 与 `hslToRgb()` 保留，供第3章背景配色查表复用。
- 第3章加载时直接引用 `window.Noise2D.noise2`，避免重复定义。

## 等高线渲染实现
- 栅格构造：在 `updateContourPlot()` 内生成 `grid[rows][cols]`，值域映射至 [0,1]；`rows≈120`、`cols≈200`（依据画布尺寸自适应）。
- 等高线库（二选一，主推 d3-contour）：
  - d3-contour：高质量 marching squares 等高线与等带生成，输出多边形路径，可在 Canvas 直接描边/填充 [1][2][3]。
  - MarchingSquares.js：支持 isoLines/isoBands，提供 QuadTree 预处理以加速多阈值场景 [4][5]。
- 绘制：
  - 用 `contours({thresholds})` 生成多级等高线；每级使用渐变色与发光描边（shadowBlur/合成模式），线宽随级别细微变化。
  - 颜色方案：霓虹冷色系（青-紫-蓝）并引入少量互补色以增强层级辨识。
- 动画：在 `requestAnimationFrame` 中更新 `t`（时间相位），重算少量帧（例如每 2 帧重绘一次）确保流畅与性能平衡。

## 边缘分布光效
- 映射约定：
  - 顶/底边缘显示 `pX(x)`；左/右边缘显示 `pY(y)`。
  - 亮度 = 归一化密度；色相随密度在设定范围内平滑变化，或 X/Y 使用不同基色（顶/底青色、左/右洋红）。
- 数据来源：复用 `drawMarginalDistribution()` 的直方图逻辑，增加一个 `getMarginals()` 返回两个密度数组与数值范围。
- 绘制实现：
  - 新增 `updateMarginalGlow()`：在全屏覆盖的 `marginal-glow` 画布上绘制四条极窄发光条（宽/高≈8px），使用 `createLinearGradient` + 多采样色标生成“丝滑”渐变；外侧再叠加轻微高斯模糊（Canvas shadowBlur 或 WebGL 滤镜）。
  - 触发时机：在 `updateAllVisualizations()` 末尾调用，或在滑块/分布类型变化后调用，确保与数据联动。

## 与第1章风格差异化
- 背景色板：由第1章的深蓝紫过渡到更高对比的青-紫霓虹；引入微弱网格叠加与角落光晕。
- 等高线形态：第1章是纯噪声背景；第3章等高线采用更薄的描边与发光外沿，线宽与透明度分层。
- 交互动效：滑块变化时增加短暂的“脉冲光”响应；边缘光效随边际分布动态改变色相，强调“科技”反馈。

## 库与方案调研（可选叠加）
- d3-contour：基于 marching squares 的等高线/等带，输出可直接绘制的多边形，质量与接口成熟 [1][2][3]。
- MarchingSquares.js：支持 isoLines/isoBands，QuadTree 预处理适合多阈值高频更新 [4][5]。
- deck.gl ContourLayer：WebGL 加速的等高线层，适合大规模数据或更强交互，但引入成本较高 [6]。
- PixiJS GlowFilter：GPU 滤镜实现平滑发光，光晕参数可控，适合“边缘光效”与高质量发光描边 [7][8][9][10]。
- Plotly.js 等高线：已有依赖，直接绘制 contour；但与自定义 Canvas 背景耦合较弱，更适合单独图层 [1]。

## 具体改动清单
- 新增：`static/js/lib/noise2d.js`（或在 `chapter3.js` 顶部注入 `window.Noise2D`）。
- 修改：
  - `updateContourPlot()` 改为：构造噪声栅格 → 调用等高线库 → 分层绘制（发光描边）。
  - 新增 `updateMarginalGlow()` 并在 `updateAllVisualizations()` 末尾调用。
  - `showMarginalDistribution()` 扩展为对对应边缘发光条进行脉冲增强。
- 样式：在 `static/css/chapter3.css` 增加背景网格与霓虹配色变量；为 `marginal-glow` 画布设置绝对定位与指针事件穿透。

## 验证与优化
- 功能验证：滑块与分布切换时，等高线与边缘光效同步更新；动画在 60FPS 设备上降帧不明显。
- 兼容策略：低端设备 fallback 为降低栅格分辨率与关闭外沿发光；无库加载时回退到现有 `drawContourLevel()` 椭圆近似。
- 性能观测：噪声与等高线计算开销监控，必要时将等高线计算放入 `requestIdleCallback` 或 Web Worker。

## 引用
- [1] Plotly.js Contour 文档：https://plotly.com/javascript/contour-plots/
- [2] d3-contour 模块主页：https://d3js.org/d3-contour
- [3] d3-contour GitHub：https://github.com/d3/d3-contour
- [4] MarchingSquares.js npm：https://www.npmjs.com/package/marchingsquares
- [5] MarchingSquares.js GitHub：https://github.com/RaumZeit/MarchingSquares.js/
- [6] deck.gl ContourLayer 示例：https://deck.gl/gallery/contour-layer
- [7] PixiJS GlowFilter API（@pixi/filter-glow）：https://api.pixijs.io/@pixi/filter-glow/PIXI/filters/GlowFilter.html
- [8] PixiJS Filters 文档：https://pixijs.io/filters/docs/GlowFilter.html
- [9] PixiJS GlowFilter 源码文档：https://filters.pixijs.download/remove-travis/docs/filters_glow_src_GlowFilter.js.html
- [10] PixiJS filter-glow 包文档：https://api.pixijs.io/@pixi/filter-glow.html

— 请确认是否采用 d3-contour 为主渲染路径，并是否引入 PixiJS GlowFilter 作为发光滤镜；确认后我将按上述步骤完成代码改造与样式更新。