import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchTmdbMovies,
  searchTmdbSeries,
  searchTmdbPeople,
  importMovieFromTmdb,
  importSeriesFromTmdb,
  importPersonFromTmdb,
  bulkImportMovies,
  getImportLogs,
  type TmdbSearchResult,
} from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { IMAGE_BASE_URL } from "@/lib/supabase";
import { Search, Film, Tv, User, AlertCircle, CheckCircle, Clock, SkipForward, Download, Upload } from "lucide-react";

type ImportType = "movie" | "series" | "person";

export function AdminImport() {
  const queryClient = useQueryClient();
  const [importType, setImportType] = useState<ImportType>("movie");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [bulkIds, setBulkIds] = useState("");
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importMessage, setImportMessage] = useState("");

  const searchFn = importType === "movie" ? searchTmdbMovies : importType === "series" ? searchTmdbSeries : searchTmdbPeople;

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["tmdb-search", importType, debouncedQuery],
    queryFn: () => searchFn(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["import-logs"],
    queryFn: () => getImportLogs(),
  });

  const importMutation = useMutation({
    mutationFn: async (tmdbId: number) => {
      if (importType === "movie") return importMovieFromTmdb(tmdbId);
      if (importType === "series") return importSeriesFromTmdb(tmdbId);
      return importPersonFromTmdb(tmdbId);
    },
    onMutate: (tmdbId) => {
      setImportingId(tmdbId);
      setImportMessage("");
    },
    onSuccess: (_, tmdbId) => {
      setImportMessage(`Successfully imported TMDB #${tmdbId}`);
      setImportingId(null);
      queryClient.invalidateQueries({ queryKey: ["import-logs"] });
    },
    onError: (error: Error) => {
      setImportMessage(`Import failed: ${error.message}`);
      setImportingId(null);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      const ids = bulkIds.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
      if (ids.length === 0) throw new Error("No valid IDs");
      return bulkImportMovies(ids);
    },
    onSuccess: () => {
      setImportMessage("Bulk import started!");
      setBulkIds("");
      queryClient.invalidateQueries({ queryKey: ["import-logs"] });
    },
    onError: (error: Error) => {
      setImportMessage(`Bulk import failed: ${error.message}`);
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-8">Import Center</h1>

        {/* Type Selector */}
        <div className="flex gap-2 mb-6">
          {(["movie", "series", "person"] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setImportType(type); setSearchQuery(""); setDebouncedQuery(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                importType === type ? "bg-primary text-white" : "bg-surface text-text-secondary border border-border"
              }`}
            >
              {type === "movie" && <Film className="w-4 h-4 inline mr-1" />}
              {type === "series" && <Tv className="w-4 h-4 inline mr-1" />}
              {type === "person" && <User className="w-4 h-4 inline mr-1" />}
              {type}
            </button>
          ))}
        </div>

        {/* TMDb Search */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Search TMDb</h2>
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <Input
              placeholder={`Search for a ${importType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button type="submit" variant="primary" disabled={searchQuery.length < 2}>
              Search
            </Button>
          </form>

          {searchLoading && (
            <div className="py-8">
              <LoadingSpinner />
            </div>
          )}

          {searchResults && searchResults.results.length === 0 && (
            <p className="text-text-muted text-sm py-4">No results found for "{debouncedQuery}"</p>
          )}

          {searchResults && searchResults.results.length > 0 && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {searchResults.results.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  type={importType}
                  isImporting={importingId === item.id}
                  onImport={() => importMutation.mutate(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {importMessage && (
          <div className={`p-4 rounded-lg mb-6 ${importMessage.includes("failed") ? "bg-danger/10 text-danger border border-danger/20" : "bg-success/10 text-success border border-success/20"}`}>
            {importMessage}
          </div>
        )}

        {/* Bulk Import */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Bulk Import by ID</h2>
          <textarea
            placeholder="Enter TMDB IDs separated by commas (e.g. 550, 551, 552)"
            value={bulkIds}
            onChange={(e) => setBulkIds(e.target.value)}
            className="w-full h-20 bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text placeholder:text-text-muted resize-none"
          />
          <Button
            variant="primary"
            className="mt-3"
            onClick={() => bulkMutation.mutate()}
            disabled={bulkMutation.isPending || !bulkIds}
          >
            <Download className="w-4 h-4" />
            {bulkMutation.isPending ? "Importing..." : "Bulk Import"}
          </Button>
        </div>

        {/* Import Logs */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Import Logs</h2>
          {logsLoading ? (
            <LoadingSpinner />
          ) : logs?.data && logs.data.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.data.map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                  {log.status === "success" && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
                  {log.status === "error" && <AlertCircle className="w-4 h-4 text-danger shrink-0" />}
                  {log.status === "pending" && <Clock className="w-4 h-4 text-warning shrink-0" />}
                  {log.status === "skipped" && <SkipForward className="w-4 h-4 text-text-muted shrink-0" />}
                  <Badge variant={log.status === "success" ? "success" : log.status === "error" ? "danger" : "outline"}>
                    {log.type}
                  </Badge>
                  <span className="text-sm text-text-muted">TMDB #{log.tmdb_id}</span>
                  <span className="text-xs text-text-muted truncate flex-1">{log.message}</span>
                  <span className="text-xs text-text-muted shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">No import logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({
  item,
  type,
  isImporting,
  onImport,
}: {
  item: TmdbSearchResult;
  type: ImportType;
  isImporting: boolean;
  onImport: () => void;
}) {
  const title = item.title || item.name || "Unknown";
  const date = item.release_date || item.first_air_date;

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-surface/50 hover:bg-surface transition-colors">
      {type === "person" ? (
        <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-card shrink-0">
          {item.profile_path ? (
            <img src={`https://image.tmdb.org/t/p/w185${item.profile_path}`} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-6 h-6 text-text-muted" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-12 h-18 rounded-lg overflow-hidden bg-bg-card shrink-0">
          {item.poster_path ? (
            <img src={`${IMAGE_BASE_URL}/w185${item.poster_path}`} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {type === "movie" ? <Film className="w-5 h-5 text-text-muted" /> : <Tv className="w-5 h-5 text-text-muted" />}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text truncate">{title}</p>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {date && <span>{date.substring(0, 4)}</span>}
          {item.vote_average > 0 && <span>★ {item.vote_average.toFixed(1)}</span>}
          {item.known_for_department && <span>{item.known_for_department}</span>}
        </div>
        {item.overview && (
          <p className="text-xs text-text-muted mt-1 line-clamp-1">{item.overview}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-text-muted">#{item.id}</span>
        <Button
          variant="primary"
          size="sm"
          onClick={onImport}
          disabled={isImporting}
        >
          {isImporting ? (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Importing...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Import
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
