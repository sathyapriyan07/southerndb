-- ============================================================
-- FIX: Table-level GRANT permissions for anon/authenticated/service_role
-- Run this in Supabase SQL Editor to fix "permission denied" errors.
-- ============================================================

-- anon: read-only for public browsing
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- authenticated: full DML for logged-in users (RLS governs access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- service_role: full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO service_role;
