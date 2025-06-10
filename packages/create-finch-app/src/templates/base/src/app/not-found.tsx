import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-base-100 flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-primary/20 text-9xl font-bold">404</h1>
        <h2 className="text-base-content mb-4 text-2xl font-semibold">
          Page Not Found
        </h2>
        <p className="text-base-content/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn btn-primary gap-2">
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
