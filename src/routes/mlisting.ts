import { Router } from "express";
import MlistingService from "../services/mlisting";
import MLApi from "../services/mlapi";

const router = Router();
const mlistingService = new MlistingService();
const mlapi = new MLApi();

router.get("/search", mlistingService.search);
router.get("/mlb/:mlb", mlistingService.findByMLB);
router.patch("/keep-zero/:mlb", mlistingService.keepZero); // diretamente pro DB, sem histórico
router.get("/keep-zero/:mlb", mlapi.changeKeepZeroFlag); // usa MercadoLivreLocalApi, guarda histórico de alterações e email do usuário
router.get("/idproduto/:id", mlistingService.findByidProduto);
router.get("/sku/:sku", mlistingService.findBySku);
router.get("/:idMLB", mlistingService.findOne);

export default router;
