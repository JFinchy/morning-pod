import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  selectSize?: "lg" | "md" | "sm" | "xl" | "xs";
  selectStyle?: "ghost";
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

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { children, className, selectSize = "md", selectStyle, variant, ...props },
    ref
  ) => {
    return (
      <select
        className={cn(
          "select select-bordered w-full",
          variant && `select-${variant}`,
          selectStyle && `select-${selectStyle}`,
          selectSize && `select-${selectSize}`,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select, type SelectProps };
