import { Router } from "express";
import { Multer } from "../middlewares/multer";
import { uploadImageCdm } from "../middlewares/uploadFile";
import Service from "../services/cdm";
import { checkToken } from "../middlewares/checkToken";

const router = Router();
const service = new Service();

router.get("/", service.findAll);
router.get("/full", service.findAllWithExtraInfo);
router.get("/distance", service.findAllByDistance);

router.get("/:id", service.findOne);
router.get("/full/:id", service.findOneWithExtraInfo);
router.get("/info/:id", service.findInfoById);

router.post("/", Multer.single("imagem"), uploadImageCdm, checkToken, service.new);

router.put("/:id", Multer.single("imagem"), uploadImageCdm, checkToken, service.update);

router.put("/validate/:id", checkToken, service.validate);
router.put("/invalidate/:id", checkToken, service.invalidate);

export default router;
