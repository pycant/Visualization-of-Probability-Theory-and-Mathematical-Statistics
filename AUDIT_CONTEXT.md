# 项目审计共享上下文

> 所有审计 agent 在开始前必须读取此文件。

## 项目结构

```
templates/          # 16 个 HTML 页面
  index.html (235KB)           ✅ 完成度高
  chapter1.html (59KB)         ✅ 完成
  chapter3.html (206KB)        ✅ 完成
  chapter5.html (10KB)         ⚠️ 可能未完工
  chapter8.html (9KB)          ⚠️ 可能未完工
  appendix.html (2KB)          ⚠️ 可能未完工
  probability_distributions.html (337KB)  ✅ 完成
  random_variables.html (159KB)           ✅ 完成
  hypothesis_testing.html (197KB)         ✅ 完成
  interval_estimation.html (184KB)        ✅ 完成
  law_of_large_numbers.html (221KB)       ✅ 完成
  expectation_variance.html (74KB)        ✅ 完成
  video-courses.html (6KB)     ⚠️ 可能未完工
  flip_card_test.html (24KB)   ⚠️ 测试页
  contour-test.html (14KB)     ⚠️ 测试页
  temp_old_chapter3.html (153KB) ⚠️ 待清理
  partials/                    # 导航栏 + 页脚 partials
    navbar.html (22KB)
    footer.html (7KB)

static/js/          # 57 个 JS 文件
  chapter1.js (123KB)
  chapter3.js (15193行 / 大文件)
  toolbox.js
  include-navbar.js    # 动态加载导航栏
  include-footer.js    # 动态加载页脚
  url-click-handler.js
  animation.js         # 新增: GSAP ScrollTrigger 引擎
  panel-layout/        # TypeScript 面板布局系统
  tests/               # 测试 JS 文件

static/css/         # 8 个 CSS 文件
  chapter1.css, chapter3.css, random_variables.css
  chi-squared-distribution.css
  mobile-base.css         # 新增

static/libs/        # 第三方库
  chart/ (chart.umd.min.js + annotation)
  three/ (three.min.js)
  gsap/ (gsap.min.js 71KB + ScrollTrigger.min.js 42KB)
  katex/ (CSS + JS)
  marked/ (marked.min.js)
  mathjax/ (tex-mml-chtml.js 1145KB — 大!)
  fontawesome/
  webfonts/

static/videos/      # 451MB 教学视频
static/img/         # 20MB 图片
```

## 技术栈

| 技术 | 版本 | 加载方式 |
|------|------|---------|
| TailwindCSS | v4 | CDN (`cdn.tailwindcss.com`) |
| GSAP | v3.12.2 | 本地 `static/libs/gsap/` |
| Chart.js | v4 | 本地 `static/libs/chart/` |
| Three.js | r128 | CDN / 本地 |
| KaTeX | — | 本地 `static/libs/katex/` |
| Font Awesome | 6.5.0 | CDN |

## 已部署状态

- 域名: https://www.cuili.xyz/
- 服务器: 8.163.45.62 (Ubuntu 22.04)
- Web 服务: Nginx 1.18.0 + HTTPS (Let's Encrypt)
- 数据库: 无 (已移除 MySQL, 改用 Python + JSON)
- 测试: Playwright 1.57 (tests/e2e/)

## 已有测试

- 冒烟测试: 12 页面 × 2 检查 (无JS报错 + HTTP 200) — 全部通过
- 视觉回归: 4 页面 × 3 断点 (桌面/平板/手机)
- 原有测试: basic.spec.ts, chapter3.spec.ts, security.spec.ts
