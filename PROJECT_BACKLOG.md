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

### 2026-10-27 缺陷修复批次（按优先级）

| 优先级 | 问题 | 处理 |
|--------|------|------|
| P0 安全 | `/login.php`、`/admin_subscribers.php`、`/create_admin.php`、`/submit_email.php` 被 nginx 当静态文本公开下载，内含 MySQL 口令与 `admin123` 明文建号逻辑 | 4 个文件全部删除，现返回 404 |
| P0 功能 | 首页订阅表单 POST 到 PHP，拿到源码文本却提示「订阅成功」 | 表单改为 mailto 订阅卡片 |
| P0 功能 | **chapter3 的 3D 联合密度图完全不渲染**：Plotly 来自 cdnjs，国内 TLS 被重置 → `Plotly is not defined`（仅控制台报错，页面无提示） | Plotly 2.26.0 本地化 |
| P0 性能 | 首页 `load` 事件 60s 内不触发 | 两个根因分别处理（Google Fonts 挂起 + 20MB 封面图） |
| P1 性能 | 封面图 `img/covers/*.png` 11 张共 20MB（单张最大 1600x6839），卡片只显示顶部 16:9 | 按显示区域裁切转 WebP，20MB → 280KB |
| P1 交互 | 拖动 chapter3 温度滑块报 `undefined.toFixed`；切换气体类型报 null 引用 | 补数据就绪判断 + `setText` 空值安全写入 |
| P1 一致性 | chapter3 22 个滑块中 16 个是浏览器原生样式 | 全部补 `param-slider` |
| P1 依赖 | Google Fonts（国内不可达）、cdnjs FA/Three/Plotly、jsdelivr Three | 全部本地化（Tailwind CDN 除外） |
| P2 清理 | 7 个 0 字节 JS stub、2 个 172KB 备份 JS、153KB 旧版 chapter3 | 全部删除 |
| P2 卫生 | 每页都预加载一个教学视频（`preload=metadata`） | 改 `preload=none` |
| P2 SEO | 无 robots.txt / sitemap.xml；测试页可被收录 | 新增 robots + sitemap；3 个测试页加 noindex |

> 回归结果：13 个页面 **0 控制台错误、0 个 4xx**；首页 `readyState=complete`（此前永不触发）。

### chapter3 背景等高线：性能优化 + 移除 2 秒轮询（2026-10-27 追加）

- 事实核对：`useBackgroundEffects` 在 `8478004`(2026-01-05) 被从 `true` 改为 `false`，背景**一直是关闭的**。
  临时开启实测：本地帧率 120fps → **19.5fps**（平均 51.2ms/帧），且立刻进 `degraded` 档。
- 优化项：去掉 `willReadFrequently`（会强制软件渲染）、背景/光条固定 1x DPR、噪声网格 150×90→120×72、
  噪声场+d3 三角化+模糊合成降至 ~8fps（中间帧只刷光条）、去掉描边与合成上的 `shadowBlur`、
  颜色按阈值缓存、光条限 ~11fps、降级判据改为「真实重算耗时」（原判据被 30fps 上限钳在 33ms 永远抖动）。
- 结果：**19.5fps / 51.2ms → 110~112fps / 8.9ms，稳定 normal 档**；线上实测 110.3fps。
- 启用改为能力判断（`prefers-reduced-motion`、核数<4 或内存<4 关闭），`?bg=0` / localStorage 可关；
  `chapter3.css` 里把背景压到 0.42、光条 0.4 透明度，避免抢内容。
- 移除 `chapter3.html` 的 `initializeRealTimeSimulation`（19 行）：其 2 秒轮询做的两件事都已有替代——
  话题轮播由 `chapter3.js` 的 `setupTrendingTopicsRotation`（5 秒）覆盖，`#live-indicator` 本身已带
  Tailwind `animate-pulse`（JS 反而用内联 opacity 覆盖了它）。
