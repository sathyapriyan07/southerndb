-- ============================================================
-- SOUTHERND B — MASTER MIGRATION
-- ============================================================
-- Execute this file in order to set up the entire database.
-- Run in Supabase SQL Editor or via:
--   supabase db reset
-- ============================================================

-- Step 1: Schema (tables, indexes, types)
\ir 001_schema.sql

-- Step 2: Row Level Security policies
\ir 002_rls_policies.sql

-- Step 3: Functions & triggers
\ir 003_functions.sql

-- Step 4: Storage buckets & policies
\ir 004_storage.sql

-- Step 5: Seed data (genres, homepage sections, providers)
\ir 005_seed.sql
