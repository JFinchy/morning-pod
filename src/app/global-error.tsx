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
        <div className="min-h-screen bg-red-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-8">
            {/* Placeholder for TuneBot image/animation */}
            {/* <Image src={TuneBotFrazzled} alt="TuneBot looking frazzled" width={150} height={150} /> */}
            <div className="text-6xl mb-4">⚡🤖🔧</div>{" "}
            {/* Simple emoji placeholder */}
            <h1 className="text-4xl font-bold text-red-700 dark:text-red-400 mb-2">
              500 - TuneBot&apos;s Circuits are Sizzling!
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Our AI is experiencing some unexpected turbulence and needs a
              quick reboot. The engineers have been notified!
            </p>
          </div>
          <div className="space-x-4">
            <button
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow-md transition duration-300"
              onClick={() => reset()}
            >
              Try Refreshing Page
            </button>
            <Link
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-semibold rounded-md shadow-md transition duration-300"
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
              <summary className="cursor-pointer text-sm text-base-content/60">
                Error details
              </summary>
              <pre className="text-xs mt-2 p-2 bg-base-200 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
