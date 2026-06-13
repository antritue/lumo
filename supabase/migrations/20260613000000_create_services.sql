-- Create services table for user-definable service catalog
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  name text not null,
  unit_label text,
  pricing_type text not null check (pricing_type in ('flat', 'variable')),
  flat_amount numeric,
  unit_price numeric
);

-- Enable Row Level Security (RLS)
alter table services enable row level security;

-- RLS Policies: Scope all operations to authenticated user's own data

-- Select: Users can read only their own services
create policy "Users can select own services"
  on services
  for select
  using (auth.uid() = user_id);

-- Insert: Users can insert services only for themselves
create policy "Users can insert own services"
  on services
  for insert
  with check (auth.uid() = user_id);

-- Update: Users can update only their own services
create policy "Users can update own services"
  on services
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete: Users can delete only their own services
create policy "Users can delete own services"
  on services
  for delete
  using (auth.uid() = user_id);

-- Auto-seed default services when a new user signs up
create or replace function public.handle_new_user_services()
returns trigger as $$
begin
  insert into public.services (user_id, name, unit_label, pricing_type)
  values
    (new.id, 'Electricity', 'kWh', 'variable'),
    (new.id, 'Water', 'm³', 'variable');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_services
  after insert on auth.users
  for each row execute function public.handle_new_user_services();
