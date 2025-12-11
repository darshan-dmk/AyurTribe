-- Migration: 0002_ensure_users_exist.sql
-- Description: Ensures public.users records exist for all auth.users, and sets up a trigger for future users.

BEGIN;

-- 1. Create the Function to handle new user insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role, is_active, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    true,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. REPAIR: Backfill missing users from auth.users
-- This effectively fixes the broken Admin account by creating the missing record.
INSERT INTO public.users (id, email, first_name, last_name, role, is_active, is_verified)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'first_name', 'Admin'), 
  COALESCE(raw_user_meta_data->>'last_name', 'User'), 
  COALESCE(raw_user_meta_data->>'role', 'admin'), -- Default fallback to admin for older accounts if unsure, or specific logic
  true,
  true
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

COMMIT;
