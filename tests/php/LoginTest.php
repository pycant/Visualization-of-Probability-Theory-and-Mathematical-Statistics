<?php
use PHPUnit\Framework\TestCase;

final class LoginTest extends TestCase {
  private function requireDbAllowed(): void {
    if (getenv('ALLOW_DB_TESTS') !== '1') {
      $this->markTestSkipped('数据库相关测试已跳过：设置 ALLOW_DB_TESTS=1 以启用');
    }
  }

  public function testWrongCredentialsShowError(): void {
    $this->requireDbAllowed();
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST = ['username' => 'not_exist_user', 'password' => 'bad'];
    ob_start();
    include __DIR__ . '/../../templates/login.php';
    $html = ob_get_clean();
    $this->assertStringContainsString('用户名或密码错误', $html);
  }

  public function testSessionSetOnSuccess(): void {
    $this->requireDbAllowed();
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST = ['username' => 'admin', 'password' => 'correct_password'];
    ob_start();
    include __DIR__ . '/../../templates/login.php';
    ob_end_clean();
    $this->assertTrue(isset($_SESSION['admin_logged_in']));
  }
}
?>
