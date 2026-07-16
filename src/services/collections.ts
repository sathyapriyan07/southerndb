import { supabase } from "@/lib/supabase";
import type { Collection } from "@/types/database";

export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data || []) as unknown as Collection[];
}

export async function getCollection(id: string): Promise<Collection> {
  const { data, error } = await supabase
    .from("collections")
    .select("*, parts:movies_collections(movie:movies(*))")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Collection;
}
