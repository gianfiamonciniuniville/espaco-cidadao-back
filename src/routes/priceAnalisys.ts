import { Router } from "express";
import PriceAnalisysService from "../services/product/priceAnalisys";

const router = Router();

const priceAnalisysService = new PriceAnalisysService();

router.get("/", priceAnalisysService.findAllPrices);

export default router;
