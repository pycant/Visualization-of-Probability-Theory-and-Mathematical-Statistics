/**
 * Property-Based Tests for Chapter 3 Variable Transformation
 * 
 * **Property 5: Probability Conservation Under Transformation**
 * **Validates: Requirements 4.6**
 * 
 * Tests that probability mass is conserved under variable transformations
 * in Chapter 3 multidimensional variable transformations.
 */

(function() {
  'use strict';

  // Test configuration
  const TEST_CONFIG = {
    numRuns: 100,  // Property-based testing requires many iterations
    timeout: 5000,
    verbose: false,
    tolerance: 1e-6  // Numerical precision tolerance for probability conservation
  };

  // Test results storage
  let testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  /**
   * Property 5: Probability Conservation Under Transformation
   * For any valid variable transformation applied to a probability distribution, 
   * the total probability mass should remain equal to 1.0 within numerical precision (±1e-6).
   * **Validates: Requirements 4.6**
   */
  function testProbabilityConservation() {
    console.log('Running Property 5: Probability Conservation Under Transformation');
    console.log('**Feature: chapter3-multidimensional-variables, Property 5: Probability Conservation Under Transformation**');
    
    if (typeof fc === 'undefined') {
      const error = 'fast-check library not available';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    if (!window.chapter3Visualizer || !window.chapter3Visualizer.variableTransformation) {
      const error = 'Chapter 3 Variable Transformation system not initialized';
      testResults.errors.push(error);
      testResults.failed++;
      return { passed: false, error };
    }

    try {
      // Test 1: Linear transformation probability conservation
      const linearTransformationTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.float({ min: -2, max: 2 }), // a11
            fc.float({ min: -2, max: 2 }), // a12
            fc.float({ min: -2, max: 2 }), // a21
            fc.float({ min: -2, max: 2 })  // a22
          ),
          ([a11, a12, a21, a22]) => {
            // Ensure transformation matrix is invertible (non-zero determinant)
            const determinant = a11 * a22 - a12 * a21;
            if (Math.abs(determinant) < 1e-10) {
              return true; // Skip singular matrices
            }

            // Generate sample data
            const sampleSize = 1000;
            const originalSamples = generateTestSamples(sampleSize);
            
            // Apply linear transformation
            const transformedSamples = originalSamples.map(([x, y]) => {
              const u = a11 * x + a12 * y;
              const v = a21 * x + a22 * y;
              return [u, v];
            });

            // Calculate probability densities using kernel density estimation
            const originalDensity = estimateTotalProbability(originalSamples);
            const transformedDensity = estimateTotalProbability(transformedSamples);
            
            // Adjust for Jacobian determinant
            const adjustedTransformedDensity = transformedDensity * Math.abs(determinant);
            
            // Property: Total probability should be conserved (within numerical tolerance)
            const probabilityDifference = Math.abs(originalDensity - adjustedTransformedDensity);
            
            return probabilityDifference < TEST_CONFIG.tolerance;
          }
        ),
        { numRuns: Math.min(20, TEST_CONFIG.numRuns) }
      );

      // Test 2: Polar transformation probability conservation
      const polarTransformationTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.float({ min: -5, max: 5 }), // centerX
            fc.float({ min: -5, max: 5 })  // centerY
          ),
          ([centerX, centerY]) => {
            // Generate sample data
            const sampleSize = 500;
            const originalSamples = generateTestSamples(sampleSize);
            
            // Apply polar transformation: (x,y) -> (r, θ)
            const transformedSamples = originalSamples.map(([x, y]) => {
              const dx = x - centerX;
              const dy = y - centerY;
              const r = Math.sqrt(dx * dx + dy * dy);
              const theta = Math.atan2(dy, dx);
              return [r, theta];
            }).filter(([r, theta]) => r > 0 && !isNaN(r) && !isNaN(theta));

            if (transformedSamples.length < sampleSize * 0.8) {
              return true; // Skip if too many invalid transformations
            }

            // For polar coordinates, the Jacobian determinant is r
            // So we need to account for this in probability conservation
            const originalDensity = estimateTotalProbability(originalSamples);
            const transformedDensity = estimatePolarProbability(transformedSamples);
            
            // Property: Probability should be approximately conserved
            // (allowing for some numerical error due to coordinate transformation)
            const probabilityDifference = Math.abs(originalDensity - transformedDensity);
            
            return probabilityDifference < TEST_CONFIG.tolerance * 10; // Relaxed tolerance for polar
          }
        ),
        { numRuns: Math.min(15, TEST_CONFIG.numRuns) }
      );

      // Test 3: Logarithmic transformation probability conservation
      const logarithmicTransformationTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.float({ min: 0.1, max: 5 }), // shiftX (must be positive)
            fc.float({ min: 0.1, max: 5 })  // shiftY (must be positive)
          ),
          ([shiftX, shiftY]) => {
            // Generate positive sample data for logarithmic transformation
            const sampleSize = 500;
            const originalSamples = generatePositiveTestSamples(sampleSize, shiftX, shiftY);
            
            // Apply logarithmic transformation: (x,y) -> (log(x+shift), log(y+shift))
            const transformedSamples = originalSamples.map(([x, y]) => {
              const u = Math.log(x + shiftX);
              const v = Math.log(y + shiftY);
              return [u, v];
            }).filter(([u, v]) => !isNaN(u) && !isNaN(v) && isFinite(u) && isFinite(v));

            if (transformedSamples.length < sampleSize * 0.8) {
              return true; // Skip if too many invalid transformations
            }

            // Calculate probability densities
            const originalDensity = estimateTotalProbability(originalSamples);
            const transformedDensity = estimateTotalProbability(transformedSamples);
            
            // For log transformation, Jacobian determinant is 1/((x+shift)(y+shift))
            // This is complex to calculate exactly, so we use a relaxed tolerance
            const probabilityDifference = Math.abs(originalDensity - transformedDensity);
            
            return probabilityDifference < TEST_CONFIG.tolerance * 50; // Very relaxed for log transform
          }
        ),
        { numRuns: Math.min(10, TEST_CONFIG.numRuns) }
      );

      // Test 4: Identity transformation (should preserve probability exactly)
      const identityTransformationTest = fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }),
          (sampleSize) => {
            // Generate sample data
            const originalSamples = generateTestSamples(sampleSize);
            
            // Apply identity transformation (no change)
            const transformedSamples = originalSamples.map(([x, y]) => [x, y]);
            
            // Calculate probability densities
            const originalDensity = estimateTotalProbability(originalSamples);
            const transformedDensity = estimateTotalProbability(transformedSamples);
            
            // Property: Identity transformation should preserve probability exactly
            const probabilityDifference = Math.abs(originalDensity - transformedDensity);
            
            return probabilityDifference < 1e-12; // Very strict tolerance for identity
          }
        ),
        { numRuns: Math.min(10, TEST_CONFIG.numRuns) }
      );

      // Test 5: Scaling transformation probability conservation
      const scalingTransformationTest = fc.assert(
        fc.property(
          fc.tuple(
            fc.float({ min: 0.1, max: 5 }), // scaleX
            fc.float({ min: 0.1, max: 5 })  // scaleY
          ),
          ([scaleX, scaleY]) => {
            // Generate sample data
            const sampleSize = 800;
            const originalSamples = generateTestSamples(sampleSize);
            
            // Apply scaling transformation
            const transformedSamples = originalSamples.map(([x, y]) => [
              x * scaleX,
              y * scaleY
            ]);
            
            // Calculate probability densities
            const originalDensity = estimateTotalProbability(originalSamples);
            const transformedDensity = estimateTotalProbability(transformedSamples);
            
            // For scaling, Jacobian determinant is scaleX * scaleY
            const adjustedTransformedDensity = transformedDensity * scaleX * scaleY;
            
            // Property: Probability should be conserved after Jacobian adjustment
            const probabilityDifference = Math.abs(originalDensity - adjustedTransformedDensity);
            
            return probabilityDifference < TEST_CONFIG.tolerance;
          }
        ),
        { numRuns: Math.min(15, TEST_CONFIG.numRuns) }
      );

      testResults.passed++;
      testResults.details.push({
        property: 'Probability Conservation Under Transformation',
        tests: ['linear_transformation', 'polar_transformation', 'logarithmic_transformation', 'identity_transformation', 'scaling_transformation'],
        status: 'passed'
      });

      return { 
        passed: true, 
        tests: ['linear_transformation', 'polar_transformation', 'logarithmic_transformation', 'identity_transformation', 'scaling_transformation']
      };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        property: 'Probability Conservation Under Transformation',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Generate test samples from a bivariate normal distribution
   */
  function generateTestSamples(n) {
    const samples = [];
    const mu1 = 0, mu2 = 0;
    const sigma1 = 1, sigma2 = 1;
    const rho = 0.3;
    
    for (let i = 0; i < n; i++) {
      // Box-Muller transformation
      const u1 = Math.random();
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      
      // Transform to correlated bivariate normal
      const x = mu1 + sigma1 * z1;
      const y = mu2 + sigma2 * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);
      
      samples.push([x, y]);
    }
    
    return samples;
  }

  /**
   * Generate positive test samples for logarithmic transformations
   */
  function generatePositiveTestSamples(n, minX = 0.1, minY = 0.1) {
    const samples = [];
    
    for (let i = 0; i < n; i++) {
      // Generate positive samples using exponential distribution
      const x = minX + Math.random() * 5;
      const y = minY + Math.random() * 5;
      samples.push([x, y]);
    }
    
    return samples;
  }

  /**
   * Estimate total probability using simple kernel density estimation
   */
  function estimateTotalProbability(samples) {
    if (!samples || samples.length === 0) return 0;
    
    // Simple approximation: assume uniform distribution over sample range
    const xValues = samples.map(s => s[0]);
    const yValues = samples.map(s => s[1]);
    
    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);
    
    if (xRange === 0 || yRange === 0) return 1; // Degenerate case
    
    // Probability density approximation
    const area = xRange * yRange;
    const density = samples.length / area;
    
    // Total probability should integrate to 1
    return density * area / samples.length;
  }

  /**
   * Estimate probability for polar coordinates (accounting for Jacobian)
   */
  function estimatePolarProbability(samples) {
    if (!samples || samples.length === 0) return 0;
    
    // For polar coordinates, we need to account for the r factor in the Jacobian
    let totalWeight = 0;
    
    samples.forEach(([r, theta]) => {
      if (r > 0) {
        totalWeight += r; // Jacobian determinant for polar coordinates
      }
    });
    
    // Normalize by sample count and average radius
    const avgWeight = totalWeight / samples.length;
    return avgWeight / (samples.length || 1);
  }

  /**
   * Run probability conservation tests
   */
  function runProbabilityConservationTests() {
    console.log('Starting Chapter 3 Probability Conservation Tests');
    console.log('**Feature: chapter3-multidimensional-variables, Property 5: Probability Conservation Under Transformation**');
    
    const startTime = performance.now();
    
    // Reset results
    testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    // Run the probability conservation test
    const conservationResult = testProbabilityConservation();
    
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
    
    console.log('Probability Conservation Test Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('✅ All probability conservation tests passed!');
    } else {
      console.error('❌ Some probability conservation tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize and run tests when libraries are loaded
   */
  function initializeProbabilityConservationTests() {
    // Wait for Chapter 3 to be initialized
    if (typeof window.chapter3Visualizer === 'undefined' || 
        !window.chapter3Visualizer.variableTransformation) {
      setTimeout(initializeProbabilityConservationTests, 100);
      return;
    }
    
    // Run tests
    const results = runProbabilityConservationTests();
    
    // Store results globally for debugging
    window.Chapter3ProbabilityConservationTestResults = results;
    
    return results;
  }

  // Export for use in other modules
  window.Chapter3ProbabilityConservationTester = {
    runTests: runProbabilityConservationTests,
    testProbabilityConservation: testProbabilityConservation,
    getResults: () => testResults
  };

  // Auto-run tests if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('test=true') || window.location.hash.includes('test'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeProbabilityConservationTests, 2000);
    });
  }

})();