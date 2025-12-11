-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = patient_id);

-- Policy: Patients can insert their own appointments
CREATE POLICY "Patients can insert own appointments"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Policy: Receptionists and Admins can view ALL appointments
CREATE POLICY "Staff can view all appointments"
ON public.appointments
FOR SELECT
USING (
  exists (
    select 1 from public.users
    where id = auth.uid() and role IN ('receptionist', 'admin', 'practitioner')
  )
);

-- Policy: Receptionists and Admins can update appointments
CREATE POLICY "Staff can update appointments"
ON public.appointments
FOR UPDATE
USING (
  exists (
    select 1 from public.users
    where id = auth.uid() and role IN ('receptionist', 'admin')
  )
);
