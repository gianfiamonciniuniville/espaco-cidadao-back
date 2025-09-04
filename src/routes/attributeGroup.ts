import { Router } from "express";
import ProductGroupAttributeService from "../services/product/productGroupAttribute";

const router = Router();
const productGroupAttributeService = new ProductGroupAttributeService();

router.delete("/:idProdutoGrupoAtributo", productGroupAttributeService.remove);
router.get("/:idProduto", productGroupAttributeService.findOne);
router.post("/", productGroupAttributeService.newProductAttributeGroup);

export default router;
