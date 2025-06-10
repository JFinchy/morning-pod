import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { type TRPCPanelMeta } from "trpc-ui";

// Create context for tRPC (mock version without database)
export const createTRPCMockContext = async () => {
  return {
    // No database connection needed for mock
  };
};

export type MockContext = Awaited<ReturnType<typeof createTRPCMockContext>>;

// Initialize tRPC with meta support for documentation
const t = initTRPC
  .meta<TRPCPanelMeta>()
  .context<MockContext>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
    transformer: superjson,
  });

// Export reusable router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
