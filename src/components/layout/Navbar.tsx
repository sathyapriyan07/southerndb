import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { globalSearch } from "@/services/search";
import { cn } from "@/lib/utils";
import { posterUrl, profileUrl } from "@/lib/supabase";
import { Search, Menu, X, Bell, User, Film, Tv, LogOut, Settings, Shield, Bookmark, Star, List, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ movies: { id: string; title: string; poster_path: string | null }[]; series: { id: string; name: string; poster_path: string | null }[]; people: { id: string; name: string; profile_path: string | null }[] }>({ movies: [], series: [], people: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults({ movies: [], series: [], people: [] });
      return;
    }
    const timer = setTimeout(async () => {
      const results = await globalSearch(searchQuery);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/series", label: "Series", icon: Tv },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass py-2" : "bg-transparent py-3"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl md:text-2xl font-black font-[family-name:var(--font-display)] tracking-tight">
              <span className="text-primary">Southern</span>
              <span className="text-text">DB</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors",
                  location.pathname.startsWith(link.to)
                    ? "text-text"
                    : "text-text-secondary hover:text-text"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "text-sm font-medium transition-colors",
                  location.pathname.startsWith("/admin")
                    ? "text-text"
                    : "text-text-secondary hover:text-text"
                )}
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div ref={searchRef} className="relative">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full transition-all duration-300",
                  searchOpen
                    ? "bg-surface border border-border w-64 md:w-96 px-4"
                    : "bg-transparent w-auto px-0"
                )}
              >
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-text-secondary hover:text-text transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                {searchOpen && (
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery) {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }
                    }}
                    placeholder="Search movies, series, people..."
                    className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none py-2"
                  />
                )}
              </div>

              <AnimatePresence>
                {searchOpen && (searchResults.movies.length > 0 || searchResults.series.length > 0 || searchResults.people.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 right-0 w-80 md:w-96 glass rounded-xl overflow-hidden shadow-xl"
                  >
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                      {searchResults.movies.length > 0 && (
                        <div>
                          <p className="text-xs text-text-muted px-3 py-1.5 uppercase font-medium">Movies</p>
                          {searchResults.movies.slice(0, 4).map((m) => (
                            <Link
                              key={m.id}
                              to={`/movie/${m.id}`}
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
                            >
                              <img src={posterUrl(m.poster_path, "small")} alt="" className="w-8 h-12 rounded object-cover" />
                              <span className="text-sm text-text">{m.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.series.length > 0 && (
                        <div>
                          <p className="text-xs text-text-muted px-3 py-1.5 uppercase font-medium">Series</p>
                          {searchResults.series.slice(0, 4).map((s) => (
                            <Link
                              key={s.id}
                              to={`/series/${s.id}`}
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
                            >
                              <img src={posterUrl(s.poster_path, "small")} alt="" className="w-8 h-12 rounded object-cover" />
                              <span className="text-sm text-text">{s.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.people.length > 0 && (
                        <div>
                          <p className="text-xs text-text-muted px-3 py-1.5 uppercase font-medium">People</p>
                          {searchResults.people.slice(0, 3).map((p) => (
                            <Link
                              key={p.id}
                              to={`/person/${p.id}`}
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
                            >
                              <img src={profileUrl(p.profile_path, "small")} alt="" className="w-8 h-8 rounded-full object-cover" />
                              <span className="text-sm text-text">{p.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      <Link
                        to={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="block text-center text-sm text-primary hover:text-primary-hover py-3 border-t border-border"
                      >
                        View all results
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/notifications" className="relative text-text-secondary hover:text-text transition-colors hidden md:block">
                  <Bell className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <Avatar src={profile?.avatar_url} name={profile?.display_name || user.email || "User"} size="sm" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl overflow-hidden shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-medium text-text">{profile?.display_name || "User"}</p>
                        <p className="text-xs text-text-muted">@{profile?.username || "user"}</p>
                      </div>
                      <Link to={`/profile/${profile?.username}`} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/watchlist" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors">
                        <Bookmark className="w-4 h-4" /> Watchlist
                      </Link>
                      <Link to="/diary" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors">
                        <BookOpen className="w-4 h-4" /> Diary
                      </Link>
                      <Link to="/lists" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors">
                        <List className="w-4 h-4" /> Lists
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg flex items-center transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-text-secondary hover:text-text"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 pt-16 bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center gap-6 py-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors",
                    location.pathname.startsWith(link.to)
                      ? "text-text"
                      : "text-text-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-lg font-medium text-text-secondary">
                  Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
