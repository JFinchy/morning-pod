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
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-base-100 rounded-lg border border-error/20">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-8 h-8 text-error" />
        <h3 className="text-lg font-semibold text-base-content">
          Something went wrong
        </h3>
      </div>

      <p className="text-sm text-base-content/70 text-center mb-6 max-w-md">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>

      <button className="btn btn-primary btn-sm gap-2" onClick={resetError}>
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>

      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-6 p-4 bg-base-200 rounded-lg text-xs max-w-full overflow-auto">
          <summary className="cursor-pointer font-medium text-base-content/80 mb-2">
            Error Details (Development)
          </summary>
          <pre className="whitespace-pre-wrap break-words text-base-content/60">
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
