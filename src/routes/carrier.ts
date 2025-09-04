import { Router } from "express";
import CarrierService from "../services/carrier";

const router = Router();

const carrierService = new CarrierService();

router.get("/pagination", carrierService.findAllPagination);
router.get("/:id", carrierService.findOne);
router.delete("/:id", carrierService.removeCarrier);
router.patch("/:id", carrierService.updateCarrier);

router.post("/", carrierService.newCarrier);
router.get("/", carrierService.findAll);

export default router;
