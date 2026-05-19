# 内容完整性审计报告

> 由 Content Completeness Auditor 生成

## 发现汇总

| # | 严重度 | 文件 | 问题 |
|---|--------|------|------|
| 1 | CRITICAL | chapter5.html | 仅骨架，"内容建设中"，10KB vs 参考 235KB |
| 2 | CRITICAL | chapter8.html | 仅骨架，"内容建设中"，9KB vs 参考 235KB |
| 3 | CRITICAL | appendix.html | 几乎未开始，无 navbar，无共享 footer，2KB |
| 4 | HIGH | video-courses.html | 完全依赖 JS 动态加载，无静态降级，6KB |
| 5 | HIGH | partials/navbar.html | 导航下拉缺失 5 个页面入口 |
| 6 | HIGH | temp_old_chapter3.html | 孤立的 153KB 过期文件，零引用 |
| 7 | MEDIUM | expectation_variance.html | 74KB vs ~185KB 平均，可能内容不足 |
| 8 | MEDIUM | contour-test.html, flip_card_test.html | 开发测试页在 templates/ 中 |
| 9 | MEDIUM | templates/tests/test.html, 韦恩图.html | 测试文件放错目录，可公网访问 |
| 10 | LOW | appendix.html | 缺少共享 footer |
| 11 | LOW | partials/footer.html | 使用相对 `../` 路径而非根相对路径 |
