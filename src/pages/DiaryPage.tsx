import { useQuery } from "@tanstack/react-query";
import { getDiary } from "@/services/users";
import { formatDate } from "@/lib/utils";
import { posterUrl } from "@/lib/supabase";
import { RatingBadge } from "@/components/shared/StarRating";
import { EmptyState } from "@/components/shared/LoadingSpinner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export function DiaryPage() {
  const { data: diary, isLoading } = useQuery({
    queryKey: ["diary"],
    queryFn: () => getDiary(),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-8">Diary</h1>
        {diary && diary.length > 0 ? (
          <div className="space-y-4">
            {diary.map((entry) => (
              <div key={entry.id} className="bg-bg-card border border-border rounded-xl p-4 flex gap-4">
                {entry.movie && (
                  <Link to={`/movie/${entry.movie.id}`} className="shrink-0">
                    <img src={posterUrl(entry.movie.poster_path, "small")} alt="" className="w-16 h-24 rounded-lg object-cover" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link to={entry.movie ? `/movie/${entry.movie.id}` : `/series/${entry.series?.id}`} className="text-sm font-medium text-text hover:text-primary">
                      {entry.movie?.title || entry.series?.name}
                    </Link>
                    {entry.rating && <RatingBadge rating={entry.rating} />}
                  </div>
                  <p className="text-xs text-text-muted mt-1">Watched on {formatDate(entry.watched_date)}</p>
                  {entry.review && <p className="text-sm text-text-secondary mt-2">{entry.review}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Your diary is empty" description="Start logging movies and series you've watched." icon={<BookOpen className="w-12 h-12" />} />
        )}
      </div>
    </div>
  );
}
