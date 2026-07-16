import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { posterUrl } from "@/lib/supabase";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { Heart, List } from "lucide-react";
import { motion } from "framer-motion";

interface ListCardProps {
  id: string;
  name: string;
  description?: string | null;
  itemsCount: number;
  likesCount: number;
  isRanked?: boolean;
  posters?: (string | null)[];
  username?: string;
  className?: string;
}

export function ListCard({ id, name, description, itemsCount, likesCount, isRanked, posters = [], username, className }: ListCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group", className)}
    >
      <Link to={`/list/${id}`} className="block">
        <div className="relative flex gap-1 mb-2 rounded-lg overflow-hidden h-32 bg-surface">
          {posters.slice(0, 4).map((poster, i) => (
            <div key={i} className="flex-1 overflow-hidden">
              <ImageWithLoader
                src={posterUrl(poster, "small")}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {posters.length < 4 && (
            <div className="absolute bottom-2 right-2 bg-surface/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md text-text-secondary">
              {itemsCount} items
            </div>
          )}
          {isRanked && (
            <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded text-white font-medium">
              RANKED
            </div>
          )}
        </div>

        <h3 className="text-sm font-medium text-text group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
          <span>{itemsCount} items</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {likesCount}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
