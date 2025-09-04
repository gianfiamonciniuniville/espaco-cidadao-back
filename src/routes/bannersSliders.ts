import { Router } from "express";

import Service from "../services/bannersSliders";
import { Multer } from "../middlewares/multer";

const router = Router();
const service = new Service();

router.delete("/slider/:id", service.removeSlider);
router.get("/slider/:id", service.findOneSlider);
router.patch("/slider/:id", Multer.single("path"), service.updateSlider);
router.post("/slider", Multer.single("path"), service.newSlider);
router.get("/slider", service.findAllSlider);
router.put("/slider", service.updateAllSlider);

router.delete("/banner/:id", service.removeBanner);
router.get("/banner/:id", service.findOneBanner);
router.patch("/banner/:id", Multer.single("path"), service.updateBanner);
router.get("/banner", service.findAllBanner);
router.put("/banner", service.updateAllBanner);
router.post("/banner", Multer.single("path"), service.newBanner);

export default router;
