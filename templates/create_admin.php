<?php
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

// 插入管理员账户
$admin_username = 'admin';
$admin_password = password_hash('admin123', PASSWORD_BCRYPT);  // 使用 BCRYPT 加密密码

$sql = "INSERT INTO admins (username, password) VALUES ('$admin_username', '$admin_password')";
if ($conn->query($sql) === TRUE) {
    echo "管理员账户创建成功!";
} else {
    echo "错误: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
