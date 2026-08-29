-- Remove service_id from property_services (leftover from global services table).
-- service_name is the actual identifier; id (PK) is used for FK references.
ALTER TABLE property_services DROP COLUMN service_id;
ALTER TABLE property_services DROP CONSTRAINT IF EXISTS property_services_property_id_service_id_key;
ALTER TABLE property_services ADD UNIQUE (property_id, service_name);
