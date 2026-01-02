/**
 * Chapter 3 Animation Timing Verification Tests
 * Validates that animation speed and smoothness settings are preserved
 * Requirements: 3.3
 */

// Expected animation timing parameters
const EXPECTED_FRAME_RATE_LIMIT = 30; // FPS (1000/30 = 33.33ms)
const EXPECTED_MIN_DT = 1000 / EXPECTED_FRAME_RATE_LIMIT;
const EXPECTED_ANIMATION_SPEED = 0.00005; // Animation time multiplier
const EXPECTED_EDGE_BARS_SPEED = 0.00008; // Edge bars animation speed

/**
 * Test that verifies frame rate limiting is preserved
 */
function testFrameRateLimiting() {
  console.log("Testing frame rate limiting parameters...");
  
  const visualizer = new Chapter3Visualizer();
  const functionString = visualizer.startBackgroundContours.toString();
  
  // Check for bgMinDt setting (frame rate limiting)
  const minDtRegex = /bgMinDt = 1000 \/ (\d+)/;
  const minDtMatch = functionString.match(minDtRegex);
  
  if (!minDtMatch) {
    throw new Error("Could not find bgMinDt frame rate limiting in startBackgroundContours");
  }
  
  const actualFrameRate = parseInt(minDtMatch[1]);
  if (actualFrameRate !== EXPECTED_FRAME_RATE_LIMIT) {
    throw new Error(`Frame rate limit mismatch. Expected: ${EXPECTED_FRAME_RATE_LIMIT} FPS, Actual: ${actualFrameRate} FPS`);
  }
  
  // Verify the calculated minDt value
  const minDtValueRegex = /if \(this\.bgLastRAF && now - this\.bgLastRAF < this\.bgMinDt\)/;
  if (!functionString.match(minDtValueRegex)) {
    throw new Error("Frame rate limiting logic not found in animation loop");
  }
  
  console.log("✓ Frame rate limiting verification passed");
  return true;
}

/**
 * Test that verifies animation speed multiplier is preserved
 */
function testAnimationSpeed() {
  console.log("Testing animation speed parameters...");
  
  const visualizer = new Chapter3Visualizer();
  const functionString = visualizer.startBackgroundContours.toString();
  
  // Check for main animation speed multiplier
  const animSpeedRegex = /const t = now \* ([\d.]+)/;
  const animSpeedMatch = functionString.match(animSpeedRegex);
  
  if (!animSpeedMatch) {
    throw new Error("Could not find animation speed multiplier in startBackgroundContours");
  }
  
  const actualAnimSpeed = parseFloat(animSpeedMatch[1]);
  if (actualAnimSpeed !== EXPECTED_ANIMATION_SPEED) {
    throw new Error(`Animation speed mismatch. Expected: ${EXPECTED_ANIMATION_SPEED}, Actual: ${actualAnimSpeed}`);
  }
  
  console.log("✓ Animation speed verification passed");
  return true;
}

/**
 * Test that verifies edge bars animation timing is preserved
 */
function testEdgeBarsAnimationTiming() {
  console.log("Testing edge bars animation timing...");
  
  const visualizer = new Chapter3Visualizer();
  
  // Check updateMarginalGlow function for edge bars timing
  const marginalGlowString = visualizer.updateMarginalGlow.toString();
  
  // Look for the edge bars animation speed
  const edgeBarsSpeedRegex = /\* ([\d.]+)/;
  const edgeBarsSpeedMatch = marginalGlowString.match(edgeBarsSpeedRegex);
  
  if (!edgeBarsSpeedMatch) {
    throw new Error("Could not find edge bars animation speed in updateMarginalGlow");
  }
  
  const actualEdgeBarsSpeed = parseFloat(edgeBarsSpeedMatch[1]);
  if (actualEdgeBarsSpeed !== EXPECTED_EDGE_BARS_SPEED) {
    throw new Error(`Edge bars animation speed mismatch. Expected: ${EXPECTED_EDGE_BARS_SPEED}, Actual: ${actualEdgeBarsSpeed}`);
  }
  
  console.log("✓ Edge bars animation timing verification passed");
  return true;
}

/**
 * Test that verifies requestAnimationFrame usage is preserved
 */
