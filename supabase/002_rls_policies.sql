-- ============================================================
-- SOUTHERND B — ROW LEVEL SECURITY POLICIES
-- ============================================================
-- Enable RLS on every table and define access rules.
--
-- Role model:
--   anon       = unauthenticated visitor
--   authenticated = logged-in user
--   service_role  = backend / admin only (bypasses RLS)
--
-- Content tables (movies, series, people, genres, etc.) are
-- PUBLIC READ. Only admins (service_role or is_admin user)
-- can write.
--
-- User data is PRIVATE by default; the owner can CRUD their
-- own rows. Public profiles/lists/reviews are readable by all.
-- ============================================================

-- Helper: check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PUBLIC READ / ADMIN WRITE TABLES
-- ============================================================

-- movies
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movies_select_public" ON movies
  FOR SELECT USING (true);

CREATE POLICY "movies_insert_admin" ON movies
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "movies_update_admin" ON movies
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "movies_delete_admin" ON movies
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- series
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "series_select_public" ON series
  FOR SELECT USING (true);

CREATE POLICY "series_insert_admin" ON series
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "series_update_admin" ON series
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "series_delete_admin" ON series
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- people
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "people_select_public" ON people
  FOR SELECT USING (true);

CREATE POLICY "people_insert_admin" ON people
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "people_update_admin" ON people
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "people_delete_admin" ON people
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- genres
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "genres_select_public" ON genres
  FOR SELECT USING (true);

CREATE POLICY "genres_insert_admin" ON genres
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "genres_update_admin" ON genres
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "genres_delete_admin" ON genres
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collections_select_public" ON collections
  FOR SELECT USING (true);

CREATE POLICY "collections_insert_admin" ON collections
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "collections_update_admin" ON collections
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "collections_delete_admin" ON collections
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_select_public" ON companies
  FOR SELECT USING (true);

CREATE POLICY "companies_insert_admin" ON companies
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "companies_update_admin" ON companies
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "companies_delete_admin" ON companies
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- platforms
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platforms_select_public" ON platforms
  FOR SELECT USING (true);

CREATE POLICY "platforms_insert_admin" ON platforms
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "platforms_update_admin" ON platforms
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "platforms_delete_admin" ON platforms
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- providers
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_select_public" ON providers
  FOR SELECT USING (true);

CREATE POLICY "providers_insert_admin" ON providers
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "providers_update_admin" ON providers
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "providers_delete_admin" ON providers
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- ============================================================
-- JUNCTION TABLES (public read / admin write)
-- ============================================================

ALTER TABLE movie_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movie_genres_public" ON movie_genres FOR SELECT USING (true);
CREATE POLICY "movie_genres_admin" ON movie_genres FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE series_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "series_genres_public" ON series_genres FOR SELECT USING (true);
CREATE POLICY "series_genres_admin" ON series_genres FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE movies_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movies_collections_public" ON movies_collections FOR SELECT USING (true);
CREATE POLICY "movies_collections_admin" ON movies_collections FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE movie_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movie_providers_public" ON movie_providers FOR SELECT USING (true);
CREATE POLICY "movie_providers_admin" ON movie_providers FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE series_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "series_providers_public" ON series_providers FOR SELECT USING (true);
CREATE POLICY "series_providers_admin" ON series_providers FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

-- ============================================================
-- CREDITS (public read / admin write)
-- ============================================================

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credits_select_public" ON credits
  FOR SELECT USING (true);

CREATE POLICY "credits_insert_admin" ON credits
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "credits_update_admin" ON credits
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "credits_delete_admin" ON credits
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- ============================================================
-- SEASONS & EPISODES (public read / admin write)
-- ============================================================

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seasons_select_public" ON seasons
  FOR SELECT USING (true);

CREATE POLICY "seasons_insert_admin" ON seasons
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "seasons_update_admin" ON seasons
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "seasons_delete_admin" ON seasons
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "episodes_select_public" ON episodes
  FOR SELECT USING (true);

CREATE POLICY "episodes_insert_admin" ON episodes
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "episodes_update_admin" ON episodes
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "episodes_delete_admin" ON episodes
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- ============================================================
-- MEDIA ASSETS (public read / admin write)
-- ============================================================

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "videos_public" ON videos FOR SELECT USING (true);
CREATE POLICY "videos_admin" ON videos FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images_public" ON images FOR SELECT USING (true);
CREATE POLICY "images_admin" ON images FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "keywords_public" ON keywords FOR SELECT USING (true);
CREATE POLICY "keywords_admin" ON keywords FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recommendations_public" ON recommendations FOR SELECT USING (true);
CREATE POLICY "recommendations_admin" ON recommendations FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

ALTER TABLE similar_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "similar_titles_public" ON similar_titles FOR SELECT USING (true);
CREATE POLICY "similar_titles_admin" ON similar_titles FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

