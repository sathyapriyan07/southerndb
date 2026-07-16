import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
export const POSTER_SIZES = {
  small: "w185",
  medium: "w342",
  large: "w500",
  original: "original",
} as const;
export const BACKDROP_SIZES = {
  small: "w780",
  medium: "w1280",
  large: "w1920",
  original: "original",
} as const;
export const PROFILE_SIZES = {
  small: "w45",
  medium: "w185",
  large: "h632",
  original: "original",
} as const;

export function posterUrl(path: string | null, size: keyof typeof POSTER_SIZES = "medium"): string {
  if (!path) return "/placeholder-poster.svg";
  return `${IMAGE_BASE_URL}/${POSTER_SIZES[size]}${path}`;
}

export function backdropUrl(path: string | null, size: keyof typeof BACKDROP_SIZES = "large"): string {
  if (!path) return "/placeholder-backdrop.svg";
  return `${IMAGE_BASE_URL}/${BACKDROP_SIZES[size]}${path}`;
}

export function profileUrl(path: string | null, size: keyof typeof PROFILE_SIZES = "medium"): string {
  if (!path) return "/placeholder-profile.svg";
  return `${IMAGE_BASE_URL}/${PROFILE_SIZES[size]}${path}`;
}

export function logoUrl(path: string | null): string {
  if (!path) return "";
  return `${IMAGE_BASE_URL}/w45${path}`;
}
