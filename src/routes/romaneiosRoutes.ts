import { Router } from "express";
import { romaneiosController } from "../controllers/romaneiosController.js";

const router = Router();

router.post(
    "/dashboard",
    romaneiosController.getDashboardData
);

router.get(
    "/filters",
    romaneiosController.getFilters
);

router.get(
    "/premises",
    romaneiosController.getPremises
);

// ADICIONE ESTA LINHA:
router.post(
    "/reconnect",
    romaneiosController.reconnect
);

export default router;