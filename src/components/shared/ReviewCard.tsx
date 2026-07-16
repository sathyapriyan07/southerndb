import { Link } from "react-router-dom";
import { cn, truncate, formatDate } from "@/lib/utils";
import { posterUrl } from "@/lib/supabase";
import { StarRating } from "@/components/shared/StarRating";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewCardProps {
  id: string;
  content: string;
  rating: number | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  containsSpoilers: boolean;
  user: { username: string; display_name: string; avatar_url: string | null } | null;
  media?: { title?: string; name?: string; poster_path: string | null } | null;
  mediaType?: "movie" | "series";
  mediaId?: string;
  className?: string;
}

export function ReviewCard({ id, content, rating, likesCount, commentsCount, createdAt, containsSpoilers, user, media, mediaType, mediaId, className }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-bg-card border border-border rounded-xl p-4 hover:border-border-hover transition-colors", className)}
    >
      {user && (
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/profile/${user.username}`}>
            <Avatar src={user.avatar_url} name={user.display_name} size="sm" />
          </Link>
          <div>
            <Link to={`/profile/${user.username}`} className="text-sm font-medium text-text hover:text-primary transition-colors">
              {user.display_name}
            </Link>
            <p className="text-xs text-text-muted">{formatDate(createdAt)}</p>
          </div>
          <div className="ml-auto">
            <StarRating rating={rating || 0} size="sm" />
          </div>
        </div>
      )}

      {media && mediaId && (
        <Link to={`/${mediaType}/${mediaId}`} className="flex items-center gap-3 mb-3 p-2 bg-surface rounded-lg">
          <img src={posterUrl(media.poster_path, "small")} alt="" className="w-10 h-14 rounded object-cover" />
          <span className="text-sm font-medium text-text">{media.title || media.name}</span>
        </Link>
      )}

      <div className="mb-3">
        {containsSpoilers ? (
          <details className="group">
            <summary className="text-sm text-text-secondary cursor-pointer hover:text-text">Contains spoilers — click to reveal</summary>
            <p className="text-sm text-text mt-2 leading-relaxed">{content}</p>
          </details>
        ) : (
          <p className="text-sm text-text leading-relaxed">{truncate(content, 300)}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-text-muted">
        <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
          <Heart className="w-3.5 h-3.5" />
          {likesCount}
        </button>
        <button className="flex items-center gap-1.5 text-xs hover:text-text transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          {commentsCount}
        </button>
      </div>
    </motion.div>
  );
}
