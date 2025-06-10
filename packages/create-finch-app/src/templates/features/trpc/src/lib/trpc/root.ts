import { createTRPCRouter } from "./server";
import { exampleRouter } from "./routers/example";
{{#if hasDatabase}}import { usersRouter } from "./routers/users";{{/if}}

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
{{#if hasDatabase}}  users: usersRouter,{{/if}}
});

// export type definition of API
export type AppRouter = typeof appRouter;