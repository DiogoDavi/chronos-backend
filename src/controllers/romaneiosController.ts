import { Request, Response } from 'express';
import { romaneiosService } from '../services/romaneiosService';

export const romaneiosController = {
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
