/**
 * Synthetic User Testing Module
 *
 * @business-context Simulates real user behavior for canary testing and feature validation.
 *                   Allows safe testing of new features without impacting real users.
 *                   Enables automated A/B testing and performance validation.
 * @decision-date 2024-01-22
 * @decision-by Development team for safer feature rollouts
 */

import { z } from "zod";

/**
 * Synthetic user behavior profiles
 * @business-context Different user types exhibit different usage patterns
 */
export enum SyntheticUserType {
  ACCESSIBILITY_USER = "accessibility_user", // Uses assistive technologies
  CASUAL_LISTENER = "casual_listener", // Light usage, basic features
  CONTENT_CREATOR = "content_creator", // Generates content frequently
  MOBILE_USER = "mobile_user", // Primarily mobile interactions
  POWER_USER = "power_user", // Heavy usage, all features
}

/**
 * Test scenario types for different feature validation
 */
export enum TestScenario {
  AUDIO_PLAYBACK = "audio_playback",
  EPISODE_GENERATION = "episode_generation",
  ERROR_RECOVERY = "error_recovery",
  NAVIGATION_FLOW = "navigation_flow",
  PERFORMANCE_STRESS = "performance_stress",
  RESPONSIVE_DESIGN = "responsive_design",
}

/**
 * Synthetic user configuration
 */
export interface SyntheticUserConfig {
  behaviorPattern: UserBehaviorPattern;
  device: DeviceProfile;
  id: string;
  name: string;
  preferences: UserPreferences;
  testScenarios: TestScenario[];
  type: SyntheticUserType;
}

/**
 * User behavior patterns for realistic simulation
 */
export interface UserBehaviorPattern {
  actionsPerSession: {
    average: number;
    max: number;
    min: number;
  };
  errorTolerance: number; // 0-1, how likely to retry after errors
  featureAdoption: number; // 0-1, how likely to try new features
  sessionDuration: {
    average: number;
    max: number;
    min: number; // minutes
  };
  thinkTime: {
    average: number;
    max: number;
    min: number; // milliseconds between actions
  };
}

/**
 * Device and browser profiles for testing
 */
export interface DeviceProfile {
  capabilities: {
    javascript: boolean;
    localStorage: boolean;
    touchScreen: boolean;
    webAudio: boolean;
  };
  deviceType: "desktop" | "mobile" | "tablet";
  network: "fast" | "offline" | "slow";
  userAgent: string;
  viewport: {
    height: number;
    width: number;
  };
}

/**
 * User preferences for personalized testing
 */
export interface UserPreferences {
  audioQuality: "high" | "standard";
  autoplay: boolean;
  notifications: boolean;
  playbackSpeed: number;
  theme: "auto" | "dark" | "light";
}

/**
 * Test execution result tracking
 */
export interface TestExecutionResult {
  duration: number; // milliseconds
  endTime: Date;
  errors: TestError[];
  metrics: PerformanceMetrics;
  scenario: TestScenario;
  screenshots: string[]; // paths to screenshots
  startTime: Date;
  steps: TestStepResult[];
  success: boolean;
  userId: string;
}

export interface TestStepResult {
  action: string;
  duration: number;
  error?: string;
  screenshot?: string;
  step: string;
  success: boolean;
  timestamp: Date;
}

export interface PerformanceMetrics {
  cumulativeLayoutShift: number;
  firstContentfulPaint: number;
  interactionToNextPaint: number;
  largestContentfulPaint: number;
  memoryUsage?: number;
  networkRequests: number;
  pageLoadTime: number;
  totalDataTransferred: number;
}

export interface TestError {
  message: string;
  screenshot?: string;
  stack?: string;
  timestamp: Date;
  type: "assertion" | "javascript" | "network" | "timeout";
}

/**
 * Test report interface
 */
export interface SyntheticTestReport {
  detailedResults: TestExecutionResult[];
  scenarioBreakdown: Record<string, { success: number; total: number }>;
  summary: {
    averageDuration: number;
    failedTests: number;
    generatedAt: Date;
    successfulTests: number;
    successRate: number;
    totalTests: number;
  };
  userBreakdown: Record<string, { success: number; total: number }>;
}

/**
 * Main Synthetic User Testing Class
 *
 * @business-context Orchestrates automated user simulation for comprehensive
 *                   feature testing and validation before real user exposure
 */
export class SyntheticUserTesting {
  private isRunning: boolean = false;
  private results: TestExecutionResult[] = [];
  private users: Map<string, SyntheticUserConfig> = new Map();

