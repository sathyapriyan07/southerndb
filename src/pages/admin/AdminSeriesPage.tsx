import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSeries, createSeries, updateSeries, deleteSeries,
  importSeriesFromTmdb,
} from "@/services/admin";
import type { Series } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { IMAGE_BASE_URL } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Tv,
  ExternalLink, X, Save, AlertCircle, Download,
} from "lucide-react";

const STATUS_OPTIONS = ["Returning Series", "Ended", "Canceled", "Planned", "In Production", "Post Production"];

interface SeriesForm {
  tmdb_id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  vote_count: number;
  popularity: number;
  status: string;
  original_language: string;
}

const EMPTY_FORM: SeriesForm = {
  tmdb_id: 0, name: "", original_name: "", overview: "", tagline: "",
  poster_path: "", backdrop_path: "", first_air_date: "", last_air_date: "",
  number_of_seasons: 0, number_of_episodes: 0,
  vote_average: 0, vote_count: 0, popularity: 0, status: "Planned", original_language: "en",
};

export function AdminSeriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SeriesForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-series", search, page, sortBy, sortOrder],
    queryFn: () => listSeries({ search, page, sortBy, sortOrder }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const input = { ...form };
      if (!input.original_name) input.original_name = input.name;
      if (editId) return updateSeries(editId, input);
      return createSeries(input);
    },
    onSuccess: () => {
      setMessage(editId ? "Series updated" : "Series created");
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (e: Error) => setMessage(`Error: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSeries,
    onSuccess: () => {
      setMessage("Series deleted");
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (e: Error) => setMessage(`Error: ${e.message}`),
  });

  const tmdbImportMutation = useMutation({
    mutationFn: async (tmdbId: number) => importSeriesFromTmdb(tmdbId),
    onSuccess: () => {
      setMessage("Series imported from TMDb");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (e: Error) => setMessage(`Import error: ${e.message}`),
  });

  const totalPages = data ? Math.ceil(data.count / 25) : 1;

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(s: Series) {
    setEditId(s.id);
    setForm({
      tmdb_id: s.tmdb_id,
      name: s.name,
      original_name: s.original_name || "",
      overview: s.overview || "",
      tagline: s.tagline || "",
      poster_path: s.poster_path || "",
      backdrop_path: s.backdrop_path || "",
      first_air_date: s.first_air_date || "",
      last_air_date: s.last_air_date || "",
      number_of_seasons: s.number_of_seasons || 0,
      number_of_episodes: s.number_of_episodes || 0,
      vote_average: s.vote_average || 0,
      vote_count: s.vote_count || 0,
      popularity: s.popularity || 0,
      status: s.status || "Planned",
      original_language: s.original_language || "en",
    });
    setShowForm(true);
  }

  function setField<K extends keyof SeriesForm>(key: K, value: SeriesForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">Series</h1>
            <p className="text-sm text-text-muted mt-1">{data?.count ?? 0} total</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/import">
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Import</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Add Series</Button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.startsWith("Error") ? "bg-danger/10 text-danger border border-danger/20" : "bg-success/10 text-success border border-success/20"}`}>
            {message}
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Input placeholder="Search series..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={<Search className="w-4 h-4" />} />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text">
            <option value="created_at">Created</option>
            <option value="popularity">Popularity</option>
            <option value="vote_average">Rating</option>
            <option value="first_air_date">Air Date</option>
            <option value="name">Name</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text hover:bg-surface-hover transition-colors">
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center"><LoadingSpinner /></div>
          ) : !data?.data.length ? (
            <div className="p-12 text-center text-text-muted">No series found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                    <th className="text-left p-3">Poster</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">TMDB</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Rating</th>
                    <th className="text-left p-3">Seasons</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                      <td className="p-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-surface">
                          {s.poster_path ? (
                            <img src={`${IMAGE_BASE_URL}/w92${s.poster_path}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Tv className="w-4 h-4 text-text-muted" /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link to={`/series/${s.id}`} className="text-sm font-medium text-text hover:text-primary transition-colors line-clamp-1">{s.name}</Link>
                        {s.original_name !== s.name && <p className="text-xs text-text-muted line-clamp-1">{s.original_name}</p>}
                      </td>
                      <td className="p-3 text-xs text-text-muted">#{s.tmdb_id}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{s.status}</Badge></td>
                      <td className="p-3 text-sm text-text">{s.vote_average.toFixed(1)}</td>
                      <td className="p-3 text-sm text-text">{s.number_of_seasons}</td>
                      <td className="p-3 text-xs text-text-muted">{s.first_air_date ? formatDate(s.first_air_date) : "—"}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`https://www.themoviedb.org/tv/${s.tmdb_id}`} target="_blank" rel="noopener noreferrer">
                            <button className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"><ExternalLink className="w-3.5 h-3.5" /></button>
                          </a>
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-border">
              <span className="text-xs text-text-muted">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-danger" /></div>
                <div>
                  <h3 className="font-semibold text-text">Delete Series</h3>
                  <p className="text-xs text-text-muted">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={() => setShowForm(false)}>
            <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-2xl mb-20" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text">{editId ? "Edit Series" : "Add Series"}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover text-text-muted"><X className="w-5 h-5" /></button>
              </div>

              {!editId && (
                <div className="mb-6 p-4 bg-surface rounded-xl border border-border">
                  <p className="text-xs text-text-muted mb-2">Quick import from TMDb — enter TMDB ID:</p>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="TMDB ID" value={form.tmdb_id || ""} onChange={(e) => setField("tmdb_id", Number(e.target.value))} />
                    <Button variant="primary" size="sm" disabled={!form.tmdb_id || tmdbImportMutation.isPending} onClick={() => tmdbImportMutation.mutate(form.tmdb_id)}>
                      {tmdbImportMutation.isPending ? "Importing..." : "Import"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted mb-1 block">Name *</label>
                  <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Series name" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Original Name</label>
                  <Input value={form.original_name} onChange={(e) => setField("original_name", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">TMDB ID</label>
                  <Input type="number" value={form.tmdb_id || ""} onChange={(e) => setField("tmdb_id", Number(e.target.value))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted mb-1 block">Overview</label>
                  <textarea value={form.overview} onChange={(e) => setField("overview", e.target.value)} className="w-full h-24 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted resize-none" placeholder="Series overview" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted mb-1 block">Tagline</label>
                  <Input value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">First Air Date</label>
                  <Input type="date" value={form.first_air_date} onChange={(e) => setField("first_air_date", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Last Air Date</label>
                  <Input type="date" value={form.last_air_date} onChange={(e) => setField("last_air_date", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Rating</label>
                  <Input type="number" step="0.1" min="0" max="10" value={form.vote_average} onChange={(e) => setField("vote_average", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Vote Count</label>
                  <Input type="number" value={form.vote_count} onChange={(e) => setField("vote_count", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Popularity</label>
                  <Input type="number" step="0.1" value={form.popularity} onChange={(e) => setField("popularity", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Status</label>
                  <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Seasons</label>
                  <Input type="number" value={form.number_of_seasons} onChange={(e) => setField("number_of_seasons", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Episodes</label>
                  <Input type="number" value={form.number_of_episodes} onChange={(e) => setField("number_of_episodes", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Language</label>
                  <Input value={form.original_language} onChange={(e) => setField("original_language", e.target.value)} placeholder="en" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Poster Path</label>
                  <Input value={form.poster_path} onChange={(e) => setField("poster_path", e.target.value)} placeholder="/path.jpg" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Backdrop Path</label>
                  <Input value={form.backdrop_path} onChange={(e) => setField("backdrop_path", e.target.value)} placeholder="/path.jpg" />
                </div>
              </div>

              {form.poster_path && (
                <div className="mt-4 flex gap-4">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Poster preview</p>
                    <img src={`${IMAGE_BASE_URL}/w185${form.poster_path}`} alt="" className="w-24 h-36 rounded-lg object-cover" />
                  </div>
                  {form.backdrop_path && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Backdrop preview</p>
                      <img src={`${IMAGE_BASE_URL}/w300${form.backdrop_path}`} alt="" className="w-48 h-27 rounded-lg object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
                  <Save className="w-4 h-4 mr-1" />
                  {saveMutation.isPending ? "Saving..." : editId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
