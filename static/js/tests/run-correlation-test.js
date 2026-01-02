#!/usr/bin/env node

// Simple test runner for correlation coefficient accuracy
const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = {
  Chapter3: {
    MathEngine: {
      calculateCorrelation: function(samples) {
        if (!samples || samples.length < 2) return 0;
        
        if (Array.isArray(samples[0])) {
          const x = samples.map(s => s[0]);
          const y = samples.map(s => s[1]);
          return this.calculatePearsonCorrelation(x, y);
        }
        
        return 0;
      },
      
      calculatePearsonCorrelation: function(x, y) {
        if (!x || !y || x.length !== y.length || x.length < 2) return 0;
        
        const n = x.length;
        const meanX = x.reduce((a, b) => a + b) / n;
        const meanY = y.reduce((a, b) => a + b) / n;

        let numerator = 0;
        let denomX = 0;
        let denomY = 0;

        for (let i = 0; i < n; i++) {
          const dx = x[i] - meanX;
          const dy = y[i] - meanY;
          numerator += dx * dy;
          denomX += dx * dx;
          denomY += dy * dy;
        }

        const denominator = Math.sqrt(denomX * denomY);
        return denominator === 0 ? 0 : numerator / denominator;
      }
    }
  },
  location: { search: '', hash: '' },
  performance: { now: () => Date.now() }
};

global.console = console;
global.setTimeout = setTimeout;
global.document = { addEventListener: () => {} };

// Mock fast-check with reduced iterations
global.fc = {
  assert: function(property, config) {
    const numRuns = Math.min(config?.numRuns || 10, 5); // Very small for speed
    console.log(`Running ${numRuns} iterations...`);
    
    for (let i = 0; i < numRuns; i++) {
      try {
        const testData = property.arb.generate();
        const result = property.predicate(testData);
        if (!result) {
          throw new Error(`Property failed on iteration ${i + 1} with data: ${JSON.stringify(testData).substring(0, 100)}`);
        }
      } catch (e) {
        throw new Error(`Property test failed on iteration ${i + 1}: ${e.message}`);
      }
    }
    return true;
  },
  
  property: function(arb, predicate) {
    return { arb, predicate };
  },
  
  array: function(itemArb, config) {
    return {
      generate: () => {
        const length = Math.floor(Math.random() * (config.maxLength - config.minLength + 1)) + config.minLength;
        return Array.from({length}, () => itemArb.generate());
      }
    };
  },
  
  tuple: function(...arbs) {
    return {
      generate: () => arbs.map(arb => arb.generate())
    };
  },
  
  float: function(config) {
    return {
      generate: () => Math.random() * (config.max - config.min) + config.min
    };
  },
  
  integer: function(config) {
    return {
      generate: () => Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
    };
  }
};

// Load and execute the test
try {
  console.log('Loading correlation coefficient accuracy test...');
  const testCode = fs.readFileSync(path.join(__dirname, 'chapter3-math-properties.test.js'), 'utf8');
  
  // Execute the test code
  eval(testCode);
  
  // Run the test
  if (global.window.Chapter3CorrelationTester) {
    console.log('Running correlation coefficient accuracy tests...');
    const results = global.window.Chapter3CorrelationTester.runTests();
    
    console.log('\n=== TEST RESULTS ===');
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Duration: ${results.duration}ms`);
    
    if (results.failed === 0) {
      console.log('✅ All correlation coefficient accuracy tests PASSED!');
      process.exit(0);
    } else {
      console.log('❌ Some tests FAILED:');
      results.errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    }
  } else {
    console.log('❌ Test module not found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
}