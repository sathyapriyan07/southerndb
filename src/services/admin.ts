import { supabase } from "@/lib/supabase";
import type { Movie, Series, Person, ImportLog } from "@/types/database";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

function assertResult<T>(result: T | null, error: { message: string; code?: string } | null, context: string): T {
  if (error) {
    throw new Error(`${context}: ${error.message}${error.code ? ` (${error.code})` : ""}`);
  }
  if (!result) {
    throw new Error(`${context}: Write blocked by RLS. Ensure your user has is_admin = true in user_profiles.`);
  }
  return result;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function importMovieFromTmdb(tmdbId: number): Promise<Movie> {
  const tmdbMovie = await tmdbFetch<any>(`/movie/${tmdbId}`, {
    append_to_response: "credits,videos,images,keywords,recommendations,similar,watch/providers",
  });

  const movieData = {
    tmdb_id: tmdbMovie.id,
    title: tmdbMovie.title,
    original_title: tmdbMovie.original_title,
    overview: tmdbMovie.overview,
    tagline: tmdbMovie.tagline,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    release_date: tmdbMovie.release_date || null,
    runtime: tmdbMovie.runtime || null,
    vote_average: tmdbMovie.vote_average || 0,
    vote_count: tmdbMovie.vote_count || 0,
    popularity: tmdbMovie.popularity || 0,
    status: tmdbMovie.status || "Planned",
    budget: tmdbMovie.budget || 0,
    revenue: tmdbMovie.revenue || 0,
    original_language: tmdbMovie.original_language || "en",
    adult: tmdbMovie.adult || false,
    video: tmdbMovie.video || false,
    production_companies: tmdbMovie.production_companies || [],
    production_countries: tmdbMovie.production_countries || [],
    spoken_languages: tmdbMovie.spoken_languages || [],
  };

  const { data: existing, error: existErr } = await supabase
    .from("movies").select("id").eq("tmdb_id", tmdbId).single();

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("movies").update(movieData).eq("id", existing.id).select().single();
    result = assertResult(data, error, `Failed to update movie "${tmdbMovie.title}"`);
  } else {
    const { data, error } = await supabase
      .from("movies").insert(movieData).select().single();
    result = assertResult(data, error, `Failed to insert movie "${tmdbMovie.title}"`);
  }

  if (tmdbMovie.genres?.length) {
    for (const genre of tmdbMovie.genres) {
      const { data: genreData } = await supabase
        .from("genres").select("id").eq("tmdb_id", genre.id).single();
      if (genreData) {
        await supabase.from("movie_genres").upsert({
          movie_id: result.id,
          genre_id: genreData.id,
        });
      }
    }
  }

  if (tmdbMovie.credits?.cast) {
    const cast = tmdbMovie.credits.cast.slice(0, 30).map((c: any, i: number) => ({
      movie_id: result.id,
      tmdb_id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path,
      "order": i,
      media_type: "movie",
    }));
    await supabase.from("credits").delete().eq("movie_id", result.id).eq("media_type", "movie").eq("department", "Acting");
    if (cast.length) await supabase.from("credits").insert(cast);
  }

  if (tmdbMovie.credits?.crew) {
    const crew = tmdbMovie.credits.crew.map((c: any) => ({
      movie_id: result.id,
      tmdb_id: c.id,
      name: c.name,
      job: c.job,
      department: c.department,
      profile_path: c.profile_path,
      media_type: "movie",
    }));
    await supabase.from("credits").delete().eq("movie_id", result.id).eq("media_type", "movie").neq("department", "Acting");
    if (crew.length) await supabase.from("credits").insert(crew);
  }

  if (tmdbMovie.keywords?.keywords) {
    for (const keyword of tmdbMovie.keywords.keywords) {
      await supabase.from("keywords").upsert({
        movie_id: result.id,
        tmdb_id: keyword.id,
        name: keyword.name,
      });
    }
  }

  if (tmdbMovie.videos?.results) {
    for (const video of tmdbMovie.videos.results) {
      await supabase.from("videos").upsert({
        movie_id: result.id,
        tmdb_video_id: video.id,
        key: video.key,
        name: video.name,
        site: video.site,
        type: video.type,
        official: video.official,
      });
    }
  }

  if (tmdbMovie.recommendations?.results) {
    await supabase.from("recommendations").delete().eq("movie_id", result.id);
    for (const rec of tmdbMovie.recommendations.results.slice(0, 20)) {
      await supabase.from("recommendations").insert({
        movie_id: result.id,
        recommended_movie_id: null,
      });
    }
  }

  await logImport("movie", tmdbId, "success", `Imported ${tmdbMovie.title} (TMDB #${tmdbId})`);
  return result as unknown as Movie;
}

