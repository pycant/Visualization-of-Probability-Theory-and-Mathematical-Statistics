## 变更范围
- 删除 `routs.py` 与 `routs2.py`（检索未发现依赖）。
- 在 `c:\Users\12919\Desktop\可视化教学案例\tests` 添加测试，覆盖 SQL、PHP 安全性与稳定性、前端 E2E。

## 测试目标
- SQL：提供最小测试库 schema/seed，验证 CRUD、唯一约束（邮箱）、必要索引与基本查询性能。
- PHP：
  - 订阅接口正确性与安全性（重复检查、插入、异常输入与注入）。参考 `templates/submit_email.php:20-40,43-65`。
  - 登录流程与会话行为（成功/失败分支、密码校验）。参考 `templates/login.php:26-41`。
  - 管理页分页与删除只影响指定 `id`，并进行输出安全性冒烟（XSS）。参考 `templates/admin_subscribers.php:30-53,82-90`。
- 前端 E2E：关键页面加载无错误，`static/js/include-navbar.js` 与 `include-footer.js` 的片段注入正常；对管理页输出进行 XSS 冒烟测试。
- 稳定性：对订阅流程与静态页面做轻量并发访问，记录 95% 响应时间与错误率。

## 目录结构（新增于 `tests/`）
- `php/`
  - `phpunit.xml`
  - `SubmitEmailTest.php`
  - `LoginTest.php`
  - `AdminSubscribersTest.php`
- `sql/`
  - `schema.sql`（`emails(id,email_address,created_at)`、`admins(id,username,password)` 等最小表）
  - `seed.sql`（基础数据）
- `e2e/`
  - `playwright.config.ts`
  - `basic.spec.ts`（页面加载、导航/页脚注入、无 `console.error`）
  - `security.spec.ts`（提交含脚本标签邮箱后管理页是否原样输出）
- `load/`（可选）
  - `locustfile.py`（订阅与静态页面并发场景）

## 关键用例设计
- SQL：
  - 创建并连接到独立测试库；`emails.email_address` 设置唯一约束；CRUD 测试与查询耗时上限断言。
- PHP：
  - 订阅：先 `email_check` 返回 `unique` → 插入成功；再次提交返回“已订阅”；注入字符串与脚本标签输入的行为记录。
  - 登录：错误用户名/密码返回错误；正确凭证设置会话与重定向；会话检查。
  - 管理页：第一页/最后一页分页边界；删除仅删除指定 `id`；列表输出中是否需要转义（冒烟暴露 XSS 风险）。
- 前端 E2E：
  - 访问主要页面，断言 200 与无控制台错误；检查 `#site-footer` 与导航容器是否成功注入模板片段。
  - 安全性：用包含脚本的“邮箱”模拟，进入管理页观察是否原样呈现脚本标签（若是，即记录为风险）。
- 稳定性：
  - 订阅接口与静态页面并发 50~100，错误率<1%，95% 响应时间在合理范围（具体阈值以本机环境为准）。

## 依赖与运行
- PHP：使用 `phpunit.phar` 运行 `phpunit`（无需 composer）。
- Node：使用 `@playwright/test` 进行 E2E（测试内启动本地静态服务器）。
- Python（可选）：`locust` 用于并发访问模拟。
- 执行：
  - `php tests/php/phpunit.phar --configuration tests/php/phpunit.xml`
  - `npx playwright test`
  - `locust -f tests/load/locustfile.py --headless -u 50 -r 5 -t 1m`

## 安全与环境
- 测试数据库使用本地/容器化 MySQL 与独立库，避免连接生产；连接信息来源于测试配置或环境变量。
- 预计首轮安全用例可能失败（例如未转义输出导致的 XSS），作为修复依据。

## 交付
- 完整的 `tests/` 目录与可直接运行的测试脚本；基础报告（通过率、关键性能与并发指标）。
- 安全问题清单与修复建议（输入校验、输出转义、统一预编语句、敏感配置外置）。