import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getList } from "@/services/users";
import { formatDate } from "@/lib/utils";
import { posterUrl } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { List } from "lucide-react";

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: list, isLoading } = useQuery({
    queryKey: ["list", id],
    queryFn: () => getList(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!list) return <div className="min-h-screen flex items-center justify-center"><p className="text-text-muted">List not found</p></div>;

  const items = (list as unknown as { items?: { movie?: { id: string; title: string; poster_path: string | null; release_date: string | null; vote_average: number }; series?: { id: string; name: string; poster_path: string | null; first_air_date: string | null; vote_average: number } }[] }).items;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-text">{list.name}</h1>
          {list.description && <p className="text-sm text-text-secondary mt-2">{list.description}</p>}
          {list.user && (
            <Link to={`/profile/${list.user.username}`} className="flex items-center gap-2 mt-3">
              <Avatar src={list.user.avatar_url} name={list.user.display_name} size="sm" />
              <span className="text-sm text-text-secondary">{list.user.display_name}</span>
            </Link>
          )}
          <div className="flex items-center gap-3 mt-3">
            <Badge>{list.items_count} items</Badge>
            {list.is_ranked && <Badge variant="gold">Ranked</Badge>}
          </div>
        </div>

        {items && items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <div key={i}>
                {item.movie ? (
                  <Link to={`/movie/${item.movie.id}`} className="block group">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden poster-shadow relative">
                      <img src={posterUrl(item.movie.poster_path, "medium")} alt={item.movie.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      {list.is_ranked && (
                        <div className="absolute top-2 left-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {i + 1}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text mt-2 line-clamp-1">{item.movie.title}</p>
                  </Link>
                ) : item.series ? (
                  <Link to={`/series/${item.series.id}`} className="block group">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden poster-shadow">
                      <img src={posterUrl(item.series.poster_path, "medium")} alt={item.series.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <p className="text-sm font-medium text-text mt-2 line-clamp-1">{item.series.name}</p>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <List className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">This list is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
