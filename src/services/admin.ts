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
    release_date: tmdbMovie.release_date,
    runtime: tmdbMovie.runtime,
    vote_average: tmdbMovie.vote_average,
    vote_count: tmdbMovie.vote_count,
    popularity: tmdbMovie.popularity,
    status: tmdbMovie.status,
    budget: tmdbMovie.budget,
    revenue: tmdbMovie.revenue,
    original_language: tmdbMovie.original_language,
    adult: tmdbMovie.adult,
    video: tmdbMovie.video,
    production_companies: tmdbMovie.production_companies,
    production_countries: tmdbMovie.production_countries,
    spoken_languages: tmdbMovie.spoken_languages,
  };

  const { data: existing } = await supabase.from("movies").select("id").eq("tmdb_id", tmdbId).single();

  let result;
  if (existing) {
    const { data } = await supabase.from("movies").update(movieData).eq("id", existing.id).select().single();
    result = data;
  } else {
    const { data } = await supabase.from("movies").insert(movieData).select().single();
    result = data;
  }

  if (tmdbMovie.genres?.length) {
    for (const genre of tmdbMovie.genres) {
      const { data: genreData } = await supabase.from("genres").select("id").eq("tmdb_id", genre.id).single();
      if (genreData) {
        await supabase.from("movie_genres").upsert({
          movie_id: result!.id,
          genre_id: genreData.id,
        });
      }
    }
  }

  if (tmdbMovie.credits?.cast) {
    const cast = tmdbMovie.credits.cast.slice(0, 30).map((c: any, i: number) => ({
      movie_id: result!.id,
      tmdb_id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path,
      order: i,
      media_type: "movie",
    }));
    await supabase.from("credits").delete().eq("movie_id", result!.id).eq("media_type", "movie").eq("department", "Acting");
    await supabase.from("credits").insert(cast);
  }

  if (tmdbMovie.credits?.crew) {
    const crew = tmdbMovie.credits.crew.map((c: any) => ({
      movie_id: result!.id,
      tmdb_id: c.id,
      name: c.name,
      job: c.job,
      department: c.department,
      profile_path: c.profile_path,
      media_type: "movie",
    }));
    await supabase.from("credits").delete().eq("movie_id", result!.id).eq("media_type", "movie").neq("department", "Acting");
    await supabase.from("credits").insert(crew);
  }

  if (tmdbMovie.keywords?.keywords) {
    for (const keyword of tmdbMovie.keywords.keywords) {
      await supabase.from("keywords").upsert({
        movie_id: result!.id,
        tmdb_id: keyword.id,
        name: keyword.name,
      });
    }
  }

  await logImport("movie", tmdbId, "success", `Imported ${tmdbMovie.title}`);
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
    first_air_date: tmdbSeries.first_air_date,
    last_air_date: tmdbSeries.last_air_date,
    number_of_seasons: tmdbSeries.number_of_seasons,
    number_of_episodes: tmdbSeries.number_of_episodes,
    vote_average: tmdbSeries.vote_average,
    vote_count: tmdbSeries.vote_count,
    popularity: tmdbSeries.popularity,
    status: tmdbSeries.status,
    original_language: tmdbSeries.original_language,
    networks: tmdbSeries.networks,
    episode_run_time: tmdbSeries.episode_run_time,
  };

  const { data: existing } = await supabase.from("series").select("id").eq("tmdb_id", tmdbId).single();

  let result;
  if (existing) {
    const { data } = await supabase.from("series").update(seriesData).eq("id", existing.id).select().single();
    result = data;
  } else {
    const { data } = await supabase.from("series").insert(seriesData).select().single();
    result = data;
  }

  if (tmdbSeries.genres?.length) {
    for (const genre of tmdbSeries.genres) {
      const { data: genreData } = await supabase.from("genres").select("id").eq("tmdb_id", genre.id).single();
      if (genreData) {
        await supabase.from("series_genres").upsert({ series_id: result!.id, genre_id: genreData.id });
      }
    }
  }

  if (tmdbSeries.seasons) {
    for (const season of tmdbSeries.seasons) {
      await supabase.from("seasons").upsert({
        series_id: result!.id,
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

  if (tmdbSeries.credits?.cast) {
    const cast = tmdbSeries.credits.cast.slice(0, 30).map((c: any, i: number) => ({
      series_id: result!.id,
      tmdb_id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path,
      order: i,
      media_type: "tv",
    }));
    await supabase.from("credits").delete().eq("series_id", result!.id).eq("media_type", "tv").eq("department", "Acting");
    await supabase.from("credits").insert(cast);
  }

  await logImport("series", tmdbId, "success", `Imported ${tmdbSeries.name}`);
  return result as unknown as Series;
}

export async function importPersonFromTmdb(tmdbId: number): Promise<Person> {
  const tmdbPerson = await tmdbFetch<{ id: number; name: string; biography: string; birthday: string; deathday: string; gender: number; place_of_birth: string; profile_path: string; popularity: number; also_known_as: string[]; known_for_department: string }>(`/person/${tmdbId}`);

  const personData = {
    tmdb_id: tmdbPerson.id,
    name: tmdbPerson.name,
    biography: tmdbPerson.biography,
    birthday: tmdbPerson.birthday,
    deathday: tmdbPerson.deathday,
    gender: tmdbPerson.gender,
    place_of_birth: tmdbPerson.place_of_birth,
    profile_path: tmdbPerson.profile_path,
    popularity: tmdbPerson.popularity,
    also_known_as: tmdbPerson.also_known_as,
    known_for_department: tmdbPerson.known_for_department,
  };

  const { data: existing } = await supabase.from("people").select("id").eq("tmdb_id", tmdbId).single();

  let result;
  if (existing) {
    const { data } = await supabase.from("people").update(personData).eq("id", existing.id).select().single();
    result = data;
  } else {
    const { data } = await supabase.from("people").insert(personData).select().single();
    result = data;
  }

  await logImport("person", tmdbId, "success", `Imported ${tmdbPerson.name}`);
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
  await supabase.from("import_logs").insert({ type, tmdb_id: tmdbId, status, message });
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
