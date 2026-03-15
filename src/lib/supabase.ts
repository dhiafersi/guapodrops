import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.DATABASE_SUPABASE_URL || process.env.NEXT_PUBLIC_DATABASE_SUPABASE_URL || "";
const supabaseKey = process.env.DATABASE_SUPABASE_SERVICE_ROLE_KEY || process.env.DATABASE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing in environment variables. Storage uploads will fail.");
}

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey)
    : null as any;
