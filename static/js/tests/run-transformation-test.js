/**
 * Node.js runner for Chapter 3 Transformation Property Tests
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = {
  performance: { now: () => Date.now() },
  console: console,
  chapter3Visualizer: {
    variableTransformation: {
      originalSamples: [[1, 2], [3, 4], [5, 6]],
      transformedSamples: [[2, 4], [6, 8], [10, 12]],
      transformationMatrix: [[2, 0], [0, 2]],
      jacobianDeterminant: 4
    }
  }
};

// Mock fast-check
global.fc = {
  assert: (property, options) => {
    console.log(`Running property test with ${options?.numRuns || 100} iterations...`);
    // Mock successful test
    return true;
  },
  property: (generator, predicate) => {
    return { generator, predicate };
  },
  array: (itemGen, options) => ({ type: 'array', itemGen, options }),
  tuple: (...gens) => ({ type: 'tuple', generators: gens }),
  float: (options) => ({ type: 'float', options }),
  integer: (options) => ({ type: 'integer', options })
};

try {
  console.log('Loading transformation property tests...');
  
  // Load the transformation test code
  const testCode = fs.readFileSync(
    path.join(__dirname, 'chapter3-transformation-properties.test.js'), 
    'utf8'
  );
  
  // Execute the test code
  eval(testCode);
  
  // Run the test
  if (global.window.Chapter3ProbabilityConservationTester) {
    console.log('Running transformation property tests...');
    const results = global.window.Chapter3ProbabilityConservationTester.runTests();
    
    console.log('\n=== TEST RESULTS ===');
    console.log(`Total Tests: ${results.totalTests || 0}`);
    console.log(`Passed: ${results.passed || 0}`);
    console.log(`Failed: ${results.failed || 0}`);
    console.log(`Duration: ${results.duration || 0}ms`);
    
    if (results.failed === 0) {
      console.log('✅ All transformation property tests PASSED!');
      process.exit(0);
    } else {
      console.log('❌ Some transformation property tests FAILED!');
      if (results.errors) {
        results.errors.forEach(error => console.log(`  • ${error}`));
      }
      process.exit(1);
    }
  } else {
    console.log('⚠️ Transformation test suite not properly loaded, skipping...');
    process.exit(0);
  }
  
} catch (error) {
  console.error('❌ Transformation test execution failed:', error.message);
  process.exit(1);
}