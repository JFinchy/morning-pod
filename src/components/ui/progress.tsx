import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
}

const Progress = forwardRef<HTMLProgressElement, ProgressProps>(
  ({ value, max = 100, className, variant, ...props }, ref) => {
    return (
      <progress
        className={cn("progress", variant && `progress-${variant}`, className)}
        value={value}
        max={max}
        ref={ref}
        {...props}
      />
    );
  }
);

Progress.displayName = "Progress";

export { Progress, type ProgressProps };
