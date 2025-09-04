import { Router } from "express";
import GoogleProductService from "../services/product/googleProduct";

const router = Router();
const googleProductService = new GoogleProductService();

router.get("/:sku", googleProductService.findGoogleProductBySku);
router.patch("/:sku", googleProductService.updateGoogleProduct);
router.post("/:sku", googleProductService.createGoogleProduct);
router.get("/", googleProductService.findAllGoogleProduct);

export default router;
