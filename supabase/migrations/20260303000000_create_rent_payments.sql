-- Create rent_payments table for tracking room rent payments
create table if not exists rent_payments (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  period text not null,
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'paid'))
);

-- Unique constraint: one payment record per room per period
create unique index if not exists idx_rent_payments_room_period
  on rent_payments (room_id, period);

-- Enable Row Level Security (RLS)
alter table rent_payments enable row level security;

-- RLS Policies: Scope all operations to authenticated user's own data

-- Select: Users can read only their own payments
create policy "Users can select own rent payments"
  on rent_payments
  for select
  using (auth.uid() = user_id);

-- Insert: Users can insert payments only for themselves
create policy "Users can insert own rent payments"
  on rent_payments
  for insert
  with check (auth.uid() = user_id);

-- Update: Users can update only their own payments
create policy "Users can update own rent payments"
  on rent_payments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete: Users can delete only their own payments
create policy "Users can delete own rent payments"
  on rent_payments
  for delete
  using (auth.uid() = user_id);
