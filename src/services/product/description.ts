import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { Description } from "./../../models/product/description";

class Descriptions {
  public description = Service(Description);
  constructor() {
    this.description;
  }

  newDescription = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        DescricaoProduto: body.DescricaoProduto,
      };

      const description = await Description.create(data);
      response(res, 201, "OK", description);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateDescription = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        DescricaoProduto: body.DescricaoProduto,
      };

      await Description.update(data, {
        where: { idDescricao: params.id },
      });
      response(res, 200, "Descricao atualizada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeDescription = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Description.destroy({
        where: { idDescricao: params.id },
      });
      response(res, 200, "Descricao excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Descriptions;
