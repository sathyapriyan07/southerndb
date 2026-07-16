import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  listPeople, createPerson, updatePerson, deletePerson,
  importPersonFromTmdb,
} from "@/services/admin";
import type { Person } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { IMAGE_BASE_URL } from "@/lib/supabase";
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, User,
  ExternalLink, X, Save, AlertCircle, Download, Upload,
} from "lucide-react";

interface PersonForm {
  tmdb_id: number;
  name: string;
  biography: string;
  birthday: string;
  deathday: string;
  gender: number;
  place_of_birth: string;
  profile_path: string;
  popularity: number;
  known_for_department: string;
}

const EMPTY_FORM: PersonForm = {
  tmdb_id: 0, name: "", biography: "", birthday: "", deathday: "",
  gender: 0, place_of_birth: "", profile_path: "", popularity: 0,
  known_for_department: "Acting",
};

const GENDER_OPTIONS = [
  { value: 0, label: "Not specified" },
  { value: 1, label: "Female" },
  { value: 2, label: "Male" },
  { value: 3, label: "Non-binary" },
];

export function AdminPeoplePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PersonForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-people", search, page, sortBy, sortOrder],
    queryFn: () => listPeople({ search, page, sortBy, sortOrder }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const input = { ...form };
      if (editId) return updatePerson(editId, input);
      return createPerson(input);
    },
    onSuccess: () => {
      setMessage(editId ? "Person updated" : "Person created");
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["admin-people"] });
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (e: Error) => setMessage(`Error: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      setMessage("Person deleted");
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["admin-people"] });
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (e: Error) => setMessage(`Error: ${e.message}`),
  });

  const tmdbImportMutation = useMutation({
    mutationFn: async (tmdbId: number) => importPersonFromTmdb(tmdbId),
    onSuccess: () => {
      setMessage("Person imported from TMDb");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-people"] });
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

  function openEdit(p: Person) {
    setEditId(p.id);
    setForm({
      tmdb_id: p.tmdb_id,
      name: p.name,
      biography: p.biography || "",
      birthday: p.birthday || "",
      deathday: p.deathday || "",
      gender: p.gender || 0,
      place_of_birth: p.place_of_birth || "",
      profile_path: p.profile_path || "",
      popularity: p.popularity || 0,
      known_for_department: p.known_for_department || "Acting",
    });
    setShowForm(true);
  }

  function setField<K extends keyof PersonForm>(key: K, value: PersonForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">People</h1>
            <p className="text-sm text-text-muted mt-1">{data?.count ?? 0} total</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/import">
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Import</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Add Person</Button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.startsWith("Error") ? "bg-danger/10 text-danger border border-danger/20" : "bg-success/10 text-success border border-success/20"}`}>
            {message}
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Input placeholder="Search people..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={<Search className="w-4 h-4" />} />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text">
            <option value="created_at">Created</option>
            <option value="popularity">Popularity</option>
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
            <div className="p-12 text-center text-text-muted">No people found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                    <th className="text-left p-3">Photo</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">TMDB</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">Gender</th>
                    <th className="text-left p-3">Popularity</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((person) => (
                    <tr key={person.id} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface">
                          {person.profile_path ? (
                            <img src={`${IMAGE_BASE_URL}/w92${person.profile_path}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User className="w-4 h-4 text-text-muted" /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link to={`/person/${person.id}`} className="text-sm font-medium text-text hover:text-primary transition-colors line-clamp-1">{person.name}</Link>
                      </td>
                      <td className="p-3 text-xs text-text-muted">#{person.tmdb_id}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{person.known_for_department}</Badge></td>
                      <td className="p-3 text-sm text-text">{GENDER_OPTIONS.find((g) => g.value === person.gender)?.label || "—"}</td>
                      <td className="p-3 text-sm text-text">{person.popularity?.toFixed(1) || "—"}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`https://www.themoviedb.org/person/${person.tmdb_id}`} target="_blank" rel="noopener noreferrer">
                            <button className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"><ExternalLink className="w-3.5 h-3.5" /></button>
                          </a>
                          <button onClick={() => openEdit(person)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteConfirm(person.id)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                  <h3 className="font-semibold text-text">Delete Person</h3>
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
                <h2 className="text-xl font-bold text-text">{editId ? "Edit Person" : "Add Person"}</h2>
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
                  <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">TMDB ID</label>
                  <Input type="number" value={form.tmdb_id || ""} onChange={(e) => setField("tmdb_id", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Department</label>
                  <Input value={form.known_for_department} onChange={(e) => setField("known_for_department", e.target.value)} placeholder="Acting" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted mb-1 block">Biography</label>
                  <textarea value={form.biography} onChange={(e) => setField("biography", e.target.value)} className="w-full h-24 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted resize-none" placeholder="Biography" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Birthday</label>
                  <Input type="date" value={form.birthday} onChange={(e) => setField("birthday", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Deathday</label>
                  <Input type="date" value={form.deathday} onChange={(e) => setField("deathday", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Gender</label>
                  <select value={form.gender} onChange={(e) => setField("gender", Number(e.target.value))} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text">
                    {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Popularity</label>
                  <Input type="number" step="0.1" value={form.popularity} onChange={(e) => setField("popularity", Number(e.target.value))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted mb-1 block">Place of Birth</label>
                  <Input value={form.place_of_birth} onChange={(e) => setField("place_of_birth", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-text-muted mb-1 block">Profile Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text cursor-pointer hover:bg-surface-hover transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !editId) return;
                          const ext = file.name.split(".").pop();
                          const path = `people/${editId}.${ext}`;
                          const { error } = await supabase.storage.from("admin-uploads").upload(path, file, { upsert: true });
                          if (!error) {
                            const { data: urlData } = supabase.storage.from("admin-uploads").getPublicUrl(path);
                            setField("profile_path", urlData.publicUrl);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <Input className="mt-2" value={form.profile_path} onChange={(e) => setField("profile_path", e.target.value)} placeholder="Or paste image URL" />
                </div>
              </div>

              {form.profile_path && (
                <div className="mt-4">
                  <p className="text-xs text-text-muted mb-1">Photo preview</p>
                  <img
                    src={form.profile_path.startsWith("http") ? form.profile_path : `${IMAGE_BASE_URL}/w185${form.profile_path}`}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover"
                  />
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
