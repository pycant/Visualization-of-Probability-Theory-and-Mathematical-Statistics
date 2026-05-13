/**
 * 视觉回归测试 — 关键页面多断点截图
 * [Agent: vs]
 * 首次运行生成基线截图，后续对比差异
 */

const { test, expect } = require('@playwright/test');

const PAGES = [
  { path: '/templates/index.html', name: 'home' },
  { path: '/templates/chapter1.html', name: 'chapter1' },
  { path: '/templates/probability_distributions.html', name: 'distributions' },
  { path: '/templates/video-courses.html', name: 'videos' },
];

const VIEWPORTS = [
  { width: 1440, height: 900, label: 'desktop' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 375, height: 812, label: 'mobile' },
];

for (const p of PAGES) {
  for (const vp of VIEWPORTS) {
    test(`截图 ${p.name}-${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(p.path, { waitUntil: 'networkidle', timeout: 20000 });
      await expect(page).toHaveScreenshot(`${p.name}-${vp.label}.png`, {
        maxDiffPixelRatio: 0.05,
        fullPage: true,
      });
    });
  }
}
