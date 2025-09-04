import { Router } from "express";
import AccessService from "../services/access/access";

const router = Router();

const accessService = new AccessService();

router.get("/", accessService.getUserTokenAccess.bind(accessService));
router.put("/profiles/:profileId", accessService.updateProfileAccess.bind(accessService));
router.get("/profiles/:profileId", accessService.getProfileAccess.bind(accessService));

export default router;
