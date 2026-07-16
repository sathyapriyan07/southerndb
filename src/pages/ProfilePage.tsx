import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/services/users";
import { getReviews } from "@/services/reviews";
import { useAuth } from "@/contexts/AuthContext";
import { toggleFollow } from "@/services/users";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { UserPlus, UserCheck, Settings } from "lucide-react";

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getProfile(username!),
    enabled: !!username,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["user-reviews", profile?.id],
    queryFn: () => getReviews({ userId: profile?.id }),
    enabled: !!profile?.id,
  });

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(currentUser!.id, profile!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", username] }),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><p className="text-text-muted">User not found</p></div>;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-bold text-text">{profile.display_name}</h1>
            <p className="text-sm text-text-muted">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-text-secondary mt-2">{profile.bio}</p>}
            <div className="flex items-center justify-center md:justify-start gap-6 mt-3 text-sm">
              <span className="text-text"><strong>{profile.followers_count}</strong> <span className="text-text-muted">followers</span></span>
              <span className="text-text"><strong>{profile.following_count}</strong> <span className="text-text-muted">following</span></span>
              <span className="text-text"><strong>{profile.reviews_count}</strong> <span className="text-text-muted">reviews</span></span>
            </div>
            {!isOwnProfile && currentUser && (
              <Button
                variant={profile.is_following ? "outline" : "primary"}
                size="sm"
                className="mt-4"
                onClick={() => followMutation.mutate()}
              >
                {profile.is_following ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
              </Button>
            )}
            {isOwnProfile && (
              <Link to="/settings" className="inline-flex items-center gap-1 mt-4 text-sm text-text-secondary hover:text-text">
                <Settings className="w-4 h-4" /> Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-border pb-4">
          <Link to={`/profile/${username}/reviews`} className="text-sm font-medium text-primary">Reviews</Link>
          <Link to={`/profile/${username}/lists`} className="text-sm font-medium text-text-muted hover:text-text">Lists</Link>
          <Link to={`/profile/${username}/watchlist`} className="text-sm font-medium text-text-muted hover:text-text">Watchlist</Link>
          <Link to={`/profile/${username}/favorites`} className="text-sm font-medium text-text-muted hover:text-text">Favorites</Link>
        </div>

        {reviewsData && reviewsData.data.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.data.map((review) => (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-text-muted">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
