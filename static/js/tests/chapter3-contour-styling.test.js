/**
 * Chapter 3 Contour Styling Verification Tests
 * Validates that contour colors and styling properties are preserved
 * Requirements: 3.2
 */

// Test configuration
const EXPECTED_PALETTE = ["#00f3ff", "#bf00ff", "#00ff66", "#ffc107", "#ff6b6b"];
const EXPECTED_THRESHOLDS_COUNT = 8;
const EXPECTED_LINE_WIDTH_BASE = 1.5;
const EXPECTED_LINE_WIDTH_INCREMENT = 0.3;
const EXPECTED_GLOBAL_ALPHA = 0.8;
const EXPECTED_SHADOW_BLUR = 2;
const EXPECTED_SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

/**
 * Test that verifies the color palette remains unchanged
 */
function testContourColorPalette() {
  console.log("Testing contour color palette...");
  
  // Create a mock Chapter3Visualizer instance
  const visualizer = new Chapter3Visualizer();
  
  // Access the palette from the startBackgroundContours function
  // We'll need to extract it from the function since it's defined locally
  const paletteRegex = /const palette = \[(.*?)\]/;
  const functionString = visualizer.startBackgroundContours.toString();
  const paletteMatch = functionString.match(paletteRegex);
  
  if (!paletteMatch) {
    throw new Error("Could not find palette definition in startBackgroundContours");
  }
  
  // Parse the palette colors
  const paletteString = paletteMatch[1];
  const actualPalette = paletteString.split(',').map(color => 
    color.trim().replace(/['"]/g, '')
  );
  
  // Verify palette matches expected colors
  if (actualPalette.length !== EXPECTED_PALETTE.length) {
    throw new Error(`Palette length mismatch. Expected: ${EXPECTED_PALETTE.length}, Actual: ${actualPalette.length}`);
  }
  
  for (let i = 0; i < EXPECTED_PALETTE.length; i++) {
    if (actualPalette[i] !== EXPECTED_PALETTE[i]) {
      throw new Error(`Palette color mismatch at index ${i}. Expected: ${EXPECTED_PALETTE[i]}, Actual: ${actualPalette[i]}`);
    }
  }
  
  console.log("✓ Contour color palette verification passed");
  return true;
}

/**
 * Test that verifies threshold configuration remains unchanged
 */
function testContourThresholds() {
  console.log("Testing contour thresholds configuration...");
  
  const visualizer = new Chapter3Visualizer();
  
  // Extract thresholds configuration from function
  const thresholdsRegex = /Array\.from\(\{ length: (\d+) \}/;
  const functionString = visualizer.startBackgroundContours.toString();
  const thresholdsMatch = functionString.match(thresholdsRegex);
  
  if (!thresholdsMatch) {
    throw new Error("Could not find thresholds configuration in startBackgroundContours");
  }
  
  const actualThresholdsCount = parseInt(thresholdsMatch[1]);
  
  if (actualThresholdsCount !== EXPECTED_THRESHOLDS_COUNT) {
    throw new Error(`Thresholds count mismatch. Expected: ${EXPECTED_THRESHOLDS_COUNT}, Actual: ${actualThresholdsCount}`);
  }
  
  console.log("✓ Contour thresholds configuration verification passed");
  return true;
}

/**
 * Test that verifies line styling properties remain unchanged
 */
function testContourLineStyling() {
  console.log("Testing contour line styling properties...");
  
  const visualizer = new Chapter3Visualizer();
  const functionString = visualizer.startBackgroundContours.toString();
  
  // Check for global alpha setting
  const globalAlphaRegex = /globalAlpha = ([\d.]+)/;
  const globalAlphaMatch = functionString.match(globalAlphaRegex);
  
  if (!globalAlphaMatch) {
    throw new Error("Could not find globalAlpha setting in startBackgroundContours");
  }
  
  const actualGlobalAlpha = parseFloat(globalAlphaMatch[1]);
  if (actualGlobalAlpha !== EXPECTED_GLOBAL_ALPHA) {
    throw new Error(`Global alpha mismatch. Expected: ${EXPECTED_GLOBAL_ALPHA}, Actual: ${actualGlobalAlpha}`);
  }
  
  // Check for line width configuration
  const lineWidthRegex = /lineWidth = ([\d.]+) \+ idx \* ([\d.]+)/;
  const lineWidthMatch = functionString.match(lineWidthRegex);
  
  if (!lineWidthMatch) {
    throw new Error("Could not find lineWidth configuration in startBackgroundContours");
  }
  
  const actualLineWidthBase = parseFloat(lineWidthMatch[1]);
  const actualLineWidthIncrement = parseFloat(lineWidthMatch[2]);
  
  if (actualLineWidthBase !== EXPECTED_LINE_WIDTH_BASE) {
    throw new Error(`Line width base mismatch. Expected: ${EXPECTED_LINE_WIDTH_BASE}, Actual: ${actualLineWidthBase}`);
  }
  
  if (actualLineWidthIncrement !== EXPECTED_LINE_WIDTH_INCREMENT) {
    throw new Error(`Line width increment mismatch. Expected: ${EXPECTED_LINE_WIDTH_INCREMENT}, Actual: ${actualLineWidthIncrement}`);
  }
  
  // Check for shadow properties
  const shadowBlurRegex = /shadowBlur = ([\d.]+)/;
  const shadowBlurMatch = functionString.match(shadowBlurRegex);
  
  if (!shadowBlurMatch) {
    throw new Error("Could not find shadowBlur setting in startBackgroundContours");
  }
  
  const actualShadowBlur = parseFloat(shadowBlurMatch[1]);
  if (actualShadowBlur !== EXPECTED_SHADOW_BLUR) {
    throw new Error(`Shadow blur mismatch. Expected: ${EXPECTED_SHADOW_BLUR}, Actual: ${actualShadowBlur}`);
  }
  
  // Check for shadow color
  const shadowColorRegex = /shadowColor = "(.*?)"/;
  const shadowColorMatch = functionString.match(shadowColorRegex);
  
  if (!shadowColorMatch) {
    throw new Error("Could not find shadowColor setting in startBackgroundContours");
  }
  
  const actualShadowColor = shadowColorMatch[1];
  if (actualShadowColor !== EXPECTED_SHADOW_COLOR) {
    throw new Error(`Shadow color mismatch. Expected: ${EXPECTED_SHADOW_COLOR}, Actual: ${actualShadowColor}`);
  }
  
  console.log("✓ Contour line styling properties verification passed");
  return true;
}

/**
 * Test that verifies line join and cap properties remain unchanged
 */
function testContourLineProperties() {
  console.log("Testing contour line join and cap properties...");
  
  const visualizer = new Chapter3Visualizer();
  const functionString = visualizer.startBackgroundContours.toString();
  
  // Check for lineJoin property
  const lineJoinRegex = /lineJoin = "(.*?)"/;
  const lineJoinMatch = functionString.match(lineJoinRegex);
  
  if (!lineJoinMatch) {
    throw new Error("Could not find lineJoin setting in startBackgroundContours");
  }
  
  const actualLineJoin = lineJoinMatch[1];
  if (actualLineJoin !== "round") {
    throw new Error(`Line join mismatch. Expected: "round", Actual: "${actualLineJoin}"`);
  }
  
  // Check for lineCap property
  const lineCapRegex = /lineCap = "(.*?)"/;
  const lineCapMatch = functionString.match(lineCapRegex);
  
  if (!lineCapMatch) {
    throw new Error("Could not find lineCap setting in startBackgroundContours");
  }
  
  const actualLineCap = lineCapMatch[1];
  if (actualLineCap !== "round") {
    throw new Error(`Line cap mismatch. Expected: "round", Actual: "${actualLineCap}"`);
  }
  
  console.log("✓ Contour line join and cap properties verification passed");
  return true;
}

/**
 * Run all contour styling tests
 */
function runContourStylingTests() {
  console.log("=== Chapter 3 Contour Styling Tests ===");
  
  const tests = [
    testContourColorPalette,
    testContourThresholds,
    testContourLineStyling,
    testContourLineProperties
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
    console.log("🎉 All contour styling tests passed!");
    return true;
  } else {
    console.log("❌ Some contour styling tests failed!");
    return false;
  }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runContourStylingTests,
    testContourColorPalette,
    testContourThresholds,
    testContourLineStyling,
    testContourLineProperties
  };
}