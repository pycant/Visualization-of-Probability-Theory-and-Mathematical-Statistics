import { test, expect } from "@playwright/test";
test("首页加载无控制台错误且页脚注入正常", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!/Failed to load resource/.test(text)) errors.push(text);
    }
  });
  await page.goto("/templates/index.html", { waitUntil: "domcontentloaded" });
  const footer = page.locator("#site-footer");
  await expect(footer).toHaveCount(1);
  await page.waitForTimeout(500);
  await expect(errors).toEqual([]);
});
