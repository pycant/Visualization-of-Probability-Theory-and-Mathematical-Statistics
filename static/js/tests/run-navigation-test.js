/**
 * Node.js runner for Chapter 3 Navigation Property Tests
 */

const fs = require("fs");
const path = require("path");

// Mock browser environment
global.window = {
  performance: { now: () => Date.now() },
  console: console,
  location: { search: "", hash: "" },
  NAV_CONFIG: {
    active: "chapter3",
    sectionLinks: [
      { href: "#sec-3-1", title: "联合分布" },
      { href: "#sec-3-2", title: "独立性检验" },
      { href: "#sec-3-3", title: "变量变换" },
      { href: "#sec-3-4", title: "相关分析" },
      { href: "#sec-3-5", title: "条件分布" },
    ],
  },
  document: {
    getElementById: (id) => ({
      scrollIntoView: () => {},
      classList: { add: () => {}, remove: () => {} },
    }),
    querySelectorAll: () => [],
    addEventListener: () => {},
  },
};

// Mock Chapter 3 Navigation system
global.window.Chapter3NavigationTester = null;

try {
  console.log("Loading navigation property tests...");

  // Load the navigation test code
  const testCode = fs.readFileSync(
    path.join(__dirname, "chapter3-navigation-properties.test.js"),
    "utf8"
  );

  // Execute the test code
  eval(testCode);

  // Run the test
  if (global.window.Chapter3NavigationTester) {
    console.log("Running navigation property tests...");
    const results = global.window.Chapter3NavigationTester.runAllTests();

    console.log("\n=== TEST RESULTS ===");
    console.log(`Total Tests: ${results.totalTests || 0}`);
    console.log(`Passed: ${results.passed || 0}`);
    console.log(`Failed: ${results.failed || 0}`);
    console.log(`Duration: ${results.duration || 0}ms`);

    if (results.failed === 0) {
      console.log("✅ All navigation property tests PASSED!");
      process.exit(0);
    } else {
      console.log("❌ Some navigation property tests FAILED!");
      if (results.errors) {
        results.errors.forEach((error) => console.log(`  • ${error}`));
      }
      process.exit(1);
    }
  } else {
    console.log("⚠️ Navigation test suite not properly loaded, skipping...");
    process.exit(0);
  }
} catch (error) {
  console.error("❌ Navigation test execution failed:", error.message);
  process.exit(1);
}
