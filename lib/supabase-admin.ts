import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
	throw new Error("Supabase admin environment variables are missing.");
}

// Admin client using the service_role key — server-side only, never exposed to the client.
// Required for operations like deleting auth.users records.
export const createSupabaseAdminClient = () => {
	return createClient(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};
