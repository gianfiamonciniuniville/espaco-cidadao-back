import { Request, Response } from "express";
import Service from "../Service";
import { TicketPriorityLevel } from "../../models/ticket/ticketPriorityLevel";
import { response } from "../../utils/response";
import { ITicketPriorityLevel } from "../../interfaces/ticketPriorityLevel";

class TicketsPriorityLevel {
  public ticketPriorityLevel = Service(TicketPriorityLevel);

  constructor() {
    this.ticketPriorityLevel;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const tickets = await TicketPriorityLevel.findAll({
        order: [["Nivel", "ASC"]],
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
      const ticket = await TicketPriorityLevel.findOne({
        where: { id: params.id },
      });

      response(res, 200, "OK", ticket);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newTicketPriorityLevel = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      await TicketPriorityLevel.create({
        Nivel: body.Nivel,
        Nome: body.Nome,
        CorHex: body.CorHex,
      });

      response(res, 201, "Nível de prioridade de ticket criado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateTicketPriorityLevel = async (req: Request, res: Response) => {
    const { params, body } = req;
    const ticketPriorityLevelExist = await TicketPriorityLevel.findByPk(params.id);

    if (!ticketPriorityLevelExist) {
      response(res, 404, "Ticket não encontrado");
      return;
    }

    try {
      const data = {
        Nome: body.Nome,
        Nivel: body.Nivel,
        CorHex: body.CorHex,
      };

      await TicketPriorityLevel.update(data, {
        where: { id: params.id },
      });
      response(res, 200, "Nível de prioridade de ticket atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAllTicketPriorityLevel = async (req: Request, res: Response) => {
    const { body } = req;
    try {
      body.forEach(async (priorityLevel: ITicketPriorityLevel) => {
        const data = {
          Nome: priorityLevel.Nome,
          Nivel: priorityLevel.Nivel,
          CorHex: priorityLevel.CorHex,
        };

        await TicketPriorityLevel.update(data, {
          where: { id: priorityLevel.id },
        });
      });
      response(res, 200, "Níveis de prioridade de ticket atualizados com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeTicketPriorityLevel = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const tickets = await TicketPriorityLevel.destroy({
        where: { id: params.id },
      });

      response(res, 200, "Nível de prioridade de ticket removido com sucesso!", tickets);
    } catch (error) {
      console.log(error);
      response(res, 500);
    }
  };
}

export default TicketsPriorityLevel;
