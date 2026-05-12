// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// dotenv.config();

// const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Supabase URL and Key are required in environment variables');
// }

// export const supabase = createClient(supabaseUrl, supabaseKey);
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL and Anon Key are required. Check that SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    realtime: {
      transport: ws
    }
  }
);