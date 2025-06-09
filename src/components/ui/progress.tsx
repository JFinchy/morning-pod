import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface ProgressProps {
  className?: string;
  max?: number;
  value: number;
  variant?:
    | "accent"
    | "error"
    | "info"
    | "neutral"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
}

const Progress = forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, max = 100, value, variant, ...props }, ref) => {
    return (
      <progress
        className={cn("progress", variant && `progress-${variant}`, className)}
        max={max}
        ref={ref}
        value={value}
        {...props}
      />
    );
  }
);

Progress.displayName = "Progress";

export { Progress, type ProgressProps };
