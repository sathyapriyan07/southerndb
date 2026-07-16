export interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  original_title: string | null;
  overview: string | null;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  logo_path: string | null;
  release_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  status: string;
  budget: number | null;
  revenue: number | null;
  original_language: string;
  adult: boolean;
  video: boolean;
  genres: Genre[];
  production_companies: Company[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  keywords: { id: number; name: string }[];
 Belongs_to_collection: Collection | null;
  streaming_providers: Provider[];
  cast: CastMember[];
  crew: CrewMember[];
  videos: Video[];
  images: MediaImage[];
  recommendations: Movie[];
  similar: Movie[];
  reviews?: Review[];
  user_rating?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Series {
  id: string;
  tmdb_id: number;
  name: string;
  original_name: string | null;
  overview: string | null;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  logo_path: string | null;
  first_air_date: string | null;
  last_air_date: string | null;
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  vote_count: number;
  popularity: number;
  status: string;
  original_language: string;
  genres: Genre[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  seasons: Season[];
  episode_run_time: number[];
  streaming_providers: Provider[];
  cast: CastMember[];
  crew: CrewMember[];
  videos: Video[];
  images: MediaImage[];
  recommendations: Series[];
  similar: Series[];
  reviews?: Review[];
  user_rating?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Season {
  id: string;
  tmdb_id: number;
  season_number: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  air_date: string | null;
  episode_count: number;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  tmdb_id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string | null;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  guest_stars: CastMember[];
  crew: CrewMember[];
}

export interface Person {
  id: string;
  tmdb_id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  place_of_birth: string | null;
  profile_path: string | null;
  card_image_path: string | null;
  popularity: number;
  also_known_as: string[];
  known_for_department: string;
  combined_credits?: { cast: CreditItem[]; crew: CreditItem[] };
  images?: MediaImage[];
  external_ids?: Record<string, string | null>;
  movie_credits?: CreditItem[];
  tv_credits?: CreditItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Genre {
  id: string;
  tmdb_id: number;
  name: string;
  slug: string;
  movie_count?: number;
  series_count?: number;
}

export interface Company {
  id: string;
  tmdb_id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Collection {
  id: string;
  tmdb_id: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  parts?: Movie[];
  movie_count?: number;
  created_at?: string;
}

export interface Provider {
  id: string;
  tmdb_id: number;
  name: string;
  logo_path: string | null;
}

export interface CastMember {
  id: string;
  tmdb_id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  credit_id?: string;
  department?: string;
  gender?: number;
  person?: { id: string; tmdb_id: number; card_image_path: string | null } | null;
}

export interface CrewMember {
  id: string;
  tmdb_id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id?: string;
  person?: { id: string; tmdb_id: number; card_image_path: string | null } | null;
}

export interface CreditItem {
  id: string;
  tmdb_id: number;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  department?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  media_type?: string;
  overview?: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MediaImage {
  file_path: string;
  aspect_ratio: number;
  width: number;
  height: number;
  type?: string;
}

export interface Review {
  id: string;
  user_id: string;
  movie_id?: string;
  series_id?: string;
  rating: number | null;
  content: string;
  contains_spoilers: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  movie?: Movie;
  series?: Series;
  is_liked?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  reviews_count: number;
  lists_count: number;
  watched_count: number;
  is_following?: boolean;
  created_at: string;
}

export interface UserList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_ranked: boolean;
  items_count: number;
  likes_count: number;
  movie_ids?: string[];
  series_ids?: string[];
  movies?: Movie[];
  series?: Series[];
  user?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  movie_id?: string;
  series_id?: string;
  watched_date: string;
  rating: number | null;
  review: string | null;
  contains_spoilers: boolean;
  movie?: Movie;
  series?: Series;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id?: string;
  series_id?: string;
  added_at: string;
  movie?: Movie;
  series?: Series;
}

export interface Favorite {
  id: string;
  user_id: string;
  movie_id?: string;
  series_id?: string;
  added_at: string;
  movie?: Movie;
  series?: Series;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  author: string;
  category: string;
  published_at: string;
}

export interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  winner: boolean;
  movie_id?: string;
  series_id?: string;
  person_id?: string;
  character?: string;
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  items: unknown[];
}

export interface MediaFilters {
  genres?: number[];
  language?: string;
  country?: string;
  year?: number | string;
  runtime_min?: number;
  runtime_max?: number;
  streaming_service?: number[];
  studio?: number[];
  rating_min?: number;
  rating_max?: number;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
}

export interface SearchResult {
  movies: Movie[];
  series: Series[];
  people: Person[];
  collections: Collection[];
  companies: Company[];
}

export interface ImportLog {
  id: string;
  type: string;
  tmdb_id: number;
  status: "pending" | "success" | "error" | "skipped";
  message: string | null;
  created_at: string;
}

export interface Stats {
  totalMovies: number;
  totalSeries: number;
  totalPeople: number;
  totalReviews: number;
  totalUsers: number;
  totalLists: number;
}
