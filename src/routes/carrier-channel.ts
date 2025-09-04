import { Router } from "express";
import CarrierChannelService from "../services/carrier-channel";

const router = Router();

const carrierChannel = new CarrierChannelService();

router.patch("/update", carrierChannel.updateCarrierChannel);

router.delete("/", carrierChannel.removeCarrierChannel);
router.post("/", carrierChannel.newCarrierChannel);
router.get("/", carrierChannel.findAll);

export default router;
