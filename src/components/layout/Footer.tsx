import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-elevated mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Browse</h4>
            <div className="space-y-2">
              <Link to="/movies" className="block text-sm text-text-secondary hover:text-text transition-colors">Movies</Link>
              <Link to="/series" className="block text-sm text-text-secondary hover:text-text transition-colors">Series</Link>
              <Link to="/search" className="block text-sm text-text-secondary hover:text-text transition-colors">Search</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Community</h4>
            <div className="space-y-2">
              <Link to="/reviews" className="block text-sm text-text-secondary hover:text-text transition-colors">Reviews</Link>
              <Link to="/lists" className="block text-sm text-text-secondary hover:text-text transition-colors">Lists</Link>
              <Link to="/awards" className="block text-sm text-text-secondary hover:text-text transition-colors">Awards</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">Account</h4>
            <div className="space-y-2">
              <Link to="/login" className="block text-sm text-text-secondary hover:text-text transition-colors">Sign In</Link>
              <Link to="/settings" className="block text-sm text-text-secondary hover:text-text transition-colors">Settings</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text mb-4">About</h4>
            <div className="space-y-2">
              <span className="block text-sm text-text-secondary">A cinematic database</span>
              <span className="block text-sm text-text-secondary">Powered by Supabase</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-black font-[family-name:var(--font-display)]">
              <span className="text-primary">Southern</span>
              <span className="text-text">DB</span>
            </span>
          </Link>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} SouthernDB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
