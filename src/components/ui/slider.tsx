import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  sliderSize?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, variant, sliderSize = "md", min = 0, max = 100, ...props },
    ref
  ) => {
    return (
      <input
        type="range"
        className={cn(
          "range",
          variant && `range-${variant}`,
          sliderSize && `range-${sliderSize}`,
          className
        )}
        min={min}
        max={max}
        ref={ref}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";

export { Slider, type SliderProps };
