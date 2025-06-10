import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },

      hydrate: {
        deserializeData: superjson.deserialize,
      },

      mutations: {
        // Retry strategy for mutations (more conservative)
        retry: (failureCount, error: unknown) => {
          // Don't retry mutations on client errors
          const httpError = error as { status?: number };
          if (
            httpError?.status &&
            httpError.status >= 400 &&
            httpError.status < 500
          ) {
            return false;
          }
          // Only retry once for server errors
          return failureCount < 1;
        },
      },
      queries: {
        gcTime: 10 * 60 * 1000, // 10 minutes - data kept in cache for this long
        refetchOnMount: true, // Refetch when component mounts if data is stale

        refetchOnReconnect: "always", // Always refetch when coming back online
        // Performance Optimizations
        refetchOnWindowFocus: false, // Don't refetch on window focus
        // Retry Strategy
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors (client errors)
          const httpError = error as { status?: number };
          if (
            httpError?.status &&
            httpError.status >= 400 &&
            httpError.status < 500
          ) {
            return false;
          }
          // Retry up to 3 times for server errors and network issues
          return failureCount < 3;
        },

        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        // Caching Strategy
        staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for this long
      },
    },
  });
}
