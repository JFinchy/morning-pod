"use client";

import { AlertTriangle, Podcast, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" data-theme="forest">
      <body>
        <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-8">
            <div className="w-24 h-24 bg-error/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12 text-error" />
            </div>
            <h1 className="text-4xl font-black text-base-content mb-4">
              Transmission Interrupted
            </h1>
            <p className="text-lg text-base-content/60 mb-8 max-w-md mx-auto">
              Our broadcast encountered some unexpected interference. We&apos;ve
              logged the technical details and are working to restore the
              signal.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              className="h-12 px-8 gap-2"
              onClick={() => reset()}
            >
              <RefreshCw className="w-4 h-4" />
              Reset Connection
            </Button>
            <Link href="/">
              <Button btnStyle="outline" size="lg" className="h-12 px-8">
                Go to Homepage
              </Button>
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-base-300 w-full max-w-md">
            <p className="text-xs text-base-content/40 uppercase font-bold tracking-widest mb-4">
              Morning Pod • Debug Information
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="text-left bg-base-200 p-4 rounded-xl overflow-auto max-h-48">
                <pre className="text-xs font-mono text-error">
                  <code>{error.message}</code>
                </pre>
                {error.digest && (
                  <p className="text-[10px] text-base-content/40 mt-2 font-mono">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
