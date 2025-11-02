<?php
session_start(); // 确保会话管理

// 验证管理员登录权限
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php'); // 如果没有登录，重定向到登录页面
    exit;
}

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

// 获取分页参数
$limit = 10;  // 每页显示10个订阅者
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

// 查询所有订阅者
$sql = "SELECT * FROM emails LIMIT $limit OFFSET $offset";
$result = $conn->query($sql);

// 获取总订阅者数量
$sql_count = "SELECT COUNT(*) as total FROM emails";
$count_result = $conn->query($sql_count);
$row = $count_result->fetch_assoc();
$total_subscribers = $row['total'];
$total_pages = ceil($total_subscribers / $limit);

// 删除订阅者
if (isset($_GET['delete'])) {
    $delete_id = (int)$_GET['delete'];
    $delete_sql = "DELETE FROM emails WHERE id = $delete_id";
    $conn->query($delete_sql);
    header("Location: admin_subscribers.php"); // 刷新页面，避免重复删除
    exit;
}

?>

<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理员 - 查看订阅者</title>
</head>
<body>
    <h2>订阅者管理</h2>
    <table border="1" cellpadding="10">
        <thead>
            <tr>
                <th>ID</th>
                <th>邮箱地址</th>
                <th>订阅时间</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            <?php while ($row = $result->fetch_assoc()) { ?>
                <tr>
                    <td><?php echo $row['id']; ?></td>
                    <td><?php echo $row['email_address']; ?></td>
                    <td><?php echo $row['created_at']; ?></td>
                    <td>
                        <a href="admin_subscribers.php?delete=<?php echo $row['id']; ?>" onclick="return confirm('确定删除该订阅者吗？')">删除</a>
                    </td>
                </tr>
            <?php } ?>
        </tbody>
    </table>

    <div>
        <p>共 <?php echo $total_subscribers; ?> 位订阅者</p>
        <p>页码： 
        <?php for ($i = 1; $i <= $total_pages; $i++) { ?>
            <a href="admin_subscribers.php?page=<?php echo $i; ?>"><?php echo $i; ?></a> 
        <?php } ?>
        </p>
    </div>

</body>
</html>

<?php
$conn->close(); // 关闭数据库连接
?>
