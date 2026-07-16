import { supabase } from "@/lib/supabase";
import type { Review, UserProfile } from "@/types/database";

export async function getReviews(options?: {
  movieId?: string;
  seriesId?: string;
  userId?: string;
  sortBy?: "created_at" | "likes_count";
  page?: number;
}): Promise<{ data: Review[]; count: number }> {
  let query = supabase
    .from("reviews")
    .select("*, user:user_profiles(*), movie:movies(title, poster_path, release_date), series:series(name, poster_path, first_air_date)", { count: "exact" });

  if (options?.movieId) query = query.eq("movie_id", options.movieId);
  if (options?.seriesId) query = query.eq("series_id", options.seriesId);
  if (options?.userId) query = query.eq("user_id", options.userId);

  const sortBy = options?.sortBy || "created_at";
  query = query.order(sortBy, { ascending: false });

  const page = options?.page || 1;
  query = query.range((page - 1) * 20, page * 20 - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: (data || []) as unknown as Review[], count: count || 0 };
}

export async function createReview(review: {
  movie_id?: string;
  series_id?: string;
  rating?: number;
  content: string;
  contains_spoilers?: boolean;
}): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select("*, user:user_profiles(*)")
    .single();
  if (error) throw error;
  return data as unknown as Review;
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .update(updates)
    .eq("id", id)
    .select("*, user:user_profiles(*)")
    .single();
  if (error) throw error;
  return data as unknown as Review;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleReviewLike(reviewId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .single();

  if (data) {
    await supabase.from("likes").delete().eq("id", data.id);
    return false;
  } else {
    await supabase.from("likes").insert({ review_id: reviewId, user_id: userId });
    return true;
  }
}

export async function getTrendingReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:user_profiles(*), movie:movies(title, poster_path, release_date), series:series(name, poster_path, first_air_date)")
    .order("likes_count", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Review[];
}

export async function getReviewsStats() {
  const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true });
  return count || 0;
}
