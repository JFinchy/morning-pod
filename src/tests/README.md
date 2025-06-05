# Morning Pod - Test Infrastructure

## Overview

This directory contains our comprehensive testing infrastructure built with Playwright, focusing on end-to-end testing, accessibility compliance, visual regression testing, and cross-browser compatibility.

## Test Architecture

```mermaid
graph TB
    subgraph "Test Infrastructure"
        GS[Global Setup] --> TC[Test Configuration]
        TC --> TS[Test Suites]
        TS --> GT[Global Teardown]
    end

    subgraph "Test Suites"
        E2E[E2E Tests]
        VR[Visual Regression]
        A11Y[Accessibility]
        CC[Cross Browser]
    end

    subgraph "Reporting"
        HTML[HTML Report]
        JSON[JSON Results]
        VIDEO[Video Recording]
        TRACE[Trace Files]
    end

    E2E --> HTML
    VR --> HTML
    A11Y --> HTML
    CC --> HTML

    TS --> VIDEO
    TS --> TRACE
    TS --> JSON
```

## Test Flow Diagrams

### 1. Homepage E2E Test Flow

```mermaid
flowchart TD
    A[Start Homepage Test] --> B[Navigate to /]
    B --> C[Wait for Load State]
    C --> D[Check Page Title]
    D --> E[Verify Navigation Elements]
    E --> F[Test Theme Switching]
    F --> G[Check Accessibility]
    G --> H[Test Mobile Responsive]
    H --> I[Validate Keyboard Navigation]
    I --> J[Test Complete]

    subgraph "Error Handling"
        K[Capture Screenshot]
        L[Record Video]
        M[Generate Trace]
    end

    D --> K
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
```

### 2. Accessibility Testing Flow

```mermaid
flowchart TD
    A[Start A11Y Test] --> B[Inject Axe-Core]
    B --> C[Run Full Page Scan]
    C --> D[Filter Violations]
    D --> E{Critical Violations?}

    E -->|Yes| F[Fail Test]
    E -->|No| G[Log Non-Critical Issues]

    G --> H[Check ARIA Labels]
    H --> I[Verify Keyboard Navigation]
    I --> J[Test Screen Reader Support]
    J --> K[Validate Color Contrast]
    K --> L[Test Complete]

    F --> M[Generate Accessibility Report]
    L --> M
```

### 3. Visual Regression Testing Flow

```mermaid
flowchart TD
    A[Start Visual Test] --> B[Navigate to Page]
    B --> C[Wait for Stable State]
    C --> D[Disable Animations]
    D --> E[Take Full Page Screenshot]
    E --> F{Baseline Exists?}

    F -->|No| G[Create Baseline]
    F -->|Yes| H[Compare with Baseline]

    H --> I{Match Within Threshold?}
    I -->|Yes| J[Test Passes]
    I -->|No| K[Generate Diff Image]

    K --> L[Fail Test with Visual Diff]
    G --> M[Save Baseline for Future]
    J --> N[Test Complete]

    subgraph "Cross-Browser"
        O[Chrome Screenshots]
        P[Firefox Screenshots]
        Q[Safari Screenshots]
    end

    E --> O
    E --> P
    E --> Q
```

### 4. Cross-Browser Testing Strategy

```mermaid
flowchart LR
    A[Test Suite] --> B[Chrome Desktop]
    A --> C[Firefox Desktop]
    A --> D[Safari Desktop]
    A --> E[Chrome Mobile]
    A --> F[Safari Mobile]

    subgraph "Desktop Tests"
        B --> G[Full Feature Testing]
        C --> H[Core Functionality]
        D --> I[Safari-Specific Issues]
    end

    subgraph "Mobile Tests"
        E --> J[Touch Interactions]
        F --> K[Mobile Safari Issues]
    end

    G --> L[Generate Reports]
    H --> L
    I --> L
    J --> L
    K --> L
```

## Test Categories

### 1. End-to-End (E2E) Tests

**Location**: `src/tests/e2e/homepage.spec.ts`

- **Core functionality testing**
- **User journey validation**
- **Navigation and routing**
- **Form interactions**
- **API integration testing**

### 2. Visual Regression Tests

**Location**: `src/tests/e2e/visual-regression.spec.ts`

- **Full page screenshots**
- **Component-level screenshots**
- **Responsive design validation**
- **Cross-browser visual consistency**
- **Hover and interaction states**

### 3. Accessibility Tests

**Location**: `src/tests/e2e/homepage.spec.ts` (integrated)

- **WCAG 2.1 compliance**
- **Screen reader compatibility**
- **Keyboard navigation**
- **Color contrast validation**
- **ARIA labels and roles**

## Test Configuration

### Browser Matrix

```mermaid
graph LR
    subgraph "Desktop Browsers"
        A[Chromium] --> D[1920x1080]
        B[Firefox] --> E[1920x1080]
        C[WebKit] --> F[1920x1080]
    end

    subgraph "Mobile Browsers"
        G[Chrome Mobile] --> H[375x667]
        I[Safari Mobile] --> J[375x667]
    end

    subgraph "Tablet"
        K[iPad] --> L[768x1024]
    end
```

### Test Environments

- **Development**: `npm run test:e2e`
- **CI/CD**: Automated on PR and main branch
- **Staging**: Pre-deployment validation
- **Production**: Smoke tests

## Advanced Features

### 1. Global Setup & Teardown

```mermaid
sequenceDiagram
    participant GS as Global Setup
    participant T as Tests
    participant GT as Global Teardown

    GS->>GS: Initialize Coverage
    GS->>GS: Setup Test Database
    GS->>GS: Configure Environment

    GS->>T: Start Test Execution

    T->>T: Run E2E Tests
    T->>T: Run Visual Tests
    T->>T: Run A11Y Tests

    T->>GT: Complete Tests

    GT->>GT: Collect Coverage Data
    GT->>GT: Generate Reports
    GT->>GT: Cleanup Resources
```

