import { Router } from "express";
import pendingPublicationService from "../services/product/pendingPublication"

const router = Router();
const pendingPublication = new pendingPublicationService();

router.get("/", pendingPublication.findPendingPublications); // com args opcionais idProduto e idCanal

export default router;