-- Create waitlist table
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table waitlist enable row level security;

-- Create policy to allow inserts from the anon role (browser client)
create policy "Allow anonymous inserts"
  on waitlist
  for insert
  with check (true);
