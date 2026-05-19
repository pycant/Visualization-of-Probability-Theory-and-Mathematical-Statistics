# 性能与视觉质量审计报告

> 由 Performance & Visual Auditor 生成

## 严重度: CRITICAL (1)

| 资源 | 问题 | 建议 |
|------|------|------|
| static/libs/mathjax/ (1.1MB) | 预留：为 AI 侧边栏 LaTeX 渲染准备，当前未引用 | 保留，后续接入 |

## 严重度: HIGH (5)

| 资源 | 问题 | 建议 |
|------|------|------|
| static/videos/ (451MB, 15个文件) | 9个 .mov (395MB) 无流式支持，6个未引用 | 转码MP4，删除未引用文件 |
| static/css/chapter3.css + templates/ | ~55处 `transition: all` 反模式 | 替换为具体属性 |
| 所有页面 (12处) | TailwindCSS CDN 运行时加载，拖慢 FCP | 本地构建静态 CSS |
| 多页面 (CDN vs 本地混用) | Font Awesome 加载策略不一致 | 统一使用本地版本 |
| static/img/covers/ (20MB, 11个PNG) | 封面图使用 PNG，未用 WebP/AVIF | 转换为 WebP（预计缩小 60-70%）|

## 严重度: MEDIUM (10)

| 资源 | 问题 | 建议 |
|------|------|------|
| chapter3.css | 多处 `box-shadow`/`border-color` 动画非合成器友好 | 改用 opacity/transform |
| chapter1.css | `filter: hue-rotate()` 触发重绘 | 预计算色值替代 |
| chapter3.css:1280 | 动画 `width`/`height` 触发 layout | 改用 `transform: scale()` |
| static/libs/ (webfonts x2) | Font Awesome 字体文件重复 1.1MB | 删除冗余副本 |
| 8个模板 | Google Fonts 加载方式不统一（含 @import 阻塞） | 统一用 `<link>` + preconnect |
| 3个 CSS 文件 | ~20处硬编码品牌色 | 统一使用 CSS 变量 |
| 所有 `<video>` | 缺少 preload/poster/懒加载 | 添加 `preload="none"` + poster |
| font-awesome.min.css (119KB) | 加载所有图标但只用少量 | 子集化 |
| KaTeX 字体 TTF 冗余 | 3格式存留，WOFF2已足够 | 删除 TTF |
| 均匀分布.mov (31MB) | 引用 .mov 格式 | 转码 MP4 |

## 严重度: LOW (2)

| 资源 | 问题 | 建议 |
|------|------|------|
| 6个大HTML文件 | 大量内联 JS/CSS 未拆分 | 提取外部文件 |
| 部分 SVG | flood_slide 系列 60-80KB | SVGO 压缩 |

## 优先级建议

1. **立即** 删除未使用的 MathJax (1.2MB) + 6个未引用 .mov (364MB)
2. **高** 消除 `transition: all` 反模式
3. **高** 封面图转 WebP
4. **高** 统一 Font Awesome 策略
5. **中** 品牌色硬编码 → CSS 变量
