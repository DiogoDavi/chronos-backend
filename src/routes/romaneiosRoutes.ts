// import { Router } from 'express';
// import { romaneiosController } from '../controllers/romaneiosController';

// const router = Router();

// router.post('/dashboard', romaneiosController.getDashboardData);
// router.get('/filters', romaneiosController.getFilters);
// router.get('/premises', romaneiosController.getPremises);

// export default router;
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

export default router;