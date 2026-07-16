import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPerson } from "@/services/people";
import { formatDate } from "@/lib/utils";
import { profileUrl, posterUrl } from "@/lib/supabase";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { MovieCard } from "@/components/movie/MovieCard";
import { SeriesCard } from "@/components/series/SeriesCard";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { motion } from "framer-motion";
import { ExternalLink, MapPin, Calendar } from "lucide-react";

export function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: person, isLoading, error } = useQuery({
    queryKey: ["person", id],
    queryFn: () => getPerson(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error || !person) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-xl font-bold text-text">Person not found</h2></div></div>;

  const movieCredits = (person.movie_credits || []) as { movie?: { id: string; title: string; poster_path: string | null; release_date: string | null; vote_average: number }; character?: string; job?: string; release_date?: string }[];
  const tvCredits = (person.tv_credits || []) as { series?: { id: string; name: string; poster_path: string | null; first_air_date: string | null; vote_average: number }; character?: string; job?: string }[];

  const actingCredits = [
    ...movieCredits.filter((c) => c.character).map((c) => ({ ...c, type: "movie" as const, title: c.movie?.title || "", id: c.movie?.id || "", poster: c.movie?.poster_path || null, date: c.release_date || c.movie?.release_date || null, rating: c.movie?.vote_average || 0, character: c.character || "" })),
    ...tvCredits.filter((c) => c.character).map((c) => ({ ...c, type: "series" as const, title: c.series?.name || "", id: c.series?.id || "", poster: c.series?.poster_path || null, date: c.series?.first_air_date || null, rating: c.series?.vote_average || 0, character: c.character || "" })),
  ].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const deathDate = person.deathday ? new Date(person.deathday) : null;
  const birthDate = person.birthday ? new Date(person.birthday) : null;
  const age = birthDate ? (deathDate || new Date()).getFullYear() - birthDate.getFullYear() : null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden poster-shadow">
              <ImageWithLoader src={profileUrl(person.profile_path, "large")} alt={person.name} className="w-full h-full object-cover" fallback="/placeholder-profile.svg" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-display)] text-text">{person.name}</h1>

            <div className="flex items-center flex-wrap gap-3 mt-3">
              <Badge>{person.known_for_department}</Badge>
              {person.birthday && <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />{formatDate(person.birthday)}{age ? ` (${age})` : ""}</Badge>}
              {person.deathday && <Badge variant="outline">Died {formatDate(person.deathday)}</Badge>}
              {person.place_of_birth && <Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />{person.place_of_birth}</Badge>}
            </div>

            {person.also_known_as && person.also_known_as.length > 0 && (
              <p className="text-xs text-text-muted mt-2">Also known as: {person.also_known_as.slice(0, 5).join(", ")}</p>
            )}

            {person.biography && (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-text mb-2">Biography</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Known For - Acting Credits */}
        {actingCredits.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-text font-[family-name:var(--font-display)] mb-4">Known For</h2>
            <div className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-4">
              {actingCredits.filter((c) => c.poster).slice(0, 15).map((credit) => (
                <div key={`${credit.type}-${credit.id}`} className="w-36 md:w-44 shrink-0">
                  {credit.type === "movie" ? (
                    <MovieCard id={credit.id} title={credit.title} posterPath={credit.poster || null} releaseDate={credit.date || null} rating={credit.rating} />
                  ) : (
                    <SeriesCard id={credit.id} name={credit.title} posterPath={credit.poster || null} firstAirDate={credit.date || null} rating={credit.rating} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full Filmography */}
        {actingCredits.length > 0 && (
          <section className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-text font-[family-name:var(--font-display)] mb-4">Filmography</h2>
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
              {actingCredits.slice(0, 30).map((credit, i) => (
                <div key={`${credit.type}-${credit.id}-${i}`} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                  <div className="w-10 h-14 rounded overflow-hidden shrink-0">
                    <ImageWithLoader src={posterUrl(credit.poster, "small")} alt="" className="w-full h-full object-cover" />
                  </div>
                  <Link to={`/${credit.type}/${credit.id}`} className="text-sm font-medium text-text hover:text-primary transition-colors min-w-0 truncate">
                    {credit.title}
                  </Link>
                  {credit.character && <span className="text-xs text-text-muted shrink-0">as {credit.character}</span>}
                  {credit.date && <span className="text-xs text-text-muted ml-auto shrink-0">{credit.date.slice(0, 4)}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
