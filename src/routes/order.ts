import { Router } from "express";
import OrderMLService from "../services/orders/mercadoLivre";
import OrderService from "../services/orders/order";

const router = Router();

const orderMLService = new OrderMLService();
const orderService = new OrderService();

//router.get("/ml", orderMLService.findAllOrders); // crashes
router.get("/", orderService.findAll);
router.get("/:cpf", orderService.findAllByCpf);

export default router;
