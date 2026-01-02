# Implementation Plan: Contour Line Fix

## Overview

Fix the contour line rendering issue by reverting to the official D3 contour library and removing problematic coordinate normalization code that causes straight-line artifacts.

## Tasks

- [x] 1. Replace D3 contour library in HTML template
  - Update script tag in templates/chapter3.html to use official D3 contour library
  - Remove reference to local d3-contour-lite.js file
  - _Requirements: 1.1, 1.2_

- [x] 1.1 Write unit test for D3 library loading
  - Test that d3.contours function is available after library load
  - _Requirements: 1.1_

- [x] 2. Fix contour coordinate processing in JavaScript
  - [x] 2.1 Remove or fix normalizeContourCoordinates function
    - Remove the problematic function that calls missing linkSegmentsToPolylines
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Update startBackgroundContours to use D3 coordinates directly
    - Remove call to normalizeContourCoordinates in contour rendering loop
    - Use standard D3 coordinate format without custom processing
    - _Requirements: 2.3, 2.4_

  - [x] 2.3 Write property test for coordinate processing
    - **Property 2: Contour coordinates maintain curve characteristics without normalization**
    - **Validates: Requirements 1.3, 2.3**

- [x] 3. Verify visual consistency and styling preservation
  - [x] 3.1 Ensure contour colors and styling remain unchanged
    - Verify color palette and line styling properties are preserved
    - _Requirements: 3.2_

  - [x] 3.2 Maintain animation timing parameters
    - Preserve existing animation speed and smoothness settings
    - _Requirements: 3.3_

  - [x] 3.3 Write property test for visual characteristics
    - **Property 4: Background animation preserves visual characteristics**
    - **Validates: Requirements 3.1**

- [x] 4. Test functionality preservation
  - [x] 4.1 Verify 3D plots and scatter plots work correctly
    - Test that joint density plots and scatter visualizations remain functional
    - _Requirements: 4.1, 4.2_

  - [x] 4.2 Test parameter controls and scenario switching
    - Verify sliders and controls continue to work as expected
    - Test scenario switching functionality remains intact
    - _Requirements: 4.3, 4.4_

  - [x] 4.3 Write property test for parameter interactions
    - **Property 5: Parameter changes trigger correct visualization updates**
    - **Validates: Requirements 4.3**

- [ ] 5. Integration testing and validation
  - [ ] 5.1 Test complete page loading and initialization
    - Verify page loads without errors and initializes correctly
    - _Requirements: 4.5_

  - [ ] 5.2 Write property test for D3 contour generation
    - **Property 1: D3 contour generation produces valid curved coordinates**
    - **Validates: Requirements 1.2, 1.4**

  - [ ] 5.3 Write property test for direct coordinate usage
    - **Property 3: Direct coordinate usage preserves D3 output format**
    - **Validates: Requirements 2.4**

- [ ] 6. Checkpoint - Ensure all tests pass and contours display correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The fix focuses on reverting to proven working code rather than complex new implementations