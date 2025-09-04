import { Router } from "express";
import { SkuRecommendationService } from "../services/skuRecommendation";

const router = Router();

const skuRecommendations = new SkuRecommendationService();

router.get("/:id", skuRecommendations.findById);
router.get("/indicator/:id", skuRecommendations.findAllByIndicatorId);
router.get("/user/:id", skuRecommendations.findAllByUserId);

router.patch("/:id", skuRecommendations.update);
router.patch("/users/:id", skuRecommendations.setSkuRecommendationUsers);

router.delete("/:id", skuRecommendations.remove);

router.post("/", skuRecommendations.create);
router.get("/", skuRecommendations.findAll);

export default router;
