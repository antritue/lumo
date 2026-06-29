-- Create rent_payment_charges table for persisting service charges per payment

create table if not exists rent_payment_charges (
  id uuid default gen_random_uuid() primary key,
  rent_payment_id uuid not null references rent_payments(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  service_id text not null,
  service_name text not null,
  pricing_type text not null check (pricing_type in ('flat', 'variable')),
  unit_label text,
  unit_price numeric,
  flat_amount numeric,
  usage numeric,
  total numeric not null,
  unique (rent_payment_id, service_id)
);

alter table rent_payment_charges enable row level security;

create policy "Users can select own charges"
  on rent_payment_charges for select
  using (auth.uid() = user_id);

create policy "Users can insert own charges"
  on rent_payment_charges for insert
  with check (auth.uid() = user_id);

create policy "Users can update own charges"
  on rent_payment_charges for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own charges"
  on rent_payment_charges for delete
  using (auth.uid() = user_id);
