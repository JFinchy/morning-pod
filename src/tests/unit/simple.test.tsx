import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

// Simple test component
function TestComponent() {
  return (
    <div>
      <h1>Test Page</h1>
      <main role="main">
        <p>This is a test component</p>
        <button>Click me</button>
      </main>
    </div>
  );
}

describe("Simple Test", () => {
  test("renders test component", () => {
    render(<TestComponent />);
    expect(screen.getByText("Test Page")).toBeInTheDocument();
  });

  test("has accessible structure", () => {
    render(<TestComponent />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
