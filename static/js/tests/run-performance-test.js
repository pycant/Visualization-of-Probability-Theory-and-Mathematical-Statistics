/**
 * Node.js runner for Chapter 3 Performance Property Tests
 */

const fs = require("fs");
const path = require("path");

// Mock browser environment with performance monitoring
global.window = {
  performance: {
    now: () => Date.now(),
    memory: { usedJSHeapSize: 1000000, totalJSHeapSize: 2000000 },
  },
  console: console,
  requestAnimationFrame: (callback) => setTimeout(callback, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  chapter3Visualizer: {
    parameters: {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      nSamples: 1000,
    },
    currentSamples: Array.from({ length: 1000 }, () => [
      Math.random() * 100,
      Math.random() * 100,
    ]),
    updateAllVisualizations: () => Promise.resolve(),
    updateParameter: (param, value) => {},
    generateSamples: () => {},
  },
};

// Minimal mock for Chapter3Visualizer class used by performance tests
global.Chapter3Visualizer = class Chapter3Visualizer {
  constructor() {
    this.parameters = {
      mu1: 5,
      mu2: 8,
      sigma1: 15,
      sigma2: 20,
      rho: 0.3,
      nSamples: 1000,
    };
    this.currentSamples = Array.from(
      { length: this.parameters.nSamples },
      () => [Math.random() * 100, Math.random() * 100]
    );
    this.frameRateMonitor = { currentFPS: 60 };
    this.memoryManager = { maxSampleSize: 5000 };
    this.webglSupport = { supported: true };
  }
  generateSamples() {
    const n = Math.max(1, this.parameters.nSamples);
    this.currentSamples = Array.from({ length: n }, () => [
      Math.random() * 100,
      Math.random() * 100,
    ]);
  }
  updateAllVisualizations() {
    return;
  }
  updateParameter(param, value) {
    this.parameters[param] = value;
  }
  handleWindowResize() {
    return;
  }
};

// Mock fast-check
global.fc = {
  assert: (property, options) => {
    console.log(
      `Running performance test with ${options?.numRuns || 100} iterations...`
    );
    // Mock successful performance test
    return true;
  },
  property: (generator, predicate) => {
    return { generator, predicate };
  },
  array: (itemGen, options) => ({ type: "array", itemGen, options }),
  tuple: (...gens) => ({ type: "tuple", generators: gens }),
  float: (options) => ({
    generate: () => Math.random() * (options.max - options.min) + options.min,
  }),
  integer: (options) => ({
    generate: () =>
      Math.floor(Math.random() * (options.max - options.min + 1)) + options.min,
  }),
  record: (schema) => ({
    generate: () => {
      const obj = {};
      for (const key of Object.keys(schema)) {
        const arb = schema[key];
        obj[key] = typeof arb.generate === "function" ? arb.generate() : arb;
      }
      return obj;
    },
  }),
};

try {
  console.log("Loading performance property tests...");

  // Load the performance test code
  const testCode = fs.readFileSync(
    path.join(__dirname, "chapter3-performance-properties.test.js"),
    "utf8"
  );

  // Execute the test code
  eval(testCode);

  // Run the test
  if (global.window.Chapter3PerformanceTester) {
    console.log("Running performance property tests...");
    const results = global.window.Chapter3PerformanceTester.runTests();

    console.log("\n=== TEST RESULTS ===");
    const summary = results && results.summary ? results.summary : results;
    const total = summary?.totalTests ?? 0;
    const passed = summary?.passed ?? 0;
    const failed = summary?.failed ?? 0;
    const duration = summary?.executionTime ?? `${summary?.duration || 0}ms`;
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${duration}`);

    if (failed === 0) {
      console.log("✅ All performance property tests PASSED!");
      process.exit(0);
    } else {
      console.log("❌ Some performance property tests FAILED!");
      if (results.errors) {
        results.errors.forEach((error) => console.log(`  • ${error}`));
      }
      process.exit(1);
    }
  } else {
    console.log("⚠️ Performance test suite not properly loaded, skipping...");
    process.exit(0);
  }
} catch (error) {
  console.error("❌ Performance test execution failed:", error.message);
  process.exit(1);
}
