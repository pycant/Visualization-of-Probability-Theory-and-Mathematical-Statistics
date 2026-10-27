# 概率维度 — 项目待办清单

> 基于 4 个并行审计 Agent 的全量扫描结果 (2026-05-13)
> 审计文件: AUDIT_FINDINGS_CONTENT.md / JS.md / PERF.md / STYLE.md

---

## 现状快照 (2026-10-27)

### 已完成

| 项 | 说明 |
|----|------|
| ICP 备案号 | 赣ICP备2026027726号 全站上线，17 个文件同步（2026-10-26 审核通过） |
| 导航/页脚 404 | 路径 `/templates/partials/*` → `/partials/*`；脚本改为立即执行 + 幂等 |
| 目录加载失败 | `docs/目录.md` 复制到 `templates/docs/`，`/docs/目录.md` 可访问 |
| favicon | `templates/favicon.ico` 上线，消除 `/favicon.ico` 404 |
| **C-02 chapter5** | 已从骨架改造为完整交互章节：抽样模拟器 + χ²/t/F 三分布 + 对照表（2026-10-27） |

### 已知但低危

- `static/images/` 目录在仓库中为空，但多个页面引用 `../static/images/favicon.ico` → 这些引用仍是 404（页面 icon 已由根级 `favicon.ico` 兜底）
- `node_modules/` 有 2466 个文件被 git 跟踪，仓库体积因此膨胀，建议后续 `git rm -r --cached node_modules`

### 未合并分支（需决策）

| 分支 | 内容 | 建议 |
|------|------|------|
| `sprintC/gsap-scrolltrigger-animations-vs` | GSAP 滚动入场动效 + 冒烟/视觉回归测试 | 动效需 rebase（与 navbar 事件、index 备案号冲突） |
| `feat/email-subscription-service-vs` | 删废弃 PHP 后端，换 Python 邮件订阅 | 落后 6 个提交，需确认需求是否仍要 |
| `feat/mobile-adaptive-placeholder-vs` | 移动端适配计划占位（标记暂缓） | 保留，见 MOBILE_ADAPTATION.md |

---

## 🔴 严重问题 (Critical)

| ID | Agent | 问题 | 文件 | 建议 |
|----|-------|------|------|------|
| C-01 | A4-样式 | **TailwindCSS 自定义颜色全部失效**：`--neon-blue` 需改为 `--color-neon-blue`，否则 400-600 处渐变/透明度静默不生效 | 全项目 | 添加 `@theme { --color-dark-bg: ... }` 定义 |
| C-02 | A1-内容 | ~~**chapter5.html** 仅骨架 10KB~~ ✅ 已改造为完整交互章节 (2026-10-27) | templates/chapter5.html | 已完成 |
| C-03 | A1-内容 | **chapter8.html** 仅骨架 9KB，"内容建设中" | templates/chapter8.html | 开发 ANOVA/回归分析内容 |
| C-04 | A1-内容 | **appendix.html** 几乎未开始 2KB，无 navbar/footer | templates/appendix.html | 集成共享组件，填充分布表 |
| C-05 | A2-JS | **多处 DOM 无 null 检查** (toolbox.js 3处, chapter3.js 3处) | static/js/toolbox.js, chapter3.js | 添加 null 守卫 |
| C-06 | A2-JS | **JSON.parse 无 try-catch** (localStorage 数据可能损坏) | static/js/toolbox.js:1955 | 包裹 try-catch |
| C-07 | A3-性能 | **MathJax 1.1MB** 为 AI 侧边栏预留，当前未接入 | static/libs/mathjax/ | 后续接入 LaTeX 渲染 |

---

## 🟠 高优先级 (High)

| ID | Agent | 问题 | 文件 |
|----|-------|------|------|
| H-01 | A1 | ~~导航栏缺失 5 个页面入口~~ **已确认是设计意图**，仅主章节在导航中 | partials/navbar.html |
| H-02 | A1 | temp_old_chapter3.html 153KB 孤立文件 | templates/ |
| H-03 | A2 | `window.resize` / `mousemove` 监听器未清理 (内存泄漏) | chapter3.js |
| H-04 | A2 | 8 个事件绑定无 null 守卫 | toolbox.js |
| H-05 | A2 | clipboard.writeText Promise 未 catch | chapter1.js |
| H-06 | A3 | 9 个 .mov 文件 (395MB) 无流式支持，6 个未引用 | static/videos/ |
| H-07 | A3 | ~55 处 `transition: all` 反模式 | 多文件 |
| H-08 | A3 | TailwindCSS CDN 运行时加载拖慢 FCP | 12 个页面 |
| H-09 | A3 | 封面图 20MB 使用 PNG 而非 WebP | static/img/covers/ |
| H-10 | A4 | z-index 冲突 (导航/下拉/toast) | 多文件 |
| H-11 | A4 | footer 颜色对比度不足 (2.45:1 < 4.5:1) | partials/footer.html |
| H-12 | A4 | `animate-pulse-slow` 未定义 | index.html + 2 页 |
| H-13 | A1 | video-courses.html 完全依赖 JS 无降级 | templates/video-courses.html |
| H-14 | A3 | Font Awesome 加载策略不一致 (CDN vs 本地) | 多页面 |

