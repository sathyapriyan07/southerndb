import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck } from "lucide-react";

interface UserCardProps {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  followersCount: number;
  reviewsCount: number;
  isFollowing?: boolean;
  onFollow?: () => void;
  className?: string;
}

export function UserCard({ username, displayName, avatarUrl, followersCount, reviewsCount, isFollowing, onFollow, className }: UserCardProps) {
  return (
    <div className={cn("bg-bg-card border border-border rounded-xl p-4 hover:border-border-hover transition-colors", className)}>
      <div className="flex items-center gap-3">
        <Link to={`/profile/${username}`}>
          <Avatar src={avatarUrl} name={displayName} size="lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${username}`} className="text-sm font-medium text-text hover:text-primary transition-colors line-clamp-1">
            {displayName}
          </Link>
          <p className="text-xs text-text-muted">@{username}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            <span>{followersCount} followers</span>
            <span>{reviewsCount} reviews</span>
          </div>
        </div>
        {onFollow && (
          <button
            onClick={onFollow}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors",
              isFollowing
                ? "bg-surface hover:bg-surface-hover text-text border border-border"
                : "bg-primary hover:bg-primary-hover text-white"
            )}
          >
            {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}
