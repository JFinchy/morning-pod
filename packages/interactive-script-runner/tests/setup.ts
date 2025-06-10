import { vi } from "vitest";

// Mock fs-extra to avoid actual file system operations in tests
vi.mock("fs-extra", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    readJSONSync: vi.fn(),
    writeJSONSync: vi.fn(),
    ensureDirSync: vi.fn(),
    pathExistsSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readJSONSync: vi.fn(),
  writeJSONSync: vi.fn(),
  ensureDirSync: vi.fn(),
  pathExistsSync: vi.fn(),
}));

// Mock cross-spawn to avoid actual command execution
vi.mock("cross-spawn", () => ({
  default: vi.fn(() => ({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn((event, callback) => {
      if (event === "close") {
        setTimeout(() => callback(0), 100);
      }
    }),
  })),
  sync: vi.fn(() => ({
    status: 0,
    stdout: Buffer.from(""),
    stderr: Buffer.from(""),
  })),
}));

// Mock clack prompts for interactive testing
vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  confirm: vi.fn(() => Promise.resolve(true)),
  select: vi.fn(() => Promise.resolve("test")),
  multiselect: vi.fn(() => Promise.resolve(["test"])),
  text: vi.fn(() => Promise.resolve("test input")),
  spinner: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    message: vi.fn(),
  })),
}));

// Mock inquirer prompts as fallback
vi.mock("@inquirer/prompts", () => ({
  search: vi.fn(() => Promise.resolve("test")),
  select: vi.fn(() => Promise.resolve("test")),
  input: vi.fn(() => Promise.resolve("test input")),
  confirm: vi.fn(() => Promise.resolve(true)),
  checkbox: vi.fn(() => Promise.resolve(["test"])),
}));

// Mock child_process execSync
vi.mock("child_process", () => ({
  execSync: vi.fn(() => "mocked command output"),
}));

// Console mocks for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

// Process mocks
const originalCwd = process.cwd;
Object.defineProperty(process, "cwd", {
  value: vi.fn(() => "/mock/cwd"),
  writable: true,
});

const originalExit = process.exit;
Object.defineProperty(process, "exit", {
  value: vi.fn(),
  writable: true,
});

// Mock process.argv for CLI testing
const originalArgv = process.argv;
Object.defineProperty(process, "argv", {
  value: ["node", "script-runner"],
  writable: true,
});

// Set up test environment variables
vi.stubEnv("NODE_ENV", "test");
vi.stubEnv("CI", "false");
