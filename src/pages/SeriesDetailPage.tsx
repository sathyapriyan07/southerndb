import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSeriesById } from "@/services/series";
import { formatRuntime, formatDate, formatNumber } from "@/lib/utils";
import { posterUrl, backdropUrl, profileUrl } from "@/lib/supabase";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { RatingBadge } from "@/components/shared/StarRating";
import { MediaCarousel } from "@/components/shared/MediaCarousel";
import { SeriesCard } from "@/components/series/SeriesCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { motion } from "framer-motion";
import { Calendar, Clock, Play, Bookmark, Heart, ChevronDown, ChevronUp } from "lucide-react";

export function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  const { data: series, isLoading, error } = useQuery({
    queryKey: ["series", id],
    queryFn: () => getSeriesById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text mb-2">Series not found</h2>
          <Link to="/series" className="text-primary hover:text-primary-hover">Browse series</Link>
        </div>
      </div>
    );
  }

  const trailer = series.videos?.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const genres = series.genres || [];
  const cast = series.cast?.slice(0, 20) || [];
  const seriesAny = series as unknown as { seasons?: { id: string; season_number: number; name: string; overview: string | null; poster_path: string | null; episode_count: number; air_date: string | null; episodes?: { id: string; episode_number: number; name: string; overview: string | null; still_path: string | null; runtime: number | null; vote_average: number }[] }[]; created_by?: { id: number; name: string }[] };
  const seasons = seriesAny.seasons || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px]">
        <div className="absolute inset-0">
          <ImageWithLoader src={backdropUrl(series.backdrop_path, "large")} alt={series.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 hero-gradient-left" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="shrink-0 w-48 md:w-64 lg:w-72 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden poster-shadow">
              <ImageWithLoader src={posterUrl(series.poster_path, "large")} alt={series.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-display)] text-text leading-tight">{series.name}</h1>
            {series.tagline && <p className="text-base text-text-secondary italic mt-2">"{series.tagline}"</p>}

            <div className="flex items-center flex-wrap gap-2 mt-4">
              <RatingBadge rating={series.vote_average} size="md" />
              <span className="text-sm text-text-muted">{formatNumber(series.vote_count)} votes</span>
              {series.first_air_date && <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />{formatDate(series.first_air_date)}</Badge>}
              <Badge variant="outline">{series.number_of_seasons} Season{series.number_of_seasons !== 1 ? "s" : ""}</Badge>
              {series.status && <Badge>{series.status}</Badge>}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {genres.map((g) => (
                <Link key={g.id || g.name} to={`/genre/${(g.name || "unknown").toLowerCase().replace(/ /g, "-")}`}>
                  <Badge>{g.name}</Badge>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Button variant="primary" size="lg"><Bookmark className="w-5 h-5" />Watchlist</Button>
              <Button variant="outline" size="lg"><Heart className="w-5 h-5" />Favorite</Button>
              {trailer && (
                <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="lg"><Play className="w-5 h-5" />Trailer</Button>
                </a>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-text mb-2">Overview</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{series.overview || "No overview available."}</p>
            </div>

            {(seriesAny.created_by && seriesAny.created_by.length > 0) && (
              <div className="mt-4">
                <p className="text-xs text-text-muted uppercase tracking-wider">Created by</p>
                <p className="text-sm text-text font-medium">
                  {seriesAny.created_by.map((c) => c.name).join(", ")}
                </p>
              </div>
            )}
          </motion.div>

          <div className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-text">Details</h3>
              {series.status && <div><p className="text-xs text-text-muted">Status</p><p className="text-sm text-text">{series.status}</p></div>}
              {series.original_language && <div><p className="text-xs text-text-muted">Language</p><p className="text-sm text-text">{series.original_language.toUpperCase()}</p></div>}
              <div><p className="text-xs text-text-muted">Episodes</p><p className="text-sm text-text">{series.number_of_episodes}</p></div>
            </div>

            {series.networks && (series.networks as unknown as { id: number; name: string; logo_path: string | null }[]).length > 0 && (
              <div className="bg-bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-bold text-text mb-3">Network</h3>
                {(series.networks as unknown as { id: number; name: string; logo_path: string | null }[]).map((n) => (
                  <div key={n.id} className="flex items-center gap-2">
                    {n.logo_path && <img src={profileUrl(n.logo_path, "small")} alt="" className="w-6 h-6 rounded" />}
                    <span className="text-sm text-text">{n.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Seasons */}
        {seasons && seasons.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-text font-[family-name:var(--font-display)] mb-4">Seasons</h2>
            <div className="space-y-3">
              {seasons.filter((s) => s.season_number > 0).map((season) => (
                <div key={season.id} className="bg-bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSeason(expandedSeason === season.season_number ? null : season.season_number)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-surface-hover transition-colors text-left"
                  >
                    {season.poster_path && (
                      <img src={posterUrl(season.poster_path, "small")} alt="" className="w-16 h-24 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text">{season.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {season.episode_count} episodes{season.air_date ? ` • ${formatDate(season.air_date)}` : ""}
                      </p>
                    </div>
                    {expandedSeason === season.season_number ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                  </button>

                  {expandedSeason === season.season_number && season.episodes && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      className="border-t border-border"
                    >
                      {season.episodes.map((ep) => (
                        <div key={ep.id} className="flex items-start gap-4 p-4 border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                          {ep.still_path && (
                            <img src={posterUrl(ep.still_path, "small")} alt="" className="w-32 h-20 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-text-muted">E{ep.episode_number}</span>
                              <h4 className="text-sm font-medium text-text">{ep.name}</h4>
                              {ep.vote_average > 0 && <RatingBadge rating={ep.vote_average} size="sm" />}
                            </div>
                            {ep.overview && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{ep.overview}</p>}
                            {ep.runtime && <p className="text-xs text-text-muted mt-1">{formatRuntime(ep.runtime)}</p>}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-text font-[family-name:var(--font-display)] mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
              {cast.map((member) => (
                <Link key={member.id || member.name + member.character} to={`/person/${member.id}`} className="shrink-0 w-28 text-center group">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                    <ImageWithLoader src={profileUrl(member.profile_path, "small")} alt={member.name} className="w-full h-full object-cover" fallback="/placeholder-profile.svg" />
                  </div>
                  <p className="text-xs font-medium text-text mt-2 line-clamp-1">{member.name}</p>
                  <p className="text-[10px] text-text-muted line-clamp-1">{member.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {series.recommendations && series.recommendations.length > 0 && (
          <div className="mt-12">
            <MediaCarousel title="Recommended" viewAllLink="/series">
              <div className="flex gap-3 md:gap-4">
                {series.recommendations.map((s) => (
                  <div key={s.id} className="w-36 md:w-44 shrink-0">
                    <SeriesCard id={s.id} name={s.name} posterPath={s.poster_path} firstAirDate={s.first_air_date} rating={s.vote_average} />
                  </div>
                ))}
              </div>
            </MediaCarousel>
          </div>
        )}
      </div>
    </div>
  );
}