---

## 🟡 中优先级 (Medium)

| ID | Agent | 问题 |
|----|-------|------|
| M-01 | A1 | expectation_variance.html (74KB) 内容可能不足 |
| M-02 | A1 | contour-test / flip_card_test 测试页在生产目录 |
| M-03 | A1 | templates/tests/ 测试文件可公网访问 |
| M-04 | A2 | chapter3.js ~50+ 处 console.log 残留 |
| M-05 | A2 | 7 个 0 字节 JS 空文件 stub |
| M-06 | A2 | 多处 DOM 操作缺少 null 守卫 (toolbox.js) |
| M-07 | A3 | `box-shadow`/`border-color` 动画非合成器友好 |
| M-08 | A3 | `width`/`height` 动画触发 layout |
| M-09 | A3 | Font Awesome 字体文件重复 1.1MB |
| M-10 | A3 | Google Fonts 加载方式不统一 |
| M-11 | A3 | ~20 处品牌色硬编码未使用 CSS 变量 |
| M-12 | A3 | 视频缺少 preload/poster/懒加载 |
| M-13 | A4 | 社交图标 40x40px 不满足 WCAG 44x44px 触摸目标 |
| M-14 | A4 | chapter3.css ~20 处 !important 滥用 |
| M-15 | A4 | `.hidden` 类重复定义在多个 CSS 文件中 |
| M-16 | A4 | body padding-top 动态加载导致闪烁 |

---

## 🟢 低优先级 (Low)

| ID | Agent | 问题 |
|----|-------|------|
| L-01 | A1 | appendix.html 缺少共享 footer |
| L-02 | A1 | partials/footer.html 使用相对路径而非根相对路径 |
| L-03 | A3 | 6 个大 HTML 文件内联 JS/CSS 未拆分外部文件 |
| L-04 | A3 | 部分 SVG 可进一步压缩 |
| L-05 | A4 | Footer Logo 渐变失效无后备色 |
| L-06 | A4 | 多处页面重复定义相同样式类 |
| L-07 | A4 | chapter5/8 不使用共享导航/样式系统 |
| L-08 | A4 | 备案链接 z-index:999 过度 |
| L-09 | A2 | 测试中硬编码 timeout 可能 flaky |
| L-10 | A2 | security.spec.ts 测试范围极小 |

---

## 推进计划 (2026Q4)

| 优先级 | 任务 | 关键点 | 预估 |
|--------|------|--------|------|
| **P1** | chapter8 内容建设（C-03） | 骨架 10KB，需覆盖方差分析与线性回归；同 chapter5 模式（场景 + Canvas 交互） | 1-2 天 |
| **P1** | appendix 补全（C-04） | 3KB 无 navbar/footer；填分布分位表 + 常用公式卡 | 半天 |
| **P2** | chapter3 滑块统一（X-01） | 17/23 个 `accent-*` 改 `param-slider`，消除视觉割裂 | 半天 |
| **P2** | JS 健壮性（C-05/C-06/H-03~H-05） | null 守卫、JSON.parse try-catch、resize 监听器清理 | 1 天 |
| **P2** | 性能清理（H-07/M-04） | `transition: all` 55 处、chapter3.js 50+ console.log | 半天 |
| **P3** | 无障碍（H-11/M-13） | footer 对比度 2.45:1 → 4.5:1、触摸目标 44px | 半天 |
| **P3** | 仓库瘦身 | node_modules 2466 文件移出跟踪；`static/images` 空引用清理 | 1 小时 |
| **P4** | 分支收敛 | sprintC 动效 rebase 合入 / 邮件订阅服务决策 | 按需 |
| **P4** | 移动端适配 | 见 MOBILE_ADAPTATION.md（P0：汉堡菜单、防溢出、44px 触摸） | 2-3 天 |

### 建议顺序

1. **先补齐内容**（chapter8 → appendix）：评委视角下「章节空着」比「样式不统一」严重得多
2. **再收技术债**（滑块统一 → JS 健壮性 → 性能 → 无障碍），每项都可独立验证、独立提交
3. **最后做需求层**（动效 / 移动端 / 邮件订阅），涉及设计取舍，需明确取舍再动手

