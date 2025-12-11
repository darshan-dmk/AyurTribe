-- Update the check constraint for appointments status to include 'pending'
ALTER TABLE public.appointments
DROP CONSTRAINT appointments_status_check;

ALTER TABLE public.appointments
ADD CONSTRAINT appointments_status_check CHECK (
  status::text = ANY (
    ARRAY[
      'pending'::character varying,
      'scheduled'::character varying,
      'confirmed'::character varying,
      'completed'::character varying,
      'cancelled'::character varying,
      'no-show'::character varying
    ]::text[]
  )
);
