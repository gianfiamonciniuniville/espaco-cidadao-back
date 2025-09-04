import { Router } from "express";
import { MLScraperService } from "../services/mlScraper";

const router = Router();
const mlScraperService = new MLScraperService();

router.get("/:sku", mlScraperService.findItemsOrScrapBySku);

export default router;
