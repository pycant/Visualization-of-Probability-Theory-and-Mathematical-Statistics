/**
 * D3 Library Loading Unit Test
 * 
 * Tests that the D3 contour library loads correctly and provides
 * the required d3.contours function for contour generation.
 * 
 * **Validates: Requirements 1.1**
 */

(function() {
  'use strict';

  // Test configuration
  const D3_TEST_CONFIG = {
    timeout: 5000,
    verbose: true
  };

  // Test results storage
  let d3TestResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  /**
   * Test 1: D3 Library Availability
   * Validates that the D3 library is loaded and available globally
   */
  function testD3LibraryAvailability() {
    console.log('Testing D3 Library Availability');
    
    // Check if d3 is available globally
    if (typeof d3 === 'undefined') {
      throw new Error('D3 library is not loaded or not available globally');
    }

    // Check if d3 is an object with expected properties
    if (typeof d3 !== 'object' || d3 === null) {
      throw new Error('D3 library is not properly initialized as an object');
    }

    return { passed: true, details: 'D3 library is available globally' };
  }

  /**
   * Test 2: D3 Contours Function Availability
   * Validates that d3.contours function is available after library load
   */
  function testD3ContoursFunction() {
    console.log('Testing D3 Contours Function Availability');
    
    // Check if d3.contours function exists
    if (typeof d3.contours !== 'function') {
      throw new Error('d3.contours function is not available. Expected function, got: ' + typeof d3.contours);
    }

    // Test that d3.contours can be called and returns a contour generator
    let contourGenerator;
    try {
      contourGenerator = d3.contours();
    } catch (error) {
      throw new Error('Failed to create contour generator: ' + error.message);
    }

    // Verify the contour generator has expected methods
    const expectedMethods = ['size', 'thresholds', 'smooth'];
    for (const method of expectedMethods) {
      if (typeof contourGenerator[method] !== 'function') {
        throw new Error(`Contour generator missing expected method: ${method}`);
      }
    }

    return { passed: true, details: 'd3.contours function is available and functional' };
  }

  /**
   * Test 3: Basic Contour Generation
   * Validates that d3.contours can generate contours from sample data
   */
  function testBasicContourGeneration() {
    console.log('Testing Basic Contour Generation');
    
    // Create simple test data (4x4 grid)
    const testData = [
      0.1, 0.2, 0.3, 0.2,
      0.2, 0.5, 0.8, 0.5,
      0.3, 0.8, 1.0, 0.8,
      0.2, 0.5, 0.8, 0.5
    ];
    
    const width = 4;
    const height = 4;
    const thresholds = [0.3, 0.6, 0.9];

    let contours;
    try {
      contours = d3.contours()
        .size([width, height])
        .thresholds(thresholds)(testData);
    } catch (error) {
      throw new Error('Failed to generate contours: ' + error.message);
    }

    // Verify contours were generated
    if (!Array.isArray(contours)) {
      throw new Error('Contour generation did not return an array');
    }

    if (contours.length === 0) {
      throw new Error('No contours were generated from test data');
    }

    // Verify contour structure
    for (let i = 0; i < contours.length; i++) {
      const contour = contours[i];
      
      // Each contour should have a value property
      if (typeof contour.value !== 'number') {
        throw new Error(`Contour ${i} missing or invalid value property`);
      }
      
      // Each contour should have coordinates
      if (!contour.coordinates || !Array.isArray(contour.coordinates)) {
        throw new Error(`Contour ${i} missing or invalid coordinates property`);
      }
    }

    return { 
      passed: true, 
      details: `Basic contour generation successful (${contours.length} contours generated)`,
      contourCount: contours.length
    };
  }

  /**
   * Test 4: Contour Coordinate Structure
   * Validates that generated contours have the expected coordinate structure
   */
  function testContourCoordinateStructure() {
    console.log('Testing Contour Coordinate Structure');
    
    // Create test data with clear contour structure
    const testData = [
      0, 0, 0, 0, 0,
      0, 1, 1, 1, 0,
      0, 1, 2, 1, 0,
      0, 1, 1, 1, 0,
      0, 0, 0, 0, 0
    ];
    
    const width = 5;
    const height = 5;
    const thresholds = [0.5, 1.5];

    let contours;
    try {
      contours = d3.contours()
        .size([width, height])
        .thresholds(thresholds)(testData);
    } catch (error) {
      throw new Error('Failed to generate contours for coordinate structure test: ' + error.message);
    }

    // Find a contour with coordinates to test
    let testContour = null;
    for (const contour of contours) {
      if (contour.coordinates && contour.coordinates.length > 0) {
        testContour = contour;
        break;
      }
    }

    if (!testContour) {
      throw new Error('No contours with coordinates found for structure testing');
    }

    // Verify MultiPolygon structure: coordinates should be array of polygons
    if (!Array.isArray(testContour.coordinates)) {
      throw new Error('Contour coordinates should be an array (MultiPolygon structure)');
    }

    // Each polygon should be an array of rings
    for (let i = 0; i < testContour.coordinates.length; i++) {
      const polygon = testContour.coordinates[i];
      if (!Array.isArray(polygon)) {
        throw new Error(`Polygon ${i} should be an array of rings`);
      }

      // Each ring should be an array of coordinate pairs
      for (let j = 0; j < polygon.length; j++) {
        const ring = polygon[j];
        if (!Array.isArray(ring)) {
          throw new Error(`Ring ${j} in polygon ${i} should be an array of coordinates`);
        }

        // Each coordinate should be [x, y] pair
        for (let k = 0; k < ring.length; k++) {
          const coord = ring[k];
          if (!Array.isArray(coord) || coord.length !== 2) {
            throw new Error(`Coordinate ${k} in ring ${j} should be [x, y] pair`);
          }
          
          if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
            throw new Error(`Coordinate ${k} in ring ${j} should contain numeric values`);
          }
        }
      }
    }

    return { 
      passed: true, 
      details: 'Contour coordinate structure is valid (MultiPolygon format)',
      polygonCount: testContour.coordinates.length
    };
  }

  /**
   * Run all D3 library loading tests
   */
  function runD3LibraryTests() {
    console.log('🔧 Starting D3 Library Loading Tests');
    console.log('Testing D3 contour library availability and functionality...');
    
    const startTime = performance.now();
    
    // Reset results
    d3TestResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    const tests = [
      { name: 'D3 Library Availability', fn: testD3LibraryAvailability },
      { name: 'D3 Contours Function Availability', fn: testD3ContoursFunction },
      { name: 'Basic Contour Generation', fn: testBasicContourGeneration },
      { name: 'Contour Coordinate Structure', fn: testContourCoordinateStructure }
    ];

    for (const test of tests) {
      try {
        console.log(`Running: ${test.name}`);
        const result = test.fn();
        
        d3TestResults.passed++;
        d3TestResults.details.push({
          test: test.name,
          status: 'passed',
          details: result.details,
          data: result
        });
        
        console.log(`✅ ${test.name}: PASSED`);
        
      } catch (error) {
        d3TestResults.failed++;
        d3TestResults.errors.push(`${test.name}: ${error.message}`);
        d3TestResults.details.push({
          test: test.name,
          status: 'failed',
          error: error.message
        });
        
        console.error(`❌ ${test.name}: FAILED - ${error.message}`);
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Summary
    const summary = {
      totalTests: tests.length,
      passed: d3TestResults.passed,
      failed: d3TestResults.failed,
      duration: Math.round(duration),
      details: d3TestResults.details,
      errors: d3TestResults.errors
    };
    
    console.log('\n📊 D3 Library Test Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('🎉 All D3 library tests passed!');
    } else {
      console.error('💥 Some D3 library tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize D3 library tests
   */
  function initializeD3LibraryTests() {
    // Wait for D3 to be loaded
    if (typeof d3 === 'undefined') {
      setTimeout(initializeD3LibraryTests, 100);
      return;
    }
    
    // Run tests immediately after D3 is available
    const results = runD3LibraryTests();
    
    // Store results globally for debugging
    window.D3LibraryTestResults = results;
    
    return results;
  }

  // Export for use in other modules
  window.D3LibraryTester = {
    runTests: runD3LibraryTests,
    getResults: () => d3TestResults,
    testLibraryAvailability: testD3LibraryAvailability,
    testContoursFunction: testD3ContoursFunction,
    testBasicGeneration: testBasicContourGeneration,
    testCoordinateStructure: testContourCoordinateStructure
  };

  // Auto-run tests if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('d3-test=true') || 
       window.location.hash.includes('d3-test'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeD3LibraryTests, 1000);
    });
  }

})();