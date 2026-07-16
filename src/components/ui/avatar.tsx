import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn(
          "rounded-full object-cover border-2 border-border",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-accent/20 text-accent font-semibold border-2 border-border",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
