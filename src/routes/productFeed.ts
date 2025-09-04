import { Router } from "express";
import ProductFeedService from "../services/product/productFeed";

const router = Router();

const productFeedService = new ProductFeedService();
router.get("/:sku", productFeedService.findBySku);

export default router;
