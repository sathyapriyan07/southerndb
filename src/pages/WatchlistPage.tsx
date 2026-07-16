import { useQuery } from "@tanstack/react-query";
import { getWatchlist } from "@/services/users";
import { MovieCard } from "@/components/movie/MovieCard";
import { SeriesCard } from "@/components/series/SeriesCard";
import { EmptyState } from "@/components/shared/LoadingSpinner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Bookmark } from "lucide-react";

export function WatchlistPage() {
  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlist,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-8">Watchlist</h1>
        {watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {watchlist.map((item) => (
              <div key={item.id}>
                {item.movie ? (
                  <MovieCard id={item.movie.id} title={item.movie.title} posterPath={item.movie.poster_path} releaseDate={item.movie.release_date} rating={item.movie.vote_average} />
                ) : item.series ? (
                  <SeriesCard id={item.series.id} name={item.series.name} posterPath={item.series.poster_path} firstAirDate={item.series.first_air_date} rating={item.series.vote_average} />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your watchlist is empty"
            description="Add movies and series to your watchlist to keep track of what you want to watch."
            icon={<Bookmark className="w-12 h-12" />}
          />
        )}
      </div>
    </div>
  );
}
