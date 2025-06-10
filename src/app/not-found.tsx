import Link from "next/link";
// Optional: If you create an SVG or image for TuneBot
// import Image from 'next/image';
// import TuneBotConfused from '../public/images/tunebot-confused.svg'; // Example path

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 text-center dark:bg-gray-900">
      <div className="mb-8">
        {/* Placeholder for TuneBot image/animation */}
        {/* <Image src={TuneBotConfused} alt="TuneBot looking confused" width={150} height={150} /> */}
        <div className="mb-4 animate-pulse text-6xl">🎧🤖?</div>{" "}
        {/* Simple emoji placeholder */}
        <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-white">
          404 - TuneBot Lost the Frequency!
        </h1>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
          Looks like the page you&apos;re searching for has gone off-air or
          never existed. Don&apos;t worry, TuneBot can help you find a new
          station!
        </p>
      </div>
      <div className="space-x-4">
        <Link
          className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-blue-700"
          href="/"
        >
          Back to Homepage
        </Link>
        <Link
          className="rounded-md bg-gray-300 px-6 py-3 font-semibold text-gray-800 shadow-md transition duration-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          href="/episodes"
        >
          Browse All Podcasts
        </Link>
      </div>
      <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        Morning Pod - Your Daily Dose of AI-Powered News
      </p>
    </div>
  );
}
