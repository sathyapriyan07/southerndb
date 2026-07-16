import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-shimmer rounded-md", className)} />
  );
}

export function PosterSkeleton({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("aspect-[2/3] rounded-xl", className)} />
  );
}

export function BackdropSkeleton({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("aspect-[16/9] rounded-xl", className)} />
  );
}

export function ProfileSkeleton({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("aspect-[2/3] rounded-full", className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <PosterSkeleton />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
