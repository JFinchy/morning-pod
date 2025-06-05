import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Caching Strategy
        staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for this long
        gcTime: 10 * 60 * 1000, // 10 minutes - data kept in cache for this long

        // Performance Optimizations
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: "always", // Always refetch when coming back online
        refetchOnMount: true, // Refetch when component mounts if data is stale

        // Retry Strategy
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for server errors and network issues
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      },

      mutations: {
        // Retry strategy for mutations (more conservative)
        retry: (failureCount, error: any) => {
          // Don't retry mutations on client errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Only retry once for server errors
          return failureCount < 1;
        },
      },

      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
