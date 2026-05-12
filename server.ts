import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = Number(process.env.PORT) || 3333;

app.use(cors({ origin: '*', methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ ROTA CORRETA que o frontend chama <<
app.get("/api/romaneios/premises", async (_req, res) => {
  try {
    const { data: premisesData, error: premError } = await supabase.from("unit_premises").select("*");
    if (premError) throw premError;

    const { data: exceptionsData, error: excError } = await supabase.from("unit_calendar_exceptions").select("*");
    if (excError) throw excError;

    res.json({ premisesData: premisesData || [], exceptionsData: exceptionsData || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROTA CORRETA para filtros
app.get("/api/romaneios/filters", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("vw_romaneios_filtros").select("*");
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROTA CORRETA para dashboard <<
app.post("/api/romaneios/dashboard", async (req, res) => {
  try {
    const { filters = {}, from, to } = req.body;

    let query = supabase.from("view_painel_operacoes").select("*", { count: "exact" });

    if (filters.unit?.length > 0) query = query.in("unit", filters.unit);
    if (filters.priority?.length > 0) query = query.in("priority", filters.priority);
    if (filters.transportador?.length > 0) query = query.in("carrier", filters.transportador);
    if (filters.material?.length > 0) query = query.in("material", filters.material);
    if (filters.area?.length > 0) query = query.in("area", filters.area);
    if (filters.year?.length > 0) query = query.in("ano", filters.year.map(Number));
    if (filters.month?.length > 0) query = query.in("mes", filters.month.map(Number));
    if (filters.day?.length > 0) query = query.in("dia", filters.day.map(Number));

    if (from !== undefined && to !== undefined) query = query.range(from, to);

    const { data, error, count } = await query
      .order("ano", { ascending: false })
      .order("mes", { ascending: false })
      .order("dia", { ascending: false })
      .order("ts_inicial", { ascending: false });

    if (error) throw error;
    res.json({ data: data || [], count: count || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (_req, res) => res.send("🚀 Chronos Logistics API Online"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Backend] Rodando na porta ${PORT}`);
});