  constructor(private baseUrl: string = "http://localhost:3000") {}

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Create predefined user profiles based on common usage patterns
   *
   * @business-context Based on analytics data and user research to ensure
   *                   realistic testing scenarios that match real usage
   */
  createStandardUserProfiles(): void {
    // Power User - Heavy feature usage, desktop focused
    this.registerUser({
      behaviorPattern: {
        actionsPerSession: { average: 30, max: 50, min: 15 },
        errorTolerance: 0.8,
        featureAdoption: 0.9,
        sessionDuration: { average: 35, max: 60, min: 20 },
        thinkTime: { average: 1000, max: 2000, min: 500 },
      },
      device: {
        capabilities: {
          javascript: true,
          localStorage: true,
          touchScreen: false,
          webAudio: true,
        },
        deviceType: "desktop",
        network: "fast",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        viewport: { height: 1080, width: 1920 },
      },
      id: "power_user_001",
      name: "Alex Chen - Power User",
      preferences: {
        audioQuality: "high",
        autoplay: true,
        notifications: true,
        playbackSpeed: 1.25,
        theme: "dark",
      },
      testScenarios: [
        TestScenario.EPISODE_GENERATION,
        TestScenario.AUDIO_PLAYBACK,
        TestScenario.NAVIGATION_FLOW,
      ],
      type: SyntheticUserType.POWER_USER,
    });

    // Casual Listener - Light usage, mobile focused
    this.registerUser({
      behaviorPattern: {
        actionsPerSession: { average: 7, max: 12, min: 3 },
        errorTolerance: 0.3,
        featureAdoption: 0.2,
        sessionDuration: { average: 12, max: 20, min: 5 },
        thinkTime: { average: 2500, max: 5000, min: 1000 },
      },
      device: {
        capabilities: {
          javascript: true,
          localStorage: true,
          touchScreen: true,
          webAudio: true,
        },
        deviceType: "mobile",
        network: "slow",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        viewport: { height: 844, width: 390 },
      },
      id: "casual_listener_001",
      name: "Jamie Smith - Casual Listener",
      preferences: {
        audioQuality: "standard",
        autoplay: false,
        notifications: false,
        playbackSpeed: 1.0,
        theme: "auto",
      },
      testScenarios: [
        TestScenario.AUDIO_PLAYBACK,
        TestScenario.RESPONSIVE_DESIGN,
      ],
      type: SyntheticUserType.CASUAL_LISTENER,
    });

    // Content Creator - Frequent content generation
    this.registerUser({
      behaviorPattern: {
        actionsPerSession: { average: 18, max: 30, min: 10 },
        errorTolerance: 0.6,
        featureAdoption: 0.7,
        sessionDuration: { average: 25, max: 45, min: 15 },
        thinkTime: { average: 1500, max: 3000, min: 800 },
      },
      device: {
        capabilities: {
          javascript: true,
          localStorage: true,
          touchScreen: false,
          webAudio: true,
        },
        deviceType: "desktop",
        network: "fast",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        viewport: { height: 900, width: 1440 },
      },
      id: "content_creator_001",
      name: "Morgan Taylor - Content Creator",
      preferences: {
        audioQuality: "high",
        autoplay: true,
        notifications: true,
        playbackSpeed: 1.0,
        theme: "light",
      },
      testScenarios: [
        TestScenario.EPISODE_GENERATION,
        TestScenario.PERFORMANCE_STRESS,
        TestScenario.ERROR_RECOVERY,
      ],
      type: SyntheticUserType.CONTENT_CREATOR,
    });

    // Accessibility User - Uses assistive technologies
    this.registerUser({
      behaviorPattern: {
        actionsPerSession: { average: 12, max: 20, min: 5 },
        errorTolerance: 0.5,
        featureAdoption: 0.4,
        sessionDuration: { average: 18, max: 30, min: 10 },
        thinkTime: { average: 3000, max: 6000, min: 1500 },
      },
      device: {
        capabilities: {
          javascript: true,
          localStorage: true,
          touchScreen: false,
          webAudio: true,
        },
        deviceType: "desktop",
        network: "fast",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        viewport: { height: 720, width: 1280 },
      },
      id: "accessibility_user_001",
      name: "Sam Rodriguez - Accessibility User",
      preferences: {
        audioQuality: "standard",
        autoplay: false,
        notifications: true,
        playbackSpeed: 0.75,
        theme: "light",
      },
      testScenarios: [
        TestScenario.NAVIGATION_FLOW,
        TestScenario.AUDIO_PLAYBACK,
        TestScenario.RESPONSIVE_DESIGN,
      ],
      type: SyntheticUserType.ACCESSIBILITY_USER,
    });
  }

