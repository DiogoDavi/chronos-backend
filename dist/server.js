"use strict";
// /**
//  * backend/server.ts
//  * Entry point do servidor Express para produção (Render).
//  * Serve apenas a API — sem Vite, sem assets estáticos.
//  */
// import "dotenv/config";
// import express from "express";
// import cors from "cors";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const romaneiosRoutes_js_1 = __importDefault(require("./src/routes/romaneiosRoutes.js"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3333;
// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ["http://localhost:3000", "http://localhost:5173"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir Postman/curl
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: origin não permitida → ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// ─────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────
app.use(express_1.default.json());
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
app.use("/api/romaneios", romaneiosRoutes_js_1.default);
// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend] API rodando em http://0.0.0.0:${PORT}`);
});
