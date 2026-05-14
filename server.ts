// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.SUPABASE_URL || '';
// const supabaseKey = process.env.SUPABASE_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseKey);

// const app = express();
// const PORT = Number(process.env.PORT) || 3333;

// app.use(cors({ origin: '*', methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
// app.use(express.json());

// app.get("/api/health", (_req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // ✅ ROTA CORRETA que o frontend chama <<
// app.get("/api/romaneios/premises", async (_req, res) => {
//   try {
//     const { data: premisesData, error: premError } = await supabase.from("unit_premises").select("*");
//     if (premError) throw premError;

//     const { data: exceptionsData, error: excError } = await supabase.from("unit_calendar_exceptions").select("*");
//     if (excError) throw excError;

//     res.json({ premisesData: premisesData || [], exceptionsData: exceptionsData || [] });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ ROTA CORRETA para filtros
// app.get("/api/romaneios/filters", async (_req, res) => {
//   try {
//     const { data, error } = await supabase.from("vw_romaneios_filtros").select("*");
//     if (error) throw error;
//     res.json(data || []);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ ROTA CORRETA para dashboard <<
// app.post("/api/romaneios/dashboard", async (req, res) => {
//   try {
//     const { filters = {}, from, to } = req.body;

//     let query = supabase.from("view_painel_operacoes").select("*", { count: "exact" });

//     if (filters.unit?.length > 0) query = query.in("unit", filters.unit);
//     if (filters.priority?.length > 0) query = query.in("priority", filters.priority);
//     if (filters.transportador?.length > 0) query = query.in("carrier", filters.transportador);
//     if (filters.material?.length > 0) query = query.in("material", filters.material);
//     if (filters.area?.length > 0) query = query.in("area", filters.area);
//     if (filters.year?.length > 0) query = query.in("ano", filters.year.map(Number));
//     if (filters.month?.length > 0) query = query.in("mes", filters.month.map(Number));
//     if (filters.day?.length > 0) query = query.in("dia", filters.day.map(Number));

//     if (from !== undefined && to !== undefined) query = query.range(from, to);

//     const { data, error, count } = await query
//       .order("ano", { ascending: false })
//       .order("mes", { ascending: false })
//       .order("dia", { ascending: false })
//       .order("ts_inicial", { ascending: false });

//     if (error) throw error;
//     res.json({ data: data || [], count: count || 0 });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/", (_req, res) => res.send("🚀 Chronos Logistics API Online"));

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`[Backend] Rodando na porta ${PORT}`);
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

// ─── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Status da Sessão Microsoft ───────────────────────────────
// Lê o flag gravado pelo ONEDRIVE-READER no Supabase
app.get("/api/session/status", async (_req, res) => {
  try {
    const { data } = await supabase
      .from("app_config")
      .select("value, updated_at")
      .eq("key", "session_status")
      .single();

    const status = data?.value || "expired";
    res.json({
      status,
      needsLogin: status === "expired",
      lastUpdated: data?.updated_at || null
    });
  } catch {
    res.json({ status: "expired", needsLogin: true, lastUpdated: null });
  }
});

// ─── Login Microsoft (instrução para o ONEDRIVE-READER) ───────
// O frontend abre essa URL → explica o processo ao usuário
app.get("/api/auth/login", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reconectar Microsoft</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0f0f11; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1a1a1e; border: 1px solid #2a2a2e; border-radius: 16px; padding: 40px; max-width: 480px; text-align: center; }
        h1 { font-size: 20px; margin: 0 0 8px; }
        p { color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .steps { text-align: left; background: #111; border-radius: 10px; padding: 20px; margin: 0 0 24px; }
        .step { display: flex; gap: 12px; margin-bottom: 12px; font-size: 13px; color: #aaa; }
        .step:last-child { margin-bottom: 0; }
        .num { background: #e53e3e; color: #fff; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; margin-top: 1px; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: #1a2e1a; border: 1px solid #2a4a2a; border-radius: 20px; padding: 6px 14px; font-size: 12px; color: #4ade80; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🔌 Reconexão Necessária</h1>
        <p>A sessão do Microsoft SharePoint expirou.<br>Para restaurar a sincronização automática:</p>
        <div class="steps">
          <div class="step"><span class="num">1</span><span>Acesse o servidor do ONEDRIVE-READER</span></div>
          <div class="step"><span class="num">2</span><span>Execute: <code>node login-manual.js</code></span></div>
          <div class="step"><span class="num">3</span><span>Faça login na janela que abrir com sua conta Microsoft</span></div>
          <div class="step"><span class="num">4</span><span>Aguarde a mensagem "Sessão salva com sucesso"</span></div>
        </div>
        <div class="badge"><span class="dot"></span>O status voltará para Sync OK automaticamente</div>
      </div>
    </body>
    </html>
  `);
});

// ─── Premises ─────────────────────────────────────────────────
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

// ─── Filtros ──────────────────────────────────────────────────
app.get("/api/romaneios/filters", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("vw_romaneios_filtros").select("*");
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard ────────────────────────────────────────────────
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
