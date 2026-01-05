import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const targets = [
  { slug: "index", url: "/templates/index.html" },
  { slug: "chapter1", url: "/templates/chapter1.html" },
  { slug: "chapter3", url: "/templates/chapter3.html" },
  { slug: "random_variables", url: "/templates/random_variables.html" },
  {
    slug: "probability_distributions",
    url: "/templates/probability_distributions.html",
  },
  { slug: "expectation_variance", url: "/templates/expectation_variance.html" },
  { slug: "law_of_large_numbers", url: "/templates/law_of_large_numbers.html" },
  { slug: "interval_estimation", url: "/templates/interval_estimation.html" },
  { slug: "hypothesis_testing", url: "/templates/hypothesis_testing.html" },
  { slug: "chapter5", url: "/templates/chapter5.html" },
  { slug: "chapter8", url: "/templates/chapter8.html" },
];

test("capture full page covers", async ({ page }) => {
  test.setTimeout(parseInt(process.env.TEST_TIMEOUT_MS || "120000"));
  const outDir = path.join(__dirname, "../../static/img/covers");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const base =
    process.env.CAPTURE_BASE ||
    process.env.E2E_BASE_URL ||
    "http://localhost:8080";
  const navTimeout = parseInt(process.env.NAV_TIMEOUT_MS || "30000");
  const coverDelay = parseInt(process.env.COVER_DELAY_MS || "2500");

  for (const t of targets) {
    try {
      await page.setViewportSize({ width: 1600, height: 900 });
      const targetUrl = new URL(t.url, base).toString();
      await page.goto(targetUrl, { waitUntil: "load", timeout: navTimeout });
      await page.waitForTimeout(coverDelay);
      const file = path.join(outDir, `${t.slug}.png`);
      await page.screenshot({ path: file, fullPage: true });
    } catch (e: any) {
      console.warn(`[skip] ${t.slug}: ${e && e.message}`);
    }
  }
});
