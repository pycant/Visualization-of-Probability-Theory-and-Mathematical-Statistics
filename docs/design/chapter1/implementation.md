# 第1章实现要点与代码骨架

## 依赖与资源
- 脚本：`static/js/include-navbar.js`、`static/js/toolbox.js`、章节专属交互脚本 `static/js/chapter1.js`（后续新增）。
- 样式：Tailwind（CDN 或构建）、导航内部样式变量（已在 `navbar.html` 中定义）。
- 公式：KaTeX（推荐）或 MathJax（仓库已包含）。
- 媒体：视频在 `static/videos/`（可选加载，错误不影响功能）。

## 结构化HTML片段（示例）
- 章节页头（Hero）：
  - `header.hero` 包含章徽、标题、副标题、导航按钮。
- 可视化卡片（VisCard）：
  - 容器：`section.vis-card#sec-1-1-1`
  - 标题：`.card-title`
  - 控制：`.card-controls`（滑块、开关、重置）
  - 画布：`.card-canvas`（`<canvas>` 或 `<svg>`）
  - 结论：`.card-conclusion`

## JS骨架（示例）
```js
// static/js/chapter1.js
(function () {
  function q(sel, root) { return (root || document).querySelector(sel); }
  function on(el, evt, cb) { el && el.addEventListener(evt, cb); }

  // 1.1.1 随机现象：掷骰模拟器
  function initDiceSim(root) {
    var card = q('#sec-1-1-1');
    if (!card) return;
    var startBtn = q('.card-controls .start', card);
    var stopBtn = q('.card-controls .stop', card);
    var resetBtn = q('.card-controls .reset', card);
    var nSlider = q('.card-controls input[type=range]', card);
    var canvas = q('.card-canvas', card);
    var ctx = canvas && canvas.getContext('2d');
    var counts = Array(6).fill(0), total = 0, timer = null;

    function roll() { return Math.floor(Math.random() * 6) + 1; }
    function draw() {
      if (!ctx) return;
      // 绘制简单柱状图（占位示例）
      ctx.clearRect(0,0,canvas.width,canvas.height);
      var w = canvas.width, h = canvas.height, bw = w/6 - 8;
      for (var i=0;i<6;i++) {
        var p = total ? counts[i]/total : 0;
        var bh = p * (h-20);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
        ctx.fillRect(i*(bw+8)+8, h-bh-10, bw, bh);
      }
    }
    function tick() {
      var n = parseInt(nSlider && nSlider.value || '1', 10);
      for (var i=0;i<n;i++) { var r = roll(); counts[r-1]++; total++; }
      draw();
    }
    on(startBtn, 'click', function(){ if (!timer) timer = setInterval(tick, 100); });
    on(stopBtn, 'click', function(){ if (timer) { clearInterval(timer); timer = null; } });
    on(resetBtn, 'click', function(){ counts = Array(6).fill(0); total = 0; draw(); });
    draw();
  }

  function init() {
    initDiceSim(document);
    // TODO: 绑定其他小节的初始化函数
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

## 样式与主题
- 继承导航主题变量（文本悬停/激活/选中），章节主色使用青色系。
- `VisCard` 背景：深色玻璃卡片（半透明+模糊），边缘霓虹微光。

## 开发分工建议
- 先按锚点划分 HTML 结构与占位卡片；再逐步填充各可视化函数。
- 统一封装常用绘图与控件绑定函数，复用到各卡片初始化中。