import { Router } from "express";

import OrderTrackingService from "../services/orders/tracking";

const router = Router();

const orderTrackingService = new OrderTrackingService();

router.get("/", (req, res) => orderTrackingService.findAll(req, res));

router.get("/backorders", (req, res) => orderTrackingService.findBackorders(req, res));

export default router;
