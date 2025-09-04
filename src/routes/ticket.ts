import { Router } from "express";
import TicketsService from "../services/ticket/ticket";
import { uploadImageTicket } from "../middlewares/uploadFile";
import { Multer } from "../middlewares/multer";

const router = Router();

const ticketService = new TicketsService();

router.post("/", Multer.single("Path"), uploadImageTicket, ticketService.newTicket);
router.get("/", ticketService.findAll);
router.get("/user", ticketService.findAllByUserEmail);
router.get("/count", ticketService.countOpenTickets);
router.get("/:id", ticketService.findById);
router.delete("/:id", ticketService.removeTicket);
router.patch("/:id", ticketService.updateTicket);

export default router;
