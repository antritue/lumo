-- Drop old room_services table and create room_service_overrides from scratch.
-- No data migration needed (no active users/live data).

-- Step A: Drop old table
DROP TABLE IF EXISTS room_services;

-- Step B: Create new table
CREATE TABLE room_service_overrides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES property_services(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  is_enabled boolean NOT NULL DEFAULT true,
  custom_flat_amount numeric,
  custom_unit_price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (room_id, service_id)
);

-- Step C: Enable RLS
ALTER TABLE room_service_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own room service overrides"
  ON room_service_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own room service overrides"
  ON room_service_overrides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own room service overrides"
  ON room_service_overrides FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own room service overrides"
  ON room_service_overrides FOR DELETE
  USING (auth.uid() = user_id);
