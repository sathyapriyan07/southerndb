import { Link } from "react-router-dom";
import { cn, formatYear } from "@/lib/utils";
import { posterUrl } from "@/lib/supabase";
import { RatingBadge } from "@/components/shared/StarRating";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { motion } from "framer-motion";

interface SeriesCardProps {
  id: string;
  name: string;
  posterPath: string | null;
  firstAirDate: string | null;
  rating: number;
  className?: string;
}

export function SeriesCard({ id, name, posterPath, firstAirDate, rating, className }: SeriesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("group relative", className)}
    >
      <Link to={`/series/${id}`} className="block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden poster-shadow group-hover:poster-shadow-hover transition-shadow duration-300">
          <ImageWithLoader
            src={posterUrl(posterPath, "medium")}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {rating > 0 && (
            <div className="absolute top-2 right-2">
              <RatingBadge rating={rating} />
            </div>
          )}
        </div>

        <div className="mt-2 px-0.5">
          <h3 className="text-sm font-medium text-text line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {formatYear(firstAirDate)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
