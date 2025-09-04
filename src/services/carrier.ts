import { Request, Response } from "express";

import Service from "./Service";
import { response } from "../utils/response";
import { Carrier } from "../models/carrier";
import { Op } from "sequelize";
class Carriers {
  public carrier = Service(Carrier);
  constructor() {
    this.carrier;
  }

  findAll = async (req: Request, res: Response) => {
    const { query } = req;

    // check if exclude is an array, otherwise set it to an empty array
    const exclude = Array.isArray(query?.exclude) ? query?.exclude : [];

    try {
      const carriers = await Carrier.findAll({
        where: {
          // exclude unused carriers, check frontend for the list of excludes ones
          ...(exclude && { Nome: { [Op.notIn]: exclude } }),
        },
      });

      response(res, 200, "OK", carriers);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllPagination = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;
    try {
      let whereCarrier: {
        Nome?: { [Op.like]: string };
      } = {};

      if (query.search) {
        whereCarrier = {
          ...whereCarrier,
          Nome: { [Op.like]: "%" + query.search + "%" },
        };
      }
      const carriers = await Carrier.findAndCountAll({
        where: whereCarrier,
        distinct: true,
        limit: size,
        offset: (page - 1) * size,
      });

      response(res, 200, "OK", {
        carriers: carriers.rows,
        total: carriers.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(carriers.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const carrier = await Carrier.findByPk(params.id);

      if (!carrier) {
        response(res, 404, "Transportadora não encontrada!");
        return;
      }

      response(res, 200, "OK", carrier);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newCarrier = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        Nome: body.Nome,
        CodigoERP: body.CodigoERP,
        Intelipost: body.Intelipost,
        Datafrete: body.Datafrete,
        MercadoLivre: body.MercadoLivre,
      };

      const carrier = await Carrier.create(data);
      response(res, 201, "OK", carrier);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateCarrier = async (req: Request, res: Response) => {
    const { params, body } = req;

    const carrier = await Carrier.findByPk(params.id);

    if (!carrier) {
      response(res, 404, "Transportadora não encontrada!");
      return;
    }

    try {
      const data = {
        Nome: body.Nome,
        CodigoERP: body.CodigoERP,
        Intelipost: body.Intelipost,
        Datafrete: body.Datafrete,
        MercadoLivre: body.MercadoLivre,
      };

      await Carrier.update(data, {
        where: { idTransportadora: params.id },
      });

      const carrier = await Carrier.findByPk(params.id);

      response(res, 200, "Transportadora atualizada com sucesso!", carrier);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeCarrier = async (req: Request, res: Response) => {
    const { params } = req;

    const carrier = await Carrier.findByPk(params.id);

    if (!carrier) {
      response(res, 404, "Transportadora não encontrada!");
      return;
    }

    try {
      await Carrier.destroy({
        where: { idTransportadora: params.id },
      });
      response(res, 200, "Transportadora excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Carriers;
