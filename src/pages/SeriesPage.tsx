import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSeries } from "@/services/series";
import { SeriesCard } from "@/components/series/SeriesCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaFilters } from "@/types/database";

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "vote_average", label: "Rating" },
  { value: "first_air_date", label: "Release Date" },
  { value: "name", label: "Name" },
];

const STATUS_OPTIONS = [
  { value: "Returning Series", label: "Returning Series" },
  { value: "Ended", label: "Ended" },
  { value: "Canceled", label: "Canceled" },
  { value: "In Production", label: "In Production" },
  { value: "Planned", label: "Planned" },
];

export function SeriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentFilters: MediaFilters = {
    sort_by: (searchParams.get("sort") as string) || "popularity",
    sort_order: "desc",
    status: (searchParams.get("status") as string) || undefined,
    language: (searchParams.get("lang") as string) || undefined,
    rating_min: searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : undefined,
    year: (searchParams.get("year") as string) || undefined,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["series-browse", currentFilters],
    queryFn: ({ pageParam = 1 }) => getSeries({ ...currentFilters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.length === 20 ? allPages.length + 1 : undefined;
    },
  });

  const allSeries = data?.pages.flatMap((page) => page.data) || [];
  const filteredSeries = searchQuery
    ? allSeries.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allSeries;

  const lastElementRef = useInfiniteScroll(() => fetchNextPage(), !!hasNextPage);

  const updateFilter = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)]">Series</h1>
            <p className="text-sm text-text-muted mt-1">Explore {data?.pages[0]?.count.toLocaleString() || "0"} TV series</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Search series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button variant={filtersOpen ? "primary" : "outline"} onClick={() => setFiltersOpen(!filtersOpen)}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter("sort", opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                currentFilters.sort_by === opt.value
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:text-text border border-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-bg-card border border-border rounded-xl p-4 md:p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Status</label>
                    <select
                      value={searchParams.get("status") || ""}
                      onChange={(e) => updateFilter("status", e.target.value)}
                      className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text appearance-none"
                    >
                      <option value="">All</option>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Language</label>
                    <select
                      value={searchParams.get("lang") || ""}
                      onChange={(e) => updateFilter("lang", e.target.value)}
                      className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text appearance-none"
                    >
                      <option value="">All</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Year</label>
                    <input
                      type="number"
                      placeholder="e.g. 2024"
                      value={searchParams.get("year") || ""}
                      onChange={(e) => updateFilter("year", e.target.value)}
                      className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text placeholder:text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Min Rating</label>
                    <input
                      type="number"
                      placeholder="0-10"
                      min="0"
                      max="10"
                      step="0.5"
                      value={searchParams.get("min_rating") || ""}
                      onChange={(e) => updateFilter("min_rating", e.target.value)}
                      className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-sm text-text placeholder:text-text-muted"
                    />
                  </div>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-4 flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors">
                    <X className="w-3 h-3" /> Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] animate-shimmer rounded-xl" />
                <div className="h-4 w-3/4 animate-shimmer rounded" />
                <div className="h-3 w-1/2 animate-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted">No series found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {filteredSeries.map((series, i) => (
                <div
                  key={`${series.id}-${i}`}
                  ref={i === filteredSeries.length - 1 ? lastElementRef : undefined}
                >
                  <SeriesCard
                    id={series.id}
                    name={series.name}
                    posterPath={series.poster_path}
                    firstAirDate={series.first_air_date}
                    rating={series.vote_average}
                  />
                </div>
              ))}
            </div>
            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
