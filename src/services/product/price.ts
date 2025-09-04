import { Request, Response } from "express";
import { Op } from "sequelize";

import Service from "../Service";
import { response } from "../../utils/response";

import { Price } from "./../../models/product/price";
import { Product } from "../../models/product/product";
import { Channel } from "../../models/product/channel";

class Prices {
  public price = Service(Price);
  constructor() {
    this.price;
  }

  newPrice = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        PrecoLista: body.PrecoLista,
        PrecoPromocional: body.PrecoPromocional,
        PrecoCarrinho: body.PrecoCarrinho,
        EmailAutor: body.EmailAutor,
        DataAutoria: Date.now(),
        DataInicio: body.DataInicio,
      };

      const price = await Price.create(data);
      response(res, 201, "OK", price);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updatePrice = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        PrecoLista: body.PrecoLista,
        PrecoPromocional: body.PrecoPromocional,
        PrecoCarrinho: body.PrecoCarrinho,
        EmailAutor: body.EmailAutor,
        DataAutoria: Date.now(),
        DataInicio: body.DataInicio,
      };

      await Price.update(data, {
        where: { idPreco: params.id },
      });
      response(res, 200, "Preco atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removePrice = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Price.destroy({
        where: { idPreco: params.id },
      });
      response(res, 200, "Preco excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllPrice = async (req: Request, res: Response) => {
    const { query } = req;

    try {
      //FIND WITH STOCK
      if (query.stock === "true") {
        const prices = await Price.findAll({
          include: [
            { model: Product, as: "Produto", where: { QtdStock: { [Op.gt]: 0 } } },
            { model: Channel, as: "Canal" },
          ],
        });
        response(res, 200, "OK", prices);
      }

      //FIND WITH STOCK < 0
      if (query.stock === "false") {
        const prices = await Price.findAll({
          include: [
            { model: Product, as: "Produto", where: { QtdStock: 0 } },
            { model: Channel, as: "Canal" },
          ],
        });
        response(res, 200, "OK", prices);
      }

      //FIND WITH SKU
      if (query.sku) {
        const prices = await Price.findAll({
          include: [
            { model: Product, as: "Produto", where: { Sku: query.sku } },
            { model: Channel, as: "Canal" },
          ],
        });
        response(res, 200, "OK", prices);
      }

      //FIND WITHOUT SKU AND STOCK
      if (!query.sku && !query.stock) {
        const prices = await Price.findAll({
          include: [
            { model: Product, as: "Produto" },
            { model: Channel, as: "Canal" },
          ],
        });
        response(res, 200, "OK", prices);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Prices;
