import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Badge Component
 *
 * @business-context Status indicators and labels throughout the application
 *                   for showing deployment status, test results, and feature flags
 */

interface BadgeProps {
  children: ReactNode;
  className?: string;
  size?: "lg" | "md" | "sm";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "success"
    | "warning";
}

const badgeVariants = {
  default: "bg-primary text-primary-content",
  destructive: "bg-error text-error-content",
  outline: "border border-base-300 text-base-content bg-transparent",
  secondary: "bg-secondary text-secondary-content",
  success: "bg-success text-success-content",
  warning: "bg-warning text-warning-content",
};

const badgeSizes = {
  lg: "px-4 py-1.5 text-base",
  md: "px-3 py-1 text-sm",
  sm: "px-2 py-0.5 text-xs",
};

export function Badge({
  children,
  className = "",
  size = "sm",
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
