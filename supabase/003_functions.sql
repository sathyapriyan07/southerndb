-- ============================================================
-- SOUTHERND B — FUNCTIONS & TRIGGERS
-- ============================================================
-- Auto-create profiles, maintain counters, handle follow/like
-- count bookkeeping, full-text search helpers.
-- ============================================================

-- ============================================================
-- 1. AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON movies;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON series;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON people;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON user_profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON reviews;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON lists;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON comments;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON homepage_sections;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 3. FOLLOW COUNT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_follow_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE user_profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;

    -- Create notification
    INSERT INTO notifications (user_id, actor_id, type, title, message, link)
    VALUES (
      NEW.following_id,
      NEW.follower_id,
      'follow',
      'New follower',
      (SELECT display_name FROM user_profiles WHERE id = NEW.follower_id) || ' started following you',
      '/profile/' || (SELECT username FROM user_profiles WHERE id = NEW.follower_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    UPDATE user_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_change ON followers;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_change();

-- ============================================================
-- 4. REVIEW COUNT + RATING TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_review_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET reviews_count = reviews_count + 1 WHERE id = NEW.user_id;

    -- Update movie average rating
    IF NEW.movie_id IS NOT NULL THEN
      UPDATE movies SET
        vote_average = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = NEW.movie_id AND rating IS NOT NULL),
        vote_count = (SELECT COUNT(*) FROM reviews WHERE movie_id = NEW.movie_id)
      WHERE id = NEW.movie_id;
    END IF;

    IF NEW.series_id IS NOT NULL THEN
      UPDATE series SET
        vote_average = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE series_id = NEW.series_id AND rating IS NOT NULL),
        vote_count = (SELECT COUNT(*) FROM reviews WHERE series_id = NEW.series_id)
      WHERE id = NEW.series_id;
    END IF;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET reviews_count = GREATEST(reviews_count - 1, 0) WHERE id = OLD.user_id;

    IF OLD.movie_id IS NOT NULL THEN
      UPDATE movies SET
        vote_average = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = OLD.movie_id AND rating IS NOT NULL),
        vote_count = (SELECT COUNT(*) FROM reviews WHERE movie_id = OLD.movie_id)
      WHERE id = OLD.movie_id;
    END IF;

    IF OLD.series_id IS NOT NULL THEN
      UPDATE series SET
        vote_average = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE series_id = OLD.series_id AND rating IS NOT NULL),
        vote_count = (SELECT COUNT(*) FROM reviews WHERE series_id = OLD.series_id)
      WHERE id = OLD.series_id;
    END IF;

    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Recalculate if rating changed
    IF OLD.rating IS DISTINCT FROM NEW.rating THEN
      IF NEW.movie_id IS NOT NULL THEN
        UPDATE movies SET
          vote_average = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = NEW.movie_id AND rating IS NOT NULL)
        WHERE id = NEW.movie_id;
      END IF;
      IF NEW.series_id IS NOT NULL THEN
        UPDATE series SET
          vote_average = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE series_id = NEW.series_id AND rating IS NOT NULL)
        WHERE id = NEW.series_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_change();

-- ============================================================
-- 5. WATCHED COUNT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_watched_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET watched_count = watched_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET watched_count = GREATEST(watched_count - 1, 0) WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_watched_change ON watched;
CREATE TRIGGER on_watched_change
  AFTER INSERT OR DELETE ON watched
  FOR EACH ROW EXECUTE FUNCTION public.handle_watched_change();

-- ============================================================
-- 6. LIST COUNT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_list_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET lists_count = lists_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET lists_count = GREATEST(lists_count - 1, 0) WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_list_change ON lists;
CREATE TRIGGER on_list_change
  AFTER INSERT OR DELETE ON lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_list_change();

-- ============================================================
-- 7. LIST ITEMS COUNT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_list_item_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lists SET items_count = items_count + 1 WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lists SET items_count = GREATEST(items_count - 1, 0) WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_list_item_change ON list_items;
CREATE TRIGGER on_list_item_change
  AFTER INSERT OR DELETE ON list_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_list_item_change();

-- ============================================================
-- 8. LIKE COUNT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_like_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.review_id IS NOT NULL THEN
      UPDATE reviews SET likes_count = likes_count + 1 WHERE id = NEW.review_id;

      -- Notify review owner
      INSERT INTO notifications (user_id, actor_id, type, title, message, link)
      SELECT
        r.user_id,
        NEW.user_id,
        'like',
        'Review liked',
        (SELECT display_name FROM user_profiles WHERE id = NEW.user_id) || ' liked your review',
        NULL
      FROM reviews r WHERE r.id = NEW.review_id AND r.user_id != NEW.user_id;
    END IF;

    IF NEW.list_id IS NOT NULL THEN
      UPDATE lists SET likes_count = likes_count + 1 WHERE id = NEW.list_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.review_id IS NOT NULL THEN
      UPDATE reviews SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.review_id;
    END IF;
    IF OLD.list_id IS NOT NULL THEN
      UPDATE lists SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.list_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_change ON likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_change();

