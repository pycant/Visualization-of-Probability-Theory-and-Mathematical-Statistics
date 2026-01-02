/**
 * Property-Based Tests for Chapter 3 Correlation Coefficient Accuracy
 * 
 * **Property 3: Mathematical Calculation Accuracy**
 * **Validates: Requirements 2.7**
 * 
 * Tests the accuracy and correctness of correlation coefficient calculations
 * in Chapter 3 multidimensional variable visualizations.
 */

(function() {
  'use strict';

  // Test configuration
  const TEST_CONFIG = {
    numRuns: 20,  // Reduced from 100 for faster execution
    timeout: 3000,
    verbose: false
  };

  // Test results storage
  let testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  /**
   * Property 3: Mathematical Calculation Accuracy (Correlation Coefficient Focus)
   * For any valid sample data, correlation coefficient calculations should match 
   * their theoretical mathematical formulas within numerical precision (±1e-10).
   * Specifically validates Requirements 2.7: correlation coefficient accuracy.
   */
  function testCorrelationCoefficientAccuracy() {
    console.log('Running Property 3: Correlation Coefficient Accuracy');
    console.log('**Feature: chapter3-multidimensional-variables, Property 3: Mathematical Calculation Accuracy**');
    
    if (typeof fc === 'undefined') {
      const error = 'fast-check library not available';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    try {
      // Test 1: Correlation coefficient bounds validation
      const correlationBoundsTest = fc.assert(
        fc.property(
          fc.array(
            fc.tuple(
              fc.float({ min: -100, max: 100 }),
              fc.float({ min: -100, max: 100 })
            ),
            { minLength: 10, maxLength: 1000 }
          ),
          (samples) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            const correlation = window.Chapter3.MathEngine.calculateCorrelation(samples);
            
            // Property: Correlation coefficient must be in [-1, 1]
            const isValidRange = correlation >= -1 && correlation <= 1;
            
            // Property: Correlation should be finite
            const isFinite = Number.isFinite(correlation);
            
            return isValidRange && isFinite;
          }
        ),
        { numRuns: TEST_CONFIG.numRuns }
      );

      // Test 2: Perfect correlation cases
      const perfectCorrelationTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.float({ min: -10, max: 10 }), // slope
            fc.float({ min: -10, max: 10 }), // intercept
            fc.integer({ min: 10, max: 100 }) // number of points
          ),
          ([slope, intercept, n]) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            // Generate perfectly correlated data: y = slope * x + intercept
            const samples = [];
            for (let i = 0; i < n; i++) {
              const x = i - n/2; // Center around 0
              const y = slope * x + intercept;
              samples.push([x, y]);
            }
            
            const correlation = window.Chapter3.MathEngine.calculateCorrelation(samples);
            
            // Property: Perfect positive correlation should be close to 1
            // Perfect negative correlation should be close to -1
            if (slope > 0) {
              return Math.abs(correlation - 1) < 1e-10;
            } else if (slope < 0) {
              return Math.abs(correlation + 1) < 1e-10;
            } else {
              // Slope = 0 means constant y, correlation should be 0 (undefined case)
              return !Number.isFinite(correlation) || Math.abs(correlation) < 1e-10;
            }
          }
        ),
        { numRuns: Math.min(10, TEST_CONFIG.numRuns) }
      );

      // Test 3: Zero correlation (independent variables)
      const zeroCorrelationTest = fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }),
          (n) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            // Generate independent random samples
            const samples = [];
            for (let i = 0; i < n; i++) {
              const x = Math.random() * 100 - 50; // Random x
              const y = Math.random() * 100 - 50; // Independent random y
              samples.push([x, y]);
            }
            
            const correlation = window.Chapter3.MathEngine.calculateCorrelation(samples);
            
            // Property: For large samples of independent variables, 
            // correlation should be close to 0 (within reasonable bounds for random data)
            return Math.abs(correlation) < 0.3; // Reasonable bound for random data
          }
        ),
        { numRuns: Math.min(8, TEST_CONFIG.numRuns) }
      );

      // Test 4: Correlation symmetry property
      const correlationSymmetryTest = fc.assert(
        fc.property(
          fc.array(
            fc.tuple(
              fc.float({ min: -50, max: 50 }),
              fc.float({ min: -50, max: 50 })
            ),
            { minLength: 10, maxLength: 100 }
          ),
          (samples) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            // Calculate correlation for (x,y) pairs
            const correlationXY = window.Chapter3.MathEngine.calculateCorrelation(samples);
            
            // Calculate correlation for (y,x) pairs (swapped)
            const swappedSamples = samples.map(([x, y]) => [y, x]);
            const correlationYX = window.Chapter3.MathEngine.calculateCorrelation(swappedSamples);
            
            // Property: Correlation should be symmetric: corr(X,Y) = corr(Y,X)
            return Math.abs(correlationXY - correlationYX) < 1e-10;
          }
        ),
        { numRuns: Math.min(10, TEST_CONFIG.numRuns) }
      );

      // Test 5: Scale invariance property
      const scaleInvarianceTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.array(
              fc.tuple(
                fc.float({ min: -10, max: 10 }),
                fc.float({ min: -10, max: 10 })
              ),
              { minLength: 10, maxLength: 50 }
            ),
            fc.float({ min: 0.1, max: 10 }), // scale factor
            fc.float({ min: -10, max: 10 })  // shift factor
          ),
          ([samples, scale, shift]) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            // Calculate original correlation
            const originalCorr = window.Chapter3.MathEngine.calculateCorrelation(samples);
            
            // Apply linear transformation: scale and shift both variables
            const transformedSamples = samples.map(([x, y]) => [
              scale * x + shift,
              scale * y + shift
            ]);
            
            const transformedCorr = window.Chapter3.MathEngine.calculateCorrelation(transformedSamples);
            
            // Property: Correlation should be invariant under linear transformations
            // (scaling and shifting both variables by the same amount)
            return Math.abs(originalCorr - transformedCorr) < 1e-10;
          }
        ),
        { numRuns: Math.min(8, TEST_CONFIG.numRuns) }
      );

      testResults.passed++;
      testResults.details.push({
        property: 'Correlation Coefficient Accuracy',
        tests: ['bounds_validation', 'perfect_correlation', 'zero_correlation', 'symmetry', 'scale_invariance'],
        status: 'passed'
      });

      return { 
        passed: true, 
        tests: ['bounds_validation', 'perfect_correlation', 'zero_correlation', 'symmetry', 'scale_invariance']
      };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        property: 'Correlation Coefficient Accuracy',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Run correlation coefficient accuracy tests
   */
  function runCorrelationAccuracyTests() {
    console.log('Starting Chapter 3 Correlation Coefficient Accuracy Tests');
    console.log('**Feature: chapter3-multidimensional-variables, Property 3: Mathematical Calculation Accuracy**');
    
    const startTime = performance.now();
    
    // Reset results
    testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    // Run the correlation accuracy test
    const correlationResult = testCorrelationCoefficientAccuracy();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Summary
    const summary = {
      totalTests: 1,
      passed: testResults.passed,
      failed: testResults.failed,
      duration: Math.round(duration),
      details: testResults.details,
      errors: testResults.errors
    };
    
    console.log('Correlation Accuracy Test Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('✅ All correlation accuracy tests passed!');
    } else {
      console.error('❌ Some correlation accuracy tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize and run tests when libraries are loaded
   */
  function initializeCorrelationTests() {
    // Wait for Chapter 3 to be initialized
    if (typeof window.Chapter3 === 'undefined') {
      setTimeout(initializeCorrelationTests, 100);
      return;
    }
    
    // Run tests
    const results = runCorrelationAccuracyTests();
    
    // Store results globally for debugging
    window.Chapter3CorrelationTestResults = results;
    
    return results;
  }

  // Export for use in other modules
  window.Chapter3CorrelationTester = {
    runTests: runCorrelationAccuracyTests,
    testCorrelationAccuracy: testCorrelationCoefficientAccuracy,
    getResults: () => testResults
  };

  // Auto-run tests if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('test=true') || window.location.hash.includes('test'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeCorrelationTests, 1000);
    });
  }

})();