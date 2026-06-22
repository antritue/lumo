-- Create room_services table for room-level service overrides
-- Services are self-contained per room (no FK dependency on global services table)
create table if not exists room_services (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  service_id uuid not null,
  user_id uuid not null references auth.users(id),
  service_name text not null,
  pricing_type text not null check (pricing_type in ('flat', 'variable')),
  unit_label text,
  flat_amount numeric,
  unit_price numeric,
  unique (room_id, service_id)
);

-- Enable Row Level Security (RLS)
alter table room_services enable row level security;

-- RLS Policies: Scope all operations to authenticated user's own data (via user_id)

create policy "Users can select own room services"
  on room_services
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own room services"
  on room_services
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own room services"
  on room_services
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own room services"
  on room_services
  for delete
  using (auth.uid() = user_id);
