import Link from "next/link";
import { Button } from "@/components/ui";
import { BrokenRecordIllustration } from "@/components/ui/illustrations/error-illustrations";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <div className="w-48 h-48 mx-auto mb-8">
          <BrokenRecordIllustration />
        </div>
        <h1 className="text-5xl font-black text-base-content mb-4 tracking-tight">
          Sound Not Found
        </h1>
        <p className="text-lg text-base-content/60 mb-8 max-w-md mx-auto">
          The briefing you&apos;re looking for has gone off-air or never
          existed. Let&apos;s get you back to the news that matters.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button variant="primary" size="lg" className="h-12 px-8">
            Back Home
          </Button>
        </Link>
        <Link href="/episodes">
          <Button btnStyle="outline" size="lg" className="h-12 px-8">
            Your Library
          </Button>
        </Link>
      </div>
      <div className="mt-16 pt-8 border-t border-base-300 w-full max-w-xs">
        <p className="text-xs text-base-content/40 uppercase font-bold tracking-widest">
          Morning Pod
        </p>
      </div>
    </div>
  );
}
