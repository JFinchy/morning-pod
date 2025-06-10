import { cache } from "react";

import { appRouter } from "./root";
import { createCallerFactory, createTRPCContext } from "./server";

// Create the server-side caller
const createCaller = createCallerFactory(appRouter);

// Cache the context creation
const getContext = cache(async () => {
  return await createTRPCContext();
});

// Cache the caller creation
export const getServerApi = cache(async () => {
  const ctx = await getContext();
  return createCaller(ctx);
});
