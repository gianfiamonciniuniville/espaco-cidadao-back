import { Request, Response } from "express";

import Service from "./Service";
import { response } from "../utils/response";
import { CarrierChannel } from "../models/carrier-channel";
import { Carrier } from "../models/carrier";
import { Channel } from "../models/product/channel";
class CarriersChannel {
  public carrierChannel = Service(CarrierChannel);
  constructor() {
    this.carrierChannel;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const carriersChannel = await CarrierChannel.findAll({
        include: [
          { model: Channel, as: "Canal" },
          { model: Carrier, as: "Transportadora" },
        ],
      });

      response(res, 200, "OK", carriersChannel);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newCarrierChannel = async (req: Request, res: Response) => {
    const { body } = req;

    const carrierExists = await Carrier.findByPk(body.idTransportadora);
    const channelExists = await Channel.findByPk(body.idCanal);

    if (!carrierExists) {
      response(res, 404, "Transportadora não cadastrada no sistema!");
      return;
    }

    if (!channelExists) {
      response(res, 404, "Canal não cadastrado no sistema!");
      return;
    }

    try {
      const data = {
        idTransportadora: body.idTransportadora,
        idCanal: body.idCanal,
        Codigo: body.Codigo,
      };

      const carrierChannel = await CarrierChannel.create(data);
      response(res, 201, "OK", carrierChannel);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateCarrierChannel = async (req: Request, res: Response) => {
    const { body } = req;

    const carrierChannel = await CarrierChannel.findOne({
      where: { idCanal: body.idCanal, idTransportadora: body.idTransportadora },
    });

    if (!carrierChannel) {
      response(res, 404, "Relação transportadora/canal não encontrada!");
      return;
    }

    try {
      const data = {
        Codigo: body.Codigo,
      };

      await CarrierChannel.update(data, {
        where: { idTransportadora: body.idTransportadora, idCanal: body.idCanal },
      });

      const carrierChannel = await CarrierChannel.findOne({
        where: { idCanal: body.idCanal, idTransportadora: body.idTransportadora },
      });

      response(res, 200, "Relação transportadora/canal atualizada com sucesso!", carrierChannel);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeCarrierChannel = async (req: Request, res: Response) => {
    const { query } = req;

    const carrierChannel = await CarrierChannel.findOne({
      where: { idCanal: Number(query.idCanal), idTransportadora: Number(query.idTransportadora) },
    });

    if (!carrierChannel) {
      response(res, 404, "Relação transportadora/canal não encontrada!");
      return;
    }

    try {
      await CarrierChannel.destroy({
        where: { idCanal: Number(query.idCanal), idTransportadora: Number(query.idTransportadora) },
      });
      response(res, 200, "Relação transportadora/canal excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default CarriersChannel;
