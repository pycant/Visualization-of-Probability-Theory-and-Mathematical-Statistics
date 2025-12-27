# Design Document

## Overview

This design document outlines the implementation of interactive conditional probability educational modules for Chapter 1 of the probability visualization teaching platform. The feature adds three distinct interactive scenarios: Among Us/Werewolf evidence analysis, Bayesian identification with false positive demonstrations, and the classic Monty Hall problem with strategy comparison.

The implementation follows the existing architectural patterns established in the current chapter1.html and chapter1.js, maintaining consistency with the glass-card styling, KaTeX formula rendering, and interactive canvas-based visualizations.

## Architecture

### Component Structure

The conditional probability system follows a modular architecture with three main interactive components:

1. **Among Us Evidence Analyzer** - Interactive scenario for basic conditional probability
2. **Bayesian Identification Lab** - False positive trap demonstrations  
3. **Monty Hall Strategy Simulator** - Classic probability problem with strategy comparison

Each component integrates with the existing chapter1.js framework using the established setup function pattern and maintains consistency with the current glass-card UI design system.

### Integration Points

- **HTML Structure**: New section 1.4 added to chapter1.html following existing section patterns
- **JavaScript Integration**: New setup functions added to chapter1.js initialization sequence
- **CSS Styling**: Leverages existing chapter1.css classes and design tokens
- **Formula Rendering**: Uses existing KaTeX configuration for mathematical notation

## Components and Interfaces

### Among Us Evidence Analyzer

**Purpose**: Teach the distinction between P(A|B) and P(B|A) through gamified evidence analysis

**Interface Elements**:
- Evidence configuration panel with sliders for:
  - Good/impostor ratio (prior probability)
  - Evidence accuracy rate (likelihood)
  - Multiple evidence combination controls
- Real-time probability calculator displaying:
  - P(impostor|evidence) using Bayes' theorem
  - P(evidence|impostor) for comparison
  - Step-by-step formula breakdown
- Visual feedback emphasizing "evidence ≠ conclusion"

**Core Functions**:
```javascript
function setupAmongUsAnalyzer() {
  // Initialize evidence configuration controls
  // Set up probability calculation engine
  // Render formula displays with KaTeX
}

function calculateConditionalProbability(priorImpostor, evidenceAccuracy, evidenceCount) {
  // Apply Bayes' theorem: P(impostor|evidence) = P(evidence|impostor) * P(impostor) / P(evidence)
  // Return step-by-step calculation breakdown
}
```

### Bayesian Identification Lab

**Purpose**: Demonstrate false positive traps and base rate neglect through practical scenarios

**Interface Elements**:
- Scenario selector (cheat detection, fan authenticity, security screening, medical testing)
- Parameter controls for:
  - Base rate (prior probability of condition)
  - Test sensitivity (true positive rate)
  - Test specificity (true negative rate)
- Results display showing:
  - P(condition|positive test) calculation
  - Positive predictive value vs test accuracy comparison
  - Total probability formula expansion

**Core Functions**:
```javascript
function setupBayesianLab() {
  // Initialize scenario templates
  // Set up parameter controls
  // Configure results visualization
}

function calculateBayesianResults(baseRate, sensitivity, specificity) {
  // Calculate positive predictive value
  // Show total probability decomposition
  // Highlight false positive rate implications
}
```

### Monty Hall Strategy Simulator

**Purpose**: Demonstrate how information revelation changes conditional probabilities

**Interface Elements**:
- Interactive three-door game interface
- Strategy selection (keep vs switch)
- Simulation controls for multiple trials
- Results comparison showing:
  - Empirical success rates
  - Theoretical probabilities (P(win|switch)=2/3, P(win|keep)=1/3)
  - Conditional probability formula derivations
- Rule variation toggle (standard vs non-standard host behavior)

**Core Functions**:
```javascript
function setupMontyHall() {
  // Initialize game interface
  // Set up strategy comparison tracking
  // Configure simulation engine
}

function simulateMontyHallGame(strategy, trials) {
  // Run game simulations with specified strategy
  // Track win/loss statistics
  // Calculate empirical probabilities
}

function renderStrategyComparison() {
  // Display side-by-side success rate comparison
  // Show theoretical vs empirical convergence
}
```

## Data Models

### Evidence Analysis Model
```javascript
const EvidenceModel = {
  priorProbability: Number,      // P(impostor) base rate
  evidenceAccuracy: Number,      // P(evidence|impostor) and P(¬evidence|¬impostor)
  evidenceList: Array,          // Multiple pieces of evidence
  posteriorProbability: Number,  // P(impostor|evidence) calculated result
  calculationSteps: Array       // Step-by-step breakdown for display
};
```

