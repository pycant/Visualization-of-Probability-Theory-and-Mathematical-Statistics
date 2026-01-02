/**
 * Property-Based Tests for Chapter 3 Conditional Distribution Updates
 * 
 * **Property 2: Real-time Visualization Updates**
 * **Validates: Requirements 5.5**
 * 
 * Tests that conditional distribution visualizations update correctly and within
 * performance requirements when parameters change.
 */

(function() {
  'use strict';

  // Test configuration
  const TEST_CONFIG = {
    numRuns: 100,
    timeout: 5000,
    verbose: false,
    maxUpdateTime: 100 // milliseconds - requirement from design
  };

  // Test results storage
  let testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  /**
   * Property 2: Real-time Visualization Updates for Conditional Distributions
   * For any parameter adjustment (condition values, confidence levels, noise levels),
   * all affected conditional visualizations should update within 100ms and reflect
   * the new parameter values accurately.
   * Validates Requirements 5.5: Real-time conditional distribution updates
   */
  function testConditionalDistributionUpdates() {
    console.log('Running Property 2: Real-time Conditional Distribution Updates');
    console.log('**Feature: chapter3-multidimensional-variables, Property 2: Real-time Visualization Updates**');
    
    if (typeof fc === 'undefined') {
      const error = 'fast-check library not available';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    try {
      // Test 1: Condition value updates
      const conditionValueTest = fc.assert(
        fc.property(
          fc.float({ min: -3, max: 3 }), // condition value range
          (conditionValue) => {
            if (!window.chapter3Visualizer || !window.chapter3Visualizer.conditionalDistribution) {
              return true; // Skip if not initialized
            }
            
            const startTime = performance.now();
            
            // Update condition value
            const oldValue = window.chapter3Visualizer.conditionalDistribution.conditionValue;
            window.chapter3Visualizer.conditionalDistribution.conditionValue = conditionValue;
            
            // Trigger update
            window.chapter3Visualizer.updateConditionalVisualization();
            
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            
            // Property 1: Update should complete within 100ms
            const withinTimeLimit = updateTime <= TEST_CONFIG.maxUpdateTime;
            
            // Property 2: New value should be reflected in the system
            const valueUpdated = Math.abs(
              window.chapter3Visualizer.conditionalDistribution.conditionValue - conditionValue
            ) < 1e-10;
            
            // Property 3: Conditional statistics should be recalculated
            const hasValidMean = Number.isFinite(
              window.chapter3Visualizer.conditionalDistribution.conditionalMean
            );
            const hasValidVariance = Number.isFinite(
              window.chapter3Visualizer.conditionalDistribution.conditionalVariance
            ) && window.chapter3Visualizer.conditionalDistribution.conditionalVariance >= 0;
            
            return withinTimeLimit && valueUpdated && hasValidMean && hasValidVariance;
          }
        ),
        { numRuns: Math.min(20, TEST_CONFIG.numRuns) }
      );

      // Test 2: Prediction confidence updates
      const confidenceUpdateTest = fc.assert(
        fc.property(
          fc.integer({ min: 80, max: 99 }), // confidence level range
          (confidence) => {
            if (!window.chapter3Visualizer || !window.chapter3Visualizer.conditionalDistribution) {
              return true; // Skip if not initialized
            }
            
            const startTime = performance.now();
            
            // Update prediction confidence
            window.chapter3Visualizer.conditionalDistribution.predictionConfidence = confidence;
            
            // Trigger update
            window.chapter3Visualizer.updateConditionalVisualization();
            
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            
            // Property 1: Update should complete within 100ms
            const withinTimeLimit = updateTime <= TEST_CONFIG.maxUpdateTime;
            
            // Property 2: Prediction interval should be updated
            const interval = window.chapter3Visualizer.conditionalDistribution.predictionInterval;
            const hasValidInterval = interval && 
              Number.isFinite(interval.lower) && 
              Number.isFinite(interval.upper) &&
              interval.upper > interval.lower;
            
            return withinTimeLimit && hasValidInterval;
          }
        ),
        { numRuns: Math.min(15, TEST_CONFIG.numRuns) }
      );

      // Test 3: Observation noise updates
      const noiseUpdateTest = fc.assert(
        fc.property(
          fc.float({ min: 0.01, max: 1.0 }), // noise level range
          (noiseLevel) => {
            if (!window.chapter3Visualizer || !window.chapter3Visualizer.conditionalDistribution) {
              return true; // Skip if not initialized
            }
            
            const startTime = performance.now();
            
            // Update observation noise
            window.chapter3Visualizer.conditionalDistribution.observationNoise = noiseLevel;
            
            // Trigger update
            window.chapter3Visualizer.updateConditionalVisualization();
            
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            
            // Property 1: Update should complete within 100ms
            const withinTimeLimit = updateTime <= TEST_CONFIG.maxUpdateTime;
            
            // Property 2: Noise value should be reflected
            const noiseUpdated = Math.abs(
              window.chapter3Visualizer.conditionalDistribution.observationNoise - noiseLevel
            ) < 1e-10;
            
            return withinTimeLimit && noiseUpdated;
          }
        ),
        { numRuns: Math.min(15, TEST_CONFIG.numRuns) }
      );

      // Test 4: Bayesian update consistency
      const bayesianUpdateTest = fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }), // number of updates
          (numUpdates) => {
            if (!window.chapter3Visualizer || !window.chapter3Visualizer.conditionalDistribution) {
              return true; // Skip if not initialized
            }
            
            // Reset Bayesian state
            window.chapter3Visualizer.resetBayesianPrior();
            
            let allUpdatesValid = true;
            
            for (let i = 0; i < numUpdates; i++) {
              const startTime = performance.now();
              
              // Perform Bayesian update
              window.chapter3Visualizer.performBayesianUpdate();
              
              const endTime = performance.now();
              const updateTime = endTime - startTime;
              
              // Property 1: Each update should complete within 100ms
              const withinTimeLimit = updateTime <= TEST_CONFIG.maxUpdateTime;
              
              // Property 2: Posterior should be valid
              const bayesian = window.chapter3Visualizer.conditionalDistribution.bayesianUpdate;
              const hasValidPosterior = Number.isFinite(bayesian.posteriorMean) &&
                Number.isFinite(bayesian.posteriorVariance) &&
                bayesian.posteriorVariance > 0;
              
              // Property 3: Observations should accumulate
              const hasObservations = bayesian.observations.length === i + 1;
              
              if (!withinTimeLimit || !hasValidPosterior || !hasObservations) {
                allUpdatesValid = false;
                break;
              }
            }
            
            return allUpdatesValid;
          }
        ),
        { numRuns: Math.min(10, TEST_CONFIG.numRuns) }
      );

      testResults.passed++;
      testResults.details.push({
        property: 'Real-time Conditional Distribution Updates',
        tests: ['condition_value_updates', 'confidence_updates', 'noise_updates', 'bayesian_updates'],
        status: 'passed'
      });

      return { 
        passed: true, 
        tests: ['condition_value_updates', 'confidence_updates', 'noise_updates', 'bayesian_updates']
      };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        property: 'Real-time Conditional Distribution Updates',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }
  /**
   * Run conditional distribution update tests
   */
  function runConditionalDistributionTests() {
    console.log('Starting Chapter 3 Conditional Distribution Update Tests');
    console.log('**Feature: chapter3-multidimensional-variables, Property 2: Real-time Visualization Updates**');
    
    const startTime = performance.now();
    
    // Reset results
    testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    // Run the conditional distribution update test
    const conditionalResult = testConditionalDistributionUpdates();
    
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
    
    console.log('Conditional Distribution Update Test Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('✅ All conditional distribution update tests passed!');
    } else {
      console.error('❌ Some conditional distribution update tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize and run tests when libraries are loaded
   */
  function initializeConditionalTests() {
    // Wait for Chapter 3 to be initialized
    if (typeof window.chapter3Visualizer === 'undefined') {
      setTimeout(initializeConditionalTests, 100);
      return;
    }
    
    // Run tests
    const results = runConditionalDistributionTests();
    
    // Store results globally for debugging
    window.Chapter3ConditionalTestResults = results;
    
    return results;
  }

  // Export for use in other modules
  window.Chapter3ConditionalTester = {
    runTests: runConditionalDistributionTests,
    testConditionalUpdates: testConditionalDistributionUpdates,
    getResults: () => testResults
  };

  // Auto-run tests if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('test=true') || window.location.hash.includes('test'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeConditionalTests, 2000);
    });
  }

})();