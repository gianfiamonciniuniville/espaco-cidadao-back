import { Router } from "express";

import Service from "../services/users/users";
import { checkToken } from "../middlewares/checkToken";

const router = Router();
const service = new Service();

router.post("/:id/user-level", checkToken, service.setLevelAuthorization);

router.get("/checkuser", service.checkUser);

router.post("/register-request", service.registerRequest);
router.get("/validate-register", service.validateRegisterRequest);
router.post("/generate-password", service.generatePassword);

router.post("/register", service.register);
router.post("/login", service.login);

router.get("/pagination", service.findAllPagination);
router.get("/:id", checkToken, service.findOne);
router.patch("/:id", checkToken, service.update);
router.delete("/:idUsuario", checkToken, service.remove);

router.get("/profiles/:id", checkToken, service.findProfiles);
router.get("/channels/:id", checkToken, service.findChannels);

router.patch("/user-channel/:id/add", service.createAllUserChannels);
router.patch("/user-channel/:id/remove", service.removeUserChannels);

router.get("/", checkToken, service.findAll);

export default router;
