import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedMovie, getTrendingMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies } from "@/services/movies";
import { getTrendingSeries, getTopRatedSeries } from "@/services/series";
import { getTrendingPeople } from "@/services/people";
import { getTrendingReviews } from "@/services/reviews";
import { getNews, getStats } from "@/services/homepage";
import { MovieCard } from "@/components/movie/MovieCard";
import { SeriesCard } from "@/components/series/SeriesCard";
import { PersonCard } from "@/components/person/PersonCard";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { MediaCarousel } from "@/components/shared/MediaCarousel";
import { GenrePill } from "@/components/shared/GenrePill";
import { formatYear, formatRuntime } from "@/lib/utils";
import { posterUrl, backdropUrl } from "@/lib/supabase";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { RatingBadge } from "@/components/shared/StarRating";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Play, TrendingUp, Star, Calendar, Award, Users, Newspaper, ChevronRight, Sparkles } from "lucide-react";

export function HomePage() {
  const { data: featuredMovie, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-movie"],
    queryFn: getFeaturedMovie,
  });

  const { data: trendingMovies, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-movies"],
    queryFn: getTrendingMovies,
  });

  const { data: topRatedMovies } = useQuery({
    queryKey: ["top-rated-movies"],
    queryFn: getTopRatedMovies,
  });

  const { data: upcomingMovies } = useQuery({
    queryKey: ["upcoming-movies"],
    queryFn: getUpcomingMovies,
  });

  const { data: nowPlayingMovies } = useQuery({
    queryKey: ["now-playing-movies"],
    queryFn: getNowPlayingMovies,
  });

  const { data: trendingSeries } = useQuery({
    queryKey: ["trending-series"],
    queryFn: getTrendingSeries,
  });

  const { data: topRatedSeries } = useQuery({
    queryKey: ["top-rated-series"],
    queryFn: getTopRatedSeries,
  });

  const { data: trendingPeople } = useQuery({
    queryKey: ["trending-people"],
    queryFn: getTrendingPeople,
  });

  const { data: trendingReviews } = useQuery({
    queryKey: ["trending-reviews"],
    queryFn: getTrendingReviews,
  });

  const { data: news } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const genres = [
    { id: "1", name: "Action", slug: "action" },
    { id: "2", name: "Comedy", slug: "comedy" },
    { id: "3", name: "Drama", slug: "drama" },
    { id: "4", name: "Horror", slug: "horror" },
    { id: "5", name: "Sci-Fi", slug: "science-fiction" },
    { id: "6", name: "Thriller", slug: "thriller" },
    { id: "7", name: "Animation", slug: "animation" },
    { id: "8", name: "Romance", slug: "romance" },
    { id: "9", name: "Documentary", slug: "documentary" },
    { id: "10", name: "Fantasy", slug: "fantasy" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] max-h-[800px] flex items-end">
        {featuredLoading ? (
          <div className="absolute inset-0">
            <Skeleton className="w-full h-full" />
          </div>
        ) : featuredMovie ? (
          <>
            <div className="absolute inset-0">
              <ImageWithLoader
                src={backdropUrl(featuredMovie.backdrop_path, "large")}
                alt={featuredMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 hero-gradient" />
              <div className="absolute inset-0 hero-gradient-left" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  {featuredMovie.release_date && (
                    <span className="text-sm text-text-secondary">{formatYear(featuredMovie.release_date)}</span>
                  )}
                  {featuredMovie.runtime && (
                    <span className="text-sm text-text-muted">• {formatRuntime(featuredMovie.runtime)}</span>
                  )}
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-display)] text-text mb-3 leading-tight">
                  {featuredMovie.title}
                </h1>

                {featuredMovie.tagline && (
                  <p className="text-lg md:text-xl text-text-secondary italic mb-4">
                    "{featuredMovie.tagline}"
                  </p>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <RatingBadge rating={featuredMovie.vote_average} size="md" />
                  <span className="text-sm text-text-muted">{featuredMovie.vote_count?.toLocaleString()} votes</span>
                </div>

                <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-6 line-clamp-3">
                  {featuredMovie.overview}
                </p>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/movie/${featuredMovie.id}`}
                    className="h-12 px-6 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    View Details
                  </Link>
                  <Link
                    to="/movies"
                    className="h-12 px-6 glass hover:bg-surface text-text font-medium rounded-lg flex items-center gap-2 transition-colors"
                  >
                    Explore All
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl md:text-8xl font-black font-[family-name:var(--font-display)]">
                <span className="text-primary">Southern</span>
                <span className="text-text">DB</span>
              </h1>
              <p className="text-text-secondary mt-4">Your Cinematic Universe</p>
              <div className="flex items-center justify-center gap-6 mt-8">
                {stats && (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-text">{stats.totalMovies.toLocaleString()}</p>
                      <p className="text-xs text-text-muted">Movies</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-text">{stats.totalSeries.toLocaleString()}</p>
                      <p className="text-xs text-text-muted">Series</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-text">{stats.totalPeople.toLocaleString()}</p>
                      <p className="text-xs text-text-muted">People</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Genres */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {genres.map((g) => (
            <GenrePill key={g.id} {...g} />
          ))}
        </div>
      </section>

      {/* Trending Movies */}
      {trendingMovies && trendingMovies.length > 0 && (
        <MediaCarousel title="Trending Movies" subtitle="What's hot right now" viewAllLink="/movies?sort=popularity">
          <div className="flex gap-3 md:gap-4">
            {trendingMovies.map((movie) => (
              <div key={movie.id} className="w-36 md:w-44 shrink-0">
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  releaseDate={movie.release_date}
                  rating={movie.vote_average}
                  showActions
                />
              </div>
            ))}
          </div>
        </MediaCarousel>
      )}

      {/* Trending Series */}
      {trendingSeries && trendingSeries.length > 0 && (
        <MediaCarousel title="Trending Series" subtitle="Binge-worthy shows" viewAllLink="/series?sort=popularity">
          <div className="flex gap-3 md:gap-4">
            {trendingSeries.map((series) => (
              <div key={series.id} className="w-36 md:w-44 shrink-0">
                <SeriesCard
                  id={series.id}
                  name={series.name}
                  posterPath={series.poster_path}
                  firstAirDate={series.first_air_date}
                  rating={series.vote_average}
                />
              </div>
            ))}
          </div>
        </MediaCarousel>
      )}

      {/* Top Rated */}
      {topRatedMovies && topRatedMovies.length > 0 && (
        <MediaCarousel title="Top Rated Movies" subtitle="Highest rated of all time" viewAllLink="/movies?sort=vote_average">
          <div className="flex gap-3 md:gap-4">
            {topRatedMovies.map((movie) => (
              <div key={movie.id} className="w-36 md:w-44 shrink-0">
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  releaseDate={movie.release_date}
                  rating={movie.vote_average}
                />
              </div>
            ))}
          </div>
        </MediaCarousel>
      )}

      {/* Now Playing */}
      {nowPlayingMovies && nowPlayingMovies.length > 0 && (
        <MediaCarousel title="Now Playing" subtitle="Currently in theaters" viewAllLink="/movies?status=Released">
          <div className="flex gap-3 md:gap-4">
            {nowPlayingMovies.map((movie) => (
              <div key={movie.id} className="w-36 md:w-44 shrink-0">
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  releaseDate={movie.release_date}
                  rating={movie.vote_average}
                />
              </div>
            ))}
          </div>
        </MediaCarousel>
      )}

      {/* Upcoming */}
      {upcomingMovies && upcomingMovies.length > 0 && (
        <MediaCarousel title="Coming Soon" subtitle="Upcoming releases" viewAllLink="/movies?sort=release_date">
          <div className="flex gap-3 md:gap-4">
            {upcomingMovies.map((movie) => (
              <div key={movie.id} className="w-36 md:w-44 shrink-0">
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  releaseDate={movie.release_date}
                  rating={movie.vote_average}
                />
              </div>
            ))}
          </div>
        </MediaCarousel>
      )}

      {/* Top Rated Series */}
      {topRatedSeries && topRatedSeries.length > 0 && (
        <MediaCarousel title="Top Rated Series" subtitle="Must-watch television" viewAllLink="/series?sort=vote_average">
          <div className="flex gap-3 md:gap-4">
            {topRatedSeries.map((series) => (
              <div key={series.id} className="w-36 md:w-44 shrink-0">
                <SeriesCard
                  id={series.id}
                  name={series.name}
                  posterPath={series.poster_path}
                  firstAirDate={series.first_air_date}
                  rating={series.vote_average}
                />
              </div>
            ))}
          </div>
        </MediaCarousel>
      )}

      {/* Trending People */}
      {trendingPeople && trendingPeople.length > 0 && (
        <MediaCarousel title="Popular People" subtitle="Most popular right now">
          <div className="flex gap-6 md:gap-8">
            {trendingPeople.map((person) => (
              <PersonCard
                key={person.id}
                id={person.id}
                name={person.name}
                profilePath={person.profile_path}
                knownFor={person.known_for_department}
              />
            ))}
          </div>
        </MediaCarousel>
      )}

      {/* Latest Reviews */}
      {trendingReviews && trendingReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <h2 className="text-xl md:text-2xl font-bold text-text font-[family-name:var(--font-display)] mb-6">
            Latest Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingReviews.slice(0, 6).map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                content={review.content}
                rating={review.rating}
                likesCount={review.likes_count}
                commentsCount={review.comments_count}
                createdAt={review.created_at}
                containsSpoilers={review.contains_spoilers}
                user={review.user || null}
              />
            ))}
          </div>
        </section>
      )}

      {/* News */}
      {news && news.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <h2 className="text-xl md:text-2xl font-bold text-text font-[family-name:var(--font-display)] mb-6">
            Latest News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.slug}`}
                className="bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border-hover transition-colors group"
              >
                {item.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <Badge variant="outline" size="sm" className="mb-2">{item.category}</Badge>
                  <h3 className="text-sm font-medium text-text group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
