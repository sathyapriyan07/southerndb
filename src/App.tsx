import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function lazyWithRetry(factory: () => Promise<{ default: React.ComponentType }>) {
  return lazy(() =>
    factory().catch((err) => {
      if (err?.message?.includes("Failed to fetch dynamically imported module")) {
        window.location.reload();
      }
      throw err;
    })
  );
}

const HomePage = lazyWithRetry(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const MoviesPage = lazyWithRetry(() => import("@/pages/MoviesPage").then((m) => ({ default: m.MoviesPage })));
const SeriesPage = lazyWithRetry(() => import("@/pages/SeriesPage").then((m) => ({ default: m.SeriesPage })));
const MovieDetailPage = lazyWithRetry(() => import("@/pages/MovieDetailPage").then((m) => ({ default: m.MovieDetailPage })));
const SeriesDetailPage = lazyWithRetry(() => import("@/pages/SeriesDetailPage").then((m) => ({ default: m.SeriesDetailPage })));
const PersonDetailPage = lazyWithRetry(() => import("@/pages/PersonDetailPage").then((m) => ({ default: m.PersonDetailPage })));
const SearchPage = lazyWithRetry(() => import("@/pages/SearchPage").then((m) => ({ default: m.SearchPage })));
const LoginPage = lazyWithRetry(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazyWithRetry(() => import("@/pages/SignupPage").then((m) => ({ default: m.SignupPage })));
const ProfilePage = lazyWithRetry(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const WatchlistPage = lazyWithRetry(() => import("@/pages/WatchlistPage").then((m) => ({ default: m.WatchlistPage })));
const DiaryPage = lazyWithRetry(() => import("@/pages/DiaryPage").then((m) => ({ default: m.DiaryPage })));
const ListsPage = lazyWithRetry(() => import("@/pages/ListsPage").then((m) => ({ default: m.ListsPage })));
const ListDetailPage = lazyWithRetry(() => import("@/pages/ListDetailPage").then((m) => ({ default: m.ListDetailPage })));
const GenrePage = lazyWithRetry(() => import("@/pages/GenrePage").then((m) => ({ default: m.GenrePage })));
const SettingsPage = lazyWithRetry(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const AdminDashboard = lazyWithRetry(() => import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminImport = lazyWithRetry(() => import("@/pages/admin/AdminImport").then((m) => ({ default: m.AdminImport })));
const AdminMoviesPage = lazyWithRetry(() => import("@/pages/admin/AdminMoviesPage").then((m) => ({ default: m.AdminMoviesPage })));
const AdminSeriesPage = lazyWithRetry(() => import("@/pages/admin/AdminSeriesPage").then((m) => ({ default: m.AdminSeriesPage })));
const AdminPeoplePage = lazyWithRetry(() => import("@/pages/admin/AdminPeoplePage").then((m) => ({ default: m.AdminPeoplePage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function Layout() {
  return (
    <ErrorBoundary>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
          <Route path="movies" element={<Suspense fallback={<PageLoader />}><MoviesPage /></Suspense>} />
          <Route path="series" element={<Suspense fallback={<PageLoader />}><SeriesPage /></Suspense>} />
          <Route path="movie/:id" element={<Suspense fallback={<PageLoader />}><MovieDetailPage /></Suspense>} />
          <Route path="series/:id" element={<Suspense fallback={<PageLoader />}><SeriesDetailPage /></Suspense>} />
          <Route path="person/:id" element={<Suspense fallback={<PageLoader />}><PersonDetailPage /></Suspense>} />
          <Route path="search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
          <Route path="login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
          <Route path="signup" element={<Suspense fallback={<PageLoader />}><SignupPage /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
          <Route path="profile/:username" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
          <Route path="watchlist" element={<Suspense fallback={<PageLoader />}><WatchlistPage /></Suspense>} />
          <Route path="diary" element={<Suspense fallback={<PageLoader />}><DiaryPage /></Suspense>} />
          <Route path="lists" element={<Suspense fallback={<PageLoader />}><ListsPage /></Suspense>} />
          <Route path="list/:id" element={<Suspense fallback={<PageLoader />}><ListDetailPage /></Suspense>} />
          <Route path="genre/:slug" element={<Suspense fallback={<PageLoader />}><GenrePage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
          <Route path="admin/import" element={<Suspense fallback={<PageLoader />}><AdminImport /></Suspense>} />
          <Route path="admin/movies" element={<Suspense fallback={<PageLoader />}><AdminMoviesPage /></Suspense>} />
          <Route path="admin/series" element={<Suspense fallback={<PageLoader />}><AdminSeriesPage /></Suspense>} />
          <Route path="admin/people" element={<Suspense fallback={<PageLoader />}><AdminPeoplePage /></Suspense>} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-black font-[family-name:var(--font-display)] text-primary mb-4">404</h1>
                <p className="text-text-muted mb-4">Page not found</p>
                <a href="/" className="text-primary hover:text-primary-hover">Go home</a>
              </div>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
