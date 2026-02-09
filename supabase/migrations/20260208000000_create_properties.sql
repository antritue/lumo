-- Create properties table for landlord property management
create table if not exists properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  name text not null
);

-- Enable Row Level Security (RLS)
alter table properties enable row level security;

-- RLS Policies: Scope all operations to authenticated user's own data

-- Select: Users can read only their own properties
create policy "Users can select own properties"
  on properties
  for select
  using (auth.uid() = user_id);

-- Insert: Users can insert properties only for themselves
create policy "Users can insert own properties"
  on properties
  for insert
  with check (auth.uid() = user_id);

-- Update: Users can update only their own properties
create policy "Users can update own properties"
  on properties
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete: Users can delete only their own properties
create policy "Users can delete own properties"
  on properties
  for delete
  using (auth.uid() = user_id);
