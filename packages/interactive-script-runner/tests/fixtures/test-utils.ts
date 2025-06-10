import { vi } from "vitest";
import fs from "fs-extra";
import type { ProjectDetection, PackageManagerDetection } from "@/types";
import * as fixtures from "./projects";

const mockedFs = vi.mocked(fs);

/**
 * Test utilities for setting up mock project environments
 */
export class TestProjectSetup {
  private projectPath: string;
  private mockFiles: Set<string> = new Set();
  private mockPackageJson: any = {};
  private mockConfigFile: any = null;

  constructor(projectPath: string = "/tmp/test-project") {
    this.projectPath = projectPath;
  }

  /**
   * Set up a Next.js project environment
   */
  setupNextJsProject(): this {
    const project = fixtures.nextjsProject;
    this.mockPackageJson = project.packageJson;
    project.files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Set up a React project environment
   */
  setupReactProject(): this {
    const project = fixtures.reactProject;
    this.mockPackageJson = project.packageJson;
    project.files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Set up a Node.js project environment
   */
  setupNodeProject(): this {
    const project = fixtures.nodeProject;
    this.mockPackageJson = project.packageJson;
    project.files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Set up a generic project environment
   */
  setupGenericProject(): this {
    const project = fixtures.genericProject;
    this.mockPackageJson = project.packageJson;
    project.files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Set up a monorepo project environment
   */
  setupMonorepoProject(): this {
    const project = fixtures.monorepoProject;
    this.mockPackageJson = project.packageJson;
    project.files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Set up a project with custom configuration
   */
  setupCustomConfigProject(): this {
    const project = fixtures.customConfigProject;
    this.mockPackageJson = project.packageJson;
    this.mockConfigFile = project.configFile;
    project.files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Add specific package manager files
   */
  withPackageManager(manager: "bun" | "npm" | "yarn" | "pnpm"): this {
    const pm = fixtures.packageManagers[manager];
    pm.files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Add specific features to the project
   */
  withFeatures(features: string[]): this {
    features.forEach((feature) => {
      switch (feature) {
        case "typescript":
          this.mockFiles.add("tsconfig.json");
          break;
        case "testing":
          this.mockFiles.add("vitest.config.ts");
          this.mockFiles.add("jest.config.js");
          break;
        case "linting":
          this.mockFiles.add(".eslintrc.js");
          break;
        case "database":
          this.mockFiles.add("drizzle.config.ts");
          this.mockFiles.add("prisma/schema.prisma");
          break;
        case "tailwind":
          this.mockFiles.add("tailwind.config.js");
          break;
        case "storybook":
          this.mockFiles.add(".storybook/main.js");
          break;
      }
    });
    return this;
  }

  /**
   * Add custom files to the project
   */
  withFiles(files: string[]): this {
    files.forEach((file) => this.mockFiles.add(file));
    return this;
  }

  /**
   * Set custom package.json content
   */
  withPackageJson(packageJson: any): this {
    this.mockPackageJson = packageJson;
    return this;
  }

  /**
   * Set custom config file content
   */
  withConfigFile(config: any): this {
    this.mockConfigFile = config;
    return this;
  }

  /**
   * Apply the mocked file system
   */
  apply(): void {
    // Always add package.json to files if it has content
    if (Object.keys(this.mockPackageJson).length > 0) {
      this.mockFiles.add("package.json");
    }

    mockedFs.existsSync.mockImplementation((filePath: string) => {
      const pathStr = filePath.toString();
      const relativePath = pathStr.replace(this.projectPath + "/", "");

      // Check for exact matches first
      if (this.mockFiles.has(relativePath)) {
        return true;
      }

      // Check for pattern matches
      return Array.from(this.mockFiles).some((file) => {
        if (pathStr.includes(file)) {
          return true;
        }
        // Handle directory checks
        if (file.includes("/") && pathStr.includes(file.split("/")[0])) {
          return true;
        }
        return false;
      });
    });

    mockedFs.readJSONSync.mockImplementation((filePath: string) => {
      const pathStr = filePath.toString();

      if (pathStr.includes("package.json")) {
        return this.mockPackageJson;
      }

      if (pathStr.includes(".scriptrunnerrc.json") && this.mockConfigFile) {
        return this.mockConfigFile;
      }

      return {};
    });

    // Mock dynamic imports for JS config files
    if (this.mockConfigFile && this.mockFiles.has("script-runner.config.js")) {
      vi.doMock(
        `${this.projectPath}/script-runner.config.js`,
        () => ({
          default: this.mockConfigFile,
        }),
        { virtual: true }
      );
    }
  }

  /**
   * Reset all mocks
   */
  reset(): void {
    vi.clearAllMocks();
    this.mockFiles.clear();
    this.mockPackageJson = {};
    this.mockConfigFile = null;
  }

  /**
   * Get the project path
   */
  getProjectPath(): string {
    return this.projectPath;
  }

  /**
   * Get expected project detection result
   */
  getExpectedProjectDetection(): ProjectDetection {
    let type: ProjectDetection["type"] = "generic";
    const features: string[] = [];

    // Determine project type
    if (
      this.mockFiles.has("next.config.js") ||
      this.mockFiles.has("next.config.ts")
    ) {
      type = "nextjs";
      features.push("react");
    } else if (
      this.mockPackageJson.dependencies?.react ||
      this.mockPackageJson.devDependencies?.react
    ) {
      type = "react";
      features.push("react");
    } else if (
      this.mockPackageJson.main ||
      this.mockPackageJson.type === "module"
    ) {
      type = "node";
    }

    // Determine features
    if (this.mockFiles.has("tsconfig.json")) {
      features.push("typescript");
    }
    if (
      this.mockFiles.has("vitest.config.ts") ||
      this.mockFiles.has("jest.config.js") ||
      this.mockPackageJson.devDependencies?.vitest ||
      this.mockPackageJson.devDependencies?.jest
    ) {
      features.push("testing");
    }
    if (
      this.mockFiles.has(".eslintrc.js") ||
      this.mockPackageJson.devDependencies?.eslint
    ) {
      features.push("linting");
    }
    if (
      this.mockFiles.has("drizzle.config.ts") ||
      this.mockFiles.has("prisma/schema.prisma")
    ) {
      features.push("database");
    }
    if (
      this.mockFiles.has("tailwind.config.js") ||
      this.mockPackageJson.devDependencies?.tailwindcss
    ) {
      features.push("tailwind");
    }
    if (
      this.mockFiles.has(".storybook/main.js") ||
      this.mockPackageJson.devDependencies?.["@storybook/react"]
    ) {
      features.push("storybook");
    }

    return { type, features };
  }

  /**
   * Get expected package manager detection result
   */
  getExpectedPackageManagerDetection(): PackageManagerDetection {
    if (this.mockFiles.has("bun.lockb")) {
      return { manager: "bun", lockfile: "bun.lockb" };
    }
    if (this.mockFiles.has("pnpm-lock.yaml")) {
      return { manager: "pnpm", lockfile: "pnpm-lock.yaml" };
    }
    if (this.mockFiles.has("yarn.lock")) {
      return { manager: "yarn", lockfile: "yarn.lock" };
    }
    return { manager: "npm", lockfile: "package-lock.json" };
  }
}

/**
 * Create a mock spawn result
 */
export function createMockSpawnResult(
  exitCode: number = 0,
  stdout: string = "",
  stderr: string = ""
) {
  return {
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn((event, callback) => {
      if (event === "close") {
        setTimeout(() => callback(exitCode), 100);
      }
    }),
  };
}

/**
 * Create a mock spawn sync result
 */
export function createMockSpawnSyncResult(
  status: number = 0,
  stdout: string = "",
  stderr: string = ""
) {
  return {
    status,
    stdout: Buffer.from(stdout),
    stderr: Buffer.from(stderr),
    pid: 12345,
    output: [null, Buffer.from(stdout), Buffer.from(stderr)],
    signal: null,
  };
}

/**
 * Mock interactive prompts with predefined responses
 */
export function mockInteractivePrompts(responses: {
  categorySelection?: string;
  commandSelection?: string;
  argumentInputs?: Record<string, string>;
  confirmations?: Record<string, boolean>;
}) {
  const clackPrompts = vi.mocked(await vi.importActual("@clack/prompts"));

  if (responses.categorySelection) {
    clackPrompts.select.mockResolvedValueOnce(responses.categorySelection);
  }

  if (responses.commandSelection) {
    clackPrompts.select.mockResolvedValueOnce(responses.commandSelection);
  }

  if (responses.argumentInputs) {
    Object.values(responses.argumentInputs).forEach((input) => {
      clackPrompts.text.mockResolvedValueOnce(input);
    });
  }

  if (responses.confirmations) {
    Object.values(responses.confirmations).forEach((confirmation) => {
      clackPrompts.confirm.mockResolvedValueOnce(confirmation);
    });
  }
}

/**
 * Assert that a command was executed with expected arguments
 */
export function assertCommandExecuted(
  mockedSpawn: any,
  expectedCommand: string,
  expectedArgs: string[],
  expectedOptions?: any
) {
  expect(mockedSpawn).toHaveBeenCalledWith(
    expectedCommand,
    expectedArgs,
    expectedOptions
      ? expect.objectContaining(expectedOptions)
      : expect.any(Object)
  );
}

/**
 * Create error scenarios for testing
 */
export function setupErrorScenario(
  scenario: keyof typeof fixtures.errorScenarios
): void {
  const errorCase = fixtures.errorScenarios[scenario];

  switch (scenario) {
    case "invalidPackageJson":
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readJSONSync.mockImplementation(() => {
        throw new Error("Unexpected token in JSON");
      });
      break;

    case "missingPackageJson":
      mockedFs.existsSync.mockImplementation((path: string) => {
        return !path.toString().includes("package.json");
      });
      break;

    case "brokenConfigFile":
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readJSONSync.mockReturnValue(errorCase.packageJson);
      vi.doMock(
        "/tmp/test-project/script-runner.config.js",
        () => {
          throw new Error("Invalid JavaScript");
        },
        { virtual: true }
      );
      break;

    case "emptyProject":
      mockedFs.existsSync.mockReturnValue(false);
      break;
  }
}

/**
 * Utility to test command execution with different exit codes
 */
export async function testCommandExecution(
  scriptRunner: any,
  args: string[],
  expectedExitCode: number = 0
): Promise<boolean> {
  const mockedSpawn = vi.mocked(await vi.importActual("cross-spawn"));

  mockedSpawn.default.mockReturnValue(createMockSpawnResult(expectedExitCode));

  return scriptRunner.run(args);
}
