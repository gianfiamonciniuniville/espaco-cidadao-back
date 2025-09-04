import { Request, Response } from "express";
import Service from "../Service";
import { TicketStatus } from "../../models/ticket/ticketStatus";
import { TicketPriorityLevel } from "../../models/ticket/ticketPriorityLevel";
import { response } from "../../utils/response";
import { ITicketStatus } from "../../interfaces/ticketStatus";

class TicketsStatus {
  public ticketStatus = Service(TicketStatus);

  constructor() {
    this.ticketStatus;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const tickets = await TicketStatus.findAll({
        order: [["Ordem", "ASC"]],
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
      const ticket = await TicketStatus.findOne({
        where: { id: params.id },
      });

      response(res, 200, "OK", ticket);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newTicket = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      await TicketStatus.create({
        EmailAutor: body.EmailAutor,
        Descricao: body.Descricao,
        DataAutoria: Date.now(),
        Ordem: body.Ordem,
      });

      response(res, 201, "Status de Ticket Criado com Sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateTicket = async (req: Request, res: Response) => {
    const { params, body } = req;
    const ticketStatusExist = await TicketStatus.findByPk(params.id);

    if (!ticketStatusExist) {
      response(res, 404, "Ticket não encontrado");
      return;
    }

    try {
      const data = {
        Descricao: body.Descricao,
      };

      await TicketStatus.update(data, {
        where: { id: params.id },
      });
      response(res, 200, "Ticket atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAllTicketStatus = async (req: Request, res: Response) => {
    const { body } = req;
    try {
      body.forEach(async (status: ITicketStatus) => {
        const data = {
          Descricao: status.Descricao,
          Ordem: status.Ordem,
        };

        await TicketStatus.update(data, {
          where: { id: status.id },
        });
      });
      response(res, 200, "Status de tickets atualizados com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeTicket = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const tickets = await TicketStatus.destroy({
        where: { id: params.id },
      });

      response(res, 200, "Status de ticket removido com sucesso!", tickets);
    } catch (error) {
      console.log(error);
      response(res, 500);
    }
  };
}

export default TicketsStatus;
