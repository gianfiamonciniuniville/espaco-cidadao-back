import { id } from "date-fns/locale";
import { Request, Response } from "express";

import Service from "./Service";
import { response } from "../utils/response";
import { EpriceData } from "../models/eprice/eprice_data";
import { EpriceUrl } from "../models/eprice/eprice_url";
import { EpriceProduct } from "../models/eprice/eprice_product";
import { Sequelize } from "sequelize";
import { EpriceMerchant } from "../models/eprice/eprice_merchant";

class Eprice {
  public eprice = Service(Eprice);
  constructor() {
    this.eprice;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const epriceData = await EpriceData.findAll();

      response(res, 200, "OK", epriceData);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;
    const sku = params.sku;

    if (!sku) {
      response(res, 400, "sku é obrigatorio!");
      return;
    }

    try {
      const epriceData = await EpriceData.findAll({
        where: { in_stock: true },
        include: [
          {
            model: EpriceProduct,
            required: true,
            attributes: [],
            where: { sku },
          },
          {
            model: EpriceUrl,
            as: "url",
            required: true,
            include: [
              {
                model: EpriceMerchant,
                required: true,
                as: "merchant",
              },
            ],
          },
        ],
        order: [["price", "ASC"]],
        logging: true,
      });

      if (!epriceData.length) {
        response(res, 404, "No data found!");
        return;
      }

      response(res, 200, "OK", epriceData);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Eprice;
