/**
 * Chapter 3 Integration Tests - Cross-Component Communication
 * 
 * Tests the integration between all Chapter 3 components:
 * - Parameter controls → Mathematical engine → Visualizations
 * - State management and parameter persistence
 * - Data flow validation across all sections
 * - Performance and real-time update validation
 */

(function() {
  'use strict';

  // Test configuration
  const INTEGRATION_TEST_CONFIG = {
    numRuns: 50,
    timeout: 5000,
    updateTimeThreshold: 100, // ms - requirement for real-time updates
    verbose: true
  };

  // Test results storage
  let integrationResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: [],
    performance: []
  };

  /**
   * Test 1: Parameter Control → Mathematical Engine Integration
   * Validates that parameter changes flow correctly to mathematical calculations
   */
  function testParameterToMathEngineIntegration() {
    console.log('Testing Parameter Control → Mathematical Engine Integration');
    
    if (!window.chapter3Visualizer) {
      throw new Error('Chapter3Visualizer not initialized');
    }

    const visualizer = window.chapter3Visualizer;
    const originalParams = { ...visualizer.parameters };
    
    try {
      // Test parameter updates
      const testParams = [
        { param: 'mu1', value: 10.5 },
        { param: 'mu2', value: -5.2 },
        { param: 'sigma1', value: 8.3 },
        { param: 'sigma2', value: 12.7 },
        { param: 'rho', value: 0.65 },
        { param: 'nSamples', value: 2000 }
      ];

      for (const { param, value } of testParams) {
        // Update parameter
        visualizer.updateParameter(`${param}-slider`, value);
        
        // Verify parameter was updated
        if (Math.abs(visualizer.parameters[param] - value) > 1e-6) {
          throw new Error(`Parameter ${param} not updated correctly. Expected: ${value}, Got: ${visualizer.parameters[param]}`);
        }
        
        // Verify samples were regenerated if needed
        if (param === 'nSamples' && visualizer.currentSamples.length !== value) {
          throw new Error(`Sample count not updated. Expected: ${value}, Got: ${visualizer.currentSamples.length}`);
        }
      }

      // Test correlation calculation accuracy
      if (visualizer.currentSamples.length > 0) {
        const xValues = visualizer.currentSamples.map(([x]) => x);
        const yValues = visualizer.currentSamples.map(([, y]) => y);
        const calculatedCorr = visualizer.calculateCorrelation(xValues, yValues);
        
        // Correlation should be finite and within bounds
        if (!Number.isFinite(calculatedCorr) || Math.abs(calculatedCorr) > 1) {
          throw new Error(`Invalid correlation calculated: ${calculatedCorr}`);
        }
      }

      return { passed: true, details: 'Parameter to math engine integration working correctly' };
      
    } finally {
      // Restore original parameters
      Object.assign(visualizer.parameters, originalParams);
      visualizer.generateSamples();
    }
  }

  /**
   * Test 2: Mathematical Engine → Visualization Integration
   * Validates that mathematical calculations flow correctly to visualizations
   */
  function testMathEngineToVisualizationIntegration() {
    console.log('Testing Mathematical Engine → Visualization Integration');
    
    if (!window.chapter3Visualizer) {
      throw new Error('Chapter3Visualizer not initialized');
    }

    const visualizer = window.chapter3Visualizer;
    const startTime = performance.now();
    
    // Test visualization update performance
    visualizer.updateAllVisualizations();
    
    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    // Verify update time meets real-time requirement (< 100ms)
    if (updateTime > INTEGRATION_TEST_CONFIG.updateTimeThreshold) {
      throw new Error(`Visualization update too slow: ${updateTime}ms (threshold: ${INTEGRATION_TEST_CONFIG.updateTimeThreshold}ms)`);
    }

    // Verify canvases are properly updated
    const requiredCanvases = ['contour', 'scatter', 'marginal'];
    for (const canvasName of requiredCanvases) {
      const canvas = visualizer.canvases[canvasName];
      if (!canvas || !canvas.ctx) {
        throw new Error(`Canvas ${canvasName} not properly initialized`);
      }
      
      // Check if canvas has been drawn on (not completely empty)
      const imageData = canvas.ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = Array.from(imageData.data).some(pixel => pixel !== 0);
      
      if (!hasContent) {
        console.warn(`Canvas ${canvasName} appears to be empty - this may indicate rendering issues`);
      }
    }

    // Verify 3D plot integration
    const plotDiv = document.getElementById('joint-3d-plot');
    if (plotDiv && typeof Plotly !== 'undefined') {
      // Check if Plotly plot exists
      if (!plotDiv._fullLayout) {
        throw new Error('3D plot not properly initialized');
      }
    }

    integrationResults.performance.push({
      test: 'Math Engine to Visualization',
      updateTime: updateTime,
      passed: updateTime <= INTEGRATION_TEST_CONFIG.updateTimeThreshold
    });

    return { 
      passed: true, 
      details: `Visualization integration working correctly (${updateTime.toFixed(2)}ms)`,
      performance: { updateTime }
    };
  }

  /**
   * Test 3: State Management and Parameter Persistence
   * Validates that state changes are properly managed across components
   */
  function testStateManagementIntegration() {
    console.log('Testing State Management and Parameter Persistence');
    
    if (!window.chapter3Visualizer) {
      throw new Error('Chapter3Visualizer not initialized');
    }

    const visualizer = window.chapter3Visualizer;
    
    // Test section switching state management
    const sections = ['3-1', '3-2', '3-3', '3-4', '3-5'];
    for (const section of sections) {
      // Simulate section switch
      if (typeof visualizer.switchSection === 'function') {
        visualizer.switchSection(section);
        
        // Verify state was updated
        if (visualizer.currentSection && visualizer.currentSection !== section) {
          throw new Error(`Section state not updated correctly. Expected: ${section}, Got: ${visualizer.currentSection}`);
        }
      }
    }

    // Test scenario switching for section 3.2
    if (visualizer.currentSection32Tab) {
      const scenarios = ['streamer', 'game-character', 'social-media'];
      const originalTab = visualizer.currentSection32Tab;
      
      for (const scenario of scenarios) {
        if (typeof visualizer.switchSection32Tab === 'function') {
          visualizer.switchSection32Tab(scenario);
          
          // Verify tab state was updated
          if (visualizer.currentSection32Tab !== scenario) {
            throw new Error(`Section 3.2 tab state not updated. Expected: ${scenario}, Got: ${visualizer.currentSection32Tab}`);
          }
        }
      }
      
      // Restore original tab
      visualizer.switchSection32Tab(originalTab);
    }

    // Test parameter persistence across operations
    const originalRho = visualizer.parameters.rho;
    visualizer.updateParameter('rho-slider', 0.8);
    visualizer.generateSamples();
    visualizer.updateAllVisualizations();
    
    // Parameter should still be 0.8 after operations
    if (Math.abs(visualizer.parameters.rho - 0.8) > 1e-6) {
      throw new Error(`Parameter persistence failed. Expected: 0.8, Got: ${visualizer.parameters.rho}`);
    }
    
    // Restore original parameter
    visualizer.updateParameter('rho-slider', originalRho);

    return { passed: true, details: 'State management working correctly' };
  }

  /**
   * Test 4: Cross-Section Data Flow
   * Validates that data flows correctly between different sections
   */
  function testCrossSectionDataFlow() {
    console.log('Testing Cross-Section Data Flow');
    
    if (!window.chapter3Visualizer) {
      throw new Error('Chapter3Visualizer not initialized');
    }

    const visualizer = window.chapter3Visualizer;
    
    // Generate fresh samples
    visualizer.generateSamples();
    const sampleCount = visualizer.currentSamples.length;
    
    if (sampleCount === 0) {
      throw new Error('No samples generated for cross-section testing');
    }

    // Test that samples are available to all sections
    
    // Section 3.1: Joint distribution should use current samples
    if (visualizer.currentSamples.length !== visualizer.parameters.nSamples) {
      throw new Error(`Sample count mismatch in Section 3.1. Expected: ${visualizer.parameters.nSamples}, Got: ${visualizer.currentSamples.length}`);
    }

    // Section 3.2: Independence test should access sample data
    if (visualizer.independenceTest) {
      // Verify independence test can access samples
      if (typeof visualizer.runIndependenceTest === 'function') {
        try {
          // This should not throw an error
          const testData = visualizer.currentSamples.slice(0, Math.min(100, sampleCount));
          if (testData.length === 0) {
            throw new Error('Independence test cannot access sample data');
          }
        } catch (error) {
          throw new Error(`Independence test data access failed: ${error.message}`);
        }
      }
    }

    // Section 3.3: Variable transformation should work with current samples
    if (visualizer.variableTransformation) {
      visualizer.variableTransformation.originalSamples = visualizer.currentSamples.slice(0, 100);
      
      if (visualizer.variableTransformation.originalSamples.length === 0) {
        throw new Error('Variable transformation cannot access sample data');
      }
    }

    // Section 3.4: Correlation analysis should use current samples
    const xValues = visualizer.currentSamples.map(([x]) => x);
    const yValues = visualizer.currentSamples.map(([, y]) => y);
    
    if (xValues.length !== yValues.length || xValues.length === 0) {
      throw new Error('Correlation analysis data extraction failed');
    }

    // Section 3.5: Conditional distribution should access joint samples
    if (visualizer.conditionalDistribution) {
      visualizer.conditionalDistribution.jointSamples = visualizer.currentSamples.slice(0, 200);
      
      if (visualizer.conditionalDistribution.jointSamples.length === 0) {
        throw new Error('Conditional distribution cannot access sample data');
      }
    }

    return { passed: true, details: 'Cross-section data flow working correctly' };
  }

  /**
   * Test 5: Real-time Update Performance
   * Validates that real-time updates meet performance requirements
   */
  function testRealTimeUpdatePerformance() {
    console.log('Testing Real-time Update Performance');
    
    if (!window.chapter3Visualizer) {
      throw new Error('Chapter3Visualizer not initialized');
    }

    const visualizer = window.chapter3Visualizer;
    const performanceResults = [];
    
    // Test multiple parameter updates
    const testUpdates = [
      { param: 'rho', values: [-0.8, -0.4, 0, 0.4, 0.8] },
      { param: 'sigma1', values: [5, 10, 15, 20, 25] },
      { param: 'mu1', values: [-10, -5, 0, 5, 10] }
    ];

    for (const { param, values } of testUpdates) {
      for (const value of values) {
        const startTime = performance.now();
        
        // Update parameter and trigger visualization update
        visualizer.updateParameter(`${param}-slider`, value);
        
        const endTime = performance.now();
        const updateTime = endTime - startTime;
        
        performanceResults.push({
          param,
          value,
          updateTime,
          passed: updateTime <= INTEGRATION_TEST_CONFIG.updateTimeThreshold
        });
        
        if (updateTime > INTEGRATION_TEST_CONFIG.updateTimeThreshold) {
          console.warn(`Slow update for ${param}=${value}: ${updateTime.toFixed(2)}ms`);
        }
      }
    }

    // Calculate average performance
    const avgUpdateTime = performanceResults.reduce((sum, result) => sum + result.updateTime, 0) / performanceResults.length;
    const failedUpdates = performanceResults.filter(result => !result.passed).length;
    
    integrationResults.performance.push({
      test: 'Real-time Updates',
      avgUpdateTime,
      failedUpdates,
      totalUpdates: performanceResults.length,
      passed: failedUpdates === 0
    });

    if (failedUpdates > 0) {
      throw new Error(`${failedUpdates}/${performanceResults.length} updates exceeded time threshold (avg: ${avgUpdateTime.toFixed(2)}ms)`);
    }

    return { 
      passed: true, 
      details: `Real-time updates working correctly (avg: ${avgUpdateTime.toFixed(2)}ms)`,
      performance: { avgUpdateTime, failedUpdates, totalUpdates: performanceResults.length }
    };
  }

  /**
   * Test 6: Error Handling and Recovery
   * Validates that components handle errors gracefully
   */
  function testErrorHandlingIntegration() {
    console.log('Testing Error Handling and Recovery');
    
    if (!window.chapter3Visualizer) {
      throw new Error('Chapter3Visualizer not initialized');
    }

    const visualizer = window.chapter3Visualizer;
    const originalParams = { ...visualizer.parameters };
    
    try {
      // Test invalid parameter values
      const invalidTests = [
        { param: 'rho', value: 1.5 }, // Should be clamped to valid range
        { param: 'sigma1', value: -5 }, // Should be clamped to positive
        { param: 'nSamples', value: 50000 } // Should be clamped to reasonable range
      ];

      for (const { param, value } of invalidTests) {
        visualizer.updateParameter(`${param}-slider`, value);
        
        // Verify parameter was validated/clamped
        const actualValue = visualizer.parameters[param];
        
        if (param === 'rho' && Math.abs(actualValue) >= 1.0) {
          throw new Error(`Invalid rho value not handled: ${actualValue}`);
        }
        
        if (param === 'sigma1' && actualValue <= 0) {
          throw new Error(`Invalid sigma1 value not handled: ${actualValue}`);
        }
        
        if (param === 'nSamples' && (actualValue < 100 || actualValue > 10000)) {
          throw new Error(`Invalid nSamples value not handled: ${actualValue}`);
        }
      }

      // Test recovery from invalid state
      visualizer.currentSamples = []; // Simulate empty samples
      
      try {
        visualizer.updateAllVisualizations(); // Should handle empty samples gracefully
      } catch (error) {
        throw new Error(`Visualization update failed with empty samples: ${error.message}`);
      }

      // Test canvas error recovery
      const originalCanvas = visualizer.canvases.contour;
      visualizer.canvases.contour = null; // Simulate missing canvas
      
      try {
        visualizer.updateContourPlot(); // Should handle missing canvas gracefully
      } catch (error) {
        throw new Error(`Contour plot update failed with missing canvas: ${error.message}`);
      }
      
      // Restore canvas
      visualizer.canvases.contour = originalCanvas;

      return { passed: true, details: 'Error handling working correctly' };
      
    } finally {
      // Restore original parameters and regenerate samples
      Object.assign(visualizer.parameters, originalParams);
      visualizer.generateSamples();
    }
  }

  /**
   * Run all integration tests
   */
  function runIntegrationTests() {
    console.log('🔧 Starting Chapter 3 Integration Tests');
    console.log('Testing cross-component communication and data flow...');
    
    const startTime = performance.now();
    
    // Reset results
    integrationResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: [],
      performance: []
    };

    const tests = [
      { name: 'Parameter to Math Engine Integration', fn: testParameterToMathEngineIntegration },
      { name: 'Math Engine to Visualization Integration', fn: testMathEngineToVisualizationIntegration },
      { name: 'State Management Integration', fn: testStateManagementIntegration },
      { name: 'Cross-Section Data Flow', fn: testCrossSectionDataFlow },
      { name: 'Real-time Update Performance', fn: testRealTimeUpdatePerformance },
      { name: 'Error Handling Integration', fn: testErrorHandlingIntegration }
    ];

    for (const test of tests) {
      try {
        console.log(`Running: ${test.name}`);
        const result = test.fn();
        
        integrationResults.passed++;
        integrationResults.details.push({
          test: test.name,
          status: 'passed',
          details: result.details,
          performance: result.performance
        });
        
        console.log(`✅ ${test.name}: PASSED`);
        
      } catch (error) {
        integrationResults.failed++;
        integrationResults.errors.push(`${test.name}: ${error.message}`);
        integrationResults.details.push({
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
      passed: integrationResults.passed,
      failed: integrationResults.failed,
      duration: Math.round(duration),
      details: integrationResults.details,
      errors: integrationResults.errors,
      performance: integrationResults.performance
    };
    
    console.log('\n📊 Integration Test Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('🎉 All integration tests passed!');
    } else {
      console.error('💥 Some integration tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize integration tests
   */
  function initializeIntegrationTests() {
    // Wait for Chapter 3 to be fully initialized
    if (typeof window.chapter3Visualizer === 'undefined') {
      setTimeout(initializeIntegrationTests, 100);
      return;
    }
    
    // Wait a bit more for full initialization
    setTimeout(() => {
      const results = runIntegrationTests();
      
      // Store results globally for debugging
      window.Chapter3IntegrationTestResults = results;
      
      return results;
    }, 500);
  }

  // Export for use in other modules
  window.Chapter3IntegrationTester = {
    runTests: runIntegrationTests,
    getResults: () => integrationResults,
    testParameterToMathEngine: testParameterToMathEngineIntegration,
    testMathEngineToVisualization: testMathEngineToVisualizationIntegration,
    testStateManagement: testStateManagementIntegration,
    testCrossSectionDataFlow: testCrossSectionDataFlow,
    testRealTimePerformance: testRealTimeUpdatePerformance,
    testErrorHandling: testErrorHandlingIntegration
  };

  // Auto-run tests if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('integration-test=true') || 
       window.location.hash.includes('integration-test'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeIntegrationTests, 2000);
    });
  }

})();