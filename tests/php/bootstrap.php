<?php
// 测试环境引导：避免误连接生产数据库
// 通过 ALLOW_DB_TESTS=1 显式允许连接数据库，否则跳过涉及 DB 的用例
// 可在 CI 或本地设置测试库相关环境变量
putenv('ALLOW_DB_TESTS=' . (getenv('ALLOW_DB_TESTS') ?: '0'));
?>
