"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.romaneiosController = void 0;
const romaneiosService_1 = require("../services/romaneiosService");
exports.romaneiosController = {
    async getDashboardData(req, res) {
        try {
            const { filters = {}, from, to } = req.body;
            const data = await romaneiosService_1.romaneiosService.getDashboardData(filters, from, to);
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getFilters(req, res) {
        try {
            const data = await romaneiosService_1.romaneiosService.getFilterOptions();
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getPremises(req, res) {
        try {
            const data = await romaneiosService_1.romaneiosService.getPremises();
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
