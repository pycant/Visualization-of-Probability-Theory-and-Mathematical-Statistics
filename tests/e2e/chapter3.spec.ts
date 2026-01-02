import { test, expect } from "@playwright/test";

test("Chapter3 页面无控制台错误且参数显示更新正常", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!/Failed to load resource/.test(text)) errors.push(text);
    }
  });

  await page.goto("/templates/chapter3.html?test=true", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(1000);

  expect(errors).not.toContain("ReferenceError: ariaValueText is not defined");
  await expect(errors).toEqual([]);

  const rhoSlider = page.locator("#rho-slider");
  await rhoSlider.evaluate((el: HTMLInputElement) => {
    el.value = "0.75";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const rhoVal = page.locator("#rho-val");
  await expect(rhoVal).toHaveText("0.75");

  const ariaText = await rhoSlider.getAttribute("aria-valuetext");
  expect(ariaText).toBeTruthy();
  expect(ariaText || "").toContain("0.75");

  const nSamplesSlider = page.locator("#n-samples-slider");
  await nSamplesSlider.evaluate((el: HTMLInputElement) => {
    el.value = "1200";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const nSamplesVal = page.locator("#n-samples-val");
  await expect(nSamplesVal).toHaveText("1,200");
});

