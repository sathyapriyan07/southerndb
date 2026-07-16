import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const MoviesPage = lazy(() => import("@/pages/MoviesPage").then((m) => ({ default: m.MoviesPage })));
const SeriesPage = lazy(() => import("@/pages/SeriesPage").then((m) => ({ default: m.SeriesPage })));
const MovieDetailPage = lazy(() => import("@/pages/MovieDetailPage").then((m) => ({ default: m.MovieDetailPage })));
const SeriesDetailPage = lazy(() => import("@/pages/SeriesDetailPage").then((m) => ({ default: m.SeriesDetailPage })));
const PersonDetailPage = lazy(() => import("@/pages/PersonDetailPage").then((m) => ({ default: m.PersonDetailPage })));
const SearchPage = lazy(() => import("@/pages/SearchPage").then((m) => ({ default: m.SearchPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("@/pages/SignupPage").then((m) => ({ default: m.SignupPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const WatchlistPage = lazy(() => import("@/pages/WatchlistPage").then((m) => ({ default: m.WatchlistPage })));
const DiaryPage = lazy(() => import("@/pages/DiaryPage").then((m) => ({ default: m.DiaryPage })));
const ListsPage = lazy(() => import("@/pages/ListsPage").then((m) => ({ default: m.ListsPage })));
const ListDetailPage = lazy(() => import("@/pages/ListDetailPage").then((m) => ({ default: m.ListDetailPage })));
const GenrePage = lazy(() => import("@/pages/GenrePage").then((m) => ({ default: m.GenrePage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminImport = lazy(() => import("@/pages/admin/AdminImport").then((m) => ({ default: m.AdminImport })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function Layout() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
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
  );
}
