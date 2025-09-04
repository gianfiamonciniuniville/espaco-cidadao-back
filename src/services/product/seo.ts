import { Request, Response } from "express";

import { response } from "../../utils/response";
import Service from "../Service";

import { Seo } from "../../models/product/seo";

class Seos {
  public seo = Service(Seo);
  constructor() {
    this.seo;
  }

  newSeo = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        PageTitle: body.PageTitle,
        MetaDescription: body.MetaDescription,
        Ativo: body.Ativo,
      };

      const seo = await Seo.create(data);
      response(res, 201, "OK", seo);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateSeo = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idCanal: body.idCanal,
        PageTitle: body.PageTitle,
        MetaDescription: body.MetaDescription,
        Ativo: body.Ativo,
      };

      if (body.Ativo === "S") {
        //verifica se o ativo é 'S'
        await Seo.update(
          { Ativo: "N" }, //atualiza todos os outros ativos para 'N'
          { where: { idProduto: body.idProduto, idCanal: body.idCanal } },
        );
      }

      await Seo.update(data, {
        where: { idProduto: body.idProduto, idSeo: params.id },
      });
      response(res, 200, "Seo atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeSeo = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Seo.destroy({
        where: { idSeo: params.id },
      });
      response(res, 200, "Seo excluído com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Seos;
