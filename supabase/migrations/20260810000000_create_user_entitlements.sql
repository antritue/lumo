-- Create user_entitlements table for paid-tier tracking (Polar-backed)
create table if not exists user_entitlements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique references auth.users(id),
  polar_customer_id text,
  tier text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table user_entitlements enable row level security;

-- Select: Users can read only their own entitlement (writes happen via service-role webhook client)
create policy "Users can select own entitlement"
  on user_entitlements
  for select
  using (auth.uid() = user_id);

-- Auto-update updated_at on row modification
create trigger set_user_entitlements_updated_at
  before update on user_entitlements
  for each row
  execute function update_updated_at();
