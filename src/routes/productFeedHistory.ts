import { Router } from "express";
import ProductFeedHistoryService from "../services/product/productFeedHistory";

const router = Router();

const productFeedHistoryService = new ProductFeedHistoryService();
router.post("/", productFeedHistoryService.newProductFeedHistory);
router.get("/:sku", productFeedHistoryService.findAllBySku);

export default router;
