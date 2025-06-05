import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { vi, expect } from "vitest";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  theme?: string;
  mockTrpcResponses?: Record<string, any>;
}

// Create a test wrapper with providers
const createTestWrapper = (options: {
  theme?: string;
  queryClient: QueryClient;
}) => {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <div data-theme={options.theme || "forest"}>
        <QueryClientProvider client={options.queryClient}>
          {children}
        </QueryClientProvider>
      </div>
    );
  };
};

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  {
    theme = "forest",
    mockTrpcResponses = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // Create a new QueryClient for each test to avoid cache interference
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = createTestWrapper({ theme, queryClient });

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

// Helper to test multiple themes
export const renderWithThemes = (
  ui: ReactElement,
  themes: string[] = ["forest", "dark", "light", "cyberpunk"],
  options: Omit<CustomRenderOptions, "theme"> = {}
) => {
  return themes.map((theme) => ({
    theme,
    result: customRender(ui, { ...options, theme }),
  }));
};

// Helper to wait for loading states to resolve
export const waitForNoLoadingStates = async (container: HTMLElement) => {
  await vi.waitFor(() => {
    const loadingElements = container.querySelectorAll(
      '[data-testid*="loading"], .loading, .skeleton'
    );
    expect(loadingElements).toHaveLength(0);
  });
};

// Helper to simulate user interactions
export const createUserInteractionHelpers = () => ({
  clickButton: async (user: any, buttonText: string) => {
    const button = await user.findByRole("button", {
      name: new RegExp(buttonText, "i"),
    });
    await user.click(button);
    return button;
  },

  openModal: async (user: any, triggerText: string) => {
    await user.click(await user.findByText(new RegExp(triggerText, "i")));
    return await user.findByRole("dialog");
  },

  closeModal: async (user: any) => {
    const closeButton = await user.findByRole("button", { name: /close/i });
    await user.click(closeButton);
  },

  selectOption: async (user: any, selectLabel: string, optionText: string) => {
    const select = await user.findByLabelText(new RegExp(selectLabel, "i"));
    await user.click(select);
    const option = await user.findByText(new RegExp(optionText, "i"));
    await user.click(option);
  },
});

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

// Export our custom render as the default
export { customRender as render };
