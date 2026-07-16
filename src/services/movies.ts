import { supabase } from "@/lib/supabase";
import type { Movie, MediaFilters } from "@/types/database";

const PAGE_SIZE = 20;

function buildMovieQuery(filters?: MediaFilters) {
  let query = supabase
    .from("movies")
    .select("*, genres:movie_genres(genre:genres(*))", { count: "exact" });

  if (filters) {
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.language) query = query.eq("original_language", filters.language);
    if (filters.year) query = query.gte("release_date", `${filters.year}-01-01`).lte("release_date", `${filters.year}-12-31`);
    if (filters.rating_min) query = query.gte("vote_average", filters.rating_min);
    if (filters.rating_max) query = query.lte("vote_average", filters.rating_max);
    if (filters.runtime_min) query = query.gte("runtime", filters.runtime_min);
    if (filters.runtime_max) query = query.lte("runtime", filters.runtime_max);
  }

  const sortBy = filters?.sort_by || "popularity";
  const order = filters?.sort_order || "desc";
  query = query.order(sortBy, { ascending: order === "asc" });

  const page = filters?.page || 1;
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  return query;
}

export async function getMovies(filters?: MediaFilters): Promise<{ data: Movie[]; count: number }> {
  const { data, count, error } = await buildMovieQuery(filters);
  if (error) throw error;
  return { data: (data || []) as unknown as Movie[], count: count || 0 };
}

export async function getMovie(id: string): Promise<Movie> {
  const { data, error } = await supabase
    .from("movies")
    .select(`
      *,
      genres:movie_genres(genre:genres(*)),
      cast:credits(*),
      crew:credits(*),
      videos:videos(*),
      images:images(*),
      streaming_providers:providers(*),
      Belongs_to_collection:collections(*)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Movie;
}

export async function getMovieByTmdbId(tmdbId: number): Promise<Movie | null> {
  const { data } = await supabase
    .from("movies")
    .select("*")
    .eq("tmdb_id", tmdbId)
    .single();
  return data as Movie | null;
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .order("popularity", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Movie[];
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .order("vote_average", { ascending: false })
    .gte("vote_count", 100)
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Movie[];
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  const now = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .gte("release_date", now)
    .order("release_date", { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Movie[];
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .order("popularity", { ascending: false })
    .eq("status", "Released")
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Movie[];
}

export async function getMoviesByGenre(genreId: string, page = 1): Promise<{ data: Movie[]; count: number }> {
  const { data, count, error } = await supabase
    .from("movie_genres")
    .select("movie:movies(*)", { count: "exact" })
    .eq("genre_id", genreId)
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw error;
  return { data: ((data || []).map((d: Record<string, unknown>) => d.movie) as unknown as Movie[]), count: count || 0 };
}

export async function getMoviesByCollection(collectionId: string): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies_collections")
    .select("movie:movies(*)")
    .eq("collection_id", collectionId)
    .order("movie(movies.release_date)", { ascending: true });
  if (error) throw error;
  return (data || []).map((d: Record<string, unknown>) => d.movie) as unknown as Movie[];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .ilike("title", `%${query}%`)
    .order("popularity", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Movie[];
}

export async function getFeaturedMovie(): Promise<Movie | null> {
  const { data } = await supabase
    .from("homepage_sections")
    .select("items")
    .eq("type", "featured_movie")
    .eq("enabled", true)
    .single();
  if (!data?.items) return null;
  const items = data.items as { movie_id: string }[];
  if (!items[0]?.movie_id) return null;
  const { data: movie } = await supabase.from("movies").select("*").eq("id", items[0].movie_id).single();
  return (movie as Movie) || null;
}

export async function getMovieStats() {
  const { count } = await supabase.from("movies").select("*", { count: "exact", head: true });
  return count || 0;
}
