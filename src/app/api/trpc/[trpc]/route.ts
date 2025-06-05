import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { appMockRouter } from "../../../../lib/trpc/root-mock";
import { createTRPCMockContext } from "../../../../lib/trpc/server-mock";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appMockRouter,
    createContext: createTRPCMockContext,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }: { path?: string; error: Error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
