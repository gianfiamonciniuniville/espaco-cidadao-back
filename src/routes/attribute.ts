import { Router } from "express";

import AttributeService from "../services/product/attribute";
import TypeFieldService from "../services/product/fieldType";
import SelectAttributeService from "../services/product/attributeSelect";

const router = Router();

const attributeService = new AttributeService();
const typeFieldService = new TypeFieldService();
const selectAttributeService = new SelectAttributeService();

router.get("/field-type/", typeFieldService.findAll);

router.get("/pagination", attributeService.findAllPagination);

router.patch("/attribute-select/:id", selectAttributeService.updateAttributeSelectByDefault);
router.delete("/attribute-select/:id", selectAttributeService.removeAttributeSelect);
router.post("/attribute-select", selectAttributeService.newAttributeSelect);
router.get("/attribute-select/", selectAttributeService.findAll);

router.get("/:idAtributo", attributeService.findOneAttribute);
router.patch("/:id", attributeService.updateAttribute);
router.delete("/:id", attributeService.removeAttribute);
router.get("/", attributeService.findAll);
router.post("/", attributeService.newAttribute);

export default router;
