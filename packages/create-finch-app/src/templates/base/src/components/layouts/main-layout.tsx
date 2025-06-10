import Link from "next/link";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-base-100 min-h-screen">
      {/* Header */}
      <header className="bg-base-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-primary text-xl font-bold">
              {{ projectName }}
            </Link>

            <nav className="hidden space-x-4 md:flex">
              <Link
                href="/"
                className="text-base-content hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-base-content hover:text-primary transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                >
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-base-200 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-base-content/60 text-center">
            <p>&copy; 2024 {{ projectName }}. Built with Next.js and ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
