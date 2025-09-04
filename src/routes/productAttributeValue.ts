import { Router } from "express";
import AttributeValueService from "../services/product/productAttributeValue";

const attributeValueService = new AttributeValueService();
const router = Router();

router.post("/product-values", attributeValueService.createAttributeValue);
router.patch("/update-values", attributeValueService._updateAttributeValue);
router.patch("/update-values-multi", attributeValueService.updateAttributeValueMulti);
router.post("/values", attributeValueService._createAttributeValue);
router.patch("/values/:idProdutoAtributoValor", attributeValueService.updateAttributeValue);
router.get("/group/:idGrupoAtributo", attributeValueService.findProductGroupAttribute);
router.get("/:idGrupoAtributo/:idProduto", attributeValueService.getAtributesByGroupAndProduct);
router.get("old/:idGrupoAtributo/:idProduto", attributeValueService.findValuesByIdGroupAttribute);

router.get("/:idProdutoAtributoValor", attributeValueService.findAll);

//router.get("/values/:idProduto", attributeValueService.findAllValues);

router.delete("/value/:idProdutoAtributoValor", attributeValueService.remove);
router.delete("/value-multi/:idProduto/:idAtributo", attributeValueService.removeMulti);

export default router;
