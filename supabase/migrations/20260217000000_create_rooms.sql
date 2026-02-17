-- Create rooms table for property room management
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references properties(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  name text not null,
  monthly_rent numeric,
  notes text
);

-- Enable Row Level Security (RLS)
alter table rooms enable row level security;

-- RLS Policies: Scope all operations to authenticated user's own data

-- Select: Users can read only their own rooms
create policy "Users can select own rooms"
  on rooms
  for select
  using (auth.uid() = user_id);

-- Insert: Users can insert rooms only for themselves
create policy "Users can insert own rooms"
  on rooms
  for insert
  with check (auth.uid() = user_id);

-- Update: Users can update only their own rooms
create policy "Users can update own rooms"
  on rooms
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete: Users can delete only their own rooms
create policy "Users can delete own rooms"
  on rooms
  for delete
  using (auth.uid() = user_id);
