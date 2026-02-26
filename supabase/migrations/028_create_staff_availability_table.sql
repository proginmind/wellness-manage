-- =====================================================
-- Create staff availability table
-- =====================================================

create table public.staff_availability (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  day_of_week integer CHECK (day_of_week between 0 and 6) not null,
  start_time time not null,
  end_time time not null,
  is_available boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint valid_time_range check (start_time < end_time),
  constraint unique_availability unique (profile_id, day_of_week, start_time, end_time)
);

create index idx_staff_availability_profile_id on public.staff_availability(profile_id);
create index idx_staff_availability_organization_id on public.staff_availability(organization_id);

create or replace function public.update_staff_availability_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_staff_availability_updated_at before update on public.staff_availability for each row execute function public.update_staff_availability_updated_at_column();

alter table public.staff_availability enable row level security;

create policy "Authenticated users can read staff availability" on public.staff_availability for select to authenticated using (true);
create policy "Authenticated users can create staff availability" on public.staff_availability for insert to authenticated with check (true);
create policy "Authenticated users can update staff availability" on public.staff_availability for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete staff availability" on public.staff_availability for delete to authenticated using (true);
