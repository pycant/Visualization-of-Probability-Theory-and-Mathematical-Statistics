# Design Document

## Overview

This design addresses the contour line rendering issue in Chapter 3 by reverting to the proven D3 contour library and removing problematic coordinate normalization code. The solution focuses on restoring the working implementation while maintaining all existing functionality.

## Architecture

The fix involves two main components:
1. **Library Replacement**: Replace the local d3-contour-lite.js with the official D3 contour library
2. **Code Cleanup**: Remove or fix the problematic `normalizeContourCoordinates` function and related code

## Components and Interfaces

### HTML Template Changes
- **File**: `templates/chapter3.html`
- **Change**: Replace `<script src="../static/js/lib/d3-contour-lite.js"></script>` with `<script src="https://d3js.org/d3-contour.v3.min.js"></script>`
- **Impact**: Restores official D3 contour generation functionality

### JavaScript Code Changes
- **File**: `static/js/chapter3.js`
- **Primary Changes**:
  - Remove or fix `normalizeContourCoordinates` function
  - Remove call to missing `linkSegmentsToPolylines` function
  - Restore direct use of D3 contour coordinates
  - Simplify contour rendering logic

### Background Contour Rendering
- **Function**: `startBackgroundContours()`
- **Change**: Remove the call to `normalizeContourCoordinates` and use D3 coordinates directly
- **Benefit**: Eliminates the source of straight-line artifacts

## Data Models

### Contour Data Structure
```javascript
// D3 Contour Object Structure (standard)
{
  value: number,           // Threshold value
  coordinates: [           // Array of MultiPolygon coordinates
    [                      // Polygon
      [                    // Ring (exterior or hole)
        [x, y],           // Point coordinates
        [x, y],
        ...
      ]
    ]
  ]
}
```

### Background Configuration
```javascript
// Existing configuration (unchanged)
bgConfig: {
  cols: 200,              // Grid width
  rows: 120,              // Grid height  
  scale: 0.02            // Noise scale
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">contour-line-fix

### Converting EARS to Properties

Based on the prework analysis, here are the testable properties derived from the acceptance criteria:

Property 1: D3 contour generation produces valid curved coordinates
*For any* noise data grid and threshold values, the D3 contour generator should produce coordinate arrays that contain curved paths rather than only horizontal and vertical line segments
**Validates: Requirements 1.2, 1.4**

Property 2: Contour coordinates maintain curve characteristics without normalization
*For any* contour coordinate set from D3, processing without the problematic normalization function should preserve the curved nature of the coordinate paths
**Validates: Requirements 1.3, 2.3**

Property 3: Direct coordinate usage preserves D3 output format
*For any* contour data from D3, using coordinates directly without additional processing should maintain the standard MultiPolygon coordinate structure
**Validates: Requirements 2.4**

Property 4: Background animation preserves visual characteristics
*For any* animation frame, the contour rendering should maintain smooth curves and consistent visual appearance matching the working version
**Validates: Requirements 3.1**

Property 5: Parameter changes trigger correct visualization updates
*For any* parameter modification via sliders or controls, the visualization system should update all affected components without breaking contour rendering
**Validates: Requirements 4.3**

## Error Handling

### Library Loading Failures
- **Scenario**: D3 contour library fails to load from CDN
- **Handling**: Provide fallback error message and graceful degradation
- **Implementation**: Check for `d3.contours` availability before starting background animation

### Contour Generation Errors
- **Scenario**: Invalid noise data or threshold values cause D3 contour generation to fail
- **Handling**: Log error and skip problematic frames
- **Implementation**: Wrap contour generation in try-catch blocks

### Canvas Context Issues
- **Scenario**: Canvas context becomes unavailable during animation
- **Handling**: Stop animation gracefully and attempt recovery
- **Implementation**: Validate canvas context before each render operation

## Testing Strategy

### Unit Testing Approach
- **Library Integration**: Test that D3 contour library loads and functions correctly
- **Coordinate Processing**: Verify that contour coordinates are used directly without problematic normalization
- **Function Removal**: Ensure problematic functions are removed or fixed
- **Visual Consistency**: Test that styling and animation parameters are preserved

### Property-Based Testing Configuration
- **Framework**: Use fast-check for JavaScript property-based testing
- **Minimum Iterations**: 100 iterations per property test
- **Test Environment**: Browser environment with canvas support
- **Property Test Tags**: Each test references its design document property

**Property Test Examples:**
```javascript
// Property 1: D3 contour generation produces valid curved coordinates
fc.assert(fc.property(
  fc.array(fc.float(0, 1), {minLength: 100, maxLength: 1000}),
  fc.array(fc.float(0.1, 0.9), {minLength: 3, maxLength: 10}),
  (noiseData, thresholds) => {
    const contours = d3.contours()
      .size([Math.sqrt(noiseData.length), Math.sqrt(noiseData.length)])
      .thresholds(thresholds)(noiseData);
    
    return contours.every(contour => 
      hasNonLinearSegments(contour.coordinates)
    );
  }
), {numRuns: 100});
// **Feature: contour-line-fix, Property 1: D3 contour generation produces valid curved coordinates**

// Property 2: Contour coordinates maintain curve characteristics without normalization  
fc.assert(fc.property(
  fc.array(fc.array(fc.array(fc.float(-100, 100), {minLength: 2, maxLength: 2}), {minLength: 3})),
  (coordinates) => {
    const processed = processCoordinatesDirectly(coordinates);
    const original = coordinates;
    
    return coordinatesHaveSimilarCurvature(original, processed);
  }
), {numRuns: 100});
// **Feature: contour-line-fix, Property 2: Contour coordinates maintain curve characteristics without normalization**
```

### Integration Testing
- **Full Page Load**: Test complete Chapter 3 page initialization
- **Animation Performance**: Verify smooth background animation without straight lines
- **Feature Interaction**: Ensure all Chapter 3 features work together correctly
- **Cross-browser Compatibility**: Test in major browsers (Chrome, Firefox, Safari, Edge)

### Visual Regression Testing
- **Screenshot Comparison**: Compare rendered contours with known good reference
- **Animation Smoothness**: Verify contour animation maintains expected visual flow
- **Color Consistency**: Ensure contour colors match the established palette