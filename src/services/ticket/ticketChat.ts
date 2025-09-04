import { Request, Response } from "express";
import { TicketChat } from "../../models/ticket/ticketChat";
import Service from "../Service";
import { Ticket } from "../../models/ticket/ticket";
import { User } from "../../models/user/user";
import { response } from "../../utils/response";

class TicketsChat {
  public ticketChat = Service(TicketChat);

  constructor() {
    this.ticketChat;
  }

  findAllById = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const ticketChats = await TicketChat.findAll({
        where: { idTicket: params.id },
        include: [
          {
            model: User,
            as: "Usuario",
            attributes: {
              exclude: ["senhaUsuario"],
            },
          },
        ],
      });
      response(res, 200, "OK", ticketChats);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newTicketChat = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const ticketChat = await TicketChat.create({
        idTicket: body.idTicket,
        idUsuario: body.idUsuario,
        Texto: body.Texto,
        DataHora: Date.now(),
      });

      response(res, 201, "Mensagem enviada com sucesso!", ticketChat);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default TicketsChat;
