import { Request, Response } from 'express';
import axios from 'axios';
import { romaneiosService } from '../services/romaneiosService';

export const romaneiosController = {

  // 🔴 RECONNECT CORRIGIDO (FLUXO REAL + SEGURANÇA)
  async reconnect(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email e senha são obrigatórios"
      });
    }

    try {
      const readerUrl = process.env.ONEDRIVE_READER_URL;
      const secret = process.env.INTERNAL_SECRET;

      if (!readerUrl || !secret) {
        return res.status(500).json({
          success: false,
          error: "Configuração de ambiente inválida"
        });
      }

      console.log("🚀 RECONNECT INICIADO");
      console.log("📡 Enviando para Reader...");

      const response = await axios.post(
        `${readerUrl}/internal/start-login`,
        {
          email,
          password,
          secret
        },
        {
          timeout: 30000 // evita travar request infinito
        }
      );

      console.log("✅ RESPOSTA DO READER:", response.data);

      return res.json({
        success: true,
        jobId: response.data?.jobId || null,
        status: response.data?.status || "started",
        message: "Processo de login iniciado no serviço de automação."
      });

    } catch (error: any) {
      console.error("❌ ERRO AO INICIAR RECONNECT:", error.message);

      return res.status(500).json({
        success: false,
        error: "Não foi possível iniciar o serviço de automação."
      });
    }
  },

  // 🔵 DASHBOARD
  async getDashboardData(req: Request, res: Response) {
    try {
      const { filters = {}, from, to } = req.body;
      const data = await romaneiosService.getDashboardData(filters, from, to);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🟡 FILTERS
  async getFilters(req: Request, res: Response) {
    try {
      const data = await romaneiosService.getFilterOptions();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🟢 PREMISES
  async getPremises(req: Request, res: Response) {
    try {
      const data = await romaneiosService.getPremises();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};