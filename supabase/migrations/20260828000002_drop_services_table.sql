-- Drop the global services table (replaced by property_services as source of truth).
-- Also drops the on_auth_user_created_services trigger and handle_new_user_services() function.
DROP TABLE IF EXISTS services CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_services() CASCADE;
