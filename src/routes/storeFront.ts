import { Router } from "express";
import { StoreFrontService } from "../services/storeFront/storeFront";

const router = Router();
import { Multer } from "../middlewares/multer";

const storeFrontService = new StoreFrontService();

router.get("/getAll", storeFrontService.getAll);
router.post("/products", storeFrontService.udpdateProducts);
router.get("/brands", storeFrontService.getBrands);
router.put("/brands", storeFrontService.editBrands);
router.post("/brands/images", Multer.single("file"), storeFrontService.uploadImage);

export default router;
