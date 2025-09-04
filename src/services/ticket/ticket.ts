import { Request, Response } from "express";
import { Ticket } from "../../models/ticket/ticket";
import Service from "../Service";
import { TicketStatus } from "../../models/ticket/ticketStatus";
import { TicketPriorityLevel } from "../../models/ticket/ticketPriorityLevel";
import { response } from "../../utils/response";
import { TicketHistory } from "../../models/ticket/ticketHistory";
import { User } from "../../models/user/user";
import sequelize from "sequelize";

interface IFile extends Express.Multer.File {
  storageUrl?: string;
}

class Tickets {
  public ticket = Service(Ticket);

  constructor() {
    this.ticket;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const tickets = await Ticket.findAll({
        include: [
          { model: TicketStatus, as: "TicketStatus" },
          { model: TicketPriorityLevel, as: "TicketNivelPrioridade" },
          {
            model: User,
            as: "Responsavel",
            attributes: {
              exclude: ["senhaUsuario"],
            },
          },
        ],
        attributes: {
          exclude: ["idTicketNivelPrioridade", "idTicketStatus", "idResponsavel"],
        },
        order: [["TicketNivelPrioridade", "Nivel", "DESC"]],
      });

      response(res, 200, "OK", tickets);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllByUserEmail = async (req: Request, res: Response) => {
    const { query } = req;

    try {
      const tickets = await Ticket.findAll({
        include: [
          { model: TicketStatus, as: "TicketStatus" },
          { model: TicketPriorityLevel, as: "TicketNivelPrioridade" },
          {
            model: User,
            as: "Responsavel",
            attributes: {
              exclude: ["senhaUsuario"],
            },
            where: { emailUsuario: query.email as string },
          },
        ],
        attributes: {
          exclude: ["idTicketNivelPrioridade", "idTicketStatus", "idResponsavel"],
        },
        order: [["TicketNivelPrioridade", "Nivel", "DESC"]],
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
      const ticket = await Ticket.findOne({
        where: { id: params.id },
        include: [
          { model: TicketStatus, as: "TicketStatus" },
          { model: TicketPriorityLevel, as: "TicketNivelPrioridade" },
          {
            model: User,
            as: "Responsavel",
            attributes: {
              exclude: ["senhaUsuario"],
            },
          },
        ],
        attributes: {
          exclude: ["idTicketNivelPrioridade", "idTicketStatus", "idResponsavel"],
        },
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
      if (!req.file) {
        const ticket = await Ticket.create({
          Titulo: body.Titulo,
          Descricao: body.Descricao,
          EmailAutor: body.EmailAutor,
          idTicketNivelPrioridade: body.idTicketNivelPrioridade,
          idTicketStatus: body.idTicketStatus,
          Path: body.Path,
          DataAutoria: Date.now(),
        });

        await TicketHistory.create({
          idStatus: body.idTicketStatus,
          idTicket: ticket.id,
          DataAlteração: Date.now(),
        });

        response(res, 201, "Ticket Criado com sucesso!", ticket);
      } else {
        const { storageUrl } = req.file as IFile;
        const ticket = await Ticket.create({
          Titulo: body.Titulo,
          Descricao: body.Descricao,
          EmailAutor: body.EmailAutor,
          idTicketNivelPrioridade: body.idTicketNivelPrioridade,
          idTicketStatus: body.idTicketStatus,
          Path: storageUrl,
          DataAutoria: Date.now(),
        });

        await TicketHistory.create({
          idStatus: body.idTicketStatus,
          idTicket: ticket.id,
          DataAlteração: Date.now(),
        });

        response(res, 201, "Ticket Criado com sucesso!", ticket);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateTicket = async (req: Request, res: Response) => {
    const { params, body } = req;
    const ticketExist = await Ticket.findByPk(params.id);

    if (!ticketExist) {
      response(res, 404, "Ticket não encontrado");
      return;
    }

    try {
      const data = {
        Titulo: body.Titulo,
        Descricao: body.Descricao,
        idTicketNivelPrioridade: body.idTicketNivelPrioridade,
        idTicketStatus: body.idTicketStatus,
        idResponsavel: body.idResponsavel,
      };

      await Ticket.update(data, {
        where: { id: params.id },
      });

      if (body.idTicketStatus) {
        await TicketHistory.create({
          idStatus: body.idTicketStatus,
          idTicket: Number(params.id),
          DataAlteração: Date.now(),
        });
      }

      response(res, 200, "Ticket atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeTicket = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const tickets = await Ticket.destroy({
        where: { id: params.id },
      });

      response(res, 200, "Ticket removido com sucesso!", tickets);
    } catch (error) {
      console.log(error);
      response(res, 500);
    }
  };

  countOpenTickets = async (req: Request, res: Response) => {
    try {
      const tickets = await Ticket.findAndCountAll({
        where: { idTicketStatus: 1 },
      });
      response(res, 200, "OK", tickets.count);
    } catch (error) {
      console.log(error);
      response(res, 500);
    }
  };
}

export default Tickets;
