import { Router } from "express";

import Service from "../services/profile";
import { checkToken } from "../middlewares/checkToken";

const router = Router();
const service = new Service();

router.get("/validate-request-profile", service.validateRequestProfile);
router.post("/request-profile", service.requestProfile);

router.post("/:id/profile-department", checkToken, service.profileDepartment);
router.post("/:id/new-profile-department", checkToken, service.newProfileDepartment);
router.post("/:id/remove-profile-department", checkToken, service.removeProfileDepartment);

router.get("/:id", checkToken, service.findOne);
router.post("/:idPerfil", checkToken, service.createUserProfile);
router.delete("/:idPerfil/:idUsuario", checkToken, service.removeUserProfile);
router.patch("/:id", checkToken, service.update);
router.delete("/:id", checkToken, service.remove);

router.patch("/user/:id/add", checkToken, service.createAllUserProfiles);
router.patch("/user/:id/remove", checkToken, service.removeUserProfiles);

router.post("/", checkToken, service.new);
router.get("/", service.findAll);

export default router;
