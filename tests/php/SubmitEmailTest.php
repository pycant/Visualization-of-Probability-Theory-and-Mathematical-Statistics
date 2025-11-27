<?php
use PHPUnit\Framework\TestCase;

final class SubmitEmailTest extends TestCase {
  private function requireDbAllowed(): void {
    if (getenv('ALLOW_DB_TESTS') !== '1') {
      $this->markTestSkipped('数据库相关测试已跳过：设置 ALLOW_DB_TESTS=1 以启用');
    }
  }

  public function testDuplicateCheckUniqueThenInsert(): void {
    $this->requireDbAllowed();
    $_POST = ['email_check' => 'test_user@example.com'];
    ob_start();
    include __DIR__ . '/../../templates/submit_email.php';
    $first = trim(ob_get_clean());
    $this->assertContains($first, ['unique', 'duplicate']);

    if ($first === 'unique') {
      $_POST = ['email' => 'test_user@example.com'];
      ob_start();
      include __DIR__ . '/../../templates/submit_email.php';
      $second = trim(ob_get_clean());
      $this->assertSame('订阅成功', $second);
    }
  }

  public function testDuplicateSubmissionReturnsSubscribed(): void {
    $this->requireDbAllowed();
    $_POST = ['email' => 'existing_user@example.com'];
    ob_start();
    include __DIR__ . '/../../templates/submit_email.php';
    $out1 = trim(ob_get_clean());

    $_POST = ['email' => 'existing_user@example.com'];
    ob_start();
    include __DIR__ . '/../../templates/submit_email.php';
    $out2 = trim(ob_get_clean());

    $this->assertContains($out1, ['订阅成功', '该邮箱已订阅']);
    $this->assertSame('该邮箱已订阅', $out2);
  }

  public function testSqlInjectionAndScriptInput(): void {
    $this->requireDbAllowed();
    $_POST = ['email' => "x' OR '1'='1"];
    ob_start();
    include __DIR__ . '/../../templates/submit_email.php';
    $out = trim(ob_get_clean());
    $this->assertContains($out, ['订阅成功', '该邮箱已订阅']);

    $_POST = ['email' => '<script>alert(1)</script>@example.com'];
    ob_start();
    include __DIR__ . '/../../templates/submit_email.php';
    $out2 = trim(ob_get_clean());
    $this->assertContains($out2, ['订阅成功', '该邮箱已订阅']);
  }
}
?>
