import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { vi, expect } from "vitest";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  theme?: string;
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
  { theme = "forest", ...renderOptions }: CustomRenderOptions = {}
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
  clickButton: async (user: unknown, buttonText: string) => {
    const userObj = user as {
      findByRole: (role: string, options: unknown) => Promise<unknown>;
      click: (element: unknown) => Promise<void>;
    };
    const button = await userObj.findByRole("button", {
      name: new RegExp(buttonText, "i"),
    });
    await userObj.click(button);
    return button;
  },

  openModal: async (user: unknown, triggerText: string) => {
    const userObj = user as {
      click: (element: unknown) => Promise<void>;
      findByText: (regex: RegExp) => Promise<unknown>;
      findByRole: (role: string) => Promise<unknown>;
    };
    await userObj.click(await userObj.findByText(new RegExp(triggerText, "i")));
    return await userObj.findByRole("dialog");
  },

  closeModal: async (user: unknown) => {
    const userObj = user as {
      findByRole: (role: string, options: unknown) => Promise<unknown>;
      click: (element: unknown) => Promise<void>;
    };
    const closeButton = await userObj.findByRole("button", { name: /close/i });
    await userObj.click(closeButton);
  },

  selectOption: async (
    user: unknown,
    selectLabel: string,
    optionText: string
  ) => {
    const userObj = user as {
      findByLabelText: (regex: RegExp) => Promise<unknown>;
      click: (element: unknown) => Promise<void>;
      findByText: (regex: RegExp) => Promise<unknown>;
    };
    const select = await userObj.findByLabelText(new RegExp(selectLabel, "i"));
    await userObj.click(select);
    const option = await userObj.findByText(new RegExp(optionText, "i"));
    await userObj.click(option);
  },
});

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

// Export our custom render as the default
export { customRender as render };
