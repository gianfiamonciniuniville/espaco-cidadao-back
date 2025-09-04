import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { ComposedDescription } from "../../models/product/composedDescription";

class DescriptionsComposed {
  public descriptionComposed = Service(ComposedDescription);
  constructor() {
    this.descriptionComposed;
  }

  newComposedDescription = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idDescricao: body.idDescricao,
        Ordem: body.Ordem,
        Rotulo: body.Rotulo,
        Valor: body.Valor,
        DataComposicao: Date.now(),
      };

      const descriptionComposed = await ComposedDescription.create(data);

      response(res, 201, "OK", descriptionComposed);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateComposedDescription = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idDescricao: body.idDescricao,
        Ordem: body.Ordem,
        Rotulo: body.Rotulo,
        Valor: body.Valor,
        DataComposicao: Date.now(),
      };

      await ComposedDescription.update(data, {
        where: { idDescricaoComposicao: params.id },
      });
      response(res, 200, "Descricao atualizada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeComposedDescription = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await ComposedDescription.destroy({
        where: { idDescricaoComposicao: params.id },
      });
      response(res, 200, "Descricao excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default DescriptionsComposed;
