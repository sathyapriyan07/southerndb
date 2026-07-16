import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GenrePillProps {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  className?: string;
}

export function GenrePill({ id, name, slug, isActive, className }: GenrePillProps) {
  return (
    <Link
      to={`/genre/${slug}`}
      className={cn(
        "inline-flex items-center h-8 px-4 rounded-full text-sm font-medium transition-all duration-200 border",
        isActive
          ? "bg-primary text-white border-primary"
          : "bg-surface text-text-secondary border-border hover:border-border-hover hover:text-text",
        className
      )}
    >
      {name}
    </Link>
  );
}