### Bayesian Test Model
```javascript
const BayesianTestModel = {
  scenario: String,             // Selected scenario type
  baseRate: Number,            // P(condition) prior probability
  sensitivity: Number,         // P(positive|condition) true positive rate
  specificity: Number,         // P(negative|¬condition) true negative rate
  positivePredictiveValue: Number, // P(condition|positive) result
  totalProbabilityBreakdown: Object // Denominator expansion
};
```

### Monty Hall Game Model
```javascript
const MontyHallModel = {
  doors: Array,                // [prize_door, player_choice, host_reveal]
  strategy: String,            // "keep" or "switch"
  gameHistory: Array,          // Record of all games played
  winRates: Object,           // Success rates by strategy
  currentGame: Object         // Active game state
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 1.4, 2.3, 3.5, and 5.3 all relate to formula rendering and can be combined into a single comprehensive formula rendering property
- Properties 1.3 and 2.4 both test display of related but distinct probability values and can be combined
- Properties 3.1 and 3.2 both test game setup and rule compliance and can be combined

### Core Properties

**Property 1: Bayes' theorem calculation accuracy**
*For any* valid prior probability, evidence accuracy rate, and evidence combination, the calculated posterior probability should equal the mathematically correct Bayes' theorem result
**Validates: Requirements 1.1, 1.2, 2.2**

**Property 2: Probability value distinction**
*For any* conditional probability calculation, the system should display both P(A|B) and P(B|A) values that are mathematically consistent with each other and the input parameters
**Validates: Requirements 1.3, 2.4**

**Property 3: Formula rendering consistency**
*For any* mathematical formula display, the rendered output should use proper KaTeX notation and match the established configuration used throughout the chapter
**Validates: Requirements 1.4, 2.3, 3.5, 4.4, 5.3**

**Property 4: Total probability decomposition**
*For any* Bayesian calculation, the denominator expansion should correctly apply the total probability formula with all terms summing to the calculated denominator
**Validates: Requirements 2.3**

**Property 5: Monty Hall game rule compliance**
*For any* game initialization and host behavior, exactly one door should contain the prize, and the host should never reveal the player's chosen door or the prize door
**Validates: Requirements 3.1, 3.2**

**Property 6: Strategy simulation convergence**
*For any* large number of Monty Hall simulations, the empirical success rates should converge to the theoretical values: P(win|switch) approaching 2/3 and P(win|keep) approaching 1/3
**Validates: Requirements 3.4**

**Property 7: Strategy comparison visualization**
*For any* strategy comparison display, the bar chart should show success rates that match the calculated empirical results from the simulation data
**Validates: Requirements 4.3**

**Property 8: Rule variation probability impact**
*For any* rule variation toggle, changing from standard to non-standard rules should produce mathematically different probability outcomes that reflect the rule changes
**Validates: Requirements 4.5**

## Error Handling

### Input Validation
- **Probability Range Validation**: All probability inputs must be validated to ensure they fall within [0, 1] range
- **Parameter Consistency**: Evidence accuracy rates and base rates must be mathematically consistent
- **Division by Zero Protection**: Bayes' theorem calculations must handle edge cases where P(B) = 0

### User Experience Error Handling
- **Invalid Input Feedback**: Clear visual indicators when users enter invalid parameters
- **Calculation Failure Recovery**: Graceful degradation when mathematical calculations fail
- **Browser Compatibility**: Fallback rendering for environments without full KaTeX support

### Error Recovery Strategies
```javascript
function validateProbabilityInput(value) {
  if (isNaN(value) || value < 0 || value > 1) {
    throw new ValidationError("Probability must be between 0 and 1");
  }
  return value;
}

