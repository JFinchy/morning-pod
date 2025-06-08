import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Badge Component
 *
 * @business-context Status indicators and labels throughout the application
 *                   for showing deployment status, test results, and feature flags
 */

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const badgeVariants = {
  default: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  success: "bg-success text-success-content",
  warning: "bg-warning text-warning-content",
  destructive: "bg-error text-error-content",
  outline: "border border-base-300 text-base-content bg-transparent",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
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
