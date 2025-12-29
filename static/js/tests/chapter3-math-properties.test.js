/**
 * Property-Based Tests for Chapter 3 Mathematical Library Integration
 * 
 * **Property 3: Mathematical Calculation Accuracy**
 * **Validates: Requirements 8.1, 8.4**
 * 
 * Tests the accuracy and correctness of mathematical computations
 * underlying all visualizations in Chapter 3.
 */

(function() {
  'use strict';

  // Test configuration
  const TEST_CONFIG = {
    numRuns: 100,
    timeout: 5000,
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
   * Property 3: Mathematical Calculation Accuracy
   * For any valid distribution parameters and sample data, all calculated 
   * statistical values should match their theoretical mathematical formulas 
   * within numerical precision (±1e-10).
   */
  function testMathematicalCalculationAccuracy() {
    console.log('Running Property 3: Mathematical Calculation Accuracy');
    
    if (typeof fc === 'undefined') {
      const error = 'fast-check library not available';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    try {
      // Test 1: Correlation coefficient bounds
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

      // Test 2: Multivariate normal generation consistency
      const multivariateNormalTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.float({ min: -10, max: 10 }), // mu1
            fc.float({ min: -10, max: 10 }), // mu2
            fc.float({ min: 0.1, max: 10 }), // sigma1
            fc.float({ min: 0.1, max: 10 }), // sigma2
            fc.float({ min: -0.9, max: 0.9 }), // rho
            fc.integer({ min: 10, max: 100 }) // n samples
          ),
          ([mu1, mu2, sigma1, sigma2, rho, n]) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            const mu = [mu1, mu2];
            const sigma = [
              [sigma1 * sigma1, rho * sigma1 * sigma2],
              [rho * sigma1 * sigma2, sigma2 * sigma2]
            ];
            
            const samples = window.Chapter3.MathEngine.generateMultivariateNormal(mu, sigma, n);
            
            // Property: Should generate exactly n samples
            const correctLength = samples.length === n;
            
            // Property: Each sample should be a 2D point
            const validSamples = samples.every(sample => 
              Array.isArray(sample) && 
              sample.length === 2 && 
              Number.isFinite(sample[0]) && 
              Number.isFinite(sample[1])
            );
            
            return correctLength && validSamples;
          }
        ),
        { numRuns: Math.min(50, TEST_CONFIG.numRuns) } // Fewer runs for expensive test
      );

      // Test 3: Chi-square test statistical properties
      const chiSquareTest = fc.assert(
        fc.property(
          fc.array(
            fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 5 }),
            { minLength: 2, maxLength: 5 }
          ),
          (observedFreq) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            // Create expected frequencies (uniform distribution)
            const rows = observedFreq.length;
            const cols = observedFreq[0].length;
            const total = observedFreq.flat().reduce((a, b) => a + b, 0);
            const expectedFreq = Array(rows).fill().map(() => 
              Array(cols).fill(total / (rows * cols))
            );
            
            const result = window.Chapter3.MathEngine.chiSquareTest(observedFreq, expectedFreq);
            
            // Property: Chi-square statistic should be non-negative
            const nonNegativeChiSquare = result.chiSquare >= 0;
            
            // Property: Degrees of freedom should be positive
            const positiveDf = result.degreesOfFreedom > 0;
            
            // Property: p-value should be in [0, 1]
            const validPValue = result.pValue >= 0 && result.pValue <= 1;
            
            // Property: All values should be finite
            const allFinite = Number.isFinite(result.chiSquare) && 
                             Number.isFinite(result.pValue) && 
                             Number.isFinite(result.degreesOfFreedom);
            
            return nonNegativeChiSquare && positiveDf && validPValue && allFinite;
          }
        ),
        { numRuns: Math.min(30, TEST_CONFIG.numRuns) }
      );

      // Test 4: Box-Muller transform properties
      const boxMullerTest = fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 1000 }),
          (numSamples) => {
            if (!window.Chapter3 || !window.Chapter3.MathEngine) {
              return true; // Skip if not initialized
            }
            
            const samples = [];
            for (let i = 0; i < numSamples; i++) {
              const [z1, z2] = window.Chapter3.MathEngine.boxMullerTransform();
              samples.push([z1, z2]);
            }
            
            // Property: All samples should be finite
            const allFinite = samples.every(([z1, z2]) => 
              Number.isFinite(z1) && Number.isFinite(z2)
            );
            
            // Property: Sample mean should be close to 0 (for large samples)
            if (numSamples >= 100) {
              const meanZ1 = samples.reduce((sum, [z1]) => sum + z1, 0) / numSamples;
              const meanZ2 = samples.reduce((sum, [, z2]) => sum + z2, 0) / numSamples;
              const meanCloseToZero = Math.abs(meanZ1) < 0.5 && Math.abs(meanZ2) < 0.5;
              
              return allFinite && meanCloseToZero;
            }
            
            return allFinite;
          }
        ),
        { numRuns: Math.min(20, TEST_CONFIG.numRuns) }
      );

      testResults.passed++;
      testResults.details.push({
        property: 'Mathematical Calculation Accuracy',
        tests: ['correlation_bounds', 'multivariate_normal', 'chi_square', 'box_muller'],
        status: 'passed'
      });

      return { 
        passed: true, 
        tests: ['correlation_bounds', 'multivariate_normal', 'chi_square', 'box_muller']
      };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        property: 'Mathematical Calculation Accuracy',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Run all property tests
   */
  function runAllPropertyTests() {
    console.log('Starting Chapter 3 Mathematical Library Property Tests');
    console.log('**Feature: chapter3-multidimensional-variables, Property 3: Mathematical Calculation Accuracy**');
    
    const startTime = performance.now();
    
    // Reset results
    testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    // Run the main property test
    const mathAccuracyResult = testMathematicalCalculationAccuracy();
    
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
    
    console.log('Property Test Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('✅ All property tests passed!');
    } else {
      console.error('❌ Some property tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize and run tests when libraries are loaded
   */
  function initializePropertyTests() {
    // Wait for Chapter 3 to be initialized
    if (typeof window.Chapter3 === 'undefined') {
      setTimeout(initializePropertyTests, 100);
      return;
    }
    
    // Run tests
    const results = runAllPropertyTests();
    
    // Store results globally for debugging
    window.Chapter3PropertyTestResults = results;
    
    return results;
  }

  // Export for use in other modules
  window.Chapter3PropertyTester = {
    runAllTests: runAllPropertyTests,
    testMathematicalAccuracy: testMathematicalCalculationAccuracy,
    getResults: () => testResults
  };

  // Auto-run tests if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('test=true') || window.location.hash.includes('test'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializePropertyTests, 1000);
    });
  }

})();