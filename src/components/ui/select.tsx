import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  selectStyle?: "ghost";
  selectSize?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, variant, selectStyle, selectSize = "md", children, ...props },
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