-- ============================================================
-- 9. COMMENT COUNT TRIGGER ON REVIEWS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_comment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.review_id IS NOT NULL THEN
      UPDATE reviews SET comments_count = comments_count + 1 WHERE id = NEW.review_id;

      -- Notify review owner
      INSERT INTO notifications (user_id, actor_id, type, title, message, link)
      SELECT
        r.user_id,
        NEW.user_id,
        'comment',
        'New comment',
        (SELECT display_name FROM user_profiles WHERE id = NEW.user_id) || ' commented on your review',
        NULL
      FROM reviews r WHERE r.id = NEW.review_id AND r.user_id != NEW.user_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.review_id IS NOT NULL THEN
      UPDATE reviews SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.review_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_change ON comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_change();

-- ============================================================
-- 10. FULL-TEXT SEARCH FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_movies(query TEXT, result_limit INTEGER DEFAULT 20)
RETURNS SETOF movies AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM movies m
  WHERE
    m.title ILIKE '%' || query || '%'
    OR m.original_title ILIKE '%' || query || '%'
    OR m.overview ILIKE '%' || query || '%'
  ORDER BY m.popularity DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.search_series(query TEXT, result_limit INTEGER DEFAULT 20)
RETURNS SETOF series AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM series s
  WHERE
    s.name ILIKE '%' || query || '%'
    OR s.original_name ILIKE '%' || query || '%'
    OR s.overview ILIKE '%' || query || '%'
  ORDER BY s.popularity DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.search_people(query TEXT, result_limit INTEGER DEFAULT 20)
RETURNS SETOF people AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM people p
  WHERE
    p.name ILIKE '%' || query || '%'
    OR EXISTS (
      SELECT 1 FROM unnest(p.also_known_as) AS aka
      WHERE aka ILIKE '%' || query || '%'
    )
  ORDER BY p.popularity DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 11. GET USER STATS FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id UUID)
RETURNS TABLE (
  total_reviews BIGINT,
  total_lists BIGINT,
  total_watched BIGINT,
  total_favorites BIGINT,
  total_watchlist BIGINT,
  total_diary BIGINT,
  avg_rating NUMERIC(4,1),
  favorite_genres JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM reviews WHERE user_id = target_user_id),
    (SELECT COUNT(*)::BIGINT FROM lists WHERE user_id = target_user_id),
    (SELECT COUNT(*)::BIGINT FROM watched WHERE user_id = target_user_id),
    (SELECT COUNT(*)::BIGINT FROM favorites WHERE user_id = target_user_id),
    (SELECT COUNT(*)::BIGINT FROM watchlists WHERE user_id = target_user_id),
    (SELECT COUNT(*)::BIGINT FROM diary WHERE user_id = target_user_id),
    (SELECT COALESCE(AVG(rating), 0)::NUMERIC(4,1) FROM ratings WHERE user_id = target_user_id),
    (
      SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT g.name, g.slug, COUNT(*) as count
        FROM movie_genres mg
        JOIN genres g ON g.id = mg.genre_id
        JOIN reviews r ON r.movie_id = mg.movie_id AND r.user_id = target_user_id
        GROUP BY g.name, g.slug
        ORDER BY count DESC
        LIMIT 5
      ) t
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 12. GET MEDIA STATS FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_movie_extra_stats(target_movie_id UUID)
RETURNS TABLE (
  avg_rating NUMERIC(4,1),
  rating_count BIGINT,
  review_count BIGINT,
  watchlist_count BIGINT,
  favorite_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COALESCE(AVG(rating), 0)::NUMERIC(4,1) FROM reviews WHERE movie_id = target_movie_id AND rating IS NOT NULL),
    (SELECT COUNT(*)::BIGINT FROM ratings WHERE movie_id = target_movie_id),
    (SELECT COUNT(*)::BIGINT FROM reviews WHERE movie_id = target_movie_id),
    (SELECT COUNT(*)::BIGINT FROM watchlists WHERE movie_id = target_movie_id),
    (SELECT COUNT(*)::BIGINT FROM favorites WHERE movie_id = target_movie_id);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 13. ACTIVITY FEED FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_activity_feed(target_user_id UUID, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  activity_type TEXT,
  actor_name TEXT,
  actor_username TEXT,
  actor_avatar TEXT,
  target_title TEXT,
  target_type TEXT,
  target_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT
      'review'::TEXT,
      up.display_name,
      up.username,
      up.avatar_url,
      CASE WHEN r.movie_id IS NOT NULL THEN m.title ELSE s.name END,
      CASE WHEN r.movie_id IS NOT NULL THEN 'movie' ELSE 'series' END,
      CASE WHEN r.movie_id IS NOT NULL THEN r.movie_id ELSE r.series_id END,
      r.created_at
    FROM reviews r
    JOIN user_profiles up ON up.id = r.user_id
    LEFT JOIN movies m ON m.id = r.movie_id
    LEFT JOIN series s ON s.id = r.series_id
    WHERE r.user_id IN (
      SELECT following_id FROM followers WHERE follower_id = target_user_id
    )
  )
  UNION ALL
  (
    SELECT
      'diary'::TEXT,
      up.display_name,
      up.username,
      up.avatar_url,
      CASE WHEN d.movie_id IS NOT NULL THEN m.title ELSE s.name END,
      CASE WHEN d.movie_id IS NOT NULL THEN 'movie' ELSE 'series' END,
      CASE WHEN d.movie_id IS NOT NULL THEN d.movie_id ELSE d.series_id END,
      d.created_at
    FROM diary d
    JOIN user_profiles up ON up.id = d.user_id
    LEFT JOIN movies m ON m.id = d.movie_id
    LEFT JOIN series s ON s.id = d.series_id
    WHERE d.user_id IN (
      SELECT following_id FROM followers WHERE follower_id = target_user_id
    )
  )
  UNION ALL
  (
    SELECT
      'list'::TEXT,
      up.display_name,
      up.username,
      up.avatar_url,
      l.name,
      'list'::TEXT,
      l.id,
      l.created_at
    FROM lists l
    JOIN user_profiles up ON up.id = l.user_id
    WHERE l.is_public = TRUE
      AND l.user_id IN (
        SELECT following_id FROM followers WHERE follower_id = target_user_id
      )
  )
  ORDER BY created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 14. GLOBAL STATS FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_global_stats()
