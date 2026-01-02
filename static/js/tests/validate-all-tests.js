/**
 * Comprehensive Test Validation for Chapter 3
 * 
 * Validates all existing tests and identifies issues that need fixing
 */

const fs = require('fs');
const path = require('path');

// Test validation results
let validationResults = {
  totalFiles: 0,
  validTests: 0,
  invalidTests: 0,
  issues: [],
  recommendations: []
};

/**
 * Validate a test file
 */
function validateTestFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n🔍 Validating: ${fileName}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for required elements
    const checks = [
      {
        name: 'Property-based test structure',
        pattern: /Property \d+:/,
        required: fileName.includes('.test.js')
      },
      {
        name: 'Feature annotation',
        pattern: /\*\*Feature: chapter3-multidimensional-variables/,
        required: fileName.includes('.test.js')
      },
      {
        name: 'Requirements validation',
        pattern: /\*\*Validates: Requirements/,
        required: fileName.includes('.test.js')
      },
      {
        name: 'Test runner export',
        pattern: /window\.\w+Tester\s*=/,
        required: fileName.includes('.test.js')
      },
      {
        name: 'Fast-check usage',
        pattern: /fc\.(assert|property)/,
        required: fileName.includes('properties.test.js')
      },
      {
        name: 'Error handling',
        pattern: /try\s*{[\s\S]*catch\s*\(/,
        required: true
      }
    ];
    
    for (const check of checks) {
      if (check.required && !check.pattern.test(content)) {
        issues.push(`Missing: ${check.name}`);
      }
    }
    
    // Check for specific issues
    if (content.includes('typeof fc === \'undefined\'') && !content.includes('fast-check library not available')) {
      issues.push('Fast-check availability check needs better error message');
    }
    
    if (content.includes('window.chapter3Visualizer') && !content.includes('typeof window.chapter3Visualizer')) {
      issues.push('Missing Chapter3Visualizer availability check');
    }
    
    // Check for performance considerations
    if (fileName.includes('performance') && !content.includes('performance.now()')) {
      issues.push('Performance test should use performance.now() for timing');
    }
    
    // Check for proper test isolation
    if (content.includes('globalThis') || content.includes('global.')) {
      issues.push('Test may have global state pollution issues');
    }
    
    return {
      file: fileName,
      valid: issues.length === 0,
      issues: issues
    };
    
  } catch (error) {
    return {
      file: fileName,
      valid: false,
      issues: [`File read error: ${error.message}`]
    };
  }
}

/**
 * Check test runner compatibility
 */
