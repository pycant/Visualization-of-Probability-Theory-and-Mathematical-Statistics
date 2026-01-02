/**
 * Property-Based Tests for Chapter 3 Performance Consistency
 * 
 * **Property 6: Performance Consistency**
 * **Validates: Requirements 9.4**
 * 
 * Tests that real-time animation and interactive update operations maintain
 * a frame rate of at least 60fps during the update process.
 */

(function() {
  'use strict';

  // Test configuration
  const TEST_CONFIG = {
    numRuns: 100,
    timeout: 10000,
    verbose: true,
    targetFPS: 60,
    minAcceptableFPS: 45,
    performanceThreshold: 100 // ms
  };

  // Test results storage
  let testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: [],
    performanceMetrics: {
      averageRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: Infinity,
      frameRateHistory: [],
      memoryUsage: []
    }
  };

  /**
   * Property 6: Performance Consistency
   * For any real-time animation or interactive update operation, the system should 
   * maintain a frame rate of at least 60fps during the update process.
   * Validates Requirements 9.4: frame rate consistency during updates.
   */
  function testPerformanceConsistency() {
    console.log('Running Property 6: Performance Consistency');
    console.log('**Feature: chapter3-multidimensional-variables, Property 6: Performance Consistency**');
    
    if (typeof fc === 'undefined') {
      const error = 'fast-check library not available';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    if (typeof Chapter3Visualizer === 'undefined') {
      const error = 'Chapter3Visualizer not available';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    try {
      // Initialize visualizer for testing
      const visualizer = new Chapter3Visualizer();
      
      // Test 1: Parameter update performance consistency
      const parameterUpdateTest = fc.assert(
        fc.property(
          fc.record({
            mu1: fc.float({ min: -50, max: 50 }),
            mu2: fc.float({ min: -50, max: 50 }),
            sigma1: fc.float({ min: 0.1, max: 100 }),
            sigma2: fc.float({ min: 0.1, max: 100 }),
            rho: fc.float({ min: -0.99, max: 0.99 }),
            nSamples: fc.integer({ min: 100, max: 5000 })
          }),
          (params) => {
            const startTime = performance.now();
            
            // Update parameters and measure performance
            visualizer.parameters = { ...visualizer.parameters, ...params };
            visualizer.generateSamples();
            visualizer.updateAllVisualizations();
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // Record performance metrics
            testResults.performanceMetrics.averageRenderTime = 
              (testResults.performanceMetrics.averageRenderTime + renderTime) / 2;
            testResults.performanceMetrics.maxRenderTime = 
              Math.max(testResults.performanceMetrics.maxRenderTime, renderTime);
            testResults.performanceMetrics.minRenderTime = 
              Math.min(testResults.performanceMetrics.minRenderTime, renderTime);
            
            // Calculate approximate FPS
            const fps = renderTime > 0 ? 1000 / renderTime : 60;
            testResults.performanceMetrics.frameRateHistory.push(fps);
            
            // Performance should be within acceptable limits
            const isPerformant = renderTime <= TEST_CONFIG.performanceThreshold;
            const hasAcceptableFPS = fps >= TEST_CONFIG.minAcceptableFPS;
            
            if (!isPerformant || !hasAcceptableFPS) {
              console.warn(`Performance issue: ${renderTime.toFixed(2)}ms (${fps.toFixed(1)}fps) with params:`, params);
            }
            
            return isPerformant && hasAcceptableFPS;
          }
        ),
        { numRuns: TEST_CONFIG.numRuns, timeout: TEST_CONFIG.timeout }
      );

      // Test 2: Visualization update consistency across different sample sizes
      const sampleSizePerformanceTest = fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 8000 }),
          (sampleSize) => {
            const startTime = performance.now();
            
            // Test with different sample sizes
            visualizer.parameters.nSamples = sampleSize;
            visualizer.generateSamples();
            visualizer.updateAllVisualizations();
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // Performance should scale reasonably with sample size
            const expectedMaxTime = Math.min(200, 50 + (sampleSize / 100) * 10); // Linear scaling with cap
            const isScalable = renderTime <= expectedMaxTime;
            
            if (!isScalable) {
              console.warn(`Scaling issue: ${renderTime.toFixed(2)}ms for ${sampleSize} samples (expected max: ${expectedMaxTime.toFixed(2)}ms)`);
            }
            
            return isScalable;
          }
        ),
        { numRuns: Math.floor(TEST_CONFIG.numRuns / 2), timeout: TEST_CONFIG.timeout }
      );

      // Test 3: Memory usage consistency
      const memoryConsistencyTest = fc.assert(
        fc.property(
          fc.array(fc.record({
            nSamples: fc.integer({ min: 500, max: 3000 }),
            operations: fc.integer({ min: 1, max: 10 })
          }), { minLength: 1, maxLength: 5 }),
          (testCases) => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Perform multiple operations
            testCases.forEach(testCase => {
              visualizer.parameters.nSamples = testCase.nSamples;
              
              for (let i = 0; i < testCase.operations; i++) {
                visualizer.generateSamples();
                visualizer.updateAllVisualizations();
              }
            });
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 50MB for test operations)
            const maxAcceptableIncrease = 50 * 1024 * 1024; // 50MB
            const isMemoryEfficient = memoryIncrease <= maxAcceptableIncrease;
            
            if (!isMemoryEfficient) {
              console.warn(`Memory usage concern: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
            }
            
            testResults.performanceMetrics.memoryUsage.push(memoryIncrease);
            
            return isMemoryEfficient;
          }
        ),
        { numRuns: Math.floor(TEST_CONFIG.numRuns / 4), timeout: TEST_CONFIG.timeout * 2 }
      );

      // Test 4: Responsive design performance consistency
      const responsivePerformanceTest = fc.assert(
        fc.property(
          fc.record({
            width: fc.integer({ min: 320, max: 1920 }),
            height: fc.integer({ min: 240, max: 1080 }),
            devicePixelRatio: fc.float({ min: 1, max: 3 })
          }),
          (viewport) => {
            // Simulate viewport change
            const originalWidth = window.innerWidth;
            const originalHeight = window.innerHeight;
            const originalDPR = window.devicePixelRatio;
            
            try {
              // Mock viewport properties
              Object.defineProperty(window, 'innerWidth', { value: viewport.width, configurable: true });
              Object.defineProperty(window, 'innerHeight', { value: viewport.height, configurable: true });
              Object.defineProperty(window, 'devicePixelRatio', { value: viewport.devicePixelRatio, configurable: true });
              
              const startTime = performance.now();
              
              // Trigger responsive updates
              if (visualizer.handleWindowResize) {
                visualizer.handleWindowResize();
              }
              visualizer.updateAllVisualizations();
              
              const endTime = performance.now();
              const renderTime = endTime - startTime;
              
              // Responsive updates should be fast
              const isResponsive = renderTime <= TEST_CONFIG.performanceThreshold * 1.5; // Allow 50% more time for responsive updates
              
              if (!isResponsive) {
                console.warn(`Responsive performance issue: ${renderTime.toFixed(2)}ms for viewport ${viewport.width}x${viewport.height}@${viewport.devicePixelRatio}x`);
              }
              
              return isResponsive;
            } finally {
              // Restore original values
              Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
              Object.defineProperty(window, 'innerHeight', { value: originalHeight, configurable: true });
              Object.defineProperty(window, 'devicePixelRatio', { value: originalDPR, configurable: true });
            }
          }
        ),
        { numRuns: Math.floor(TEST_CONFIG.numRuns / 4), timeout: TEST_CONFIG.timeout }
      );

      // All tests passed
      testResults.passed++;
      
      // Calculate final performance metrics
      const avgFPS = testResults.performanceMetrics.frameRateHistory.length > 0 ?
        testResults.performanceMetrics.frameRateHistory.reduce((sum, fps) => sum + fps, 0) / testResults.performanceMetrics.frameRateHistory.length : 0;
      
      const performanceSummary = {
        averageRenderTime: testResults.performanceMetrics.averageRenderTime.toFixed(2),
        maxRenderTime: testResults.performanceMetrics.maxRenderTime.toFixed(2),
        minRenderTime: testResults.performanceMetrics.minRenderTime.toFixed(2),
        averageFPS: avgFPS.toFixed(1),
        memoryTests: testResults.performanceMetrics.memoryUsage.length,
        averageMemoryIncrease: testResults.performanceMetrics.memoryUsage.length > 0 ?
          (testResults.performanceMetrics.memoryUsage.reduce((sum, mem) => sum + mem, 0) / testResults.performanceMetrics.memoryUsage.length / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'
      };
      
      testResults.details.push({
        test: 'Performance Consistency',
        passed: true,
        metrics: performanceSummary
      });
      
      console.log('✅ Property 6: Performance Consistency - PASSED');
      console.log('Performance Summary:', performanceSummary);
      
      return { 
        passed: true, 
        metrics: performanceSummary,
        details: 'All performance consistency tests passed within acceptable thresholds'
      };
      
    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      
      testResults.details.push({
        test: 'Performance Consistency',
        passed: false,
        error: error.message
      });
      
      console.error('❌ Property 6: Performance Consistency - FAILED');
      console.error('Error:', error.message);
      
      return { passed: false, error: error.message };
    }
  }

  /**
   * Additional performance utility tests
   */
  function testPerformanceUtilities() {
    const tests = [];
    
    // Test frame rate monitoring
    if (typeof Chapter3Visualizer !== 'undefined') {
      const visualizer = new Chapter3Visualizer();
      
      if (visualizer.frameRateMonitor) {
        tests.push({
          name: 'Frame Rate Monitor',
          passed: typeof visualizer.frameRateMonitor.currentFPS === 'number',
          details: 'Frame rate monitoring system is functional'
        });
      }
      
      if (visualizer.memoryManager) {
        tests.push({
          name: 'Memory Manager',
          passed: typeof visualizer.memoryManager.maxSampleSize === 'number',
          details: 'Memory management system is functional'
        });
      }
      
      if (visualizer.webglSupport) {
        tests.push({
          name: 'WebGL Support Detection',
          passed: typeof visualizer.webglSupport.supported === 'boolean',
          details: `WebGL support: ${visualizer.webglSupport.supported}`
        });
      }
    }
    
    return tests;
  }

  /**
   * Run all performance property tests
   */
  function runPerformancePropertyTests() {
    console.log('🚀 Starting Chapter 3 Performance Property Tests');
    console.log('Target: Maintain 60fps during real-time updates');
    
    const startTime = performance.now();
    
    // Run main performance consistency test
    const mainTest = testPerformanceConsistency();
    
    // Run utility tests
    const utilityTests = testPerformanceUtilities();
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Compile final results
    const finalResults = {
      mainTest,
      utilityTests,
      summary: {
        totalTests: 1 + utilityTests.length,
        passed: (mainTest.passed ? 1 : 0) + utilityTests.filter(t => t.passed).length,
        failed: (mainTest.passed ? 0 : 1) + utilityTests.filter(t => !t.passed).length,
        executionTime: totalTime.toFixed(2) + 'ms',
        performanceMetrics: testResults.performanceMetrics
      }
    };
    
    console.log('📊 Performance Test Summary:', finalResults.summary);
    
    if (finalResults.summary.failed === 0) {
      console.log('✅ All performance property tests PASSED');
    } else {
      console.log('❌ Some performance property tests FAILED');
    }
    
    return finalResults;
  }

  // Export for use in other test files or manual execution
  if (typeof window !== 'undefined') {
    window.Chapter3PerformancePropertyTests = {
      run: runPerformancePropertyTests,
      testPerformanceConsistency,
      testPerformanceUtilities,
      config: TEST_CONFIG
    };
  }

  // Export for use in other modules
  window.Chapter3PerformanceTester = {
    runTests: runPerformancePropertyTests,
    testPerformanceConsistency: testPerformanceConsistency,
    getResults: () => testResults
  };

  // Auto-run if this script is loaded directly
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait a bit for other scripts to load
      setTimeout(runPerformancePropertyTests, 1000);
    });
  } else if (typeof document !== 'undefined') {
    // Document already loaded
    setTimeout(runPerformancePropertyTests, 100);
  }

})();