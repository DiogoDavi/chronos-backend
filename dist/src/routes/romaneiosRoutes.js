"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const romaneiosController_1 = require("../controllers/romaneiosController");
const router = (0, express_1.Router)();
router.post('/dashboard', romaneiosController_1.romaneiosController.getDashboardData);
router.get('/filters', romaneiosController_1.romaneiosController.getFilters);
router.get('/premises', romaneiosController_1.romaneiosController.getPremises);
exports.default = router;
