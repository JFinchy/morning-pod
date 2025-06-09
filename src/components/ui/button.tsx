import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  btnStyle?: "dash" | "ghost" | "link" | "outline" | "soft";
  loading?: boolean;
  shape?: "block" | "circle" | "square" | "wide";
  size?: "lg" | "md" | "sm" | "xl" | "xs";
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      btnStyle,
      children,
      className,
      disabled,
      loading = false,
      shape,
      size = "md",
      variant,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          "btn",
          variant && `btn-${variant}`,
          btnStyle && `btn-${btnStyle}`,
          size && `btn-${size}`,
          shape && `btn-${shape}`,
          loading && "btn-disabled",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
