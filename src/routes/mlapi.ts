import { Router } from "express";
import MLApi from "../services/mlapi";

const router = Router();
const mlapi = new MLApi();

router.get("/mlbfull", mlapi.getFullItem);
router.get("/saveorupdate", mlapi.saveOrUpdateMLB);
router.get("/tome2", mlapi.changeToMe2);
router.get("/tome1", mlapi.changeToMe1);
router.get("/changeprice", mlapi.changePrice);

export default router;
