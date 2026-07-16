import { supabase } from "@/lib/supabase";
import type { HomepageSection, Stats } from "@/types/database";

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("enabled", true)
    .order("order");
  if (error) throw error;
  return (data || []) as unknown as HomepageSection[];
}

export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("order");
  if (error) throw error;
  return (data || []) as unknown as HomepageSection[];
}

export async function updateHomepageSection(id: string, updates: Partial<HomepageSection>): Promise<void> {
  const { error } = await supabase
    .from("homepage_sections")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function getStats(): Promise<Stats> {
  const [movies, series, people, reviews, users, lists] = await Promise.all([
    supabase.from("movies").select("*", { count: "exact", head: true }),
    supabase.from("series").select("*", { count: "exact", head: true }),
    supabase.from("people").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("lists").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalMovies: movies.count || 0,
    totalSeries: series.count || 0,
    totalPeople: people.count || 0,
    totalReviews: reviews.count || 0,
    totalUsers: users.count || 0,
    totalLists: lists.count || 0,
  };
}

export async function getNews(): Promise<{ id: string; title: string; slug: string; excerpt: string; image_url: string | null; category: string; published_at: string }[]> {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, slug, excerpt, image_url, category, published_at")
    .order("published_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data || []) as { id: string; title: string; slug: string; excerpt: string; image_url: string | null; category: string; published_at: string }[];
}
