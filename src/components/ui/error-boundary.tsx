"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";

interface ErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback && this.state.error) {
        return (
          <Fallback error={this.state.error} resetError={this.resetError} />
        );
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }

  resetError = () => {
    this.setState({ error: undefined, hasError: false });
  };
}

// Default fallback component
function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) {
  return (
    <div className="bg-base-100 border-error/20 flex min-h-[200px] flex-col items-center justify-center rounded-lg border p-6">
      <div className="mb-4 flex items-center gap-3">
        <AlertTriangle className="text-error h-8 w-8" />
        <h3 className="text-base-content text-lg font-semibold">
          Something went wrong
        </h3>
      </div>

      <p className="text-base-content/70 mb-6 max-w-md text-center text-sm">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>

      <button className="btn btn-primary btn-sm gap-2" onClick={resetError}>
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>

      {process.env.NODE_ENV === "development" && error && (
        <details className="bg-base-200 mt-6 max-w-full overflow-auto rounded-lg p-4 text-xs">
          <summary className="text-base-content/80 mb-2 cursor-pointer font-medium">
            Error Details (Development)
          </summary>
          <pre className="text-base-content/60 break-words whitespace-pre-wrap">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

// Hook for using error boundary programmatically
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

export default ErrorBoundary;
