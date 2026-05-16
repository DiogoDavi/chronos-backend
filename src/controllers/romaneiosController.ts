import { Request, Response } from 'express';
import axios from 'axios';
import { romaneiosService } from '../services/romaneiosService';

export const romaneiosController = {

  async reconnect(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    try {
      const readerUrl = process.env.ONEDRIVE_READER_URL;
      const secret = process.env.INTERNAL_SECRET;

      // Chama o OneDrive Reader isolado no Render
      await axios.post(`${readerUrl}/internal/start-login`, {
        email,
        password,
        secret: secret
      });

      // Retorna sucesso imediatamente para o Frontend
      return res.json({
        success: true,
        message: "Processo de login iniciado no serviço de automação."
      });

    } catch (error: any) {
      console.error("Erro ao disparar reconexão:", error.message);
      return res.status(500).json({
        error: "Não foi possível iniciar o serviço de automação."
      });
    }
  },

  async getDashboardData(req: Request, res: Response) {
    try {
      const { filters = {}, from, to } = req.body;
      const data = await romaneiosService.getDashboardData(filters, from, to);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getFilters(req: Request, res: Response) {
    try {
      const data = await romaneiosService.getFilterOptions();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPremises(req: Request, res: Response) {
    try {
      const data = await romaneiosService.getPremises();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};