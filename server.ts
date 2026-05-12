// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import { supabase } from "./src/config/supabase.js"; // Importe seu client do supabase
// import romaneiosRoutes from "./src/routes/romaneiosRoutes.js";

// const app = express();
// const PORT = Number(process.env.PORT) || 3333;

// // ─── CORS ───────────────────────────────────────────────────
// const allowedOrigins = process.env.FRONTEND_URL
//   ? [process.env.FRONTEND_URL]
//   : ["http://localhost:3000", "http://localhost:5173", "https://seu-projeto.vercel.app"]; // Adicione sua URL da vercel aqui se o env falhar

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       // Se estiver dando erro de CORS na Vercel, mude temporariamente para: callback(null, true)
//       if (allowedOrigins.includes(origin)) return callback(null, true);

//       // Fallback para não travar o deploy enquanto ajusta as URLs
//       callback(null, true);
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

// app.use(express.json());

// // ─── Health Check ───────────────────────────────────────────
// app.get("/api/health", (_req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // ─── NOVA ROTA: Premises (Sincronização do Frontend) ────────
// // O usePremisesStore busca exatamente este endpoint
// app.get("/api/premises", async (_req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("unit_premises")
//       .select("*");

//     if (error) throw error;

//     // Formata o array para o objeto indexado por 'unit' que o front espera
//     const formatted = data.reduce((acc: any, item: any) => {
//       acc[item.unit] = {
//         ...item,
//         operatingDays: item.operating_days || [1, 2, 3, 4, 5],
//       };
//       return acc;
//     }, {});

//     res.json(formatted);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ─── Outras Rotas ───────────────────────────────────────────
// app.use("/api/romaneios", romaneiosRoutes);

// // Rota raiz para evitar "Cannot GET /" no navegador
// app.get("/", (_req, res) => {
//   res.send("🚀 Chronos Logistics API Online");
// });

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`[Backend] API rodando em http://0.0.0.0:${PORT}`);
// });


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

// ✅ ROTA CORRETA que o frontend chama
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

// ✅ ROTA CORRETA para dashboard
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