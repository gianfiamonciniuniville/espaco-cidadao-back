import { Request, Response } from "express";

import { response } from "../../utils/response";
import Service from "../Service";

import { Url } from "../../models/product/url";
import { Channel } from "../../models/product/channel";

class Urls {
  public url = Service(Url);
  constructor() {
    this.url;
  }

  findAllByProductId = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const urls = await Url.findAll({
        include: [{ model: Channel, as: "Canal" }],
        where: { idProduto: params.idProduto },
      });

      response(res, 200, "OK", urls);
    } catch (error) {}
  };

  newUrl = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        url: body.url,
      };

      const url = await Url.create(data);
      response(res, 201, "OK", url);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateUrl = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        url: body.url,
      };

      await Url.update(data, {
        where: { idProduto: body.idProduto, idCanal: body.idCanal },
      });
      response(res, 200, "URL atualizada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Urls;
