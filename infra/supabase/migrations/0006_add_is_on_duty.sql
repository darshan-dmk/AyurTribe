-- Add is_on_duty column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_on_duty boolean DEFAULT false;

-- Setup RLS policies for is_on_duty if needed (updating users table is usually restricted)
-- Ensure admins/practitioners can update their own status or admins can update anyone
-- existing policies might cover 'update' based on ID, but let's ensure:

CREATE POLICY "Allow authenticated users to read is_on_duty"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Allow staff to update their own duty status
CREATE POLICY "Allow staff to update own duty status"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to update any user's duty status (assuming admin check logic exists, simplified here)
-- In a real app, we'd check if auth.uid() is an admin. For now, rely on existing RLS or Supabase Service Role for admin actions.