function safeBayesCalculation(prior, likelihood, evidence) {
  try {
    if (evidence === 0) {
      return { error: "Cannot calculate conditional probability when P(evidence) = 0" };
    }
    return (likelihood * prior) / evidence;
  } catch (error) {
    return { error: "Calculation failed", details: error.message };
  }
}
```

## Testing Strategy

### Dual Testing Approach

The implementation requires both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing Requirements**:
- Test specific scenarios with known inputs and expected outputs
- Verify UI component integration with existing chapter1.js framework
- Test error handling and edge cases
- Validate KaTeX formula rendering integration

**Property-Based Testing Requirements**:
- Use **fast-check** as the property-based testing library for JavaScript
- Configure each property-based test to run a minimum of 100 iterations
- Tag each property-based test with comments referencing the design document properties
- Use the exact format: `**Feature: conditional-probability-interactive, Property {number}: {property_text}**`

**Property-Based Test Implementation**:
Each correctness property must be implemented by a single property-based test:

1. **Property 1 Test**: Generate random valid probability inputs and verify Bayes' theorem calculations
2. **Property 2 Test**: Generate random parameters and verify P(A|B) and P(B|A) consistency  
3. **Property 3 Test**: Generate random formulas and verify KaTeX rendering consistency
4. **Property 4 Test**: Generate random Bayesian scenarios and verify total probability decomposition
5. **Property 5 Test**: Generate random game states and verify Monty Hall rule compliance
6. **Property 6 Test**: Run large simulation batches and verify convergence to theoretical probabilities
7. **Property 7 Test**: Generate random simulation results and verify chart accuracy
8. **Property 8 Test**: Generate random rule variations and verify probability differences

**Test Data Generation**:
```javascript
// Example property-based test structure
fc.test('Bayes theorem calculation accuracy', fc.property(
  fc.float({ min: 0.01, max: 0.99 }), // prior
  fc.float({ min: 0.01, max: 0.99 }), // likelihood  
  fc.float({ min: 0.01, max: 0.99 }), // evidence
  (prior, likelihood, evidence) => {
    const result = calculateBayesProbability(prior, likelihood, evidence);
    const expected = (likelihood * prior) / evidence;
    return Math.abs(result - expected) < 1e-10;
  }
));
```

## Implementation Architecture

### File Structure
```
templates/chapter1.html           # Add section 1.4 HTML structure
static/js/chapter1.js            # Add conditional probability setup functions
static/css/chapter1.css          # Leverage existing styling classes
```

### JavaScript Module Organization
```javascript
// New functions to add to chapter1.js
function setupConditionalProbabilitySection() {
  setupAmongUsAnalyzer();
  setupBayesianLab(); 
  setupMontyHall();
}

// Integration with existing initialization
document.addEventListener("DOMContentLoaded", function () {
  // ... existing setup functions ...
  try {
    setupConditionalProbabilitySection();
  } catch (e) {
    console.warn("Conditional probability setup failed:", e);
  }
});
```

### Canvas and Visualization Integration
Following the established pattern from existing sections:
- Use HTML5 canvas for interactive visualizations
- Implement responsive canvas sizing with device pixel ratio handling
- Apply consistent color schemes using CSS custom properties
- Integrate with existing Chart.js configuration for data visualization

### Formula Rendering Integration
Leverage the existing KaTeX setup:
```javascript
// Use existing KaTeX configuration
renderMathInElement(formulaContainer, {
  delimiters: [
    { left: "$", right: "$", display: true },
    { left: "\\(", right: "\\)", display: false },
    { left: "$", right: "$", display: false },
  ],
  throwOnError: false,
});
```

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Initialize complex visualizations only when section 1.4 becomes visible
- **Calculation Caching**: Cache Bayes' theorem results for repeated parameter combinations
- **Canvas Optimization**: Use requestAnimationFrame for smooth animations
- **Memory Management**: Clean up event listeners and canvas contexts when switching between modules

### Scalability
- **Simulation Batching**: Process large Monty Hall simulations in chunks to prevent UI blocking
- **Progressive Enhancement**: Ensure basic functionality works without advanced browser features
- **Responsive Design**: Adapt visualizations for different screen sizes using existing responsive patterns

## Integration with Existing System

### Navigation Integration
Update the NAV_CONFIG in chapter1.html:
```javascript
window.NAV_CONFIG = {
  active: "chapter1",
  sectionLinks: [
    { href: "#sec-1-1", label: "1.1 随机事件及其运算" },
    { href: "#sec-1-2", label: "1.2 概率的定义与确定方法" },
    { href: "#sec-1-3", label: "1.3 概率的性质" },
    { href: "#sec-1-4", label: "1.4 条件概率" },  // New section
    { href: "#sec-1-5", label: "1.5 独立性" },
  ],
};
```

### Styling Consistency
Reuse existing CSS classes and design tokens:
- `.glass-card.fx-holo` for main container styling
- `.text-neon-blue`, `.text-neon-purple`, `.text-neon-green` for accent colors
- Existing input range styling from section 1.3
- Consistent button and control styling patterns

### Historical Context Integration
Following the pattern from other sections, include historical context:
```html
<div class="mt-8 glass-card fx-holo rounded-2xl p-6 sm:p-8">
  <h3 class="text-xl font-semibold mb-3">历史介绍</h3>
  <ul class="list-disc pl-6 space-y-2 text-gray-200">
    <li>条件概率概念由托马斯·贝叶斯（Thomas Bayes, 1763）在其著名论文中首次系统阐述。</li>
    <li>蒙提霍尔问题源于美国电视游戏节目，1990年由玛丽莲·沃斯·萨凡特（Marilyn vos Savant）的专栏文章引发广泛讨论。</li>
  </ul>
</div>
```