-- Migration: 0004_emergency_disable_rls.sql
-- Description: TEMPORARILY DISABLES Row Level Security (RLS) on public.users to unblock login. 
-- Debugging measure to confirm Policy recursion or lock issues.

BEGIN;

-- 1. Disable RLS on the users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop the recursive policies to be safe for when we re-enable it later
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- 3. Ensure simple self-access exists (though RLS is disabled, this preps for re-enable)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

COMMIT;
