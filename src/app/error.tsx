"use client";

import { useEffect } from "react";
import { ServerErrorIllustration } from "@/components/ui/illustrations/error-illustrations";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8 max-w-lg w-full">
        <div className="w-56 h-56 mx-auto mb-10">
          <ServerErrorIllustration />
        </div>
        <h1 className="text-4xl font-black text-base-content mb-4 tracking-tight">
          System Interruption
        </h1>
        <p className="text-lg text-base-content/60 mb-8 mx-auto">
          Our servers encountered an unexpected hiccup while processing your
          audio. Don&apos;t worry, we&apos;re looking into it.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant="primary"
          size="lg"
          className="h-12 px-8"
          onClick={() => reset()}
        >
          Try Again
        </Button>
        <Button
          btnStyle="outline"
          size="lg"
          className="h-12 px-8"
          onClick={() => (window.location.href = "/")}
        >
          Return to Studio
        </Button>
      </div>
      <div className="mt-16 pt-8 border-t border-base-300 w-full max-w-xs">
        <p className="text-xs text-base-content/40 uppercase font-bold tracking-widest">
          Morning Pod Server Diagnostics
        </p>
      </div>
    </div>
  );
}
