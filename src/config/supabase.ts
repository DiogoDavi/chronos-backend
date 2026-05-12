import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);