### 2. Screenshot Management Strategy

**Platform-Specific Screenshots**:

```
tests/
├── screenshots/
│   ├── homepage-chromium-linux.png     # CI/CD baselines
│   ├── homepage-firefox-linux.png      # CI/CD baselines
│   ├── homepage-webkit-linux.png       # CI/CD baselines
│   └── actual/                          # Failed test outputs
│       ├── homepage-chromium-linux-actual.png
│       └── homepage-chromium-linux-diff.png
```

### 3. Parallel Test Execution

```mermaid
graph TB
    A[Test Suite] --> B[Worker 1]
    A --> C[Worker 2]
    A --> D[Worker 3]
    A --> E[Worker 4]

    B --> F[Browser 1 Tests]
    C --> G[Browser 2 Tests]
    D --> H[Visual Tests]
    E --> I[A11Y Tests]

    F --> J[Merge Results]
    G --> J
    H --> J
    I --> J
```

## Commands Reference

### Basic Test Commands

```bash
# Run all tests
bun test:e2e

# Run with UI for debugging
bun test:e2e:headed

# Run specific test file
bunx playwright test homepage.spec.ts

# Run with trace recording
bun test:e2e:trace

# Generate visual regression baselines
bunx playwright test --update-snapshots
```

### Advanced Commands

```bash
# Run tests with coverage
bun test:e2e:coverage

# Generate test report
bun test:e2e:report

# Run visual regression tests only
bun test:e2e:visual

# Debug specific test in UI mode
bunx playwright test --debug homepage.spec.ts

# Run tests on specific browser
bunx playwright test --project=chromium
```

## Debugging & Development

### Test Debugging Flow

```mermaid
flowchart TD
    A[Test Failure] --> B{Type of Failure?}

    B -->|Visual| C[Check Diff Images]
    B -->|Functional| D[Check Traces]
    B -->|Accessibility| E[Check A11Y Report]

    C --> F[Review Visual Changes]
    D --> G[Step Through Execution]
    E --> H[Fix ARIA/Contrast Issues]

    F --> I[Update Baseline or Fix Code]
    G --> J[Fix Application Logic]
    H --> K[Update Accessibility Features]

    I --> L[Re-run Tests]
    J --> L
    K --> L
```

### Development Workflow

1. **Write test** with clear assertions
2. **Run locally** to verify functionality
3. **Check cross-browser** compatibility
4. **Validate accessibility** compliance
5. **Update visual baselines** if needed
6. **Commit changes** with test updates

## CI/CD Integration

### GitHub Actions Workflow

```mermaid
sequenceDiagram
    participant GH as GitHub
    participant CI as CI Runner
    participant T as Tests
    participant R as Reports

    GH->>CI: Trigger on PR/Push
    CI->>CI: Setup Node & Bun
    CI->>CI: Install Dependencies
    CI->>CI: Install Playwright Browsers

    CI->>T: Run Test Suite
    T->>T: Execute All Tests
    T->>T: Generate Artifacts

    T->>R: Upload Reports
    T->>R: Upload Screenshots
    T->>R: Upload Videos

    R->>GH: Comment on PR
    R->>GH: Update Status Checks
```

## Visual Regression Management

### Git LFS Strategy (Recommended)

For managing visual regression screenshots, we recommend using Git LFS:

```bash
# Install Git LFS
brew install git-lfs  # macOS
git lfs install

# Track PNG files in test directory
echo "src/tests/**/*.png filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
```

**Benefits**:

- ✅ Version control for visual baselines
- ✅ Team collaboration on visual changes
- ✅ Smaller repository size
- ✅ Easy rollback of visual changes

**Alternative**: Store in cloud storage (S3, etc.) but adds complexity.

## Best Practices

### 1. Test Reliability

- Use `data-testid` for stable selectors
- Wait for network idle before screenshots
- Disable animations in visual tests
- Handle flaky tests with retry logic

### 2. Maintenance

- Regular baseline updates
- Clean up unused screenshots
- Monitor test execution times
- Review and update selectors

### 3. Performance

- Run tests in parallel
- Use appropriate timeouts
- Minimize test data setup
- Cache dependencies in CI

### 4. Accessibility

- Test with screen readers
- Validate keyboard navigation
- Check color contrast ratios
- Ensure proper ARIA labels

## Troubleshooting

### Common Issues

**Visual Test Failures**:

- Platform differences (Linux vs macOS)
- Font rendering variations
- Animation timing issues

**Accessibility Failures**:

- Missing ARIA labels
- Insufficient color contrast
- Broken keyboard navigation

**Cross-Browser Issues**:

- Safari-specific behaviors
- Mobile viewport differences
- Touch interaction problems

### Solutions

1. **Use Docker** for consistent screenshots
2. **Implement retry logic** for flaky tests
3. **Set proper timeouts** for slow operations
4. **Mock external dependencies** when possible

## Metrics & Reporting

Our test infrastructure generates comprehensive reports:

- **HTML Report**: Interactive test results
- **JUnit XML**: CI/CD integration
- **JSON Results**: Custom processing
- **Coverage Reports**: Code coverage metrics
- **Accessibility Reports**: WCAG compliance

## Future Enhancements

- [ ] Performance testing integration
- [ ] API testing expansion
- [ ] Mobile app testing
- [ ] Load testing capabilities
- [ ] Advanced visual AI comparisons

---

_For technical questions or test infrastructure improvements, contact the development team or create an issue._
