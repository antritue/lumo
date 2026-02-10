import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Supabase environment variables are missing.");
}

// Singleton instance for use in the browser only.
// This is the standard approach for client-side Supabase usage in Next.js.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
