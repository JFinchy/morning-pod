import { createTRPCReact } from "@trpc/react-query";

import { type AppRouter } from "./root";

export const api = createTRPCReact<AppRouter>();

// Type for tRPC error objects that matches the actual tRPC error structure
interface TRPCError {
  data?: {
    code?: string;
  } | null;
  message?: string;
}

// Enhanced error handling for tRPC queries
export const handleTRPCError = (error: TRPCError) => {
  console.error("tRPC Error:", error);

  // Track error for performance monitoring
  if (typeof window !== "undefined") {
    import("@/lib/utils/performance").then(({ performanceMonitor }) => {
      performanceMonitor.recordMetric("tRPC.error", 1, "count");
    });
  }

  // Return user-friendly error messages
  if (error.data && error.data.code === "UNAUTHORIZED") {
    return "You need to be signed in to perform this action.";
  }

  if (error.data && error.data.code === "FORBIDDEN") {
    return "You don't have permission to perform this action.";
  }

  if (error.data && error.data.code === "NOT_FOUND") {
    return "The requested resource was not found.";
  }

  if (error.data && error.data.code === "TIMEOUT") {
    return "The request timed out. Please try again.";
  }

  return error.message || "An unexpected error occurred. Please try again.";
};
