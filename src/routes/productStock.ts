import { Router } from "express";
import ProductStockService from "../services/product/productStock";

const router = Router();

const productStockService = new ProductStockService();
router.get("/bysku/:sku", productStockService.findBySku);
router.get("/flag/:sku", productStockService.flagProductToUpdateBySku);

export default router;
