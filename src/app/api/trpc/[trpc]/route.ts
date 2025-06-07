import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest, NextResponse } from "next/server";

import { securityConfig } from "../../../../lib/config/security";
import { appMockRouter } from "../../../../lib/trpc/root-mock";
import { createTRPCMockContext } from "../../../../lib/trpc/server-mock";
import { withApiMiddleware } from "../../../../lib/utils/api-middleware";

const baseHandler = (req: NextRequest) =>
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

// Wrap handler with middleware
const handler = withApiMiddleware(
  async (req: NextRequest): Promise<NextResponse> => {
    const response = await baseHandler(req);
    if (response instanceof NextResponse) {
      return response;
    }
    if (response instanceof Response) {
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    return NextResponse.json(response);
  },
  {
    rateLimit: true,
    maxBodySize: securityConfig.requestLimits.json,
    allowedMethods: securityConfig.allowedMethods.all,
  }
);

export { handler as GET, handler as POST };
