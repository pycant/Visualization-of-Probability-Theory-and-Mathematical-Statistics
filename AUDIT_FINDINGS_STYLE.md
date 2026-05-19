# 样式与框架错误审计报告

> 由 Style & Framework Auditor 生成

## 严重度: CRITICAL (2)

| # | 问题 | 影响范围 | 建议 |
|---|------|---------|------|
| 1 | **所有自定义颜色渐变失效**：`from-dark-bg to-dark-card/50` 等 TailwindCSS 渐变类要求 CSS 变量命名为 `--color-dark-bg`，但项目使用的是 `--dark-bg`（无 `--color-` 前缀） | 全项目 400-600 处 | 通过 `@theme { --color-dark-bg: #0f172a; ... }` 注册或改用自定义 CSS 类 |
| 2 | **所有透明度修饰符失效**：`bg-neon-blue/20`、`border-neon-blue/30` 等依赖正确注册的颜色，全部静默失效 | 全项目数十处 | 同上，在 `@theme` 中注册 |

## 严重度: HIGH (3)

| # | 问题 | 位置 | 建议 |
|---|------|------|------|
| 3 | **z-index 冲突**：导航 z-40、下拉 z-50、sticky二级导航 z-50、toast z-50 互相争抢 | navbar.html + 各章节页 | 建立 z-index 层级体系 |
| 4 | **颜色对比度不足**：`text-gray-500` 在暗色背景上仅 2.45:1 (WCAG AA 需 4.5:1) | footer.html 版权/备案链接 | 改为 `text-gray-400` |
| 5 | **`animate-pulse-slow` 未定义**：自定义类名但未在任何 CSS 中定义 | index.html + 2 个页面 | 添加 CSS 定义或改用标准 `animate-pulse` |

## 严重度: MEDIUM (6)

| # | 问题 | 位置 |
|---|------|------|
| 6 | 社交图标 40x40px 不满足 WCAG 44x44px 触摸目标 | footer.html |
| 7 | chapter3.css 近 20 处 `!important` 滥用 | chapter3.css |
| 8 | `.hidden` 类被重复定义（chapter1.css + random_variables.css + TailwindCSS）| 多处 |
| 9 | 完全相同的媒体查询块重复两次 | chapter3.css:749 & 1347 |
| 10 | chi-squared-distribution.css 的 `.container` 与 TailwindCSS 冲突 | chi-squared-distribution.css |
| 11 | body padding-top 仅在 navbar 注入后才生效，导致加载闪烁 | navbar.html |

## 严重度: LOW (5)

| # | 问题 |
|---|------|
| 12 | Footer Logo 渐变失效时无纯色后备 |
| 13 | 多处页面重复定义相同样式类（border-glow, glass-effect 等）|
| 14 | chapter5/8 不使用共享导航/样式系统 |
| 15 | 备案链接 z-index:999 过度 |
| 16 | `-z-10` 依赖 TailwindCSS 版本 |

## 核心结论

项目中 **约 400-600 处**使用自定义颜色的 TailwindCSS 渐变/透明度修饰符因 `--color-*` 命名问题而**全部静默失效**。这是影响范围最广的问题，修复后视觉效果将有显著变化。
