-- Create Treatments Table
create table public.treatments (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  duration_minutes integer not null default 60,
  price decimal(10, 2) null,
  category text null, -- e.g., 'Rejuvenation', 'Detox', 'Consultation', 'Therapy'
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint treatments_pkey primary key (id)
);

-- Enable RLS
alter table public.treatments enable row level security;

-- Policies
-- Everyone (Authenticated) can read treatments (e.g. for booking)
create policy "Enable read access for all users"
on public.treatments for select
to authenticated
using (true);

-- Only Admins/Practitioners can insert/update/delete (Simplified to authenticated for now to unblock, ideally role-based)
create policy "Enable write access for authenticated users"
on public.treatments for all
to authenticated
using (true)
with check (true);

-- Add Trigger for updated_at
create trigger treatments_updated_at_trigger before update on public.treatments
for each row execute procedure update_updated_at_column();
