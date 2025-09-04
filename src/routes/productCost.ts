import { Router } from "express";
import ProductCostService from "../services/product/productCost";

const router = Router();

const productCostService = new ProductCostService();
router.get("/:sku", productCostService.findAllPriceCostBySku);

export default router;