export async function importSeriesFromTmdb(tmdbId: number): Promise<Series> {
  const tmdbSeries = await tmdbFetch<any>(`/tv/${tmdbId}`, {
    append_to_response: "credits,videos,images,recommendations,similar,watch/providers",
  });

  const seriesData = {
    tmdb_id: tmdbSeries.id,
    name: tmdbSeries.name,
    original_name: tmdbSeries.original_name,
    overview: tmdbSeries.overview,
    tagline: tmdbSeries.tagline,
    poster_path: tmdbSeries.poster_path,
    backdrop_path: tmdbSeries.backdrop_path,
    first_air_date: tmdbSeries.first_air_date || null,
    last_air_date: tmdbSeries.last_air_date || null,
    number_of_seasons: tmdbSeries.number_of_seasons || 0,
    number_of_episodes: tmdbSeries.number_of_episodes || 0,
    vote_average: tmdbSeries.vote_average || 0,
    vote_count: tmdbSeries.vote_count || 0,
    popularity: tmdbSeries.popularity || 0,
    status: tmdbSeries.status || "Planned",
    original_language: tmdbSeries.original_language || "en",
    networks: tmdbSeries.networks || [],
    created_by: tmdbSeries.created_by || [],
    episode_run_time: tmdbSeries.episode_run_time || [],
  };

  const { data: existing } = await supabase
    .from("series").select("id").eq("tmdb_id", tmdbId).single();

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("series").update(seriesData).eq("id", existing.id).select().single();
    result = assertResult(data, error, `Failed to update series "${tmdbSeries.name}"`);
  } else {
    const { data, error } = await supabase
      .from("series").insert(seriesData).select().single();
    result = assertResult(data, error, `Failed to insert series "${tmdbSeries.name}"`);
  }

  if (tmdbSeries.genres?.length) {
    for (const genre of tmdbSeries.genres) {
      const { data: genreData } = await supabase
        .from("genres").select("id").eq("tmdb_id", genre.id).single();
      if (genreData) {
        await supabase.from("series_genres").upsert({ series_id: result.id, genre_id: genreData.id });
      }
    }
  }

  if (tmdbSeries.seasons) {
    for (const season of tmdbSeries.seasons) {
      const { data: existingSeason } = await supabase
        .from("seasons").select("id").eq("tmdb_id", season.id).single();

      if (existingSeason) {
        await supabase.from("seasons").update({
          season_number: season.season_number,
          name: season.name,
          overview: season.overview,
          poster_path: season.poster_path,
          air_date: season.air_date,
          episode_count: season.episode_count,
        }).eq("id", existingSeason.id);
      } else {
        await supabase.from("seasons").insert({
          series_id: result.id,
          tmdb_id: season.id,
          season_number: season.season_number,
          name: season.name,
          overview: season.overview,
          poster_path: season.poster_path,
          air_date: season.air_date,
          episode_count: season.episode_count,
        });
      }
    }
  }

  if (tmdbSeries.credits?.cast) {
    const cast = tmdbSeries.credits.cast.slice(0, 30).map((c: any, i: number) => ({
      series_id: result.id,
      tmdb_id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path,
      "order": i,
      media_type: "tv",
    }));
    await supabase.from("credits").delete().eq("series_id", result.id).eq("media_type", "tv").eq("department", "Acting");
    if (cast.length) await supabase.from("credits").insert(cast);
  }

  if (tmdbSeries.credits?.crew) {
    const crew = tmdbSeries.credits.crew.map((c: any) => ({
      series_id: result.id,
      tmdb_id: c.id,
      name: c.name,
      job: c.job,
      department: c.department,
      profile_path: c.profile_path,
      media_type: "tv",
    }));
    await supabase.from("credits").delete().eq("series_id", result.id).eq("media_type", "tv").neq("department", "Acting");
    if (crew.length) await supabase.from("credits").insert(crew);
  }

  if (tmdbSeries.videos?.results) {
    for (const video of tmdbSeries.videos.results) {
      await supabase.from("videos").upsert({
        series_id: result.id,
        tmdb_video_id: video.id,
        key: video.key,
        name: video.name,
        site: video.site,
        type: video.type,
        official: video.official,
      });
    }
  }

  await logImport("series", tmdbId, "success", `Imported ${tmdbSeries.name} (TMDB #${tmdbId})`);
  return result as unknown as Series;
}

