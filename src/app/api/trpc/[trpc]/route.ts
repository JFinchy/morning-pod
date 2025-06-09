import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest, NextResponse } from "next/server";

import { securityConfig } from "../../../../lib/config/security";
import { appMockRouter } from "../../../../lib/trpc/root-mock";
import { createTRPCMockContext } from "../../../../lib/trpc/server-mock";
import { withApiMiddleware } from "../../../../lib/utils/api-middleware";

const baseHandler = (req: NextRequest) =>
  fetchRequestHandler({
    createContext: createTRPCMockContext,
    endpoint: "/api/trpc",
    onError:
      process.env.NODE_ENV === "development"
        ? ({ error, path }: { error: Error; path?: string }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
    req,
    router: appMockRouter,
  });

// Wrap handler with middleware
const handler = withApiMiddleware(
  async (req: NextRequest): Promise<NextResponse> => {
    const response = await baseHandler(req);
    if (response instanceof NextResponse) {
      return response;
    }
    if (response instanceof Response) {
      return new NextResponse(response.body, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      });
    }
    return NextResponse.json(response);
  },
  {
    allowedMethods: securityConfig.allowedMethods.all,
    maxBodySize: securityConfig.requestLimits.json,
    rateLimit: true,
  }
);

export { handler as GET, handler as POST };
