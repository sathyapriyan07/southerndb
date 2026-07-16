import { supabase } from "@/lib/supabase";
import type { Series, MediaFilters } from "@/types/database";

const PAGE_SIZE = 20;

function buildSeriesQuery(filters?: MediaFilters) {
  let query = supabase
    .from("series")
    .select("*, genres:series_genres(genre:genres(*))", { count: "exact" });

  if (filters) {
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.language) query = query.eq("original_language", filters.language);
    if (filters.year) query = query.gte("first_air_date", `${filters.year}-01-01`).lte("first_air_date", `${filters.year}-12-31`);
    if (filters.rating_min) query = query.gte("vote_average", filters.rating_min);
    if (filters.rating_max) query = query.lte("vote_average", filters.rating_max);
  }

  const sortBy = filters?.sort_by || "popularity";
  const order = filters?.sort_order || "desc";
  query = query.order(sortBy, { ascending: order === "asc" });

  const page = filters?.page || 1;
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  return query;
}

export async function getSeries(filters?: MediaFilters): Promise<{ data: Series[]; count: number }> {
  const { data, count, error } = await buildSeriesQuery(filters);
  if (error) throw error;
  return { data: (data || []) as unknown as Series[], count: count || 0 };
}

export async function getSeriesById(id: string): Promise<Series> {
  const { data, error } = await supabase
    .from("series")
    .select(`
      *,
      genres:series_genres(genre:genres(*)),
      cast:credits(*, person:people(id, tmdb_id)),
      crew:credits(*, person:people(id, tmdb_id)),
      videos:videos(*),
      images:images(*),
      streaming_providers:providers(*),
      seasons:seasons(*, episodes:episodes(*))
    `)
    .eq("id", id)
    .single();
  if (error) throw error;

  const raw = data as any;
  const overrides = raw.admin_overrides || {};
  return {
    ...raw,
    poster_path: overrides.poster_path ?? raw.poster_path,
    backdrop_path: overrides.backdrop_path ?? raw.backdrop_path,
    logo_path: overrides.logo_path ?? raw.logo_path,
    genres: (raw.genres || []).map((g: any) => g.genre).filter(Boolean),
    cast: (raw.cast || []).filter((c: any) => c.department === "Acting" || !c.department),
    crew: (raw.crew || []).filter((c: any) => c.department && c.department !== "Acting"),
    streaming_providers: raw.streaming_providers || [],
    recommendations: raw.recommendations || [],
    similar: raw.similar || [],
  } as Series;
}

export async function getTrendingSeries(): Promise<Series[]> {
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("popularity", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Series[];
}

export async function getTopRatedSeries(): Promise<Series[]> {
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("vote_average", { ascending: false })
    .gte("vote_count", 100)
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Series[];
}

export async function searchSeries(query: string): Promise<Series[]> {
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("popularity", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Series[];
}

export async function getSeriesStats() {
  const { count } = await supabase.from("series").select("*", { count: "exact", head: true });
  return count || 0;
}
