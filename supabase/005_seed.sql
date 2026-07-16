-- ============================================================
-- SOUTHERND B — SEED DATA
-- ============================================================
-- Run AFTER schema. Populates genres, homepage sections,
-- and other reference data.
-- ============================================================

-- ============================================================
-- 1. MOVIE GENRES
-- ============================================================

INSERT INTO genres (tmdb_id, name, slug) VALUES
  (28, 'Action', 'action'),
  (12, 'Adventure', 'adventure'),
  (16, 'Animation', 'animation'),
  (35, 'Comedy', 'comedy'),
  (80, 'Crime', 'crime'),
  (99, 'Documentary', 'documentary'),
  (18, 'Drama', 'drama'),
  (10751, 'Family', 'family'),
  (14, 'Fantasy', 'fantasy'),
  (36, 'History', 'history'),
  (27, 'Horror', 'horror'),
  (10402, 'Music', 'music'),
  (9648, 'Mystery', 'mystery'),
  (10749, 'Romance', 'romance'),
  (878, 'Science Fiction', 'science-fiction'),
  (10770, 'TV Movie', 'tv-movie'),
  (53, 'Thriller', 'thriller'),
  (10752, 'War', 'war'),
  (37, 'Western', 'western')
ON CONFLICT (tmdb_id) DO NOTHING;

-- ============================================================
-- 2. TV GENRES (using tmdb_id offsets to avoid collision)
-- ============================================================

INSERT INTO genres (tmdb_id, name, slug) VALUES
  (10759, 'Action & Adventure', 'action-adventure'),
  (10762, 'Kids', 'kids'),
  (10763, 'News', 'news'),
  (10764, 'Reality', 'reality'),
  (10765, 'Sci-Fi & Fantasy', 'sci-fi-fantasy'),
  (10766, 'Soap', 'soap'),
  (10767, 'Talk', 'talk'),
  (10768, 'War & Politics', 'war-politics')
ON CONFLICT (tmdb_id) DO NOTHING;

-- ============================================================
-- 3. HOMEPAGE SECTIONS
-- ============================================================

INSERT INTO homepage_sections (type, title, "order", enabled, items, settings) VALUES
  ('hero', 'Hero', 0, TRUE, '[]'::jsonb, '{"auto_rotate": true, "interval": 8000}'::jsonb),
  ('featured_movie', 'Featured Movie', 1, TRUE, '[]'::jsonb, '{}'::jsonb),
  ('trending_movies', 'Trending Movies', 2, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('trending_series', 'Trending Series', 3, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('popular_movies', 'Popular Movies', 4, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('top_rated_movies', 'Top Rated Movies', 5, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('upcoming_movies', 'Upcoming Movies', 6, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('now_playing', 'Now Playing', 7, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('recently_added', 'Recently Added', 8, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('hidden_gems', 'Hidden Gems', 9, FALSE, '[]'::jsonb, '{"min_votes": 50, "min_rating": 7.5, "limit": 20}'::jsonb),
  ('editors_picks', 'Editor''s Picks', 10, TRUE, '[]'::jsonb, '{"limit": 10}'::jsonb),
  ('top_rated_series', 'Top Rated Series', 11, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('trending_people', 'Popular People', 12, TRUE, '[]'::jsonb, '{"limit": 20}'::jsonb),
  ('latest_reviews', 'Latest Reviews', 13, TRUE, '[]'::jsonb, '{"limit": 6}'::jsonb),
  ('popular_lists', 'Popular Lists', 14, TRUE, '[]'::jsonb, '{"limit": 8}'::jsonb),
  ('news', 'Latest News', 15, TRUE, '[]'::jsonb, '{"limit": 6}'::jsonb)
ON CONFLICT (type) DO NOTHING;

-- ============================================================
-- 4. DEFAULT SETTINGS
-- ============================================================

INSERT INTO settings (key, value) VALUES
  ('site_name', '"SouthernDB"'),
  ('site_description', '"A premium movie & TV database platform"'),
  ('supabase_url', '""'),
  ('tmdb_api_key', '""'),
  ('hero_auto_rotate', 'true'),
  ('hero_interval', '8000'),
  ('default_sort', '"popularity"'),
  ('items_per_page', '20'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 5. PLATFORMS (common streaming services)
-- ============================================================

INSERT INTO providers (tmdb_id, name, logo_path) VALUES
  (8, 'Netflix', '/t2Tkl6eYzzG5GyEh52Zk0dNcPVw.png'),
  (15, 'Hulu', '/giEObL8YhN6JgZpwRDBP2EwZbJZ.png'),
  (350, 'Apple TV+', '/6uhUNhImISyxzM0fLHxwNGcEJmJ.png'),
  (384, 'Disney+', '/emthpmt9Vlfq6xyRnXYjB198a0o.png'),
  (10, 'Amazon Prime Video', '/68MNrwlcpFZhZvnPJAf1fxMonRk.png'),
  (337, 'Disney Plus', '/emthpmt9Vlfq6xyRnXYjB198a0o.png'),
  (2, 'Apple iTunes', '/dB8PzY90m4fPm5gEyTjM1NkMhJk.png'),
  (3, 'Google Play Movies', '/8jM1gUq8NHlqkiibd9YRqM0qjqa.png'),
  (7, 'Paramount+', '/fsgHq6bUBuYbGkRGrbF0KXl8DwD.png'),
  (387, 'HBO Max', '/nmQdPvqPlW3WQFDCnXVfHfA7bB0.png'),
  (531, 'Peacock', '/cbZKh1Skv6WnVnTN5oLBfOEBnHn.png'),
  (529, 'Crunchyroll', '/gNW46Jlu1NkW4B0g1gNLH12mMJS.png')
ON CONFLICT (tmdb_id) DO NOTHING;

-- ============================================================
-- 6. ADMIN USER (update after first signup)
-- ============================================================
-- After you sign up as admin@southerndb.com, run:
-- UPDATE user_profiles SET is_admin = TRUE WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'admin@southerndb.com'
-- );
