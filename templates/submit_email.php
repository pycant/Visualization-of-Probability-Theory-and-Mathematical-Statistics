<?php
// 数据库配置
$host = '8.148.208.76';
$dbname = 'e-mail';
$username = 'e-mail';
$password = '123456';

// 设置响应头为JSON格式
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接
if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

// 判断是否是检查重复邮箱请求
if (isset($_POST['email_check'])) {
    $email_check = $_POST['email_check'];

    // 检查邮箱是否已存在
    $stmt = $conn->prepare("SELECT * FROM emails WHERE email_address = ?");
    $stmt->bind_param("s", $email_check);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // 该邮箱已订阅
        echo 'duplicate';
    } else {
        // 没有重复订阅
        echo 'unique';
    }

    $stmt->close();
    $conn->close();
    exit;
}

// 判断是否是提交邮箱的请求
if (isset($_POST['email'])) {
    $email = $_POST['email'];

    // 检查该邮箱是否已订阅
    $stmt = $conn->prepare("SELECT * FROM emails WHERE email_address = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // 邮箱已订阅
        echo '该邮箱已订阅';
    } else {
        // 插入新邮箱到数据库
        $stmt = $conn->prepare("INSERT INTO emails (email_address) VALUES (?)");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        echo '订阅成功';
    }

    $stmt->close();
    $conn->close();
}
?>