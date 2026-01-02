/**
 * Test Runner for Chapter 3 Contour Coordinate Property Tests
 * 
 * **Feature: contour-line-fix, Property 2: Contour coordinates maintain curve characteristics without normalization**
 * **Validates: Requirements 1.3, 2.3**
 */

(function() {
  'use strict';

  /**
   * Run contour coordinate property tests
   */
  async function runContourCoordinatePropertyTests() {
    console.log('🚀 Starting Contour Coordinate Property Tests...');
    
    try {
      // Check dependencies
      if (typeof fc === 'undefined') {
        throw new Error('fast-check library not loaded. Please include fast-check before running tests.');
      }
      
      if (typeof d3 === 'undefined' || !d3.contours) {
        throw new Error('D3 contours library not loaded. Please include d3-contour before running tests.');
      }
      
      if (typeof window.Chapter3ContourCoordinateTester === 'undefined') {
        throw new Error('Chapter3ContourCoordinateTester not loaded. Please include chapter3-contour-coordinate-properties.test.js');
      }
      
      console.log('✅ All dependencies loaded successfully');
      
      // Run the property tests
      const startTime = performance.now();
      const results = window.Chapter3ContourCoordinateTester.runTests();
      const endTime = performance.now();
      
      const duration = Math.round(endTime - startTime);
      
      // Display results
      console.log('\n' + '='.repeat(50));
      console.log('📊 CONTOUR COORDINATE PROPERTY TEST RESULTS');
      console.log('='.repeat(50));
      console.log(`🕒 Duration: ${duration}ms`);
      console.log(`✅ Passed: ${results.passed}`);
      console.log(`❌ Failed: ${results.failed}`);
      console.log(`📋 Total: ${results.passed + results.failed}`);
      
      if (results.details.length > 0) {
        console.log('\n📝 Test Details:');
        results.details.forEach(detail => console.log(`  ${detail}`));
      }
      
      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  • ${error}`));
      }
      
      const success = results.failed === 0;
      console.log(`\n🎯 Overall Result: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
      console.log('='.repeat(50));
      
      return {
        success,
        passed: results.passed,
        failed: results.failed,
        duration,
        errors: results.errors,
        details: results.details
      };
      
    } catch (error) {
      console.error('💥 Test runner failed:', error.message);
      console.log('\n❌ CONTOUR COORDINATE PROPERTY TESTS FAILED');
      console.log('='.repeat(50));
      
      return {
        success: false,
        passed: 0,
        failed: 1,
        duration: 0,
        errors: [error.message],
        details: [`❌ Test runner error: ${error.message}`]
      };
    }
  }

  /**
   * Auto-run tests if in test environment
   */
  function initializeTestRunner() {
    // Check if we should auto-run tests
    const shouldAutoRun = window.location && (
      window.location.search.includes('test=contour') ||
      window.location.search.includes('test=coordinate') ||
      window.location.search.includes('run-contour-test=true') ||
      window.location.hash.includes('contour-test')
    );
    
    if (shouldAutoRun) {
      console.log('🔍 Contour coordinate test environment detected, starting tests...');
      
      // Wait for DOM and dependencies to load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(runContourCoordinatePropertyTests, 1000);
        });
      } else {
        setTimeout(runContourCoordinatePropertyTests, 1000);
      }
    }
  }

  // Export test runner
  window.ContourCoordinateTestRunner = {
    run: runContourCoordinatePropertyTests
  };

  // Auto-initialize
  initializeTestRunner();

  console.log('📋 Contour Coordinate Property Test Runner loaded');

})();