import { Router } from "express";
import PriceRuleService from "../services/product/priceRule";

const router = Router();

const priceRuleService = new PriceRuleService();

router.patch("/channel/:id", priceRuleService.updatePriceRuleByChannelId);
router.get("/channel/:id", priceRuleService.findPriceRuleByChannelId);
router.patch("/:id", priceRuleService.update);
router.delete("/:id", priceRuleService.remove);
router.post("/", priceRuleService.create);
router.get("/", priceRuleService.findAll);

export default router;
