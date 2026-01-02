# Requirements Document

## Introduction

Fix the contour line drawing issue in Chapter 3 where background contour lines appear as straight lines parallel to x and y axes instead of smooth curved contours. The issue was introduced when switching from the official D3 contour library to a local lite version, along with adding problematic coordinate normalization code.

## Glossary

- **D3_Contour_Library**: The official D3.js contour generation library from d3js.org
- **Lite_Version**: The local d3-contour-lite.js file currently being used
- **Background_Contours**: The animated contour lines displayed in the background of the Chapter 3 page
- **Normalization_Code**: The `normalizeContourCoordinates` function that processes contour coordinates
- **Chapter3_Visualizer**: The main JavaScript class handling Chapter 3 visualizations

## Requirements

### Requirement 1: Restore Working Contour Library

**User Story:** As a user viewing Chapter 3, I want to see smooth curved contour lines in the background, so that the visual effect works as intended.

#### Acceptance Criteria

1. WHEN the Chapter 3 page loads, THE D3_Contour_Library SHALL be loaded from the official CDN
2. WHEN background contours are generated, THE system SHALL use the official D3 contour generation algorithm
3. WHEN contour coordinates are processed, THE system SHALL NOT apply problematic normalization that causes straight lines
4. THE system SHALL display smooth curved contour lines instead of straight parallel lines
5. THE background animation SHALL work smoothly without performance degradation

### Requirement 2: Remove Problematic Code

**User Story:** As a developer, I want to remove the code causing the contour line issues, so that the visualization works correctly.

#### Acceptance Criteria

1. WHEN processing contour coordinates, THE system SHALL NOT call the missing `linkSegmentsToPolylines` function
2. THE `normalizeContourCoordinates` function SHALL be removed or simplified to not cause issues
3. THE contour rendering SHALL use the standard D3 coordinate format without custom normalization
4. THE system SHALL handle contour coordinates directly from D3 without additional processing
5. THE code SHALL be clean and maintainable without unused or broken functions

### Requirement 3: Maintain Visual Consistency

**User Story:** As a user, I want the Chapter 3 page to look and behave the same as the working version, so that the user experience is consistent.

#### Acceptance Criteria

1. THE background contour animation SHALL match the previous working version's appearance
2. THE contour line colors and styling SHALL remain unchanged
3. THE animation speed and smoothness SHALL be preserved
4. THE performance characteristics SHALL be similar to or better than the working version
5. ALL other Chapter 3 functionality SHALL remain unaffected by the contour fix

### Requirement 4: Ensure Compatibility

**User Story:** As a developer, I want to ensure the fix doesn't break other functionality, so that the entire Chapter 3 page works correctly.

#### Acceptance Criteria

1. THE 3D joint density plots SHALL continue to work correctly
2. THE scatter plots and marginal distributions SHALL remain functional
3. THE parameter controls and sliders SHALL work as expected
4. THE scenario switching functionality SHALL be unaffected
5. THE page loading and initialization SHALL complete successfully