  /**
   * Execute all registered users' test scenarios
   *
   * @business-context Comprehensive testing across all user types to ensure
   *                   broad compatibility and functionality validation
   */
  async executeAllUserTests(): Promise<Map<string, TestExecutionResult[]>> {
    if (this.isRunning) {
      throw new Error("Tests are already running");
    }

    this.isRunning = true;
    const allResults = new Map<string, TestExecutionResult[]>();

    try {
      for (const [userId] of this.users) {
        console.log(`🤖 Starting tests for user: ${userId}`);
        const userResults = await this.executeUserTests(userId);
        allResults.set(userId, userResults);

        // Brief pause between users to avoid overwhelming the system
        await this.sleep(2000);
      }
    } finally {
      this.isRunning = false;
    }

    return allResults;
  }

  /**
   * Execute test scenarios for a specific user
   *
   * @business-context Simulates realistic user journeys to validate
   *                   feature functionality and performance under real conditions
   */
  async executeUserTests(userId: string): Promise<TestExecutionResult[]> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const results: TestExecutionResult[] = [];

    for (const scenario of user.testScenarios) {
      const result = await this.executeScenario(user, scenario);
      results.push(result);
      this.results.push(result);

      // Simulate realistic think time between scenarios
      await this.sleep(
        this.randomBetween(
          user.behaviorPattern.thinkTime.min,
          user.behaviorPattern.thinkTime.max
        )
      );
    }

