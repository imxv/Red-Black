import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = 
      variant === "default"
        ? "bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-500"
        : variant === "outline"
        ? "border border-border/40 bg-transparent hover:bg-white/[0.08] focus-visible:ring-sky-500"
        : "hover:bg-white/[0.08] focus-visible:ring-sky-500";
    
    const sizeClasses =
      size === "default"
        ? "h-10 px-4 py-2 text-sm"
        : size === "sm"
        ? "h-9 px-3 text-sm"
        : "h-11 px-8 text-base";

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses,
          sizeClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
