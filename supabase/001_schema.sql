-- ============================================================
-- SOUTHERND B — DATABASE SCHEMA
-- ============================================================
-- Run this first to create all tables, indexes, and types.
-- ============================================================

-- Enums
CREATE TYPE media_type AS ENUM ('movie', 'tv');
CREATE TYPE credit_department AS ENUM ('Acting', 'Directing', 'Writing', 'Production', 'Camera', 'Editing', 'Music', 'Visual Effects', 'Lighting', 'Sound', 'Art', 'Costume & Make-Up', 'Creator');
CREATE TYPE content_status AS ENUM ('Released', 'Post Production', 'In Production', 'Planned', 'Rumored', 'Returning Series', 'Ended', 'Canceled');
CREATE TYPE import_status AS ENUM ('pending', 'success', 'error', 'skipped');

-- ============================================================
-- CORE MEDIA TABLES
-- ============================================================

CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  original_title TEXT,
  overview TEXT,
  tagline TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  logo_path TEXT,
  release_date DATE,
  runtime INTEGER,
  vote_average NUMERIC(4,1) DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  popularity NUMERIC(10,3) DEFAULT 0,
  status TEXT DEFAULT 'Planned',
  budget BIGINT DEFAULT 0,
  revenue BIGINT DEFAULT 0,
  original_language TEXT DEFAULT 'en',
  adult BOOLEAN DEFAULT FALSE,
  video BOOLEAN DEFAULT FALSE,
  production_companies JSONB DEFAULT '[]'::jsonb,
  production_countries JSONB DEFAULT '[]'::jsonb,
  spoken_languages JSONB DEFAULT '[]'::jsonb,
  admin_overrides JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  original_name TEXT,
  overview TEXT,
  tagline TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  logo_path TEXT,
  first_air_date DATE,
  last_air_date DATE,
  number_of_seasons INTEGER DEFAULT 0,
  number_of_episodes INTEGER DEFAULT 0,
  vote_average NUMERIC(4,1) DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  popularity NUMERIC(10,3) DEFAULT 0,
  status TEXT DEFAULT 'Planned',
  original_language TEXT DEFAULT 'en',
  episode_run_time INTEGER[] DEFAULT '{}',
  networks JSONB DEFAULT '[]'::jsonb,
  created_by JSONB DEFAULT '[]'::jsonb,
  admin_overrides JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  biography TEXT,
  birthday DATE,
  deathday DATE,
  gender INTEGER DEFAULT 0,
  place_of_birth TEXT,
  profile_path TEXT,
  card_image_path TEXT,
  popularity NUMERIC(10,3) DEFAULT 0,
  also_known_as TEXT[] DEFAULT '{}',
  known_for_department TEXT DEFAULT 'Acting',
  external_ids JSONB DEFAULT '{}'::jsonb,
  admin_overrides JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_path TEXT,
  origin_country TEXT
);

CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_path TEXT
);

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_path TEXT
);

-- ============================================================
-- RELATIONSHIP TABLES
-- ============================================================

CREATE TABLE movie_genres (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE series_genres (
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, genre_id)
);

CREATE TABLE movies_collections (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, collection_id)
);

CREATE TABLE movie_providers (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, provider_id)
);

CREATE TABLE series_providers (
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, provider_id)
);

-- ============================================================
-- CREDITS
-- ============================================================

CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  tmdb_id INTEGER,
  name TEXT NOT NULL,
  character TEXT,
  job TEXT,
  department TEXT DEFAULT 'Acting',
  profile_path TEXT,
  credit_id TEXT,
  media_type media_type NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER UNIQUE,
  season_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  air_date DATE,
  episode_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER UNIQUE,
  episode_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  still_path TEXT,
  air_date DATE,
  runtime INTEGER,
  vote_average NUMERIC(4,1) DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEDIA ASSETS
-- ============================================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  tmdb_video_id TEXT,
  key TEXT NOT NULL,
  name TEXT,
  site TEXT DEFAULT 'YouTube',
  type TEXT DEFAULT 'Trailer',
  official BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  aspect_ratio NUMERIC(4,2),
  width INTEGER,
  height INTEGER,
  image_type TEXT DEFAULT 'poster',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  tmdb_id INTEGER,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  recommended_movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  recommended_series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE similar_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  similar_movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  similar_series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER TABLES
-- ============================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  lists_count INTEGER DEFAULT 0,
  watched_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- ============================================================
-- USER ENGAGEMENT
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  rating NUMERIC(4,1) CHECK (rating >= 0 AND rating <= 10),
  content TEXT NOT NULL DEFAULT '',
  contains_spoilers BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_media_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  rating NUMERIC(4,1) CHECK (rating >= 0 AND rating <= 10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, movie_id),
  UNIQUE (user_id, series_id),
  CONSTRAINT rating_media_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, movie_id),
  UNIQUE (user_id, series_id),
  CONSTRAINT watchlist_media_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, movie_id),
  UNIQUE (user_id, series_id),
  CONSTRAINT favorite_media_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

