import { Router } from "express";
import PriceSuggestionService from "../services/product/priceSuggestion";

const router = Router();

const priceSuggestionService = new PriceSuggestionService();

router.get("/:sku", priceSuggestionService.findOneSuggestion);
router.post("/", priceSuggestionService.newSuggestion);
router.get("/", priceSuggestionService.findAllSuggestion);

export default router;
