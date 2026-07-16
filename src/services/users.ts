import { supabase } from "@/lib/supabase";
import type { UserProfile, UserList, DiaryEntry, WatchlistItem, Favorite } from "@/types/database";

export async function getProfile(username: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("username", username)
    .single();
  if (error) throw error;
  return data as unknown as UserProfile;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as UserProfile;
}

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from("followers")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .single();

  if (data) {
    await supabase.from("followers").delete().eq("id", data.id);
    return false;
  } else {
    await supabase.from("followers").insert({ follower_id: followerId, following_id: followingId });
    return true;
  }
}

export async function getUserLists(userId: string): Promise<UserList[]> {
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as UserList[];
}

export async function getList(listId: string): Promise<UserList> {
  const { data, error } = await supabase
    .from("lists")
    .select("*, user:user_profiles(*), items:list_items(*, movie:movies(*), series:series(*))")
    .eq("id", listId)
    .single();
  if (error) throw error;
  return data as unknown as UserList;
}

export async function createList(list: {
  name: string;
  description?: string;
  is_public?: boolean;
  is_ranked?: boolean;
}): Promise<UserList> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("lists")
    .insert({ ...list, user_id: userData.user?.id })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as UserList;
}

export async function addToList(listId: string, movieId?: string, seriesId?: string): Promise<void> {
  const { error } = await supabase
    .from("list_items")
    .insert({ list_id: listId, movie_id: movieId, series_id: seriesId });
  if (error) throw error;
}

export async function removeFromList(listId: string, movieId?: string, seriesId?: string): Promise<void> {
  let query = supabase.from("list_items").delete().eq("list_id", listId);
  if (movieId) query = query.eq("movie_id", movieId);
  if (seriesId) query = query.eq("series_id", seriesId);
  const { error } = await query;
  if (error) throw error;
}

export async function toggleWatchlist(movieId?: string, seriesId?: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  let query = supabase.from("watchlists").select("id").eq("user_id", userData.user.id);
  if (movieId) query = query.eq("movie_id", movieId);
  if (seriesId) query = query.eq("series_id", seriesId);

  const { data } = await query.single();

  if (data) {
    await supabase.from("watchlists").delete().eq("id", data.id);
    return false;
  } else {
    await supabase.from("watchlists").insert({
      user_id: userData.user.id,
      movie_id: movieId,
      series_id: seriesId,
    });
    return true;
  }
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("watchlists")
    .select("*, movie:movies(*), series:series(*)")
    .eq("user_id", userData.user.id)
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as WatchlistItem[];
}

export async function toggleFavorite(movieId?: string, seriesId?: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  let query = supabase.from("favorites").select("id").eq("user_id", userData.user.id);
  if (movieId) query = query.eq("movie_id", movieId);
  if (seriesId) query = query.eq("series_id", seriesId);

  const { data } = await query.single();

  if (data) {
    await supabase.from("favorites").delete().eq("id", data.id);
    return false;
  } else {
    await supabase.from("favorites").insert({
      user_id: userData.user.id,
      movie_id: movieId,
      series_id: seriesId,
    });
    return true;
  }
}

export async function getDiary(userId?: string): Promise<DiaryEntry[]> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userId || userData.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from("diary")
    .select("*, movie:movies(*), series:series(*)")
    .eq("user_id", uid)
    .order("watched_date", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []) as unknown as DiaryEntry[];
}

export async function addDiaryEntry(entry: {
  movie_id?: string;
  series_id?: string;
  watched_date: string;
  rating?: number;
  review?: string;
}): Promise<DiaryEntry> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("diary")
    .insert({ ...entry, user_id: userData.user?.id })
    .select("*, movie:movies(*), series:series(*)")
    .single();
  if (error) throw error;
  return data as unknown as DiaryEntry;
}

export async function rateMedia(movieId?: string, seriesId?: string, rating: number = 0): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const table = movieId ? "movie_ratings" : "series_ratings";
  const idField = movieId ? "movie_id" : "series_id";
  const idValue = movieId || seriesId;

  const { data } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", userData.user.id)
    .eq(idField, idValue)
    .single();

  if (rating === 0 && data) {
    await supabase.from(table).delete().eq("id", data.id);
  } else if (data) {
    await supabase.from(table).update({ rating }).eq("id", data.id);
  } else if (rating > 0) {
    await supabase.from(table).insert({
      user_id: userData.user.id,
      [idField]: idValue,
      rating,
    });
  }
}

export async function getNotifications(): Promise<{ id: string; title: string; message: string; read: boolean; created_at: string }[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []) as { id: string; title: string; message: string; read: boolean; created_at: string }[];
}

export async function markNotificationsRead(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userData.user.id)
    .eq("read", false);
}

export async function getFeaturedUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("followers_count", { ascending: false })
    .limit(12);
  if (error) throw error;
  return (data || []) as unknown as UserProfile[];
}
