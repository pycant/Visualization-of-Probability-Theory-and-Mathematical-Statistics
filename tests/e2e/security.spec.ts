import { test, expect } from '@playwright/test'
test('管理页可能的输出未转义（XSS 冒烟）', async ({ page }) => {
  await page.goto('/templates/admin_subscribers.php', { waitUntil: 'domcontentloaded' })
  const html = await page.content()
  expect(html).toContain('订阅者管理')
})
