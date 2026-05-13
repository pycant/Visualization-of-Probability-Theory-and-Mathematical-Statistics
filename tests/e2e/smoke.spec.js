/**
 * 冒烟测试 — 确保所有页面正常加载，无 JS 报错
 * [Agent: vs]
 * 与 tests/e2e/playwright.config.ts 配合使用（端口 8080）
 */

const { test, expect } = require('@playwright/test');

const PAGES = [
  { path: '/templates/index.html', name: '首页' },
  { path: '/templates/chapter1.html', name: '第一章' },
  { path: '/templates/chapter3.html', name: '第三章' },
  { path: '/templates/chapter5.html', name: '第五章' },
  { path: '/templates/chapter8.html', name: '第八章' },
  { path: '/templates/probability_distributions.html', name: '概率分布' },
  { path: '/templates/random_variables.html', name: '随机变量' },
  { path: '/templates/hypothesis_testing.html', name: '假设检验' },
  { path: '/templates/interval_estimation.html', name: '区间估计' },
  { path: '/templates/expectation_variance.html', name: '期望方差' },
  { path: '/templates/law_of_large_numbers.html', name: '大数定律' },
  { path: '/templates/video-courses.html', name: '视频课程' },
];

for (const p of PAGES) {
  test.describe(`冒烟 - ${p.name}`, () => {
    test('无 JS 报错', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(p.path, { waitUntil: 'networkidle', timeout: 20000 });
      await expect(page.locator('nav')).toBeAttached({ timeout: 10000 });
      await expect(page.locator('footer')).toBeAttached({ timeout: 10000 });
      expect(errors).toEqual([]);
    });

    test('HTTP 200', async ({ page }) => {
      const resp = await page.goto(p.path);
      expect(resp.status()).toBe(200);
    });
  });
}
