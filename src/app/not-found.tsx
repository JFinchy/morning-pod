import Link from "next/link";
// Optional: If you create an SVG or image for TuneBot
// import Image from 'next/image';
// import TuneBotConfused from '../public/images/tunebot-confused.svg'; // Example path

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        {/* Placeholder for TuneBot image/animation */}
        {/* <Image src={TuneBotConfused} alt="TuneBot looking confused" width={150} height={150} /> */}
        <div className="text-6xl mb-4 animate-pulse">🎧🤖?</div>{" "}
        {/* Simple emoji placeholder */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          404 - TuneBot Lost the Frequency!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Looks like the page you&apos;re searching for has gone off-air or
          never existed. Don&apos;t worry, TuneBot can help you find a new
          station!
        </p>
      </div>
      <div className="space-x-4">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition duration-300"
        >
          Back to Homepage
        </Link>
        <Link
          href="/episodes"
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-semibold rounded-md shadow-md transition duration-300"
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
