import { Link } from "react-router-dom";
import { cn, formatYear } from "@/lib/utils";
import { posterUrl } from "@/lib/supabase";
import { RatingBadge } from "@/components/shared/StarRating";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { Bookmark, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface MovieCardProps {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  rating: number;
  className?: string;
  showActions?: boolean;
  onWatchlist?: () => void;
}

export function MovieCard({ id, title, posterPath, releaseDate, rating, className, showActions, onWatchlist }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("group relative", className)}
    >
      <Link to={`/movie/${id}`} className="block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden poster-shadow group-hover:poster-shadow-hover transition-shadow duration-300">
          <ImageWithLoader
            src={posterUrl(posterPath, "medium")}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {rating > 0 && (
            <div className="absolute top-2 right-2">
              <RatingBadge rating={rating} />
            </div>
          )}

          {showActions && (
            <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWatchlist?.();
                }}
                className="flex-1 h-8 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Bookmark className="w-3 h-3" />
                Watchlist
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="h-8 w-8 bg-surface/80 hover:bg-surface text-text text-xs rounded-lg flex items-center justify-center transition-colors"
              >
                <Eye className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-2 px-0.5">
          <h3 className="text-sm font-medium text-text line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {formatYear(releaseDate)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
