"use client"; // error.js must be a Client Component

import Link from "next/link";
import { useEffect } from "react";
// Optional: If you create an SVG or image for TuneBot
// import Image from 'next/image';
// import TuneBotFrazzled from '../public/images/tunebot-frazzled.svg'; // Example path

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    // TODO: Replace with proper error reporting service
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("Global error:", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 px-4 text-center dark:bg-gray-900">
          <div className="mb-8">
            {/* Placeholder for TuneBot image/animation */}
            {/* <Image src={TuneBotFrazzled} alt="TuneBot looking frazzled" width={150} height={150} /> */}
            <div className="mb-4 text-6xl">⚡🤖🔧</div>{" "}
            {/* Simple emoji placeholder */}
            <h1 className="mb-2 text-4xl font-bold text-red-700 dark:text-red-400">
              500 - TuneBot&apos;s Circuits are Sizzling!
            </h1>
            <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
              Our AI is experiencing some unexpected turbulence and needs a
              quick reboot. The engineers have been notified!
            </p>
          </div>
          <div className="space-x-4">
            <button
              className="rounded-md bg-yellow-500 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-yellow-600"
              onClick={() => reset()}
            >
              Try Refreshing Page
            </button>
            <Link
              className="rounded-md bg-gray-300 px-6 py-3 font-semibold text-gray-800 shadow-md transition duration-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              href="/"
            >
              Go to Homepage
            </Link>
          </div>
          <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            We&apos;re working on it! Thanks for your patience.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4">
              <summary className="text-base-content/60 cursor-pointer text-sm">
                Error details
              </summary>
              <pre className="bg-base-200 mt-2 overflow-auto rounded p-2 text-xs">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
