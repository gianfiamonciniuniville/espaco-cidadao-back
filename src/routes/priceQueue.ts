import { Router } from "express";
import PriceQueueService from "../services/product/priceQueue";

const router = Router();

const priceQueueService = new PriceQueueService();
router.get("/history/:sku", priceQueueService.findAllPriceQueueHistoryBySku);
router.post("/", priceQueueService.newPriceQueueHistory); //É acionado na Fila Preço os mesmos dados atráves de um Trigger no banco de dados
router.get("/", priceQueueService.findAllPriceQueueHistory);

export default router;
