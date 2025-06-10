import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders welcome message", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", {
      name: /welcome to {{projectName}}/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it("renders feature cards", () => {
    render(<HomePage />);

    const nextjsFeature = screen.getByText("Next.js 15");
    const typescriptFeature = screen.getByText("TypeScript");

    expect(nextjsFeature).toBeInTheDocument();
    expect(typescriptFeature).toBeInTheDocument();
  });
});