RETURNS TABLE (
  total_movies BIGINT,
  total_series BIGINT,
  total_people BIGINT,
  total_reviews BIGINT,
  total_users BIGINT,
  total_lists BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM movies),
    (SELECT COUNT(*)::BIGINT FROM series),
    (SELECT COUNT(*)::BIGINT FROM people),
    (SELECT COUNT(*)::BIGINT FROM reviews),
    (SELECT COUNT(*)::BIGINT FROM user_profiles),
    (SELECT COUNT(*)::BIGINT FROM lists);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 15. BULK IMPORT UPSERT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.upsert_movie_from_tmdb(
  p_tmdb_id INTEGER,
  p_title TEXT,
  p_original_title TEXT DEFAULT NULL,
  p_overview TEXT DEFAULT NULL,
  p_tagline TEXT DEFAULT NULL,
  p_poster_path TEXT DEFAULT NULL,
  p_backdrop_path TEXT DEFAULT NULL,
  p_release_date DATE DEFAULT NULL,
  p_runtime INTEGER DEFAULT NULL,
  p_vote_average NUMERIC(4,1) DEFAULT 0,
  p_vote_count INTEGER DEFAULT 0,
  p_popularity NUMERIC(10,3) DEFAULT 0,
  p_status TEXT DEFAULT 'Planned',
  p_budget BIGINT DEFAULT 0,
  p_revenue BIGINT DEFAULT 0,
  p_original_language TEXT DEFAULT 'en',
  p_adult BOOLEAN DEFAULT FALSE,
  p_production_companies JSONB DEFAULT '[]'::jsonb,
  p_production_countries JSONB DEFAULT '[]'::jsonb,
  p_spoken_languages JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO movies (
    tmdb_id, title, original_title, overview, tagline, poster_path, backdrop_path,
    release_date, runtime, vote_average, vote_count, popularity, status,
    budget, revenue, original_language, adult,
    production_companies, production_countries, spoken_languages
  ) VALUES (
    p_tmdb_id, p_title, p_original_title, p_overview, p_tagline, p_poster_path, p_backdrop_path,
    p_release_date, p_runtime, p_vote_average, p_vote_count, p_popularity, p_status,
    p_budget, p_revenue, p_original_language, p_adult,
    p_production_companies, p_production_countries, p_spoken_languages
  )
  ON CONFLICT (tmdb_id) DO UPDATE SET
    title = EXCLUDED.title,
    original_title = EXCLUDED.original_title,
    overview = EXCLUDED.overview,
    tagline = EXCLUDED.tagline,
    poster_path = EXCLUDED.poster_path,
    backdrop_path = EXCLUDED.backdrop_path,
    release_date = EXCLUDED.release_date,
    runtime = EXCLUDED.runtime,
    vote_average = EXCLUDED.vote_average,
    vote_count = EXCLUDED.vote_count,
    popularity = EXCLUDED.popularity,
    status = EXCLUDED.status,
    budget = EXCLUDED.budget,
    revenue = EXCLUDED.revenue,
    production_companies = EXCLUDED.production_companies,
    production_countries = EXCLUDED.production_countries,
    spoken_languages = EXCLUDED.spoken_languages
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
