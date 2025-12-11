-- Migration: 0001_auth_overhaul.sql
-- Description: Updates role constraints and adds auto-promotion for specific admin email.

BEGIN;

-- 1. Update 'users' table role constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
  role IN ('patient', 'practitioner', 'admin', 'receptionist')
);

-- 2. Update 'profiles' table role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE public.profiles ADD CONSTRAINT valid_role CHECK (
  role IN ('patient', 'practitioner', 'admin', 'receptionist')
);

-- 3. Ensure Phone is nullable
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

-- 4. Create Trigger Function to Auto-Promote Admin
CREATE OR REPLACE FUNCTION public.handle_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'admin@ezbillify.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach Trigger to 'users' table (runs before insert)
DROP TRIGGER IF EXISTS promote_admin_user_trigger ON public.users;
CREATE TRIGGER promote_admin_user_trigger
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_admin_promotion();

-- 6. Attach Trigger to 'profiles' table (if used separately)
DROP TRIGGER IF EXISTS promote_admin_profile_trigger ON public.profiles;
CREATE TRIGGER promote_admin_profile_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_admin_promotion();

COMMIT;