function testAnimationFrameUsage() {
  console.log("Testing requestAnimationFrame usage...");
  
  const visualizer = new Chapter3Visualizer();
  const functionString = visualizer.startBackgroundContours.toString();
  
  // Check for proper requestAnimationFrame usage
  const rafUsageRegex = /requestAnimationFrame\(draw\)/g;
  const rafMatches = functionString.match(rafUsageRegex);
  
  if (!rafMatches || rafMatches.length < 2) {
    throw new Error("requestAnimationFrame not properly used in animation loop");
  }
  
  // Verify the animation loop structure
  const animLoopRegex = /const draw = \(now\) => \{[\s\S]*?requestAnimationFrame\(draw\);[\s\S]*?\}/;
  if (!functionString.match(animLoopRegex)) {
    throw new Error("Animation loop structure not found or malformed");
  }
  
  console.log("✓ requestAnimationFrame usage verification passed");
  return true;
}

/**
 * Test that verifies performance monitoring is preserved
 */
function testPerformanceMonitoring() {
  console.log("Testing performance monitoring parameters...");
  
  const visualizer = new Chapter3Visualizer();
  const functionString = visualizer.startBackgroundContours.toString();
  
  // Check for performance monitoring variables
  const perfVarsRegex = /this\.bgFrameAccum|this\.bgFrameSamples|this\.performanceMode/g;
  const perfVarsMatches = functionString.match(perfVarsRegex);
  
  if (!perfVarsMatches || perfVarsMatches.length < 3) {
    throw new Error("Performance monitoring variables not found");
  }
  
  // Check for performance degradation thresholds
  const perfThresholdRegex = /avg > (\d+)/;
  const perfThresholdMatch = functionString.match(perfThresholdRegex);
  
  if (!perfThresholdMatch) {
    throw new Error("Performance degradation threshold not found");
  }
  
  const degradationThreshold = parseInt(perfThresholdMatch[1]);
  if (degradationThreshold !== 45) {
    throw new Error(`Performance degradation threshold mismatch. Expected: 45ms, Actual: ${degradationThreshold}ms`);
  }
  
  console.log("✓ Performance monitoring verification passed");
  return true;
}

/**
 * Test that verifies noise animation parameters are preserved
 */
function testNoiseAnimationParameters() {
  console.log("Testing noise animation parameters...");
  
  const visualizer = new Chapter3Visualizer();
  const functionString = visualizer.startBackgroundContours.toString();
  
  // Check for noise octaves and their timing multipliers
  const noiseOctavesRegex = /const v1 = this\.bgNoise\.noise2\(x \* scale, y \* scale \+ t\)[\s\S]*?const v2 =[\s\S]*?\* ([\d.]+)\)[\s\S]*?const v3 =[\s\S]*?\* ([\d.]+)\)/;
  const noiseOctavesMatch = functionString.match(noiseOctavesRegex);
  
  if (!noiseOctavesMatch) {
    throw new Error("Noise octaves animation parameters not found");
  }
  
  const octave2Multiplier = parseFloat(noiseOctavesMatch[1]);
  const octave3Multiplier = parseFloat(noiseOctavesMatch[2]);
  
  if (octave2Multiplier !== 0.5) {
    throw new Error(`Noise octave 2 timing multiplier mismatch. Expected: 0.5, Actual: ${octave2Multiplier}`);
  }
  
  if (octave3Multiplier !== 0.25) {
    throw new Error(`Noise octave 3 timing multiplier mismatch. Expected: 0.25, Actual: ${octave3Multiplier}`);
  }
  
  console.log("✓ Noise animation parameters verification passed");
  return true;
}

/**
 * Run all animation timing tests
 */
function runAnimationTimingTests() {
  console.log("=== Chapter 3 Animation Timing Tests ===");
  
  const tests = [
    testFrameRateLimiting,
    testAnimationSpeed,
    testEdgeBarsAnimationTiming,
    testAnimationFrameUsage,
    testPerformanceMonitoring,
    testNoiseAnimationParameters
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (error) {
      console.error(`✗ ${test.name} failed:`, error.message);
      failed++;
    }
  }
  
  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log("🎉 All animation timing tests passed!");
    return true;
  } else {
    console.log("❌ Some animation timing tests failed!");
    return false;
  }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAnimationTimingTests,
    testFrameRateLimiting,
    testAnimationSpeed,
    testEdgeBarsAnimationTiming,
    testAnimationFrameUsage,
    testPerformanceMonitoring,
    testNoiseAnimationParameters
  };
}