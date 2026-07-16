import { supabase } from "@/lib/supabase";
import type { Movie, Series, Person, Collection, Company } from "@/types/database";

interface SearchResults {
  movies: Movie[];
  series: Series[];
  people: Person[];
  collections: Collection[];
  companies: Company[];
}

export async function globalSearch(query: string): Promise<SearchResults> {
  if (!query || query.length < 2) {
    return { movies: [], series: [], people: [], collections: [], companies: [] };
  }

  const run = async <T>(fn: () => PromiseLike<T>): Promise<T | null> => {
    try { return await fn(); } catch { return null; }
  };

  const [movies, series, people, collections, companies] = await Promise.all([
    run(() => supabase.from("movies").select("*").or(`title.ilike.%${query}%,original_title.ilike.%${query}%`).order("popularity", { ascending: false }).limit(8)),
    run(() => supabase.from("series").select("*").or(`name.ilike.%${query}%,original_name.ilike.%${query}%`).order("popularity", { ascending: false }).limit(8)),
    run(() => supabase.from("people").select("*").ilike("name", `%${query}%`).order("popularity", { ascending: false }).limit(6)),
    run(() => supabase.from("collections").select("*").ilike("name", `%${query}%`).limit(4)),
    run(() => supabase.from("companies").select("*").ilike("name", `%${query}%`).limit(4)),
  ]);

  return {
    movies: (movies?.data || []) as unknown as Movie[],
    series: (series?.data || []) as unknown as Series[],
    people: (people?.data || []) as unknown as Person[],
    collections: (collections?.data || []) as unknown as Collection[],
    companies: (companies?.data || []) as unknown as Company[],
  };
}

export async function getSearchSuggestions(query: string): Promise<{ type: string; id: string; title: string; image: string | null }[]> {
  if (!query || query.length < 2) return [];

  const results = await globalSearch(query);
  const suggestions: { type: string; id: string; title: string; image: string | null }[] = [];

  results.movies.slice(0, 4).forEach((m) => {
    suggestions.push({ type: "movie", id: m.id, title: m.title, image: m.poster_path });
  });
  results.series.slice(0, 4).forEach((s) => {
    suggestions.push({ type: "series", id: s.id, title: s.name, image: s.poster_path });
  });
  results.people.slice(0, 3).forEach((p) => {
    suggestions.push({ type: "person", id: p.id, title: p.name, image: p.profile_path });
  });

  return suggestions;
}
