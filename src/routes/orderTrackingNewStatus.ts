import { Router } from "express";

import OrderTrackingNewStatusService from "../services/orders/trackingNewStatus";

const router = Router();

const orderTrackingNewStatusService = new OrderTrackingNewStatusService();

router.get("/", (req, res) => orderTrackingNewStatusService.findAll(req, res));

export default router;
