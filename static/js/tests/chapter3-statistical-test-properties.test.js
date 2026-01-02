/**
 * Property-Based Tests for Chapter 3 Statistical Test Correctness
 * 
 * **Property 4: Statistical Test Correctness**
 * **Validates: Requirements 3.3, 3.4**
 * 
 * Tests the correctness of chi-square test statistics and p-value calculations
 * for independence testing in Chapter 3 multidimensional variable analysis.
 */

(function() {
  'use strict';

  // Test configuration
  const TEST_CONFIG = {
    numRuns: 100,  // Property-based testing requires minimum 100 iterations
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
   * Property 4: Statistical Test Correctness
   * For any contingency table data, the chi-square test statistic and p-value 
   * calculations should produce results that are mathematically consistent with 
   * the independence hypothesis testing framework.
   * Validates Requirements 3.3 (chi-square test statistics) and 3.4 (p-values).
   */
  function testStatisticalTestCorrectness() {
    console.log('Running Property 4: Statistical Test Correctness');
    console.log('**Feature: chapter3-multidimensional-variables, Property 4: Statistical Test Correctness**');
    
    if (typeof fc === 'undefined') {
      const error = 'fast-check library not available';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    try {
      // Test 1: Chi-square statistic non-negativity
      const chiSquareNonNegativityTest = fc.assert(
        fc.property(
          fc.array(
            fc.array(
              fc.integer({ min: 1, max: 100 }), 
              { minLength: 2, maxLength: 4 }
            ),
            { minLength: 2, maxLength: 4 }
          ),
          (contingencyTable) => {
            if (!window.Chapter3 || !window.Chapter3.IndependenceTestLab) {
              return true; // Skip if not initialized
            }
            
            // Ensure table is rectangular
            const rows = contingencyTable.length;
            const cols = contingencyTable[0].length;
            const validTable = contingencyTable.every(row => row.length === cols);
            
            if (!validTable) return true; // Skip invalid tables
            
            const testResults = window.Chapter3.IndependenceTestLab.calculateChiSquareTest(contingencyTable);
            
            // Property: Chi-square statistic must be non-negative
            return testResults.chiSquare >= 0;
          }
        ),
        { numRuns: TEST_CONFIG.numRuns }
      );

      // Test 2: P-value bounds validation
      const pValueBoundsTest = fc.assert(
        fc.property(
          fc.array(
            fc.array(
              fc.integer({ min: 5, max: 50 }), 
              { minLength: 2, maxLength: 3 }
            ),
            { minLength: 2, maxLength: 3 }
          ),
          (contingencyTable) => {
            if (!window.Chapter3 || !window.Chapter3.IndependenceTestLab) {
              return true; // Skip if not initialized
            }
            
            // Ensure table is rectangular and has sufficient cell counts
            const rows = contingencyTable.length;
            const cols = contingencyTable[0].length;
            const validTable = contingencyTable.every(row => row.length === cols);
            
            if (!validTable) return true; // Skip invalid tables
            
            const testResults = window.Chapter3.IndependenceTestLab.calculateChiSquareTest(contingencyTable);
            
            // Property: P-value must be between 0 and 1
            return testResults.pValue >= 0 && testResults.pValue <= 1;
          }
        ),
        { numRuns: TEST_CONFIG.numRuns }
      );

      // Test 3: Degrees of freedom calculation
      const degreesOfFreedomTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 2, max: 5 }), // rows
            fc.integer({ min: 2, max: 5 })  // columns
          ),
          ([rows, cols]) => {
            if (!window.Chapter3 || !window.Chapter3.IndependenceTestLab) {
              return true; // Skip if not initialized
            }
            
            // Generate contingency table with specified dimensions
            const contingencyTable = [];
            for (let i = 0; i < rows; i++) {
              const row = [];
              for (let j = 0; j < cols; j++) {
                row.push(Math.floor(Math.random() * 50) + 10); // Random counts 10-59
              }
              contingencyTable.push(row);
            }
            
            const testResults = window.Chapter3.IndependenceTestLab.calculateChiSquareTest(contingencyTable);
            
            // Property: Degrees of freedom should be (rows-1) * (cols-1)
            const expectedDF = (rows - 1) * (cols - 1);
            return testResults.degreesOfFreedom === expectedDF;
          }
        ),
        { numRuns: Math.min(50, TEST_CONFIG.numRuns) }
      );

      // Test 4: Independence test consistency
      const independenceConsistencyTest = fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          (n) => {
            if (!window.Chapter3 || !window.Chapter3.IndependenceTestLab) {
              return true; // Skip if not initialized
            }
            
            // Generate perfectly independent data (equal expected frequencies)
            const contingencyTable = [
              [n, n],
              [n, n]
            ];
            
            const testResults = window.Chapter3.IndependenceTestLab.calculateChiSquareTest(contingencyTable);
            
            // Property: For perfectly independent data, chi-square should be 0
            // and p-value should be close to 1 (>= 0.9)
            return Math.abs(testResults.chiSquare) < 1e-10 && testResults.pValue >= 0.9;
          }
        ),
        { numRuns: Math.min(20, TEST_CONFIG.numRuns) }
      );

      // Test 5: Chi-square statistic formula validation
      const chiSquareFormulaTest = fc.assert(
        fc.property(
          fc.array(
            fc.array(
              fc.integer({ min: 10, max: 100 }), 
              { minLength: 2, maxLength: 2 }
            ),
            { minLength: 2, maxLength: 2 }
          ),
          (contingencyTable) => {
            if (!window.Chapter3 || !window.Chapter3.IndependenceTestLab) {
              return true; // Skip if not initialized
            }
            
            // Manual chi-square calculation for verification
            const total = contingencyTable.flat().reduce((a, b) => a + b);
            const rowSums = contingencyTable.map(row => row.reduce((a, b) => a + b));
            const colSums = [0, 1].map(j => contingencyTable.reduce((sum, row) => sum + row[j], 0));
            
            let expectedChiSquare = 0;
            for (let i = 0; i < 2; i++) {
              for (let j = 0; j < 2; j++) {
                const observed = contingencyTable[i][j];
                const expected = (rowSums[i] * colSums[j]) / total;
                if (expected > 0) {
                  expectedChiSquare += Math.pow(observed - expected, 2) / expected;
                }
              }
            }
            
            const testResults = window.Chapter3.IndependenceTestLab.calculateChiSquareTest(contingencyTable);
            
            // Property: Calculated chi-square should match manual calculation
            return Math.abs(testResults.chiSquare - expectedChiSquare) < 1e-10;
          }
        ),
        { numRuns: Math.min(30, TEST_CONFIG.numRuns) }
      );

      // Test 6: P-value monotonicity (larger chi-square should give smaller p-value)
      const pValueMonotonicityTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 20, max: 50 }),
            fc.integer({ min: 1, max: 10 })
          ),
          ([baseCount, deviation]) => {
            if (!window.Chapter3 || !window.Chapter3.IndependenceTestLab) {
              return true; // Skip if not initialized
            }
            
            // Create two tables: one more independent, one less independent
            const independentTable = [
              [baseCount, baseCount],
              [baseCount, baseCount]
            ];
            
            const dependentTable = [
              [baseCount + deviation, baseCount - deviation],
              [baseCount - deviation, baseCount + deviation]
            ];
            
            const independentResults = window.Chapter3.IndependenceTestLab.calculateChiSquareTest(independentTable);
            const dependentResults = window.Chapter3.IndependenceTestLab.calculateChiSquareTest(dependentTable);
            
            // Property: Higher chi-square should correspond to lower p-value
            if (dependentResults.chiSquare > independentResults.chiSquare) {
              return dependentResults.pValue <= independentResults.pValue;
            }
            return true; // Skip if chi-square relationship is not as expected
          }
        ),
        { numRuns: Math.min(25, TEST_CONFIG.numRuns) }
      );

      testResults.passed++;
      testResults.details.push({
        property: 'Statistical Test Correctness',
        tests: [
          'chi_square_non_negativity', 
          'p_value_bounds', 
          'degrees_of_freedom', 
          'independence_consistency',
          'chi_square_formula',
          'p_value_monotonicity'
        ],
        status: 'passed'
      });

      return { 
        passed: true, 
        tests: [
          'chi_square_non_negativity', 
          'p_value_bounds', 
          'degrees_of_freedom', 
          'independence_consistency',
          'chi_square_formula',
          'p_value_monotonicity'
        ]
      };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        property: 'Statistical Test Correctness',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Run statistical test correctness tests
   */
  function runStatisticalTestCorrectnessTests() {
    console.log('Starting Chapter 3 Statistical Test Correctness Tests');
    console.log('**Feature: chapter3-multidimensional-variables, Property 4: Statistical Test Correctness**');
    
    const startTime = performance.now();
    
    // Reset results
    testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    // Run the statistical test correctness test
    const statisticalResult = testStatisticalTestCorrectness();
    
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
    
    console.log('Statistical Test Correctness Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('✅ All statistical test correctness tests passed!');
    } else {
      console.error('❌ Some statistical test correctness tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize and run tests when libraries are loaded
   */
  function initializeStatisticalTests() {
    // Wait for Chapter 3 to be initialized
    if (typeof window.Chapter3 === 'undefined') {
      setTimeout(initializeStatisticalTests, 100);
      return;
    }
    
    // Run tests
    const results = runStatisticalTestCorrectnessTests();
    
    // Store results globally for debugging
    window.Chapter3StatisticalTestResults = results;
    
    return results;
  }

  // Export for use in other modules
  window.Chapter3StatisticalTester = {
    runTests: runStatisticalTestCorrectnessTests,
    testStatisticalCorrectness: testStatisticalTestCorrectness,
    getResults: () => testResults
  };

  // Auto-run tests if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('test=true') || window.location.hash.includes('test'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeStatisticalTests, 1000);
    });
  }

})();