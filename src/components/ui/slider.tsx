import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  sliderSize?: "lg" | "md" | "sm" | "xl" | "xs";
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

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, max = 100, min = 0, sliderSize = "md", variant, ...props },
    ref
  ) => {
    return (
      <input
        className={cn(
          "range",
          variant && `range-${variant}`,
          sliderSize && `range-${sliderSize}`,
          className
        )}
        max={max}
        min={min}
        ref={ref}
        type="range"
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";

export { Slider, type SliderProps };
