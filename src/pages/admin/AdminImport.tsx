import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { importMovieFromTmdb, importSeriesFromTmdb, importPersonFromTmdb, bulkImportMovies, getImportLogs } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Upload, Film, Tv, User, AlertCircle, CheckCircle, Clock, SkipForward } from "lucide-react";

export function AdminImport() {
  const queryClient = useQueryClient();
  const [tmdbId, setTmdbId] = useState("");
  const [importType, setImportType] = useState<"movie" | "series" | "person">("movie");
  const [bulkIds, setBulkIds] = useState("");
  const [message, setMessage] = useState("");

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["import-logs"],
    queryFn: () => getImportLogs(),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const id = parseInt(tmdbId);
      if (isNaN(id)) throw new Error("Invalid TMDB ID");
      if (importType === "movie") return importMovieFromTmdb(id);
      if (importType === "series") return importSeriesFromTmdb(id);
      return importPersonFromTmdb(id);
    },
    onSuccess: () => {
      setMessage("Import successful!");
      setTmdbId("");
      queryClient.invalidateQueries({ queryKey: ["import-logs"] });
    },
    onError: (error: Error) => {
      setMessage(`Import failed: ${error.message}`);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      const ids = bulkIds.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
      if (ids.length === 0) throw new Error("No valid IDs");
      if (importType === "movie") return bulkImportMovies(ids);
      return bulkImportMovies(ids);
    },
    onSuccess: () => {
      setMessage("Bulk import started!");
      setBulkIds("");
      queryClient.invalidateQueries({ queryKey: ["import-logs"] });
    },
    onError: (error: Error) => {
      setMessage(`Bulk import failed: ${error.message}`);
    },
  });

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-8">Import Center</h1>

        {/* Import Type Selector */}
        <div className="flex gap-2 mb-6">
          {(["movie", "series", "person"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setImportType(type)}
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

        {/* Single Import */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Import Single {importType.charAt(0).toUpperCase() + importType.slice(1)}</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter TMDB ID"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              type="number"
            />
            <Button
              variant="primary"
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || !tmdbId}
            >
              <Upload className="w-4 h-4" />
              {importMutation.isPending ? "Importing..." : "Import"}
            </Button>
          </div>
          {message && (
            <p className={`text-sm mt-3 ${message.includes("failed") ? "text-danger" : "text-success"}`}>{message}</p>
          )}
        </div>

        {/* Bulk Import */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Bulk Import</h2>
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
