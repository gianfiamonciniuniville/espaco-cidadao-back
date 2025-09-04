import { Router } from "express";
import ControllerFilaPubExec from "../services/controllerFilaPubExec";

const router = Router();

const service = new ControllerFilaPubExec();

router.get("/", service.execMicroservice);

export default router;
