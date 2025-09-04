import { Router } from "express";
import TicketsStatusService from "../services/ticket/ticketStatus";

const router = Router();

const ticketStatusService = new TicketsStatusService();

router.post("/", ticketStatusService.newTicket);
router.get("/", ticketStatusService.findAll);
router.patch("/", ticketStatusService.updateAllTicketStatus);
router.get("/:id", ticketStatusService.findById);
router.delete("/:id", ticketStatusService.removeTicket);
router.patch("/:id", ticketStatusService.updateTicket);

export default router;
