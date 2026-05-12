"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * backend/server.ts
 * Entry point do servidor Express para produção (Render).
 * Serve apenas a API — sem Vite, sem assets estáticos.
 */
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3333;
// ─── CORS ────────────────────────────────────────────────────────────────────
// Em produção, restringir à origem do frontend no Vercel.
// Em desenvolvimento, aceitar qualquer origem.
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ["http://localhost:3000", "http://localhost:5173"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requisições sem origin (ex: curl, Postman)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin não permitida → ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(express_1.default.json());
// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ─── Rotas de API ─────────────────────────────────────────────────────────────
async function loadRoutes() {
    const { default: romaneiosRoutes } = await Promise.resolve().then(() => __importStar(require("./src/routes/romaneiosRoutes")));
    app.use("/api/romaneios", romaneiosRoutes);
}
// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
    await loadRoutes();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`[Backend] API rodando em http://0.0.0.0:${PORT}`);
    });
}
start();
