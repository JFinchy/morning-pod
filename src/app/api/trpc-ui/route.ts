import { NextResponse } from "next/server";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    // Dynamically import the router to avoid build-time DB connection
    const { appRouter } = await import("@/lib/trpc/root");
    const { renderTrpcPanel } = await import("trpc-ui");

    return new NextResponse(
      // Type assertion necessary due to version incompatibility between tRPC v11 and trpc-ui
      // trpc-ui expects a different AnyRouter interface than what our tRPC v11 router provides
      // This is safe since renderTrpcPanel only uses the router's procedure definitions
      renderTrpcPanel(
        appRouter as unknown as Parameters<typeof renderTrpcPanel>[0],
        {
          url: "/api/trpc", // Default tRPC route
          transformer: "superjson", // We're using superjson for data transformation
          meta: {
            title: "Morning Pod tRPC API",
            description:
              "Auto-generated testing UI for Morning Pod tRPC endpoints. Test episodes, sources, queue management, and more.",
          },
        }
      ),
      {
        status: 200,
        headers: [["Content-Type", "text/html"] as [string, string]],
      }
    );
  } catch (error) {
    console.error("Error rendering tRPC UI:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
