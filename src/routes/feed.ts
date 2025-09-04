import { Router } from "express";
import FeedService from "../services/product/feed";

const router = Router();

const productFeedService = new FeedService();
router.get("/", productFeedService.findAll);

export default router;
