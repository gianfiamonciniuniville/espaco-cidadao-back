import { Router } from "express";
import SkuObservations from "../services/product/skuObservation";

const router = Router();

const skuObservations = new SkuObservations();

router.get("/:sku", skuObservations.findObservationBySku);
router.delete("/:sku", skuObservations.deleteObservation);
router.post("/", skuObservations.createObservation);
router.get("/", skuObservations.findAllObservations);

export default router;
