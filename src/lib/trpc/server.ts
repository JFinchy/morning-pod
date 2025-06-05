import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

import { db } from "../db/connection";

// Create context for tRPC with React cache
export const createTRPCContext = cache(async () => {
  return {
    db,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

// Export reusable router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
