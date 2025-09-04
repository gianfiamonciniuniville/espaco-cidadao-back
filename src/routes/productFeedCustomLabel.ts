import { Router } from "express";
import ProductFeedCustomLabelService from "../services/product/productFeedCustomLabel";

const router = Router();

const productFeedCustomLabelService = new ProductFeedCustomLabelService();
router.get("/", productFeedCustomLabelService.findAll);
router.post("/", productFeedCustomLabelService.create);
router.patch("/", productFeedCustomLabelService.update);
router.delete("/:id", productFeedCustomLabelService.delete);

export default router;
