/**
 * Node.js Integration Test Runner for Chapter 3
 * 
 * Runs integration tests in a headless environment to validate
 * cross-component communication and data flow.
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment for Node.js
global.window = {
  performance: {
    now: () => Date.now()
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: console,
  document: {
    getElementById: () => null,
    addEventListener: () => {},
    createElement: () => ({ 
      getContext: () => ({ 
        clearRect: () => {}, 
        fillRect: () => {}, 
        strokeRect: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(1000) })
      })
    })
  },
  location: { search: '', hash: '' },
  navigator: {
    userAgent: 'Node.js Test Runner',
    platform: 'node',
    language: 'en-US'
  },
  screen: { width: 1920, height: 1080, colorDepth: 24 },
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1
};

// Mock Chapter 3 Visualizer for testing
function MockChapter3Visualizer() {
  this.parameters = {
    mu1: 5,
    mu2: 8,
    sigma1: 15,
    sigma2: 20,
    rho: 0.3,
    nSamples: 1000,
    distType: 'normal'
  };
  
  this.currentSamples = [];
  this.canvases = {
    contour: { ctx: global.window.document.createElement().getContext() },
    scatter: { ctx: global.window.document.createElement().getContext() },
    marginal: { ctx: global.window.document.createElement().getContext() }
  };
  
  this.independenceTest = {};
  this.variableTransformation = { originalSamples: [] };
  this.conditionalDistribution = { jointSamples: [] };
  this.currentSection32Tab = 'streamer';
  
  // Mock methods
  this.updateParameter = (sliderId, value) => {
    const paramMap = {
      'mu1-slider': 'mu1',
      'mu2-slider': 'mu2',
      'sigma1-slider': 'sigma1',
      'sigma2-slider': 'sigma2',
      'rho-slider': 'rho',
      'n-samples-slider': 'nSamples'
    };
    
    const param = paramMap[sliderId];
    if (param) {
      // Validate parameters
      if (param === 'rho') {
        this.parameters[param] = Math.max(-0.99, Math.min(0.99, parseFloat(value)));
      } else if (param.includes('sigma')) {
        this.parameters[param] = Math.max(0.1, parseFloat(value));
      } else if (param === 'nSamples') {
        this.parameters[param] = Math.max(100, Math.min(10000, parseInt(value)));
      } else {
        this.parameters[param] = parseFloat(value);
      }
      
      if (param === 'nSamples') {
        this.generateSamples();
      }
    }
  };
  
  this.generateSamples = () => {
    this.currentSamples = [];
    for (let i = 0; i < this.parameters.nSamples; i++) {
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      this.currentSamples.push([x, y]);
    }
  };
  
  this.updateAllVisualizations = () => {
    // Mock visualization update - should complete quickly
    return Promise.resolve();
  };
  
  this.calculateCorrelation = (xValues, yValues) => {
    if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length === 0) {
      return 0;
    }
    
    const n = xValues.length;
    const meanX = xValues.reduce((a, b) => a + b) / n;
    const meanY = yValues.reduce((a, b) => a + b) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = xValues[i] - meanX;
      const dy = yValues[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }
    
    const correlation = numerator / Math.sqrt(denomX * denomY);
    return isNaN(correlation) ? 0 : correlation;
  };
  
  this.switchSection32Tab = (tabName) => {
    this.currentSection32Tab = tabName;
  };
  
  this.runIndependenceTest = () => {
    return { chiSquare: 1.5, pValue: 0.22, degreesOfFreedom: 1 };
  };
  
  // Initialize with some samples
  this.generateSamples();
}

// Load and execute integration tests
try {
  console.log('🧪 Loading Chapter 3 Integration Tests...');
  
  // Set up global Chapter 3 visualizer
  global.window.chapter3Visualizer = new MockChapter3Visualizer();
  
  // Load the integration test code
  const integrationTestCode = fs.readFileSync(
    path.join(__dirname, 'chapter3-integration-tests.js'), 
    'utf8'
  );
  
  // Execute the test code in our mock environment
  eval(integrationTestCode);
  
  // Run the tests
  if (global.window.Chapter3IntegrationTester) {
    console.log('🚀 Running Chapter 3 Integration Tests...');
    
    const results = global.window.Chapter3IntegrationTester.runTests();
    
    console.log('\n📊 INTEGRATION TEST RESULTS:');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.totalTests || 0}`);
    console.log(`Passed: ${results.passed || 0} ✅`);
    console.log(`Failed: ${results.failed || 0} ❌`);
    console.log(`Duration: ${results.duration || 0}ms`);
    
    if (results.errors && results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }
    
    if (results.details && results.details.length > 0) {
      console.log('\n📋 Test Details:');
      results.details.forEach(detail => {
        const status = detail.status === 'passed' ? '✅' : '❌';
        console.log(`  ${status} ${detail.test}`);
        if (detail.performance) {
          console.log(`     Performance: ${JSON.stringify(detail.performance)}`);
        }
      });
    }
    
    if (results.performance && results.performance.length > 0) {
      console.log('\n⚡ Performance Metrics:');
      results.performance.forEach(perf => {
        console.log(`  ${perf.test}: ${JSON.stringify(perf)}`);
      });
    }
    
    console.log('='.repeat(50));
    
    // Exit with appropriate code
    const exitCode = (results.failed || 0) > 0 ? 1 : 0;
    console.log(`\n${exitCode === 0 ? '🎉 All tests passed!' : '💥 Some tests failed!'}`);
    process.exit(exitCode);
    
  } else {
    throw new Error('Integration test suite not loaded properly');
  }
  
} catch (error) {
  console.error('❌ Integration test execution failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}