# JS 缺陷审计报告

> 由 JS Bug Hunter 生成

## 核心文件健康度

| 文件 | 行数 | CRITICAL | HIGH | 健康度 |
|------|------|----------|------|--------|
| static/js/toolbox.js | ~3500 | 3 | 4 | 低 — 多处空指针风险 |
| static/js/chapter3.js | ~15200 | 3 | 2 | 中低 — 大文件，累积事件监听 |
| static/js/chapter1.js | ~3400 | 0 | 1 | 中 — console.log 残留 |
| static/js/include-navbar.js | ~320 | 0 | 0 | 良好 |
| static/js/animation.js | ~190 | 0 | 0 | 良好 |

## 严重度: CRITICAL (7)

| # | 文件:行号 | 问题 |
|---|----------|------|
| 1 | toolbox.js:1938 | `getElementById("chat-messages")` 无 null 检查直接 `.innerHTML` |
| 2 | toolbox.js:1949 | 同上模式 |
| 3 | toolbox.js:1955 | `JSON.parse` 无 try-catch (localStorage 可能损坏) |
| 4 | chapter3.js:3312 | 5 个连续的 `getElementById().value` 无 null 检查 |
| 5 | chapter3.js:6644 | 多个 `.textContent` 赋值无 null 检查 |
| 6 | chapter3.js:6548 | `querySelector()` 返回 null 后访问 `.parentElement` |
| 7 | toolbox.js:2058 | 连续 `.value` 访问无 null 检查 |

## 严重度: HIGH (8)

| # | 文件:行号 | 问题 |
|---|----------|------|
| 8 | toolbox.js:641 | `bindEvents()` 多处 `addEventListener` 无 null 守卫 |
| 9 | toolbox.js:849 | 全局 click 监听中 `sidebar.contains()` 无 null 保护 |
| 10 | toolbox.js:1007 | `openToolbox()` 中 `sidebar.querySelector` 无 null 检查 |
| 11 | toolbox.js:1368 | `sendMessage()` 中 `chat-input` 无 null 检查 |
| 12 | toolbox.js:2736 | `showTestResult()` 中 `resultDiv` 无 null 检查 |
| 13 | chapter3.js:1159 | `resize` 监听器多次注册未清理 (内存泄漏) |
| 14 | chapter3.js:6528 | `mousemove` 匿名函数累积 (内存泄漏) |
| 15 | chapter1.js:2355 | `clipboard.writeText()` Promise 未 catch |

## 严重度: MEDIUM (6)

| # | 问题 |
|---|------|
| 16 | chapter3.js 约 50+ 处 `console.log` 残留 |
| 17 | toolbox.js:1258 `history` 元素无 null 检查 |
| 18 | toolbox.js:2899 `calculateQuantile()` 无 null 检查 |
| 19 | toolbox.js:2857 `updateDistributionParams()` 无 null 检查 |
| 20 | 7 个 0 字节 JS 空文件 stub |
| 21 | chapter3.js:3967 `highlightProbabilityRegion()` 无 null 检查 |

## 严重度: LOW (4)

| # | 问题 |
|---|------|
| 22 | 测试中硬编码 `waitForTimeout` 可能 flaky |
| 23 | visual.spec.js 截图无重试 |
| 24 | capture-covers.spec.ts 等待策略不够稳健 |
| 25 | security.spec.ts 测试范围极小 |
