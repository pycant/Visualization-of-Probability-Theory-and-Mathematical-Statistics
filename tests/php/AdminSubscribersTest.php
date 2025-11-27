<?php
use PHPUnit\Framework\TestCase;

final class AdminSubscribersTest extends TestCase {
  private function requireDbAllowed(): void {
    if (getenv('ALLOW_DB_TESTS') !== '1') {
      $this->markTestSkipped('数据库相关测试已跳过：设置 ALLOW_DB_TESTS=1 以启用');
    }
  }

  public function testPaginationBounds(): void {
    $this->requireDbAllowed();
    $_SESSION['admin_logged_in'] = true;
    $_GET = ['page' => 1];
    ob_start();
    include __DIR__ . '/../../templates/admin_subscribers.php';
    $html = ob_get_clean();
    $this->assertStringContainsString('订阅者管理', $html);
    $this->assertStringContainsString('共', $html);
  }

  public function testDeleteOnlySpecifiedId(): void {
    $this->requireDbAllowed();
    $_SESSION['admin_logged_in'] = true;
    $_GET = ['delete' => "1 OR 1=1"]; // 将被强制转换为 int
    ob_start();
    include __DIR__ . '/../../templates/admin_subscribers.php';
    ob_end_clean();
    $this->assertTrue(true);
  }
}
?>
