import { Router } from "express";
import TicketsHistoryService from "../services/ticket/ticketHistory";

const router = Router();

const ticketHistoryService = new TicketsHistoryService();

router.post("/", ticketHistoryService.newTicket);
router.get("/", ticketHistoryService.findAll);
router.get("/:id", ticketHistoryService.findById);
router.delete("/:id", ticketHistoryService.removeTicket);
router.patch("/:id", ticketHistoryService.updateTicket);

router.get("/ticket/:id", ticketHistoryService.findAllByTicketId);

export default router;
