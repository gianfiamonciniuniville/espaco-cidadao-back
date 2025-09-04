import { Request, Response } from "express";
import { Ticket } from "../../models/ticket/ticket";
import Service from "../Service";
import { TicketStatus } from "../../models/ticket/ticketStatus";
import { TicketPriorityLevel } from "../../models/ticket/ticketPriorityLevel";
import { response } from "../../utils/response";
import { TicketHistory } from "../../models/ticket/ticketHistory";

class TicketsHistory {
  public ticketHistory = Service(TicketHistory);

  constructor() {
    this.ticketHistory;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const tickets = await TicketHistory.findAll({
        include: [
          { model: Ticket, as: "Ticket" },
          { model: TicketStatus, as: "TicketStatus" },
        ],
        attributes: {
          exclude: ["idStatus", "idTicket"],
        },
      });

      response(res, 200, "OK", tickets);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findById = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const ticket = await TicketHistory.findOne({
        where: { id: params.id },
      });

      response(res, 200, "OK", ticket);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllByTicketId = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const tickets = await TicketHistory.findAll({
        include: [
          {
            model: Ticket,
            as: "Ticket",
            where: { id: params.id },
          },
          { model: TicketStatus, as: "TicketStatus" },
        ],
        attributes: {
          exclude: ["idStatus", "idTicket"],
        },
      });
      response(res, 200, "OK", tickets);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  newTicket = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      await TicketHistory.create({
        idStatus: body.idStatus,
        idTicket: body.idTicket,
        DataAlteração: Date.now(),
      });

      response(res, 201, "Histórico do Ticket Criado com Sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateTicket = async (req: Request, res: Response) => {
    const { params, body } = req;
    const ticketExist = await TicketHistory.findByPk(params.id);

    if (!ticketExist) {
      response(res, 404, "Ticket não encontrado");
      return;
    }

    try {
      const data = {
        idStatus: body.idStatus,
        idTicket: body.idTicket,
      };

      await TicketHistory.update(data, {
        where: { id: params.id },
      });
      response(res, 200, "Ticket atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeTicket = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const ticketHisotry = await TicketHistory.destroy({
        where: { idTicket: params.id },
      });

      response(res, 200, "Ticket removido com sucesso!", ticketHisotry);
    } catch (error) {
      console.log(error);
      response(res, 500);
    }
  };
}

export default TicketsHistory;
