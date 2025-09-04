import { Router } from "express";
import Service from "../services/eprice";

const router = Router();
const service = new Service();

router.get("/", service.findAll);
router.get("/:sku", service.findOne);

export default router;