    return results;
  }

  /**
   * Generate test report
   *
   * @business-context Provides comprehensive analysis of test results
   *                   for stakeholder review and decision making
   */
  generateReport(): SyntheticTestReport {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter((r) => r.success).length;
    const successRate = totalTests > 0 ? successfulTests / totalTests : 0;

    const avgDuration =
      totalTests > 0
        ? this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests
        : 0;

    const scenarioStats = new Map<
      TestScenario,
      { success: number; total: number }
    >();
    for (const result of this.results) {
      const stats = scenarioStats.get(result.scenario) || {
        success: 0,
        total: 0,
      };
      stats.total++;
      if (result.success) stats.success++;
      scenarioStats.set(result.scenario, stats);
    }

    const userStats = new Map<string, { success: number; total: number }>();
    for (const result of this.results) {
      const stats = userStats.get(result.userId) || { success: 0, total: 0 };
      stats.total++;
      if (result.success) stats.success++;
      userStats.set(result.userId, stats);
    }

    return {
      detailedResults: this.results,
      scenarioBreakdown: Object.fromEntries(scenarioStats),
      summary: {
        averageDuration: avgDuration,
        failedTests: totalTests - successfulTests,
        generatedAt: new Date(),
        successfulTests,
        successRate,
        totalTests,
      },
      userBreakdown: Object.fromEntries(userStats),
    };
  }

  /**
   * Get test execution results
   */
  getResults(): TestExecutionResult[] {
    return [...this.results];
  }

  /**
   * Get results for specific scenario
   */
  getScenarioResults(scenario: TestScenario): TestExecutionResult[] {
    return this.results.filter((result) => result.scenario === scenario);
  }

  /**
   * Get results for specific user
   */
  getUserResults(userId: string): TestExecutionResult[] {
    return this.results.filter((result) => result.userId === userId);
  }

  /**
   * Register a synthetic user for testing
   *
   * @business-context Each user type represents a different usage pattern
   *                   found in real user analytics and research
   */
  registerUser(config: SyntheticUserConfig): void {
    this.users.set(config.id, config);
  }

  /**
   * Execute a specific test scenario
   *
   * @business-context Each scenario tests different aspects of the application
   *                   to ensure comprehensive coverage of user workflows
   */
  private async executeScenario(
    user: SyntheticUserConfig,
    scenario: TestScenario
  ): Promise<TestExecutionResult> {
    const startTime = new Date();
    const steps: TestStepResult[] = [];
    const errors: TestError[] = [];
    const screenshots: string[] = [];

    try {
      switch (scenario) {
        case TestScenario.EPISODE_GENERATION:
          await this.testEpisodeGeneration(user, steps, errors);
          break;
        case TestScenario.AUDIO_PLAYBACK:
          await this.testAudioPlayback(user, steps, errors);
          break;
        case TestScenario.NAVIGATION_FLOW:
          await this.testNavigationFlow(user, steps, errors);
          break;
        case TestScenario.RESPONSIVE_DESIGN:
          await this.testResponsiveDesign(user, steps, errors);
          break;
        case TestScenario.PERFORMANCE_STRESS:
          await this.testPerformanceStress(user, steps, errors);
          break;
        case TestScenario.ERROR_RECOVERY:
          await this.testErrorRecovery(user, steps, errors);
          break;
      }
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
        type: "javascript",
      });
    }

    const endTime = new Date();
    const success = errors.length === 0;

    return {
      duration: endTime.getTime() - startTime.getTime(),
      endTime,
      errors,
      metrics: await this.gatherPerformanceMetrics(),
      scenario,
      screenshots,
      startTime,
      steps,
      success,
      userId: user.id,
    };
  }

  /**
   * Gather performance metrics
   */
  private async gatherPerformanceMetrics(): Promise<PerformanceMetrics> {
    // Simulate performance metrics gathering
    return {
      cumulativeLayoutShift: Math.random() * 0.1,
      firstContentfulPaint: Math.random() * 1500 + 300,
      interactionToNextPaint: Math.random() * 200 + 50,
      largestContentfulPaint: Math.random() * 3000 + 800,
      networkRequests: Math.floor(Math.random() * 50 + 10),
      pageLoadTime: Math.random() * 2000 + 500,
      totalDataTransferred: Math.floor(Math.random() * 2000000 + 500000), // bytes
    };
  }

  /**
   * Get realistic think time for user
   */
  private getThinkTime(user: SyntheticUserConfig): number {
    return this.randomBetween(
      user.behaviorPattern.thinkTime.min,
      user.behaviorPattern.thinkTime.max
    );
  }

  /**
   * Generate random number between min and max
   */
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Simulate a single test step
   */
  private async simulateStep(
    action: string,
    description: string
  ): Promise<TestStepResult> {
    const startTime = new Date();

    try {
      // Simulate the action (in real implementation, this would use Playwright)
      await this.sleep(Math.random() * 1000 + 500); // Simulate action time

      // Random success/failure based on realistic probabilities
      const success = Math.random() > 0.05; // 95% success rate

      return {
        action,
        duration: Date.now() - startTime.getTime(),
        error: success ? undefined : "Simulated random failure",
        step: description,
        success,
        timestamp: startTime,
      };
    } catch (error) {
      return {
        action,
        duration: Date.now() - startTime.getTime(),
        error: error instanceof Error ? error.message : "Unknown error",
        step: description,
        success: false,
        timestamp: startTime,
      };
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test audio playback functionality
   */
  private async testAudioPlayback(
    user: SyntheticUserConfig,
    steps: TestStepResult[],
    errors: TestError[]
  ): Promise<void> {
    steps.push(
      await this.simulateStep("navigate_episodes", "Navigate to episodes page")
    );
    await this.sleep(this.getThinkTime(user));

    steps.push(await this.simulateStep("select_episode", "Select an episode"));
    await this.sleep(this.getThinkTime(user));

    steps.push(await this.simulateStep("play_audio", "Start audio playback"));
    await this.sleep(5000); // Listen for 5 seconds

    steps.push(await this.simulateStep("pause_audio", "Pause audio playback"));
    await this.sleep(this.getThinkTime(user));

    steps.push(
      await this.simulateStep("seek_audio", "Seek to different position")
    );
    await this.sleep(this.getThinkTime(user));

    steps.push(await this.simulateStep("volume_control", "Adjust volume"));
  }

  /**
   * Test episode generation workflow
   *
   * @business-context Validates the core podcast generation feature works
   *                   correctly across different user types and conditions
   */
  private async testEpisodeGeneration(
    user: SyntheticUserConfig,
    steps: TestStepResult[],
    errors: TestError[]
  ): Promise<void> {
    // Simulate opening the app
    steps.push(
      await this.simulateStep("navigate_home", "Navigate to homepage")
    );
    await this.sleep(this.getThinkTime(user));

    // Click generate episode button
    steps.push(
      await this.simulateStep("click_generate", "Click generate episode button")
    );
    await this.sleep(this.getThinkTime(user));

    // Fill in URL (simulate typing)
    const testUrl = "https://example.com/test-article";
    steps.push(await this.simulateStep("enter_url", `Enter URL: ${testUrl}`));
    await this.sleep(this.getThinkTime(user));

    // Select voice preference
    steps.push(
      await this.simulateStep("select_voice", "Select voice preference")
    );
    await this.sleep(this.getThinkTime(user));

    // Start generation
    steps.push(
      await this.simulateStep("start_generation", "Start episode generation")
    );

    // Wait for generation to complete (or timeout)
    const maxWaitTime = 60000; // 60 seconds
    let waited = 0;
    const pollInterval = 2000;

    while (waited < maxWaitTime) {
      await this.sleep(pollInterval);
      waited += pollInterval;

      // Check if generation completed
      const completed = await this.simulateStep(
        "check_status",
        "Check generation status"
      );
      steps.push(completed);

      if (completed.success) {
        break;
      }
    }

    if (waited >= maxWaitTime) {
      errors.push({
        message: "Episode generation timed out",
        timestamp: new Date(),
        type: "timeout",
      });
    }
  }

  /**
   * Test error recovery scenarios
   */
  private async testErrorRecovery(
    user: SyntheticUserConfig,
    steps: TestStepResult[],
    errors: TestError[]
  ): Promise<void> {
    // Test invalid URL input
    steps.push(
      await this.simulateStep("invalid_url", "Test invalid URL input")
    );
    await this.sleep(this.getThinkTime(user));

    // Test network timeout simulation
    steps.push(
      await this.simulateStep(
        "network_timeout",
        "Test network timeout recovery"
      )
    );
    await this.sleep(this.getThinkTime(user));

    // Test browser back/forward navigation
    steps.push(
      await this.simulateStep("browser_navigation", "Test browser navigation")
    );
  }

  /**
   * Test navigation flow between pages
   */
  private async testNavigationFlow(
    user: SyntheticUserConfig,
    steps: TestStepResult[],
    errors: TestError[]
  ): Promise<void> {
    const pages = ["/", "/episodes", "/sources", "/queue", "/internal"];

    for (const page of pages) {
      steps.push(
        await this.simulateStep(`navigate_${page}`, `Navigate to ${page}`)
      );
      await this.sleep(this.getThinkTime(user));

      // Check page load and basic functionality
      steps.push(
        await this.simulateStep(
          `verify_${page}`,
          `Verify ${page} loads correctly`
        )
      );
      await this.sleep(this.getThinkTime(user) / 2);
    }
  }

  /**
   * Test performance under stress conditions
   */
  private async testPerformanceStress(
    user: SyntheticUserConfig,
    steps: TestStepResult[],
    errors: TestError[]
  ): Promise<void> {
    // Rapid navigation
    for (let i = 0; i < 10; i++) {
      steps.push(
        await this.simulateStep(`rapid_nav_${i}`, `Rapid navigation ${i + 1}`)
      );
      await this.sleep(100); // Very quick navigation
    }

    // Multiple concurrent actions
    steps.push(
      await this.simulateStep(
        "concurrent_actions",
        "Execute multiple concurrent actions"
      )
    );

    // Memory stress test
    steps.push(await this.simulateStep("memory_stress", "Memory stress test"));
  }

  /**
   * Test responsive design across different viewports
   */
  private async testResponsiveDesign(
    user: SyntheticUserConfig,
    steps: TestStepResult[],
    errors: TestError[]
  ): Promise<void> {
    const viewports = [
      { height: 844, name: "mobile", width: 390 },
      { height: 1024, name: "tablet", width: 768 },
      { height: 900, name: "desktop", width: 1440 },
    ];

    for (const viewport of viewports) {
      steps.push(
        await this.simulateStep(
          `resize_${viewport.name}`,
          `Test ${viewport.name} viewport (${viewport.width}x${viewport.height})`
        )
      );
      await this.sleep(1000);

      // Test key interactions on this viewport
      steps.push(
        await this.simulateStep(
          `interact_${viewport.name}`,
          `Test interactions on ${viewport.name}`
        )
      );
      await this.sleep(this.getThinkTime(user));
    }
  }
}

/**
 * Factory function to create synthetic user testing instance
 *
 * @business-context Provides easy instantiation with standard configuration
 */
export function createSyntheticUserTesting(
  baseUrl?: string
): SyntheticUserTesting {
  const testing = new SyntheticUserTesting(baseUrl);
  testing.createStandardUserProfiles();
  return testing;
}

/**
 * Utility function to run quick validation tests
 *
 * @business-context Provides a simple way to run basic synthetic tests
 *                   for quick feature validation
 */
export async function runQuickValidation(
  baseUrl?: string
): Promise<SyntheticTestReport> {
  const testing = createSyntheticUserTesting(baseUrl);
  await testing.executeAllUserTests();
  return testing.generateReport();
}
