import { supabase } from "@/lib/supabase";
import type { Genre } from "@/types/database";

export async function getGenres(): Promise<Genre[]> {
  const { data, error } = await supabase
    .from("genres")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data || []) as unknown as Genre[];
}

export async function getGenreBySlug(slug: string): Promise<Genre | null> {
  const { data } = await supabase
    .from("genres")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Genre | null;
}
