import { Router } from "express";
import GoogleMerchant from "../services/google-merchant";

const router = Router();
const googleMerchantService = new GoogleMerchant();

router.get("/feeds", googleMerchantService.getAllFeeds);
router.get("/:sku", googleMerchantService.getProductInMerchantById);
router.get("/", googleMerchantService.getAllProductsInMerchant);

export default router;
