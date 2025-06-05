import "@testing-library/jest-dom";
import { vi } from "vitest";

// Set test environment variables
if (!process.env.NODE_ENV) {
  Object.defineProperty(process.env, "NODE_ENV", { value: "test" });
}
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
}

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: vi.fn(() => ({
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  })),
}));

// Mock Next.js navigation (App Router)
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock performance monitoring
vi.mock("@/lib/performance-monitor", () => ({
  performanceMonitor: {
    trackWebVitals: vi.fn(),
    trackUserInteraction: vi.fn(),
    trackTRPCQuery: vi.fn(),
    showDebugOverlay: vi.fn(),
  },
}));

// Mock Vercel Analytics
vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}));

// Mock Vercel Speed Insights
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => null,
}));

// Prevent database connections in tests
vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(),
  db: vi.fn(),
  VercelPool: vi.fn(),
}));

// Mock Drizzle database
vi.mock("@/lib/db/connection", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
}));

// Mock the entire tRPC server to prevent database calls
vi.mock("@/lib/trpc/server", () => ({
  createCallerFactory: vi.fn(),
  createTRPCRouter: vi.fn(),
  publicProcedure: vi.fn(),
  createTRPCContext: vi.fn(),
}));

// Global DOM mocks
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Console error suppression for known test issues
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Warning: ReactDOM.render is no longer supported") ||
      args[0].includes("Warning: An invalid form control") ||
      args[0].includes("Database connection failed"))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock audio elements for player tests
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  writable: true,
  value: vi.fn(),
});
