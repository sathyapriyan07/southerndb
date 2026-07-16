import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getStats } from "@/services/homepage";
import { Film, Tv, Users, MessageCircle, List, TrendingUp, Upload, Settings, Layout, Newspaper } from "lucide-react";

export function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: getStats });

  const adminLinks = [
    { to: "/admin/movies", icon: Film, label: "Movies", count: stats?.totalMovies },
    { to: "/admin/series", icon: Tv, label: "Series", count: stats?.totalSeries },
    { to: "/admin/people", icon: Users, label: "People", count: stats?.totalPeople },
    { to: "/admin/reviews", icon: MessageCircle, label: "Reviews", count: stats?.totalReviews },
    { to: "/admin/users", icon: Users, label: "Users", count: stats?.totalUsers },
    { to: "/admin/lists", icon: List, label: "Lists", count: stats?.totalLists },
    { to: "/admin/import", icon: Upload, label: "Import Center" },
    { to: "/admin/homepage", icon: Layout, label: "Homepage CMS" },
    { to: "/admin/news", icon: Newspaper, label: "News" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats && (
            <>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text">{stats.totalMovies.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Movies</p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text">{stats.totalSeries.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Series</p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text">{stats.totalPeople.toLocaleString()}</p>
                <p className="text-xs text-text-muted">People</p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Users</p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text">{stats.totalReviews.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Reviews</p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text">{stats.totalLists.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Lists</p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-bg-card border border-border rounded-xl p-6 hover:border-border-hover hover:bg-surface-hover transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <link.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text">{link.label}</h3>
                  {link.count !== undefined && (
                    <p className="text-xs text-text-muted">{link.count.toLocaleString()} entries</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
