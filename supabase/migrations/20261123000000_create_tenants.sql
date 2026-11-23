-- Create tenants table for landlord tenant management
create table if not exists tenants (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  room_id uuid references rooms(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- A room can have at most one active tenant. Postgres allows multiple NULLs,
-- so deactivated tenants (room_id null) are unconstrained.
create unique index if not exists tenants_room_id_key on tenants (room_id);

-- Auto-update updated_at on row modification
create trigger set_tenants_updated_at
  before update on tenants
  for each row
  execute function update_updated_at();

-- Enable Row Level Security (RLS)
alter table tenants enable row level security;

-- RLS Policies: Scope all operations to authenticated user's own data

-- Select: Users can read only their own tenants
create policy "Users can select own tenants"
  on tenants
  for select
  using (auth.uid() = user_id);

-- Insert: Users can insert tenants only for themselves
create policy "Users can insert own tenants"
  on tenants
  for insert
  with check (auth.uid() = user_id);

-- Update: Users can update only their own tenants
create policy "Users can update own tenants"
  on tenants
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete: Users can delete only their own tenants
create policy "Users can delete own tenants"
  on tenants
  for delete
  using (auth.uid() = user_id);
