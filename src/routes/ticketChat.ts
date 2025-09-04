import { Router } from "express";
import TicketChatsService from "../services/ticket/ticketChat";

const router = Router();

const ticketService = new TicketChatsService();

router.post("/", ticketService.newTicketChat);
router.get("/:id", ticketService.findAllById);

export default router;
