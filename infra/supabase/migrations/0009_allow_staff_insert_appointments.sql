-- Policy: Receptionists and Admins can insert appointments
CREATE POLICY "Staff can insert appointments"
ON public.appointments
FOR INSERT
WITH CHECK (
  exists (
    select 1 from public.users
    where id = auth.uid() and role IN ('receptionist', 'admin')
  )
);
