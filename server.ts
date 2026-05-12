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

// Inicialização do Supabase direto no server para garantir conexão
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = Number(process.env.PORT) || 3333;

// Configuração de CORS para aceitar a Vercel
app.use(cors({
  origin: '*', // Em produção, você pode trocar '*' pela sua URL da Vercel
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 1. Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", port: PORT, timestamp: new Date().toISOString() });
});

// 2. Rota de Premises (Configurações das Unidades)
app.get("/api/premises", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("unit_premises").select("*");
    if (error) throw error;

    const formatted = data.reduce((acc: any, item: any) => {
      acc[item.unit] = {
        ...item,
        operatingDays: item.operating_days || [1, 2, 3, 4, 5, 6]
      };
      return acc;
    }, {});

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Rota de Romaneios (Dados das Cargas)
app.get("/api/romaneios", async (req, res) => {
  try {
    // IMPORTANTE: Verifique se o nome da tabela no Supabase é 'fretes' ou 'romaneios'
    const { data, error } = await supabase
      .from("fretes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error("Erro ao buscar romaneios:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Raiz para evitar "Cannot GET /"
app.get("/", (req, res) => {
  res.send("🚀 Chronos Logistics API está online e operante!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Backend] Rodando na porta ${PORT}`);
});