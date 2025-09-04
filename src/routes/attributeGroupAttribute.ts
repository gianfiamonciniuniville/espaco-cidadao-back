import { Router } from "express";

import GroupAttributeService from "../services/product/attributeGroup";
import AttributeGroupAttributeService from "../services/product/attributeGroupAttribute";

const router = Router();

const groupAttributeService = new GroupAttributeService();
const attributeGroupAttributeService = new AttributeGroupAttributeService();

router.post("/:id/remove", attributeGroupAttributeService.removeAttribute);
router.post("/:id/add", attributeGroupAttributeService.addAttribute);

router.get("/attribute-group/:idGrupoAtributo", attributeGroupAttributeService.findAll);
router.get(
  "/attribute-group-value/:idAtributoGrupoAtributo",
  attributeGroupAttributeService._findValues,
);

router.patch("/:id", groupAttributeService.updateAttributeGroup);
router.delete("/:id", groupAttributeService.removeAttributeGroup);
router.post("/", groupAttributeService.newAttributeGroup);
router.get("/", groupAttributeService.findAll);
router.get("/Counting", groupAttributeService.findAllCounting);
router.get("/pagination", groupAttributeService.findAllPagination);
router.get("/:idGrupoAtributo", groupAttributeService.findOne);

router.post("/reorder/:id", attributeGroupAttributeService.changeOrder);

export default router;
