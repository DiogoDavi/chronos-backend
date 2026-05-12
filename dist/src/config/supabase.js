"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
