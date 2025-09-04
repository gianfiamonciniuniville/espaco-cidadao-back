import { Router } from "express";
import WebPriceService from "../services/webPrice";

const router = Router();

const webPriceService = new WebPriceService();

router.get("/webprice-api", webPriceService.getWebPrice);
router.get("/sellers", webPriceService.getSellers);
router.get("/mktplaces", webPriceService.getMktPlaces);
router.get("/chartday", webPriceService.chartDayBySku);
router.get("/taxgroup", webPriceService.getTaxGroup);

router.get("/", webPriceService.searchPrices);

export default router;
