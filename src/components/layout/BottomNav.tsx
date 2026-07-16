import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Film, Tv, Search, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/movies", icon: Film, label: "Movies" },
    { to: "/series", icon: Tv, label: "Series" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/profile", icon: User, label: "Me" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border md:hidden" aria-label="Bottom navigation">
      <div className="flex items-center justify-around py-2 px-4">
        {items.map((item) => {
          const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors min-w-[48px]",
                isActive ? "text-primary" : "text-text-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
