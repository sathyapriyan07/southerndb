import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ImageWithLoaderProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  containerClassName?: string;
}

export function ImageWithLoader({ src, alt, className, containerClassName, fallback, ...props }: ImageWithLoaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fallbackSrc = fallback || "/placeholder-poster.svg";

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      <img
        src={error ? fallbackSrc : src || fallbackSrc}
        alt={alt || ""}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        {...props}
      />
    </div>
  );
}
