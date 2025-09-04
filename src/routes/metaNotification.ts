import { Router } from "express";
import MetaNotificationService from "../services/metaNotification";
import { checkToken } from "../middlewares/checkToken";

const metaNotificationService = new MetaNotificationService();
const router = Router();

router.post(
  "/abandoned-carts-reminder",
  checkToken,
  metaNotificationService.abandonedCartsReminder,
);
router.post(
  "/abandoned-carts-reminder-sku/:sku",
  checkToken,
  metaNotificationService.abandonedCartsReminderBySku,
);
router.get("/find-cities-by-uf/:uf", checkToken, metaNotificationService.findCitiesByUF);

export default router;
