import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "gold" | "success" | "danger" | "outline";
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ children, variant = "default", className, size = "sm" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md whitespace-nowrap",
        {
          "bg-surface text-text-secondary border border-border": variant === "default",
          "bg-primary/15 text-primary": variant === "primary",
          "bg-gold/15 text-gold": variant === "gold",
          "bg-success/15 text-success": variant === "success",
          "bg-danger/15 text-danger": variant === "danger",
          "bg-transparent text-text-secondary border border-border": variant === "outline",
        },
        {
          "px-1.5 py-0.5 text-[10px]": size === "sm",
          "px-2.5 py-1 text-xs": size === "md",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
