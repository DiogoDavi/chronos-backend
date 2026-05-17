import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || ''
);

const ONEDRIVE_READER_URL = process.env.ONEDRIVE_READER_URL || '';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || '';

const app = express();
const PORT = Number(process.env.PORT) || 3333;

app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ─── Health ───────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── GET /api/session/status ──────────────────────────────────
app.get("/api/session/status", async (_req, res) => {
    try {
        const { data } = await supabase
            .from("app_config")
            .select("key, value")
            .in("key", ["session_status", "mfa_code", "mfa_message", "last_sync", "last_error"]);

        const cfg: Record<string, string> = {};
        (data || []).forEach((r: any) => { cfg[r.key] = r.value; });

        res.json({
            status: cfg["session_status"] || "expired",
            mfaCode: cfg["mfa_code"] || null,
            mfaMessage: cfg["mfa_message"] || null,
            lastSync: cfg["last_sync"] || null,
            lastError: cfg["last_error"] || null,
        });
    } catch {
        res.json({ status: "expired", mfaCode: null, mfaMessage: null, lastSync: null, lastError: null });
    }
});

// ─── POST /api/romaneios/reconnect ────────────────────────────
app.post("/api/romaneios/reconnect", async (req: any, res: any) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    if (!ONEDRIVE_READER_URL) {
        return res.status(500).json({ error: "ONEDRIVE_READER_URL não configurada no servidor" });
    }

    // Responde ao frontend imediatamente
    res.json({ success: true, message: "Comando de login enviado com sucesso." });

    // Executa em background
    (async () => {
        try {
            // ── PASSO 1: acorda o Reader (cold start do Render) ──
            // Faz ping no /health até responder, com timeout de 60s
            console.log(`[Background] Acordando ONEDRIVE-READER...`);
            const wakeStart = Date.now();

            let readerAcordado = false;
            while (Date.now() - wakeStart < 60000) {
                try {
                    const ping = await fetch(`${ONEDRIVE_READER_URL}/health`, {
                        signal: AbortSignal.timeout(5000)
                    });
                    if (ping.ok) {
                        readerAcordado = true;
                        console.log(`[Background] Reader acordado em ${Date.now() - wakeStart}ms`);
                        break;
                    }
                } catch {
                    // ainda dormindo — aguarda 3s e tenta de novo
                    await new Promise(r => setTimeout(r, 3000));
                }
            }

            if (!readerAcordado) {
                console.error("[Background] Reader não respondeu ao ping em 60s");
                // Marca expired no Supabase para frontend não ficar preso
                await supabase.from("app_config").upsert({
                    key: "session_status", value: "expired",
                    updated_at: new Date().toISOString()
                });
                await supabase.from("app_config").upsert({
                    key: "last_error", value: "ONEDRIVE-READER não respondeu ao ping",
                    updated_at: new Date().toISOString()
                });
                return;
            }

            // ── PASSO 2: dispara o login ──────────────────────────
            console.log(`[Background] Enviando credenciais ao Reader...`);
            const response = await fetch(`${ONEDRIVE_READER_URL}/internal/start-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, secret: INTERNAL_SECRET }),
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                console.error(`[Background] Reader erro: ${response.status}`, body);
            } else {
                console.log("[Background] Login iniciado no Reader com sucesso");
            }

        } catch (err: any) {
            console.error("[Background] Erro:", err.message);
            // Garante que frontend não fique preso em pending
            await supabase.from("app_config").upsert({
                key: "session_status", value: "expired",
                updated_at: new Date().toISOString()
            }).catch(() => { });
            await supabase.from("app_config").upsert({
                key: "last_error", value: err.message,
                updated_at: new Date().toISOString()
            }).catch(() => { });
        }
    })();
});

// ─── Premises ─────────────────────────────────────────────────
app.get("/api/romaneios/premises", async (_req, res) => {
    try {
        const { data: premisesData, error: e1 } = await supabase.from("unit_premises").select("*");
        if (e1) throw e1;
        const { data: exceptionsData, error: e2 } = await supabase.from("unit_calendar_exceptions").select("*");
        if (e2) throw e2;
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

        if (filters.unit?.length) query = query.in("unit", filters.unit);
        if (filters.priority?.length) query = query.in("priority", filters.priority);
        if (filters.transportador?.length) query = query.in("carrier", filters.transportador);
        if (filters.material?.length) query = query.in("material", filters.material);
        if (filters.area?.length) query = query.in("area", filters.area);
        if (filters.year?.length) query = query.in("ano", filters.year.map(Number));
        if (filters.month?.length) query = query.in("mes", filters.month.map(Number));
        if (filters.day?.length) query = query.in("dia", filters.day.map(Number));
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
    console.log(`[Chronos Backend] Porta ${PORT}`);
});