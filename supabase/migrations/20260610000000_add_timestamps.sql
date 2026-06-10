-- Add timestamp columns to properties and rooms for ordering

alter table properties
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table rooms
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Auto-update updated_at on row modification
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_properties_updated_at
  before update on properties
  for each row
  execute function update_updated_at();

create trigger set_rooms_updated_at
  before update on rooms
  for each row
  execute function update_updated_at();
