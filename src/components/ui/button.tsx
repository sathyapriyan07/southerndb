import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            "bg-surface hover:bg-surface-hover text-text border border-border": variant === "default",
            "bg-primary hover:bg-primary-hover text-white": variant === "primary",
            "bg-accent hover:bg-accent-hover text-white": variant === "secondary",
            "bg-transparent hover:bg-surface text-text-secondary hover:text-text": variant === "ghost",
            "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20": variant === "danger",
            "bg-transparent border border-border hover:border-border-hover text-text": variant === "outline",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
