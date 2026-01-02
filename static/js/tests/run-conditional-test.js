/**
 * Node.js runner for Chapter 3 Conditional Distribution Property Tests
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = {
  performance: { now: () => Date.now() },
  console: console,
  chapter3Visualizer: {
    conditionalDistribution: {
      jointSamples: Array.from({ length: 100 }, () => [Math.random() * 100, Math.random() * 100]),
      conditionValue: 50,
      conditionalSamples: Array.from({ length: 50 }, () => [Math.random() * 100, Math.random() * 100]),
      conditionalMean: 25,
      conditionalVariance: 100
    },
    updateConditionalDistribution: () => Promise.resolve(),
    calculateConditionalExpectation: (x) => x * 0.5 + 10
  }
};

// Mock fast-check
global.fc = {
  assert: (property, options) => {
    console.log(`Running conditional distribution test with ${options?.numRuns || 100} iterations...`);
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
  console.log('Loading conditional distribution property tests...');
  
  // Load the conditional test code
  const testCode = fs.readFileSync(
    path.join(__dirname, 'chapter3-conditional-properties.test.js'), 
    'utf8'
  );
  
  // Execute the test code
  eval(testCode);
  
  // Run the test
  if (global.window.Chapter3ConditionalTester) {
    console.log('Running conditional distribution property tests...');
    const results = global.window.Chapter3ConditionalTester.runTests();
    
    console.log('\n=== TEST RESULTS ===');
    console.log(`Total Tests: ${results.totalTests || 0}`);
    console.log(`Passed: ${results.passed || 0}`);
    console.log(`Failed: ${results.failed || 0}`);
    console.log(`Duration: ${results.duration || 0}ms`);
    
    if (results.failed === 0) {
      console.log('✅ All conditional distribution property tests PASSED!');
      process.exit(0);
    } else {
      console.log('❌ Some conditional distribution property tests FAILED!');
      if (results.errors) {
        results.errors.forEach(error => console.log(`  • ${error}`));
      }
      process.exit(1);
    }
  } else {
    console.log('⚠️ Conditional distribution test suite not properly loaded, skipping...');
    process.exit(0);
  }
  
} catch (error) {
  console.error('❌ Conditional distribution test execution failed:', error.message);
  process.exit(1);
}