export async function importPersonFromTmdb(tmdbId: number): Promise<Person> {
  const tmdbPerson = await tmdbFetch<any>(`/person/${tmdbId}`);

  const personData = {
    tmdb_id: tmdbPerson.id,
    name: tmdbPerson.name,
    biography: tmdbPerson.biography || null,
    birthday: tmdbPerson.birthday || null,
    deathday: tmdbPerson.deathday || null,
    gender: tmdbPerson.gender || 0,
    place_of_birth: tmdbPerson.place_of_birth || null,
    profile_path: tmdbPerson.profile_path || null,
    popularity: tmdbPerson.popularity || 0,
    also_known_as: tmdbPerson.also_known_as || [],
    known_for_department: tmdbPerson.known_for_department || "Acting",
  };

  const { data: existing } = await supabase
    .from("people").select("id").eq("tmdb_id", tmdbId).single();

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("people").update(personData).eq("id", existing.id).select().single();
    result = assertResult(data, error, `Failed to update person "${tmdbPerson.name}"`);
  } else {
    const { data, error } = await supabase
      .from("people").insert(personData).select().single();
    result = assertResult(data, error, `Failed to insert person "${tmdbPerson.name}"`);
  }

  await logImport("person", tmdbId, "success", `Imported ${tmdbPerson.name} (TMDB #${tmdbId})`);
  return result as unknown as Person;
}

export async function bulkImportMovies(tmdbIds: number[]): Promise<void> {
  for (const tmdbId of tmdbIds) {
    try {
      await importMovieFromTmdb(tmdbId);
    } catch (error) {
      await logImport("movie", tmdbId, "error", String(error));
    }
  }
}

export async function bulkImportSeries(tmdbIds: number[]): Promise<void> {
  for (const tmdbId of tmdbIds) {
    try {
      await importSeriesFromTmdb(tmdbId);
    } catch (error) {
      await logImport("series", tmdbId, "error", String(error));
    }
  }
}

async function logImport(type: string, tmdbId: number, status: string, message: string): Promise<void> {
  const { error } = await supabase.from("import_logs").insert({ type, tmdb_id: tmdbId, status, message });
  if (error) console.error("Failed to log import:", error.message);
}

export interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  popularity: number;
  media_type?: string;
  known_for_department?: string;
  profile_path?: string | null;
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

export async function searchTmdbMovies(query: string, page = 1): Promise<TmdbSearchResponse> {
  return tmdbFetch<TmdbSearchResponse>("/search/movie", { query, page: String(page) });
}

export async function searchTmdbSeries(query: string, page = 1): Promise<TmdbSearchResponse> {
  return tmdbFetch<TmdbSearchResponse>("/search/tv", { query, page: String(page) });
}

export async function searchTmdbPeople(query: string, page = 1): Promise<TmdbSearchResponse> {
  return tmdbFetch<TmdbSearchResponse>("/search/person", { query, page: String(page) });
}

export async function getImportLogs(type?: string, page = 1): Promise<{ data: ImportLog[]; count: number }> {
  let query = supabase
    .from("import_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const PAGE_SIZE = 50;
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: (data || []) as unknown as ImportLog[], count: count || 0 };
}
