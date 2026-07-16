import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ListCard } from "@/components/shared/ListCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Plus, List } from "lucide-react";

export function ListsPage() {
  const { data: lists, isLoading } = useQuery({
    queryKey: ["popular-lists"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lists")
        .select("*, user:user_profiles(display_name, username)")
        .eq("is_public", true)
        .order("likes_count", { ascending: false })
        .limit(30);
      return data || [];
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">Lists</h1>
          <Link to="/lists/new" className="h-10 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New List
          </Link>
        </div>

        {lists && lists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                id={list.id}
                name={list.name}
                description={list.description}
                itemsCount={list.items_count}
                likesCount={list.likes_count}
                isRanked={list.is_ranked}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <List className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">No lists yet. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
