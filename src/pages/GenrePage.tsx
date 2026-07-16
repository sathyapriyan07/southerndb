import { useQuery } from "@tanstack/react-query";
import { getGenreBySlug } from "@/services/genres";
import { getMoviesByGenre } from "@/services/movies";
import { useParams } from "react-router-dom";
import { MovieCard } from "@/components/movie/MovieCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function GenrePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: genre, isLoading: genreLoading } = useQuery({
    queryKey: ["genre", slug],
    queryFn: () => getGenreBySlug(slug!),
    enabled: !!slug,
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["genre-movies", genre?.id],
    queryFn: () => getMoviesByGenre(genre!.id),
    enabled: !!genre?.id,
  });

  if (genreLoading || moviesLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-8">
          {genre?.name || "Genre"}
        </h1>
        {moviesData && moviesData.data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {moviesData.data.map((movie) => (
              <MovieCard key={movie.id} id={movie.id} title={movie.title} posterPath={movie.poster_path} releaseDate={movie.release_date} rating={movie.vote_average} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-center py-16">No movies in this genre yet</p>
        )}
      </div>
    </div>
  );
}
