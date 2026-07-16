import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { globalSearch } from "@/services/search";
import { MovieCard } from "@/components/movie/MovieCard";
import { SeriesCard } from "@/components/series/SeriesCard";
import { PersonCard } from "@/components/person/PersonCard";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Search } from "lucide-react";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<{ movies: { id: string; title: string; poster_path: string | null; release_date: string | null; vote_average: number }[]; series: { id: string; name: string; poster_path: string | null; first_air_date: string | null; vote_average: number }[]; people: { id: string; name: string; profile_path: string | null }[] }>({ movies: [], series: [], people: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setLoading(true);
      globalSearch(q).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }
  }, [searchParams.get("q")]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-center mb-8">Search</h1>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, series, people, collections..."
                icon={<Search className="w-5 h-5" />}
                className="h-12 text-base"
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : results.movies.length === 0 && results.series.length === 0 && results.people.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted">{searchParams.get("q") ? "No results found" : "Start typing to search"}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {results.movies.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text mb-4">Movies ({results.movies.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {results.movies.map((m) => (
                    <MovieCard key={m.id} id={m.id} title={m.title} posterPath={m.poster_path} releaseDate={m.release_date} rating={m.vote_average} />
                  ))}
                </div>
              </section>
            )}
            {results.series.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text mb-4">Series ({results.series.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {results.series.map((s) => (
                    <SeriesCard key={s.id} id={s.id} name={s.name} posterPath={s.poster_path} firstAirDate={s.first_air_date} rating={s.vote_average} />
                  ))}
                </div>
              </section>
            )}
            {results.people.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text mb-4">People ({results.people.length})</h2>
                <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
                  {results.people.map((p) => (
                    <PersonCard key={p.id} id={p.id} name={p.name} profilePath={p.profile_path} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
