import { supabase } from "@/lib/supabase";
import type { Person, CreditItem } from "@/types/database";

export async function getPerson(id: string): Promise<Person> {
  let { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) {
    const byTmdb = await supabase.from("people").select("*").eq("tmdb_id", Number(id)).single();
    data = byTmdb.data;
    error = byTmdb.error;
  }

  if (error) throw error;
  if (!data) throw new Error("Person not found");

  const [movieCredits, tvCredits] = await Promise.all([
    supabase.from("credits").select("*, movie:movies(*)").eq("person_id", data.id).eq("media_type", "movie"),
    supabase.from("credits").select("*, series:series(*)").eq("person_id", data.id).eq("media_type", "tv"),
  ]);

  return {
    ...data,
    movie_credits: (movieCredits.data || []) as unknown as CreditItem[],
    tv_credits: (tvCredits.data || []) as unknown as CreditItem[],
  } as unknown as Person;
}

export async function getTrendingPeople(): Promise<Person[]> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("popularity", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Person[];
}

export async function searchPeople(query: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("popularity", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Person[];
}

export async function getPeopleStats() {
  const { count } = await supabase.from("people").select("*", { count: "exact", head: true });
  return count || 0;
}
