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
    asPath: "/",
    back: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      emit: vi.fn(),
      off: vi.fn(),
      on: vi.fn(),
    },
    pathname: "/",
    prefetch: vi.fn(),
    push: vi.fn(),
    query: {},
    reload: vi.fn(),
    replace: vi.fn(),
    route: "/",
  })),
}));

// Mock Next.js navigation (App Router)
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock performance monitoring
vi.mock("@/lib/performance-monitor", () => ({
  performanceMonitor: {
    showDebugOverlay: vi.fn(),
    trackTRPCQuery: vi.fn(),
    trackUserInteraction: vi.fn(),
    trackWebVitals: vi.fn(),
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
  db: vi.fn(),
  sql: vi.fn(),
  VercelPool: vi.fn(),
}));

// Mock Drizzle database
vi.mock("@/lib/db/connection", () => ({
  db: {
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => Promise.resolve([])),
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock the entire tRPC server to prevent database calls
vi.mock("@/lib/trpc/server", () => ({
  createCallerFactory: vi.fn(),
  createTRPCContext: vi.fn(),
  createTRPCRouter: vi.fn(),
  publicProcedure: vi.fn(),
}));

// Global DOM mocks
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(), // Deprecated
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(), // Deprecated
  })),
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
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
  value: vi.fn().mockImplementation(() => Promise.resolve()),
  writable: true,
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  value: vi.fn(),
  writable: true,
});
