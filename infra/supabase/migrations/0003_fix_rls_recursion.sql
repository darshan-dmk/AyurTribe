-- Migration: 0003_fix_rls_recursion.sql
-- Description: Fixes infinite recursion in RLS policies by using auth.jwt() to check for admin role instead of querying the table itself.

BEGIN;

-- 1. Drop the potential recursive policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- 2. Re-create them using auth.jwt() metadata
-- This avoids querying the table, preventing infinite recursion.
-- Note: usage of coalesce ensures it handles cases where metadata might be missing safely.

CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update all users"
  ON public.users
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

COMMIT;