CREATE TABLE watched (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, movie_id),
  UNIQUE (user_id, series_id),
  CONSTRAINT watched_media_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

CREATE TABLE diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  watched_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating NUMERIC(4,1) CHECK (rating >= 0 AND rating <= 10),
  review TEXT,
  contains_spoilers BOOLEAN DEFAULT FALSE,
  rewatch BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT diary_media_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

-- ============================================================
-- LISTS
-- ============================================================

CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_ranked BOOLEAN DEFAULT FALSE,
  items_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  rank INTEGER,
  note TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (list_id, movie_id),
  UNIQUE (list_id, series_id),
  CONSTRAINT list_item_media_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

-- ============================================================
-- SOCIAL
-- ============================================================

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, review_id),
  UNIQUE (user_id, list_id),
  CONSTRAINT like_target_check CHECK (
    (review_id IS NOT NULL AND list_id IS NULL) OR
    (review_id IS NULL AND list_id IS NOT NULL)
  )
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTENT / CMS
-- ============================================================

CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  author TEXT,
  category TEXT DEFAULT 'general',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0,
  items JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE featured_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  status import_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Movies
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_movies_popularity ON movies(popularity DESC);
CREATE INDEX idx_movies_vote_average ON movies(vote_average DESC);
CREATE INDEX idx_movies_release_date ON movies(release_date DESC);
CREATE INDEX idx_movies_title ON movies USING gin(to_tsvector('english', title));
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_movies_language ON movies(original_language);

-- Series
CREATE INDEX idx_series_tmdb_id ON series(tmdb_id);
CREATE INDEX idx_series_popularity ON series(popularity DESC);
CREATE INDEX idx_series_vote_average ON series(vote_average DESC);
CREATE INDEX idx_series_first_air_date ON series(first_air_date DESC);
CREATE INDEX idx_series_name ON series USING gin(to_tsvector('english', name));
CREATE INDEX idx_series_status ON series(status);

-- People
CREATE INDEX idx_people_tmdb_id ON people(tmdb_id);
CREATE INDEX idx_people_name ON people USING gin(to_tsvector('english', name));
CREATE INDEX idx_people_popularity ON people(popularity DESC);

-- Credits
CREATE INDEX idx_credits_person_id ON credits(person_id);
CREATE INDEX idx_credits_movie_id ON credits(movie_id);
CREATE INDEX idx_credits_series_id ON credits(series_id);
CREATE INDEX idx_credits_media_type ON credits(media_type);
CREATE INDEX idx_credits_department ON credits(department);

-- Seasons & Episodes
CREATE INDEX idx_seasons_series_id ON seasons(series_id);
CREATE INDEX idx_episodes_season_id ON episodes(season_id);

-- Genres
CREATE INDEX idx_genres_slug ON genres(slug);

-- Reviews
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX idx_reviews_series_id ON reviews(series_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_likes ON reviews(likes_count DESC);

-- User engagement
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_watched_user_id ON watched(user_id);
CREATE INDEX idx_diary_user_id ON diary(user_id);
CREATE INDEX idx_diary_watched_date ON diary(watched_date DESC);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_movie_id ON ratings(movie_id);
CREATE INDEX idx_ratings_series_id ON ratings(series_id);

-- Lists
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_lists_public ON lists(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_lists_likes ON lists(likes_count DESC);
CREATE INDEX idx_list_items_list_id ON list_items(list_id);

-- Social
CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);
CREATE INDEX idx_likes_review ON likes(review_id);
CREATE INDEX idx_likes_list ON likes(list_id);
CREATE INDEX idx_comments_review ON comments(review_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- Keywords
CREATE INDEX idx_keywords_movie ON keywords(movie_id);
CREATE INDEX idx_keywords_series ON keywords(series_id);
CREATE INDEX idx_keywords_name ON keywords USING gin(to_tsvector('english', name));

-- Videos
CREATE INDEX idx_videos_movie ON videos(movie_id);
CREATE INDEX idx_videos_series ON videos(series_id);

-- Images
CREATE INDEX idx_images_movie ON images(movie_id);
CREATE INDEX idx_images_series ON images(series_id);
CREATE INDEX idx_images_person ON images(person_id);

-- News
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_published ON news(published_at DESC);

-- Import logs
CREATE INDEX idx_import_logs_type ON import_logs(type);
CREATE INDEX idx_import_logs_status ON import_logs(status);

-- ============================================================
-- TABLE PERMISSIONS
-- ============================================================
-- Grant the anon role read-only access to public tables.
-- Grant the authenticated role full DML on all tables.
-- RLS policies (002_rls_policies.sql) restrict who can do what.

-- anon: read-only for public browsing
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- authenticated: full DML for logged-in users (RLS governs access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- service_role: full access (used by admin/server operations)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Ensure future tables also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO service_role;
