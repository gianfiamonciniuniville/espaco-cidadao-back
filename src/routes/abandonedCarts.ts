import { Router } from "express";
import AbandonedCartsService from "../services/orders/abandonedCarts";

const abandonedCartsService = new AbandonedCartsService();
const router = Router();

router.get("/dynamic-search", abandonedCartsService.searchDynamicAbandonedCarts);
router.get("/:Sku", abandonedCartsService.findAbandonedCartBySku);

export default router;
