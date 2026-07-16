import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMovie } from "@/services/movies";
import { useAuth } from "@/contexts/AuthContext";
import { toggleWatchlist, toggleFavorite, rateMedia } from "@/services/users";
import { setMovieAdminOverride } from "@/services/admin";
import { formatCurrency, formatRuntime, formatDate, formatNumber } from "@/lib/utils";
import { posterUrl, backdropUrl, profileUrl, IMAGE_BASE_URL } from "@/lib/supabase";
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
  Award, ChevronRight, ExternalLink, Plus, MessageCircle, Check, Image as ImageIcon
} from "lucide-react";

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [imageFilter, setImageFilter] = useState<"all" | "poster" | "backdrop" | "logo">("all");
  const [crewTab, setCrewTab] = useState<"info" | "cast" | "crew" | "production">("info");

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

  const overrideMutation = useMutation({
    mutationFn: (overrides: Record<string, string | null>) => setMovieAdminOverride(id!, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie", id] });
    },
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
  const crew = movie.crew?.filter((c) => c.department && c.department !== "Acting");
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-96 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="shrink-0 w-36 md:w-48 lg:w-56 mx-auto md:mx-0"
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
                    <Link to={`/person/${director.person?.id || ""}`} className="text-sm text-text font-medium mt-0.5 hover:text-primary transition-colors">{director.name}</Link>
                  </div>
                )}
                {writers && writers.length > 0 && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider">Writers</p>
                    <p className="text-sm text-text font-medium mt-0.5">
                      {writers.map((w, i) => (
                        <span key={w.id || i}>
                          {i > 0 && ", "}
                          <Link to={`/person/${w.person?.id || ""}`} className="hover:text-primary transition-colors">{w.name}</Link>
                        </span>
                      ))}
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
          </div>
        </div>

        {/* Info / Cast / Crew / Production Tabs */}
        <section className="mt-12">
          <div className="flex gap-1 mb-6 border-b border-border">
            {(["info", "cast", "crew", "production"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCrewTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  crewTab === tab
                    ? "text-text border-primary"
                    : "text-text-muted border-transparent hover:text-text"
                }`}
              >
                {tab === "cast" && cast?.length ? `${tab} (${cast.length})` : tab === "crew" && crew?.length ? `${tab} (${crew.length})` : tab === "production" && movie.production_companies?.length ? `${tab} (${movie.production_companies.length})` : tab}
              </button>
            ))}
          </div>

          {/* Info Tab */}
          {crewTab === "info" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Rating</p>
                <RatingBadge rating={movie.vote_average} size="md" />
              </div>
              {movie.original_title && movie.original_title !== movie.title && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Original Title</p>
                  <p className="text-sm text-text font-medium">{movie.original_title}</p>
                </div>
              )}
              {genres.length > 0 && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <Badge key={g.id || g.name}>{g.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {movie.runtime && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Runtime</p>
                  <p className="text-sm text-text font-medium">{formatRuntime(movie.runtime)}</p>
                </div>
              )}
              {movie.release_date && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Release Date</p>
                  <p className="text-sm text-text font-medium">{formatDate(movie.release_date)}</p>
                </div>
              )}
              {movie.original_language && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Language</p>
                  <p className="text-sm text-text font-medium">{movie.original_language.toUpperCase()}</p>
                </div>
              )}
              {movie.status && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm text-text font-medium">{movie.status}</p>
                </div>
              )}
              {movie.budget && movie.budget > 0 && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-sm text-text font-medium">{formatCurrency(movie.budget)}</p>
                </div>
              )}
              {movie.revenue && movie.revenue > 0 && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Revenue</p>
                  <p className="text-sm text-text font-medium">{formatCurrency(movie.revenue)}</p>
                </div>
              )}
              {movie.production_countries && movie.production_countries.length > 0 && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Countries</p>
                  <p className="text-sm text-text font-medium">{movie.production_countries.map((c) => c.name).join(", ")}</p>
                </div>
              )}
              {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Spoken Languages</p>
                  <p className="text-sm text-text font-medium">{movie.spoken_languages.map((l) => l.name).join(", ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Cast Tab */}
          {crewTab === "cast" && cast && cast.length > 0 && (
            <div className="space-y-2">
              {cast.map((member) => (
                <Link key={member.id || member.name + member.character} to={`/person/${member.person?.id || ""}`} className="relative block p-3 pr-24 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors overflow-hidden">
                  <p className="text-sm font-medium text-text line-clamp-1">{member.name}</p>
                  <p className="text-xs text-text-muted line-clamp-1">{member.character}</p>
                  <div className="absolute right-0 bottom-0 w-16 h-20 rounded-tl-lg overflow-hidden border-l border-t border-border opacity-50">
                    <ImageWithLoader src={profileUrl(member.person?.card_image_path || member.profile_path, "small")} alt="" className="w-full h-full object-cover" fallback="/placeholder-profile.svg" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Crew Tab */}
          {crewTab === "crew" && crew && crew.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(() => {
                const grouped = new Map<string, { member: typeof crew[0]; jobs: string[] }>();
                for (const m of crew) {
                  const key = m.person?.id || m.name;
                  const existing = grouped.get(key);
                  if (existing) {
                    if (m.job && !existing.jobs.includes(m.job)) existing.jobs.push(m.job);
                  } else {
                    grouped.set(key, { member: m, jobs: m.job ? [m.job] : [] });
                  }
                }
                return Array.from(grouped.values()).map(({ member, jobs }) => (
                  <Link key={member.id || member.name} to={`/person/${member.person?.id || ""}`} className="relative block p-3 pr-20 pb-20 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors overflow-hidden">
                    <p className="text-sm font-medium text-text line-clamp-1">{member.name}</p>
                    <p className="text-xs text-text-muted line-clamp-1">{jobs.join(", ")}</p>
                    <div className="absolute right-0 bottom-0 w-14 h-16 rounded-tl-lg overflow-hidden border-l border-t border-border opacity-50">
                      <ImageWithLoader src={profileUrl(member.person?.card_image_path || member.profile_path, "small")} alt="" className="w-full h-full object-cover" fallback="/placeholder-profile.svg" />
                    </div>
                  </Link>
                ));
              })()}
            </div>
          )}

          {/* Production Tab */}
          {crewTab === "production" && movie.production_companies && movie.production_companies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {movie.production_companies.map((c) => (
                <div key={c.id || c.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  {c.logo_path ? (
                    <img src={profileUrl(c.logo_path, "small")} alt="" className="w-10 h-10 rounded-lg object-contain bg-white/5" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {c.name?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text line-clamp-1">{c.name}</p>
                    {c.origin_country && <p className="text-xs text-text-muted">{c.origin_country}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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

        {/* Images Gallery */}
        {movie.images && movie.images.length > 0 && (
          <section className="mt-12 mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text font-[family-name:var(--font-display)]">Images</h2>
              {user?.id && (
                <div className="flex gap-1.5">
                  {(["all", "poster", "backdrop", "logo"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setImageFilter(t)}
                      className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                        imageFilter === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-text-muted hover:text-text"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {movie.images
                .filter((img) => imageFilter === "all" || (img as unknown as { image_type?: string }).image_type === imageFilter)
                .map((img, i) => {
                  const imgType = (img as unknown as { image_type?: string }).image_type;
                  const isAdmin = user?.id;
                  return (
                    <div
                      key={`${img.file_path}-${i}`}
                      className="group relative rounded-lg overflow-hidden bg-surface border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="aspect-video">
                        <img
                          src={`${IMAGE_BASE_URL}/w500${img.file_path}`}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="text-[10px] bg-black/60 backdrop-blur-sm">
                          {imgType || "unknown"}
                        </Badge>
                      </div>
                      {isAdmin && (
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                          {imgType !== "logo" && (
                            <button
                              onClick={() => {
                                const key = imgType === "backdrop" ? "backdrop_path" : "poster_path";
                                overrideMutation.mutate({ [key]: img.file_path });
                              }}
                              className="flex-1 text-[10px] font-medium px-2 py-1 rounded bg-primary/90 text-primary-foreground hover:bg-primary transition-colors"
                            >
                              Set {imgType === "backdrop" ? "Backdrop" : "Poster"}
                            </button>
                          )}
                          {imgType === "logo" && (
                            <button
                              onClick={() => overrideMutation.mutate({ logo_path: img.file_path })}
                              className="flex-1 text-[10px] font-medium px-2 py-1 rounded bg-primary/90 text-primary-foreground hover:bg-primary transition-colors"
                            >
                              Set Logo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
