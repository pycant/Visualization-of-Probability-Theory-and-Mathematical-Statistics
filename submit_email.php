<?php
// submit_email.php

// 数据库连接设置
$servername = "8.148.208.76";
$username = "e-mail";  // MySQL 用户名
$password = "123456";  // MySQL 密码
$dbname = "e-mail";  // 数据库名称

// 创建数据库连接
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接
if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

// 获取表单提交的邮箱
$email = $_POST['email'];

// 插入数据到数据库
$stmt = $conn->prepare("INSERT INTO emails (email_address) VALUES (?)");
$stmt->bind_param("s", $email);  // "s" 表示字符串类型
if ($stmt->execute()) {
    echo "邮箱提交成功";
} else {
    echo "提交失败：" . $stmt->error;
}

// 关闭连接
$stmt->close();
$conn->close();
?>
