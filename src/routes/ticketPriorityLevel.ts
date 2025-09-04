import { Router } from "express";
import TicketsPriorityLevelService from "../services/ticket/ticketPriorityLevel";

const router = Router();

const ticketPriorityLevelService = new TicketsPriorityLevelService();

router.post("/", ticketPriorityLevelService.newTicketPriorityLevel);
router.get("/", ticketPriorityLevelService.findAll);
router.patch("/", ticketPriorityLevelService.updateAllTicketPriorityLevel);
router.get("/:id", ticketPriorityLevelService.findById);
router.patch("/:id", ticketPriorityLevelService.updateTicketPriorityLevel);
router.delete("/:id", ticketPriorityLevelService.removeTicketPriorityLevel);

export default router;
