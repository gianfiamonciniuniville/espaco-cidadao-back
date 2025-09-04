import { Router } from "express";
import ProductFeedCustomLabelGenService from "../services/product/productFeedCustomLabelGen";

const router = Router();

const productFeedCustomLabelGenService = new ProductFeedCustomLabelGenService();
router.get("/", productFeedCustomLabelGenService.findAll);
router.post("/", productFeedCustomLabelGenService.create);
router.delete("/:id", productFeedCustomLabelGenService.delete);

export default router;
