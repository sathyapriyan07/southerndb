import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({ rating, maxRating = 5, size = "sm", showValue = false, className }: StarRatingProps) {
  const normalizedRating = (rating / 10) * maxRating;

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < Math.floor(normalizedRating);
        const half = !filled && i < normalizedRating;

        return (
          <div key={i} className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                filled ? "fill-gold text-gold" : half ? "fill-gold/50 text-gold" : "fill-transparent text-text-muted/30"
              )}
            />
          </div>
        );
      })}
      {showValue && (
        <span className={cn("ml-1 font-semibold text-gold", {
          "text-xs": size === "sm",
          "text-sm": size === "md",
          "text-base": size === "lg",
        })}>
          {rating > 0 ? rating.toFixed(1) : "N/A"}
        </span>
      )}
    </div>
  );
}

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingBadge({ rating, size = "sm", className }: RatingBadgeProps) {
  if (!rating || rating === 0) return null;

  let bgColor = "bg-surface text-text-secondary";
  if (rating >= 7) bgColor = "bg-success/20 text-success";
  else if (rating >= 5) bgColor = "bg-gold/20 text-gold";
  else bgColor = "bg-danger/20 text-danger";

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] rounded",
    md: "px-2 py-1 text-xs rounded-md",
    lg: "px-3 py-1.5 text-sm rounded-lg",
  };

  return (
    <div className={cn("inline-flex items-center font-bold", bgColor, sizeClasses[size], className)}>
      {rating.toFixed(1)}
    </div>
  );
}
