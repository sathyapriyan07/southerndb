import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMovie } from "@/services/movies";
import { useAuth } from "@/contexts/AuthContext";
import { toggleWatchlist, toggleFavorite, rateMedia } from "@/services/users";
import { formatCurrency, formatRuntime, formatDate, formatNumber } from "@/lib/utils";
import { posterUrl, backdropUrl, profileUrl } from "@/lib/supabase";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { RatingBadge, StarRating } from "@/components/shared/StarRating";
import { MediaCarousel } from "@/components/shared/MediaCarousel";
import { MovieCard } from "@/components/movie/MovieCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { motion } from "framer-motion";
import {
  Play, Bookmark, Heart, Star, Calendar, Clock, Globe, DollarSign, TrendingUp,
  Award, ChevronRight, ExternalLink, Plus, MessageCircle
} from "lucide-react";

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovie(id!),
    enabled: !!id,
  });

  const watchlistMutation = useMutation({
    mutationFn: () => toggleWatchlist(undefined, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movie", id] }),
  });

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(undefined, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movie", id] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text mb-2">Movie not found</h2>
          <Link to="/movies" className="text-primary hover:text-primary-hover">Browse movies</Link>
        </div>
      </div>
    );
  }

  const trailer = movie.videos?.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const director = movie.crew?.find((c) => c.job === "Director");
  const writers = movie.crew?.filter((c) => c.department === "Writing").slice(0, 3);
  const cast = movie.cast?.filter((c) => c.department === "Acting" || !c.department)?.slice(0, 20);
  const genres = movie.genres || [];
  const streamingProviders = movie.streaming_providers || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px]">
        <div className="absolute inset-0">
          <ImageWithLoader
            src={backdropUrl(movie.backdrop_path, "large")}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 hero-gradient-left" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="shrink-0 w-48 md:w-64 lg:w-72 mx-auto md:mx-0"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden poster-shadow">
              <ImageWithLoader
                src={posterUrl(movie.poster_path, "large")}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-display)] text-text leading-tight">
              {movie.title}
            </h1>

            {movie.original_title !== movie.title && (
              <p className="text-sm text-text-muted mt-1">Original title: {movie.original_title}</p>
            )}

            {movie.tagline && (
              <p className="text-base text-text-secondary italic mt-2">"{movie.tagline}"</p>
            )}

            <div className="flex items-center flex-wrap gap-2 mt-4">
              <RatingBadge rating={movie.vote_average} size="md" />
              <span className="text-sm text-text-muted">{formatNumber(movie.vote_count)} votes</span>
              {movie.release_date && (
                <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />{formatDate(movie.release_date)}</Badge>
              )}
              {movie.runtime && (
                <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{formatRuntime(movie.runtime)}</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {genres.map((g) => (
                <Link key={g.id || g.name} to={`/genre/${g.name.toLowerCase().replace(/ /g, "-")}`}>
                  <Badge>{g.name}</Badge>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Button variant="primary" size="lg" onClick={() => user && watchlistMutation.mutate()}>
                <Bookmark className="w-5 h-5" />
                Watchlist
              </Button>
              <Button variant="outline" size="lg" onClick={() => user && favoriteMutation.mutate()}>
                <Heart className="w-5 h-5" />
                Favorite
              </Button>
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="lg">
                    <Play className="w-5 h-5" />
                    Trailer
                  </Button>
                </a>
              )}
            </div>

            {/* Overview */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-text mb-2">Overview</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* Director & Writers */}
            {(director || writers?.length) && (
              <div className="flex gap-8 mt-6">
                {director && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider">Director</p>
                    <p className="text-sm text-text font-medium mt-0.5">{director.name}</p>
                  </div>
                )}
                {writers && writers.length > 0 && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider">Writers</p>
                    <p className="text-sm text-text font-medium mt-0.5">
                      {writers.map((w) => w.name).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-text">Details</h3>
              {movie.status && (
                <div>
                  <p className="text-xs text-text-muted">Status</p>
                  <p className="text-sm text-text">{movie.status}</p>
                </div>
              )}
              {movie.original_language && (
                <div>
                  <p className="text-xs text-text-muted">Language</p>
                  <p className="text-sm text-text">{movie.original_language.toUpperCase()}</p>
                </div>
              )}
              {movie.budget && movie.budget > 0 && (
                <div>
                  <p className="text-xs text-text-muted">Budget</p>
                  <p className="text-sm text-text">{formatCurrency(movie.budget)}</p>
                </div>
              )}
              {movie.revenue && movie.revenue > 0 && (
                <div>
                  <p className="text-xs text-text-muted">Revenue</p>
                  <p className="text-sm text-text">{formatCurrency(movie.revenue)}</p>
                </div>
              )}
            </div>

            {streamingProviders.length > 0 && (
              <div className="bg-bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-bold text-text mb-3">Where to Watch</h3>
                <div className="space-y-2">
                  {streamingProviders.map((p) => (
                    <div key={p.id || p.name} className="flex items-center gap-2">
                      {p.logo_path && (
                        <img src={profileUrl(p.logo_path, "small")} alt="" className="w-6 h-6 rounded" />
                      )}
                      <span className="text-sm text-text">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="bg-bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-bold text-text mb-3">Production</h3>
                <div className="space-y-2">
                  {movie.production_companies.map((c) => (
                    <p key={c.id || c.name} className="text-sm text-text">{c.name}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {cast && cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-text font-[family-name:var(--font-display)] mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
              {cast.map((member) => (
                <Link key={member.id || member.name + member.character} to={`/person/${member.id}`} className="shrink-0 w-28 text-center group">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                    <ImageWithLoader
                      src={profileUrl(member.profile_path, "small")}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      fallback="/placeholder-profile.svg"
                    />
                  </div>
                  <p className="text-xs font-medium text-text mt-2 line-clamp-1">{member.name}</p>
                  <p className="text-[10px] text-text-muted line-clamp-1">{member.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {movie.recommendations && movie.recommendations.length > 0 && (
          <div className="mt-12">
            <MediaCarousel title="Recommended" viewAllLink="/movies">
              <div className="flex gap-3 md:gap-4">
                {movie.recommendations.map((m) => (
                  <div key={m.id} className="w-36 md:w-44 shrink-0">
                    <MovieCard id={m.id} title={m.title} posterPath={m.poster_path} releaseDate={m.release_date} rating={m.vote_average} />
                  </div>
                ))}
              </div>
            </MediaCarousel>
          </div>
        )}

        {/* Keywords */}
        {movie.keywords && movie.keywords.length > 0 && (
          <section className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-text font-[family-name:var(--font-display)] mb-4">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {movie.keywords.slice(0, 20).map((k) => (
                <Badge key={k.id || k.name} variant="outline">{k.name}</Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