-- ============================================================
-- USER PROFILES
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read any profile
CREATE POLICY "user_profiles_select_public" ON user_profiles
  FOR SELECT USING (true);

-- Users can insert their own profile (signup trigger does this)
CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Only admins or the user can delete
CREATE POLICY "user_profiles_delete_own_or_admin" ON user_profiles
  FOR DELETE USING (
    id = auth.uid() OR public.is_admin()
  );

-- ============================================================
-- FOLLOWERS
-- ============================================================

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Public: anyone can see who follows whom
CREATE POLICY "followers_select_public" ON followers
  FOR SELECT USING (true);

-- Authenticated users can follow/unfollow
CREATE POLICY "followers_insert_own" ON followers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND follower_id = auth.uid()
  );

CREATE POLICY "followers_delete_own" ON followers
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND follower_id = auth.uid()
  );

-- ============================================================
-- REVIEWS
-- ============================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read reviews
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews for themselves
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Users can delete their own reviews; admins can delete any
CREATE POLICY "reviews_delete_own_or_admin" ON reviews
  FOR DELETE USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.is_admin()
  );

-- ============================================================
-- RATINGS
-- ============================================================

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "ratings_select_public" ON ratings
  FOR SELECT USING (true);

-- Users can insert their own ratings
CREATE POLICY "ratings_insert_own" ON ratings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Users can update their own ratings
CREATE POLICY "ratings_update_own" ON ratings
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Users can delete their own ratings
CREATE POLICY "ratings_delete_own" ON ratings
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================================
-- WATCHLISTS
-- ============================================================

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Users see only their own watchlist
CREATE POLICY "watchlists_select_own" ON watchlists
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "watchlists_insert_own" ON watchlists
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "watchlists_delete_own" ON watchlists
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================================
-- FAVORITES
-- ============================================================

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users see only their own favorites
CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================================
-- WATCHED
-- ============================================================

ALTER TABLE watched ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watched_select_own" ON watched
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "watched_insert_own" ON watched
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "watched_delete_own" ON watched
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================================
-- DIARY
-- ============================================================

ALTER TABLE diary ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read diary entries
CREATE POLICY "diary_select_public" ON diary
  FOR SELECT USING (true);

-- Own write
CREATE POLICY "diary_insert_own" ON diary
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "diary_update_own" ON diary
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "diary_delete_own" ON diary
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================================
-- LISTS
-- ============================================================

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Public lists are visible to everyone; private only to owner
CREATE POLICY "lists_select_public_or_own" ON lists
  FOR SELECT USING (
    is_public = TRUE
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "lists_insert_own" ON lists
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "lists_update_own" ON lists
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "lists_delete_own_or_admin" ON lists
  FOR DELETE USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.is_admin()
  );

-- ============================================================
-- LIST ITEMS
-- ============================================================

ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- Read: visible if parent list is public or user owns the list
CREATE POLICY "list_items_select" ON list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_items.list_id
        AND (lists.is_public = TRUE OR lists.user_id = auth.uid())
    )
  );

CREATE POLICY "list_items_insert_own" ON list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_items.list_id
        AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items_update_own" ON list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_items.list_id
        AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items_delete_own" ON list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_items.list_id
        AND lists.user_id = auth.uid()
    )
  );

-- ============================================================
-- LIKES
-- ============================================================

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Likes are public
CREATE POLICY "likes_select_public" ON likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON likes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "likes_delete_own" ON likes
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================================
-- COMMENTS
-- ============================================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments are public
CREATE POLICY "comments_select_public" ON comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_own" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "comments_delete_own_or_admin" ON comments
  FOR DELETE USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.is_admin()
  );

-- ============================================================
-- NOTIFICATIONS (private to the user)
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "notifications_insert_own" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- ============================================================
-- NEWS (public read / admin write)
-- ============================================================

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_select_public" ON news
  FOR SELECT USING (true);

CREATE POLICY "news_insert_admin" ON news
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "news_update_admin" ON news
  FOR UPDATE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "news_delete_admin" ON news
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- ============================================================
-- CMS: HOMEPAGE SECTIONS, FEATURED, SETTINGS (admin only)
-- ============================================================

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "homepage_sections_select_public" ON homepage_sections
  FOR SELECT USING (true);

CREATE POLICY "homepage_sections_admin" ON homepage_sections
  FOR ALL USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

ALTER TABLE featured_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "featured_content_select_public" ON featured_content
  FOR SELECT USING (true);

CREATE POLICY "featured_content_admin" ON featured_content
  FOR ALL USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_public" ON settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin" ON settings
  FOR ALL USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

-- ============================================================
-- IMPORT LOGS (admin only)
-- ============================================================

ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_logs_admin_read" ON import_logs
  FOR SELECT USING (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "import_logs_admin_insert" ON import_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY "import_logs_admin_delete" ON import_logs
  FOR DELETE USING (
    auth.role() = 'service_role' OR public.is_admin()
  );
