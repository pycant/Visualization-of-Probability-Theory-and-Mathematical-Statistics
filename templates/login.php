<?php
session_start();

// 如果已登录，跳转到管理页面
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header("Location: admin_subscribers.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // 连接到数据库
    $servername = "8.148.208.76";
    $db_username = "e-mail";
    $db_password = "123456";
    $dbname = "e-mail";

    $conn = new mysqli($servername, $db_username, $db_password, $dbname);

    if ($conn->connect_error) {
        die("连接失败: " . $conn->connect_error);
    }

    // 查询管理员账号
    $stmt = $conn->prepare("SELECT id, password FROM admins WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $hashed_password);
    $stmt->fetch();

    if ($stmt->num_rows > 0) {
        // 验证密码
        if (password_verify($password, $hashed_password)) {
            // 密码正确，设置会话
            $_SESSION['admin_logged_in'] = true;  // 设置会话变量
            $_SESSION['admin_id'] = $id;  // 存储管理员 ID
            header("Location: admin_subscribers.php");  // 跳转到管理页面
            exit;
        } else {
            $error = "用户名或密码错误";
        }
    } else {
        $error = "用户名或密码错误";
    }

    $stmt->close();
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理员登录</title>
</head>
<body>
    <h2>管理员登录</h2>
    <form method="POST" action="login.php">
        <label for="username">用户名：</label>
        <input type="text" id="username" name="username" required><br><br>
        <label for="password">密码：</label>
        <input type="password" id="password" name="password" required><br><br>
        <button type="submit">登录</button>
    </form>
    <?php if (isset($error)) { echo "<p style='color:red;'>$error</p>"; } ?>
</body>
</html>
