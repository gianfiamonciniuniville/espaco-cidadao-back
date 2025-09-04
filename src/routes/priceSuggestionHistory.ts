import { Router } from "express";
import PriceSuggestionHistoryService from "../services/product/priceSuggestionHistory";

const router = Router();

const priceSuggestionHistoryService = new PriceSuggestionHistoryService();

router.post("/", priceSuggestionHistoryService.newPriceSuggestionHistory);
router.get("/", priceSuggestionHistoryService.findAllPriceSuggestionHistory);

export default router;
