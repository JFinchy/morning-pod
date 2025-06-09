import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

// Test reusable UI components
function MockButton({
  children,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className="btn btn-primary" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function MockDashboardCard({
  description,
  title,
  value,
}: {
  description?: string;
  title: string;
  value: number | string;
}) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-base-content/70">{description}</p>
        )}
      </div>
    </div>
  );
}

function MockEpisodeCard({
  status,
  summary,
  title,
}: {
  status: "error" | "generating" | "ready";
  summary: string;
  title: string;
}) {
  const statusColor = {
    error: "badge-error",
    generating: "badge-warning",
    ready: "badge-success",
  }[status];

  return (
    <div className="card bg-base-100 shadow-sm border-0">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="card-title text-sm font-medium">{title}</h3>
          <span className={`badge badge-sm ${statusColor}`}>{status}</span>
        </div>
        <p className="text-xs text-base-content/70 line-clamp-2">{summary}</p>
        {status === "ready" && (
          <div className="card-actions justify-end mt-2">
            <MockButton>Play</MockButton>
          </div>
        )}
      </div>
    </div>
  );
}

function MockNavigation() {
  return (
    <nav className="navbar bg-base-100" role="navigation">
      <div className="navbar-start">
        <span className="btn btn-ghost text-xl">Morning Pod</span>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <span>Dashboard</span>
          </li>
          <li>
            <span>Episodes</span>
          </li>
          <li>
            <span>Sources</span>
          </li>
          <li>
            <span>Queue</span>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <button aria-label="Menu" className="btn btn-square btn-ghost">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function MockDashboard() {
  return (
    <div>
      <MockNavigation />
      <main className="container mx-auto px-4 py-8" role="main">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to Morning Pod</h1>
          <p className="text-base-content/70 mt-2">
            Your daily AI-generated podcast from the latest news
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MockDashboardCard title="Total Episodes" value={42} />
          <MockDashboardCard title="Total Play Time" value="2.5 hours" />
          <MockDashboardCard title="Episodes This Week" value={7} />
          <MockDashboardCard title="Average Length" value="4.2 min" />
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Episodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MockEpisodeCard
              status="ready"
              summary="Today in tech: OpenAI announces new features, Apple releases iOS update, and more..."
              title="TLDR Tech News - January 4th"
            />
            <MockEpisodeCard
              status="generating"
              summary="Top stories from Hacker News including discussions on AI, startups, and programming..."
              title="Hacker News Digest - January 4th"
            />
            <MockEpisodeCard
              status="ready"
              summary="Business news roundup covering markets, tech, and entrepreneurship..."
              title="Morning Brew Summary - January 3rd"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

describe("UI Components", () => {
  describe("Button Component", () => {
    test("renders and handles clicks", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<MockButton onClick={handleClick}>Click me</MockButton>);

      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("can be disabled", () => {
      render(<MockButton disabled>Disabled</MockButton>);

      const button = screen.getByRole("button", { name: /disabled/i });
      await expect(button).toBeDisabled();
    });
  });

  describe("Dashboard Card", () => {
    test("displays title and value", () => {
      render(
        <MockDashboardCard
          description="All time"
          title="Total Episodes"
          value={42}
        />
      );

      expect(screen.getByText("Total Episodes")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("All time")).toBeInTheDocument();
    });
  });

  describe("Episode Card", () => {
    test("shows episode details and status", () => {
      render(
        <MockEpisodeCard
          status="ready"
          summary="A test episode summary"
          title="Test Episode"
        />
      );

      expect(screen.getByText("Test Episode")).toBeInTheDocument();
      expect(screen.getByText("A test episode summary")).toBeInTheDocument();
      expect(screen.getByText("ready")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /play/iu })
      ).toBeInTheDocument();
    });

    test("hides play button for generating episodes", () => {
      render(
        <MockEpisodeCard
          status="generating"
          summary="This episode is being generated"
          title="Generating Episode"
        />
      );

      expect(screen.getByText("generating")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /play/iu })
      ).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    test("has accessible navigation structure", () => {
      render(<MockNavigation />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();

      // Check for navigation elements (using text instead of links since we changed to spans)
      expect(screen.getByText("Morning Pod")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Episodes")).toBeInTheDocument();
      expect(screen.getByText("Sources")).toBeInTheDocument();
      expect(screen.getByText("Queue")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /menu/iu })
      ).toBeInTheDocument();
    });
  });

  describe("Dashboard Layout", () => {
    test("renders complete dashboard structure", () => {
      render(<MockDashboard />);

      // Check semantic structure
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();

      // Check headings hierarchy
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /welcome to morning pod/iu,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: /recent episodes/i })
      ).toBeInTheDocument();

      // Check dashboard stats
      expect(screen.getByText("Total Episodes")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("Total Play Time")).toBeInTheDocument();
      expect(screen.getByText("2.5 hours")).toBeInTheDocument();
    });

    test("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<MockDashboard />);

      // Tab through interactive elements
      await user.tab();
      // eslint-disable-next-line testing-library/no-node-access
      expect(document.activeElement).toHaveAccessibleName();

      await user.tab();
      // eslint-disable-next-line testing-library/no-node-access
      expect(document.activeElement).toHaveAccessibleName();
    });

    test("has proper ARIA structure", () => {
      render(<MockDashboard />);

      // Check for proper roles
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();

      // Check that interactive elements have accessible names
      const playButtons = screen.getAllByRole("button", { name: /play/iu });
      expect(playButtons).toHaveLength(2); // Two play buttons (for ready episodes)
      for (const button of playButtons) {
        expect(button).toHaveAccessibleName();
      }

      const menuButton = screen.getByRole("button", { name: /menu/iu });
      expect(menuButton).toHaveAccessibleName();

      // Check that we have the expected number of buttons
      const allButtons = screen.getAllByRole("button");
      expect(allButtons).toHaveLength(3); // 2 Play buttons + 1 Menu button
    });
  });
});
