import { Router } from "express";
import { TaxInstallmentService } from "../services/taxInstallment";

const router = Router();

const taxInstallmentService = new TaxInstallmentService();


router.patch("/list", taxInstallmentService.updateMany);

router.patch("/:id", taxInstallmentService.update);
router.delete("/:id", taxInstallmentService.remove);
router.post("/", taxInstallmentService.create);
router.get("/", taxInstallmentService.findAll);

export default router;
