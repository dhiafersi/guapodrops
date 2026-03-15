import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.DATABASE_SUPABASE_URL || process.env.NEXT_PUBLIC_DATABASE_SUPABASE_URL;
const supabaseKey = process.env.DATABASE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // We don't throw here to avoid crashing build, but we will log when used
  console.warn("Supabase credentials missing in environment variables.");
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
