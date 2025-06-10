import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Card Components
 *
 * @business-context Structured content containers throughout the application
 *                   for displaying episodes, monitoring data, and feature information
 */

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={cn(
        "card bg-base-100 shadow-sm border border-base-300 rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "card-header px-6 py-4 border-b border-base-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "card-title text-lg font-semibold text-base-content",
        className
      )}
    >
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={cn("card-body px-6 py-4", className)}>{children}</div>;
}
