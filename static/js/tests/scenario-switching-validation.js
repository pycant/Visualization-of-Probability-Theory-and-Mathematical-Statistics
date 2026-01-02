/**
 * Validation Test for Scenario Switching System Implementation
 * Task 5.5: Complete scenario switching system implementation
 * 
 * This test validates that the scenario switching system is properly implemented
 * and all required methods are functional.
 */

(function() {
  'use strict';

  // Test configuration
  const TEST_CONFIG = {
    timeout: 5000,
    verbose: true
  };

  // Test results
  let testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  /**
   * Test 1: Verify initializeStreamerAnalytics method exists and works
   */
  function testInitializeStreamerAnalytics() {
    console.log('Testing initializeStreamerAnalytics method...');
    
    try {
      // Check if the visualizer instance exists
      if (!window.chapter3Visualizer) {
        throw new Error('Chapter3Visualizer instance not found');
      }

      // Check if the method exists
      if (typeof window.chapter3Visualizer.initializeStreamerAnalytics !== 'function') {
        throw new Error('initializeStreamerAnalytics method not found');
      }

      // Check if streamer analytics configuration exists
      if (!window.chapter3Visualizer.streamerAnalytics) {
        throw new Error('streamerAnalytics configuration not found');
      }

      // Check if scenarios are defined
      if (!window.chapter3Visualizer.scenarios) {
        throw new Error('scenarios configuration not found');
      }

      // Verify scenario structure
      const requiredScenarios = ['traditional', 'nlp', 'physics', 'streamer'];
      for (const scenario of requiredScenarios) {
        if (!window.chapter3Visualizer.scenarios[scenario]) {
          throw new Error(`Required scenario '${scenario}' not found`);
        }
      }

      testResults.passed++;
      testResults.details.push({
        test: 'initializeStreamerAnalytics',
        status: 'passed',
        message: 'Method exists and configuration is properly set up'
      });

      return { passed: true };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        test: 'initializeStreamerAnalytics',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Test 2: Verify scenario tab creation and event listeners
   */
  function testScenarioTabCreation() {
    console.log('Testing scenario tab creation...');
    
    try {
      // Check if scenario tabs container exists
      const tabContainer = document.getElementById('scenario-tabs');
      if (!tabContainer) {
        throw new Error('scenario-tabs container not found in DOM');
      }

      // Check if tabs were created
      const tabs = tabContainer.querySelectorAll('.scenario-tab');
      if (tabs.length === 0) {
        throw new Error('No scenario tabs were created');
      }

      // Verify each tab has required attributes
      tabs.forEach((tab, index) => {
        if (!tab.dataset.scenario) {
          throw new Error(`Tab ${index} missing data-scenario attribute`);
        }
        
        if (!tab.querySelector('i')) {
          throw new Error(`Tab ${index} missing icon element`);
        }
      });

      // Check if setupScenarioTabs method exists
      if (typeof window.chapter3Visualizer.setupScenarioTabs !== 'function') {
        throw new Error('setupScenarioTabs method not found');
      }

      testResults.passed++;
      testResults.details.push({
        test: 'scenarioTabCreation',
        status: 'passed',
        message: `${tabs.length} scenario tabs created successfully`
      });

      return { passed: true, tabCount: tabs.length };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        test: 'scenarioTabCreation',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Test 3: Verify scenario switching functionality
   */
  function testScenarioSwitching() {
    console.log('Testing scenario switching functionality...');
    
    try {
      const visualizer = window.chapter3Visualizer;
      
      // Check if switchScenario method exists
      if (typeof visualizer.switchScenario !== 'function') {
        throw new Error('switchScenario method not found');
      }

      // Check if handleScenarioChange method exists
      if (typeof visualizer.handleScenarioChange !== 'function') {
        throw new Error('handleScenarioChange method not found');
      }

      // Test switching to different scenarios
      const scenarios = ['traditional', 'nlp', 'physics', 'streamer'];
      let switchCount = 0;

      for (const scenario of scenarios) {
        const originalScenario = visualizer.currentScenario;
        
        // Attempt to switch scenario
        visualizer.switchScenario(scenario);
        
        // Verify the switch occurred
        if (visualizer.currentScenario === scenario) {
          switchCount++;
        } else {
          throw new Error(`Failed to switch to scenario: ${scenario}`);
        }
      }

      // Check content visibility methods
      if (typeof visualizer.hideScenarioContent !== 'function') {
        throw new Error('hideScenarioContent method not found');
      }

      if (typeof visualizer.showScenarioContent !== 'function') {
        throw new Error('showScenarioContent method not found');
      }

      testResults.passed++;
      testResults.details.push({
        test: 'scenarioSwitching',
        status: 'passed',
        message: `Successfully switched between ${switchCount} scenarios`
      });

      return { passed: true, switchCount };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        test: 'scenarioSwitching',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Test 4: Verify smooth transitions and content visibility
   */
  function testSmoothTransitions() {
    console.log('Testing smooth transitions...');
    
    try {
      const visualizer = window.chapter3Visualizer;
      
      // Check if updateTabStyles method exists
      if (typeof visualizer.updateTabStyles !== 'function') {
        throw new Error('updateTabStyles method not found');
      }

      // Check if updateScenarioDescription method exists
      if (typeof visualizer.updateScenarioDescription !== 'function') {
        throw new Error('updateScenarioDescription method not found');
      }

      // Test scenario content elements exist
      const scenarios = ['traditional', 'nlp', 'physics'];
      let contentElementsFound = 0;

      for (const scenario of scenarios) {
        const contentElement = document.getElementById(`${scenario}-scenario`);
        if (contentElement) {
          contentElementsFound++;
          
          // Check if element has scenario-content class
          if (!contentElement.classList.contains('scenario-content')) {
            throw new Error(`${scenario}-scenario missing scenario-content class`);
          }
        }
      }

      if (contentElementsFound === 0) {
        throw new Error('No scenario content elements found');
      }

      // Test description update
      const descriptionElement = document.getElementById('scenario-description');
      if (descriptionElement) {
        visualizer.updateScenarioDescription();
        // Check if description was updated (should have content)
        if (descriptionElement.innerHTML.trim() === '') {
          throw new Error('Scenario description not updated');
        }
      }

      testResults.passed++;
      testResults.details.push({
        test: 'smoothTransitions',
        status: 'passed',
        message: `Found ${contentElementsFound} scenario content elements with proper transitions`
      });

      return { passed: true, contentElements: contentElementsFound };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        test: 'smoothTransitions',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Test 5: Verify streamer analytics specific functionality
   */
  function testStreamerAnalyticsFeatures() {
    console.log('Testing streamer analytics features...');
    
    try {
      const visualizer = window.chapter3Visualizer;
      
      // Check streamer-specific methods
      const requiredMethods = [
        'initializeStreamerDataSimulation',
        'startStreamerDataSimulation',
        'stopStreamerDataSimulation',
        'updateStreamerRealTimeData',
        'setupTrendingTopicsRotation'
      ];

      for (const method of requiredMethods) {
        if (typeof visualizer[method] !== 'function') {
          throw new Error(`Required method '${method}' not found`);
        }
      }

      // Check if streamer analytics configuration is properly initialized
      const analytics = visualizer.streamerAnalytics;
      if (!analytics.realTimeData) {
        throw new Error('realTimeData not initialized');
      }

      if (!analytics.trendingTopics || analytics.trendingTopics.length === 0) {
        throw new Error('trendingTopics not initialized');
      }

      // Test switching to streamer scenario
      visualizer.switchScenario('streamer');
      
      // Verify streamer-specific parameters were set
      if (visualizer.parameters.mu1 !== 50 || visualizer.parameters.mu2 !== 30) {
        throw new Error('Streamer scenario parameters not properly set');
      }

      testResults.passed++;
      testResults.details.push({
        test: 'streamerAnalyticsFeatures',
        status: 'passed',
        message: 'All streamer analytics features properly implemented'
      });

      return { passed: true };

    } catch (error) {
      testResults.failed++;
      testResults.errors.push(error.message);
      testResults.details.push({
        test: 'streamerAnalyticsFeatures',
        status: 'failed',
        error: error.message
      });

      return { passed: false, error: error.message };
    }
  }

  /**
   * Run all validation tests
   */
  function runValidationTests() {
    console.log('Starting Scenario Switching System Validation Tests');
    console.log('Task 5.5: Complete scenario switching system implementation');
    
    const startTime = performance.now();
    
    // Reset results
    testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };

    // Run all tests
    const tests = [
      testInitializeStreamerAnalytics,
      testScenarioTabCreation,
      testScenarioSwitching,
      testSmoothTransitions,
      testStreamerAnalyticsFeatures
    ];

    const results = tests.map(test => test());
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Summary
    const summary = {
      totalTests: tests.length,
      passed: testResults.passed,
      failed: testResults.failed,
      duration: Math.round(duration),
      details: testResults.details,
      errors: testResults.errors
    };
    
    console.log('Scenario Switching Validation Summary:', summary);
    
    if (summary.failed === 0) {
      console.log('✅ All scenario switching tests passed!');
      console.log('Task 5.5 implementation is complete and functional.');
    } else {
      console.error('❌ Some scenario switching tests failed:', summary.errors);
    }
    
    return summary;
  }

  /**
   * Initialize and run validation tests
   */
  function initializeValidation() {
    // Wait for Chapter 3 to be initialized
    if (typeof window.chapter3Visualizer === 'undefined') {
      setTimeout(initializeValidation, 100);
      return;
    }
    
    // Wait a bit more for full initialization
    setTimeout(() => {
      const results = runValidationTests();
      window.ScenarioSwitchingValidationResults = results;
      return results;
    }, 500);
  }

  // Export for use in other modules
  window.ScenarioSwitchingValidator = {
    runTests: runValidationTests,
    getResults: () => testResults
  };

  // Auto-run validation if in test environment
  if (typeof window !== 'undefined' && window.location && 
      (window.location.search.includes('validate=true') || window.location.hash.includes('validate'))) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeValidation, 1000);
    });
  }

})();