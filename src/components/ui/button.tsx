import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  btnStyle?: "outline" | "dash" | "soft" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "wide" | "block" | "square" | "circle";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      btnStyle,
      size = "md",
      shape,
      loading = false,
      disabled,
      children,
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
        {loading && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