function validateTestRunners() {
  console.log('\n🔧 Validating test runners...');
  
  const runners = [
    'run-correlation-test.js',
    'run-statistical-test.js',
    'run-integration-tests.js'
  ];
  
  const runnerIssues = [];
  
  for (const runner of runners) {
    const runnerPath = path.join(__dirname, runner);
    
    if (!fs.existsSync(runnerPath)) {
      runnerIssues.push(`Missing runner: ${runner}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(runnerPath, 'utf8');
      
      // Check for Node.js compatibility
      if (!content.includes('global.window')) {
        runnerIssues.push(`${runner}: Missing Node.js environment setup`);
      }
      
      // Check for proper error handling
      if (!content.includes('process.exit')) {
        runnerIssues.push(`${runner}: Missing proper exit codes`);
      }
      
      // Check for mock environment
      if (content.includes('window.chapter3Visualizer') && !content.includes('Mock')) {
        runnerIssues.push(`${runner}: May need mock environment for testing`);
      }
      
    } catch (error) {
      runnerIssues.push(`${runner}: Read error - ${error.message}`);
    }
  }
  
  return runnerIssues;
}

/**
 * Validate cross-browser compatibility
 */
function validateBrowserCompatibility() {
  console.log('\n🌐 Validating browser compatibility...');
  
  const compatibilityIssues = [];
  const testFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'));
  
  for (const file of testFiles) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    
    // Check for modern JS features that might not be supported
    const modernFeatures = [
      { feature: 'async/await', pattern: /async\s+function|await\s+/ },
      { feature: 'arrow functions', pattern: /=>\s*{/ },
      { feature: 'template literals', pattern: /`[^`]*\${[^}]*}[^`]*`/ },
      { feature: 'destructuring', pattern: /const\s*{\s*\w+\s*}/ },
      { feature: 'spread operator', pattern: /\.\.\./ }
    ];
    
    for (const { feature, pattern } of modernFeatures) {
      if (pattern.test(content)) {
        // This is actually good - modern features are fine for testing
        // Just noting for compatibility awareness
      }
    }
    
    // Check for potential browser-specific issues
    if (content.includes('performance.now()') && !content.includes('window.performance')) {
      compatibilityIssues.push(`${file}: Should check for performance API availability`);
    }
    
    if (content.includes('requestAnimationFrame') && !content.includes('window.requestAnimationFrame')) {
      compatibilityIssues.push(`${file}: Should check for requestAnimationFrame availability`);
    }
  }
  
  return compatibilityIssues;
}

/**
 * Generate recommendations
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  // Based on validation results
  if (results.invalidTests > 0) {
    recommendations.push({
      priority: 'high',
      category: 'reliability',
      message: `${results.invalidTests} test files have issues that need fixing`
    });
  }
  
  // Check for missing test coverage
  const expectedTests = [
    'navigation-properties.test.js',
    'math-properties.test.js', 
    'statistical-test-properties.test.js',
    'transformation-properties.test.js',
    'performance-properties.test.js',
    'conditional-properties.test.js'
  ];
  
  const existingTests = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'));
  const missingTests = expectedTests.filter(test => 
    !existingTests.some(existing => existing.includes(test.replace('.test.js', '')))
  );
  
  if (missingTests.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'coverage',
      message: `Missing test files: ${missingTests.join(', ')}`
    });
  }
  
  // Performance recommendations
  recommendations.push({
    priority: 'low',
    category: 'performance',
    message: 'Consider reducing test iterations for faster CI/CD pipeline'
  });
  
  // Maintenance recommendations
  recommendations.push({
    priority: 'low',
    category: 'maintenance',
    message: 'Add automated test validation to build process'
  });
  
  return recommendations;
}

/**
 * Main validation function
 */
function validateAllTests() {
  console.log('🧪 Starting comprehensive test validation...');
  console.log('=' .repeat(60));
  
  // Get all test files
  const testFiles = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.test.js') || f.startsWith('run-') || f.includes('test'))
    .map(f => path.join(__dirname, f));
  
  validationResults.totalFiles = testFiles.length;
  
  // Validate each test file
  for (const filePath of testFiles) {
    const result = validateTestFile(filePath);
    
    if (result.valid) {
      validationResults.validTests++;
      console.log(`✅ ${result.file}: Valid`);
    } else {
      validationResults.invalidTests++;
      console.log(`❌ ${result.file}: Issues found`);
      result.issues.forEach(issue => {
        console.log(`   • ${issue}`);
        validationResults.issues.push(`${result.file}: ${issue}`);
      });
    }
  }
  
  // Validate test runners
  const runnerIssues = validateTestRunners();
  validationResults.issues.push(...runnerIssues);
  
  // Validate browser compatibility
  const compatibilityIssues = validateBrowserCompatibility();
  validationResults.issues.push(...compatibilityIssues);
  
  // Generate recommendations
  validationResults.recommendations = generateRecommendations(validationResults);
  
  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Files: ${validationResults.totalFiles}`);
  console.log(`Valid Tests: ${validationResults.validTests} ✅`);
  console.log(`Invalid Tests: ${validationResults.invalidTests} ❌`);
  console.log(`Total Issues: ${validationResults.issues.length}`);
  
  if (validationResults.issues.length > 0) {
    console.log('\n❌ Issues Found:');
    validationResults.issues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }
  
  if (validationResults.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    validationResults.recommendations.forEach(rec => {
      const icon = rec.priority === 'high' ? '🔴' : 
                  rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${icon} [${rec.category.toUpperCase()}] ${rec.message}`);
    });
  }
  
  console.log('='.repeat(60));
  
  // Return validation results
  return validationResults;
}

// Run validation
const results = validateAllTests();

// Exit with appropriate code
const exitCode = results.invalidTests > 0 ? 1 : 0;
process.exit(exitCode);