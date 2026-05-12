// /**
//  * backend/server.ts
//  * Entry point do servidor Express para produção (Render).
//  * Serve apenas a API — sem Vite, sem assets estáticos.
//  */
// import "dotenv/config";
// import express from "express";
// import cors from "cors";

// const app = express();
// const PORT = Number(process.env.PORT) || 3333;

// // ─── CORS ────────────────────────────────────────────────────────────────────
// // Em produção, restringir à origem do frontend no Vercel.
// // Em desenvolvimento, aceitar qualquer origem.
// const allowedOrigins = process.env.FRONTEND_URL
//   ? [process.env.FRONTEND_URL]
//   : ["http://localhost:3000", "http://localhost:5173"];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Permitir requisições sem origin (ex: curl, Postman)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) return callback(null, true);
//       callback(new Error(`CORS: origin não permitida → ${origin}`));
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

// // ─── Middlewares ──────────────────────────────────────────────────────────────
// app.use(express.json());

// // ─── Health check ─────────────────────────────────────────────────────────────
// app.get("/api/health", (_req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // ─── Rotas de API ─────────────────────────────────────────────────────────────
// async function loadRoutes() {
//   const { default: romaneiosRoutes } = await import(
//     "./src/routes/romaneiosRoutes.js"
//   );
//   app.use("/api/romaneios", romaneiosRoutes);
// }

// // ─── Start ────────────────────────────────────────────────────────────────────
// async function start() {
//   await loadRoutes();
//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`[Backend] API rodando em http://0.0.0.0:${PORT}`);
//   });
// }

// start();



import "dotenv/config";
import express from "express";
import cors from "cors";

import romaneiosRoutes from "./src/routes/romaneiosRoutes.js";

const app = express();

const PORT = Number(process.env.PORT) || 3333;

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir Postman/curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS: origin não permitida → ${origin}`)
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────
app.use(express.json());

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api/romaneios", romaneiosRoutes);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[Backend] API rodando em http://0.0.0.0:${PORT}`
  );
});