- 顺带：Plotly(3.4MB)/Three(0.58MB) 由 head 同步阻塞改为 `defer`，首屏 commit 从 40s+ 降到 210ms；
  等高线依赖的 `d3-contour` 从 d3js.org 外链改为本地（5.7KB），避免退化为 fallback 渲染器。

### 待办（下一批次）

| 优先级 | 事项 | 说明 |
|--------|------|------|
| P1 | Tailwind CDN 本地化 | 14 个页面运行时编译，拖慢 FCP；需引入构建产物 |
| P2 | `jstat` / `ml-matrix` / `fast-check` 仍走 jsdelivr | npmmirror 未收录，需另找镜像或本地打包 |
| P2 | chapter3 双套场景系统 | `.scenario-tab`（traditional/nlp/physics…）与遗留 `#scenario-select`（social/shopping/streamer…）并存，后者含 2s 轮询定时器 |
| P2 | `node_modules/` 仍被 git 跟踪（2466 文件） | 建议 `git rm -r --cached node_modules` |
| P3 | `transition: all` 55 处、chapter3.js 大量 console.log | 性能与噪音清理 |
| P2 | Plotly 整包 3.4MB 仍偏重 | 可换 plotly 局部 bundle（只留 surface/3d）或改用轻量 3D 库，首屏还能再降 |
| P3 | footer 对比度 2.45:1 未达 WCAG 4.5:1 | 无障碍 |
| P4 | 内容缺口 chapter8 / appendix | 用户要求暂缓，优先修 bug |

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
| C-05 | A2-JS | ~~**多处 DOM 无 null 检查**~~ 部分修复：chapter3 已加 setText + 数据就绪判断 (2026-10-27)；toolbox.js 待查 | static/js/toolbox.js, chapter3.js | 继续补 toolbox.js |
| C-06 | A2-JS | **JSON.parse 无 try-catch** (localStorage 数据可能损坏) | static/js/toolbox.js:1955 | 包裹 try-catch |
| C-07 | A3-性能 | **MathJax 1.1MB** 为 AI 侧边栏预留，当前未接入 | static/libs/mathjax/ | 后续接入 LaTeX 渲染 |

---

## 🟠 高优先级 (High)

| ID | Agent | 问题 | 文件 |
|----|-------|------|------|
| H-01 | A1 | ~~导航栏缺失 5 个页面入口~~ **已确认是设计意图**，仅主章节在导航中 | partials/navbar.html |
| H-02 | A1 | ~~temp_old_chapter3.html 153KB 孤立文件~~ ✅ 已删除 | templates/ |
| H-03 | A2 | `window.resize` / `mousemove` 监听器未清理 (内存泄漏) | chapter3.js |
| H-04 | A2 | 8 个事件绑定无 null 守卫 | toolbox.js |
| H-05 | A2 | clipboard.writeText Promise 未 catch | chapter1.js |
| H-06 | A3 | 9 个 .mov 文件 (395MB) 无流式支持，6 个未引用 | static/videos/ |
| H-07 | A3 | ~55 处 `transition: all` 反模式 | 多文件 |
| H-08 | A3 | TailwindCSS CDN 运行时加载拖慢 FCP | 12 个页面 |
| H-09 | A3 | ~~封面图 20MB 使用 PNG~~ ✅ 已转 16:9 裁切 WebP，20MB→280KB | static/img/covers/ |
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
| M-05 | A2 | ~~7 个 0 字节 JS 空文件 stub~~ ✅ 已删除 |
| M-06 | A2 | 多处 DOM 操作缺少 null 守卫 (toolbox.js) |
| M-07 | A3 | `box-shadow`/`border-color` 动画非合成器友好 |
| M-08 | A3 | `width`/`height` 动画触发 layout |
| M-09 | A3 | Font Awesome 字体文件重复 1.1MB |
| M-10 | A3 | Google Fonts 加载方式不统一 |
| M-11 | A3 | ~20 处品牌色硬编码未使用 CSS 变量 |
| M-12 | A3 | ~~视频缺少 preload~~ 部分修复：toolbox 播放器改 preload=none；章节视频仍为 metadata |
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

