/**
 * Chapter 3 Comprehensive Test Runner
 * 
 * Coordinates and runs all Chapter 3 tests:
 * - Property-based tests for mathematical accuracy
 * - Integration tests for cross-component communication
 * - Performance tests for real-time updates
 * - Cross-browser compatibility validation
 */

(function() {
  'use strict';

  // Test runner configuration
  const TEST_RUNNER_CONFIG = {
    timeout: 30000, // 30 seconds total timeout
    retryAttempts: 2,
    verbose: true,
    generateReport: true
  };

  // Global test results
  let globalTestResults = {
    startTime: null,
    endTime: null,
    duration: 0,
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    suites: {},
    errors: [],
    performance: [],
    browserInfo: {},
    summary: null
  };

  /**
   * Collect browser and environment information
   */
  function collectBrowserInfo() {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString()
    };

    // Detect browser
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) info.browser = 'Chrome';
    else if (ua.includes('Firefox')) info.browser = 'Firefox';
    else if (ua.includes('Safari')) info.browser = 'Safari';
    else if (ua.includes('Edge')) info.browser = 'Edge';
    else info.browser = 'Unknown';

    // Detect device type
    if (/Mobi|Android/i.test(ua)) info.deviceType = 'Mobile';
    else if (/Tablet|iPad/i.test(ua)) info.deviceType = 'Tablet';
    else info.deviceType = 'Desktop';

    // Check for required APIs
    info.apis = {
      webgl: !!window.WebGLRenderingContext,
      canvas: !!window.CanvasRenderingContext2D,
      requestAnimationFrame: !!window.requestAnimationFrame,
      performance: !!window.performance,
      plotly: typeof Plotly !== 'undefined',
      d3: typeof d3 !== 'undefined',
      fastCheck: typeof fc !== 'undefined'
    };

    return info;
  }

  /**
   * Run a test suite with error handling and retries
   */
  async function runTestSuite(suiteName, testFunction, maxRetries = TEST_RUNNER_CONFIG.retryAttempts) {
    console.log(`\n🧪 Running test suite: ${suiteName}`);
    
    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} for ${suiteName}`);
        }
        
        const startTime = performance.now();
        const result = await testFunction();
        const endTime = performance.now();
        
        const suiteResult = {
          name: suiteName,
          status: 'passed',
          duration: Math.round(endTime - startTime),
          attempt: attempt + 1,
          result: result,
          timestamp: new Date().toISOString()
        };
        
        globalTestResults.suites[suiteName] = suiteResult;
        globalTestResults.totalPassed += result.passed || 0;
        globalTestResults.totalFailed += result.failed || 0;
        globalTestResults.totalTests += (result.passed || 0) + (result.failed || 0);
        
        if (result.performance) {
          globalTestResults.performance.push({
            suite: suiteName,
            ...result.performance
          });
        }
        
        console.log(`✅ ${suiteName} completed successfully in ${suiteResult.duration}ms`);
        return suiteResult;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ ${suiteName} failed (attempt ${attempt + 1}):`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // All attempts failed
    const suiteResult = {
      name: suiteName,
      status: 'failed',
      duration: 0,
      attempt: maxRetries + 1,
      error: lastError.message,
      timestamp: new Date().toISOString()
    };
    
    globalTestResults.suites[suiteName] = suiteResult;
    globalTestResults.errors.push(`${suiteName}: ${lastError.message}`);
    
    return suiteResult;
  }

  /**
   * Wait for Chapter 3 to be fully initialized
   */
  function waitForChapter3Initialization() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Chapter 3 initialization timeout'));
      }, 10000);
      
      function checkInitialization() {
        if (typeof window.chapter3Visualizer !== 'undefined' && 
            window.chapter3Visualizer.currentSamples &&
            window.chapter3Visualizer.canvases) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkInitialization, 100);
        }
      }
      
      checkInitialization();
    });
  }

  /**
   * Run navigation property tests
   */
  async function runNavigationTests() {
    if (typeof window.Chapter3NavigationTester === 'undefined') {
      throw new Error('Navigation test suite not loaded');
    }
    
    return window.Chapter3NavigationTester.runTests();
  }

  /**
   * Run mathematical accuracy tests
   */
  async function runMathematicalTests() {
    if (typeof window.Chapter3CorrelationTester === 'undefined') {
      throw new Error('Mathematical test suite not loaded');
    }
    
    return window.Chapter3CorrelationTester.runTests();
  }

  /**
   * Run statistical test correctness tests
   */
  async function runStatisticalTests() {
    if (typeof window.Chapter3StatisticalTester === 'undefined') {
      throw new Error('Statistical test suite not loaded');
    }
    
    return window.Chapter3StatisticalTester.runTests();
  }

  /**
   * Run probability conservation tests
   */
  async function runProbabilityConservationTests() {
    if (typeof window.Chapter3ProbabilityConservationTester === 'undefined') {
      throw new Error('Probability conservation test suite not loaded');
    }
    
    return window.Chapter3ProbabilityConservationTester.runTests();
  }

  /**
   * Run performance consistency tests
   */
  async function runPerformanceTests() {
    if (typeof window.Chapter3PerformanceTester === 'undefined') {
      throw new Error('Performance test suite not loaded');
    }
    
    return window.Chapter3PerformanceTester.runTests();
  }

  /**
   * Run integration tests
   */
  async function runIntegrationTests() {
    if (typeof window.Chapter3IntegrationTester === 'undefined') {
      throw new Error('Integration test suite not loaded');
    }
    
    return window.Chapter3IntegrationTester.runTests();
  }

  /**
   * Generate comprehensive test report
   */
  function generateTestReport() {
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration: globalTestResults.duration,
        browser: globalTestResults.browserInfo,
        testRunner: 'Chapter3TestRunner v1.0'
      },
      summary: {
        totalSuites: Object.keys(globalTestResults.suites).length,
        totalTests: globalTestResults.totalTests,
        totalPassed: globalTestResults.totalPassed,
        totalFailed: globalTestResults.totalFailed,
        successRate: globalTestResults.totalTests > 0 ? 
          ((globalTestResults.totalPassed / globalTestResults.totalTests) * 100).toFixed(2) + '%' : '0%',
        overallStatus: globalTestResults.totalFailed === 0 ? 'PASSED' : 'FAILED'
      },
      suites: globalTestResults.suites,
      performance: globalTestResults.performance,
      errors: globalTestResults.errors,
      recommendations: generateRecommendations()
    };

    globalTestResults.summary = report;
    return report;
  }

  /**
   * Generate recommendations based on test results
   */
  function generateRecommendations() {
    const recommendations = [];
    
    // Performance recommendations
    const avgUpdateTime = globalTestResults.performance
      .filter(p => p.updateTime)
      .reduce((sum, p, _, arr) => sum + p.updateTime / arr.length, 0);
      
    if (avgUpdateTime > 50) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `Average update time (${avgUpdateTime.toFixed(2)}ms) is high. Consider optimizing visualization rendering.`
      });
    }
    
    // Browser compatibility recommendations
    const browserInfo = globalTestResults.browserInfo;
    if (!browserInfo.apis.webgl) {
      recommendations.push({
        type: 'compatibility',
        priority: 'medium',
        message: 'WebGL not available. 3D visualizations may not work properly.'
      });
    }
    
    if (!browserInfo.apis.fastCheck) {
      recommendations.push({
        type: 'testing',
        priority: 'low',
        message: 'fast-check library not loaded. Property-based tests may be skipped.'
      });
    }
    
    // Error-based recommendations
    if (globalTestResults.errors.length > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `${globalTestResults.errors.length} test failures detected. Review error details and fix underlying issues.`
      });
    }
    
    // Success recommendations
    if (globalTestResults.totalFailed === 0) {
      recommendations.push({
        type: 'success',
        priority: 'info',
        message: 'All tests passed! The Chapter 3 implementation is working correctly.'
      });
    }
    
    return recommendations;
  }

  /**
   * Display test results in console
   */
  function displayResults(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CHAPTER 3 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`🕒 Duration: ${report.metadata.duration}ms`);
    console.log(`🌐 Browser: ${report.metadata.browser.browser} on ${report.metadata.browser.platform}`);
    console.log(`📱 Device: ${report.metadata.browser.deviceType} (${report.metadata.browser.viewport})`);
    
    console.log('\n📈 Test Statistics:');
    console.log(`  Total Suites: ${report.summary.totalSuites}`);
    console.log(`  Total Tests: ${report.summary.totalTests}`);
    console.log(`  Passed: ${report.summary.totalPassed} ✅`);
    console.log(`  Failed: ${report.summary.totalFailed} ❌`);
    console.log(`  Success Rate: ${report.summary.successRate}`);
    console.log(`  Overall Status: ${report.summary.overallStatus}`);
    
    if (report.performance.length > 0) {
      console.log('\n⚡ Performance Metrics:');
      report.performance.forEach(perf => {
        console.log(`  ${perf.suite}: ${JSON.stringify(perf, null, 2)}`);
      });
    }
    
    if (report.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        const icon = rec.priority === 'high' ? '🔴' : 
                    rec.priority === 'medium' ? '🟡' : 
                    rec.priority === 'low' ? '🟢' : 'ℹ️';
        console.log(`  ${icon} [${rec.type.toUpperCase()}] ${rec.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Main test runner function
   */
  async function runAllTests() {
    console.log('🚀 Starting Chapter 3 Comprehensive Test Suite');
    console.log('Testing all components, integrations, and cross-browser compatibility...\n');
    
    globalTestResults.startTime = performance.now();
    globalTestResults.browserInfo = collectBrowserInfo();
    
    try {
      // Wait for Chapter 3 initialization
      console.log('⏳ Waiting for Chapter 3 initialization...');
      await waitForChapter3Initialization();
      console.log('✅ Chapter 3 initialized successfully');
      
      // Define test suites to run
      const testSuites = [
        { name: 'Integration Tests', fn: runIntegrationTests },
        { name: 'Mathematical Accuracy Tests', fn: runMathematicalTests },
        { name: 'Navigation Tests', fn: runNavigationTests }
      ];
      
      // Optional test suites (run if available)
      const optionalSuites = [
        { name: 'Statistical Test Correctness', fn: runStatisticalTests },
        { name: 'Probability Conservation Tests', fn: runProbabilityConservationTests },
        { name: 'Performance Consistency Tests', fn: runPerformanceTests }
      ];
      
      // Run core test suites
      for (const suite of testSuites) {
        await runTestSuite(suite.name, suite.fn);
      }
      
      // Run optional test suites (don't fail if they're not available)
      for (const suite of optionalSuites) {
        try {
          await runTestSuite(suite.name, suite.fn, 0); // No retries for optional suites
        } catch (error) {
          console.log(`⚠️ Optional suite '${suite.name}' skipped: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.error('💥 Test runner failed:', error.message);
      globalTestResults.errors.push(`Test Runner: ${error.message}`);
    }
    
    globalTestResults.endTime = performance.now();
    globalTestResults.duration = Math.round(globalTestResults.endTime - globalTestResults.startTime);
    
    // Generate and display report
    const report = generateTestReport();
    displayResults(report);
    
    // Store results globally for debugging
    window.Chapter3TestResults = globalTestResults;
    
    return report;
  }

  /**
   * Initialize test runner
   */
  function initializeTestRunner() {
    // Check if we're in a test environment
    const isTestEnvironment = window.location && (
      window.location.search.includes('test=true') ||
      window.location.search.includes('run-tests=true') ||
      window.location.hash.includes('test')
    );
    
    if (isTestEnvironment) {
      console.log('🔍 Test environment detected, starting tests...');
      
      // Wait for DOM and all scripts to load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(runAllTests, 2000);
        });
      } else {
        setTimeout(runAllTests, 2000);
      }
    }
  }

  // Export test runner
  window.Chapter3TestRunner = {
    runAllTests,
    runTestSuite,
    generateTestReport,
    getResults: () => globalTestResults,
    collectBrowserInfo
  };

  // Auto-initialize if in test environment
  initializeTestRunner();

})();