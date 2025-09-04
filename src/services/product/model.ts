import { Brand } from "./../../models/product/brand";
import { ProductModel } from "./../../models/product/model";
import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

class Models {
  public model = Service(ProductModel);
  constructor() {
    this.model;
  }

  findAll = async (req: Request, res: Response) => {
    const { query } = req;

    if (query.idMarca) {
      try {
        const models = await ProductModel.findAll({
          include: [{ model: Brand, as: "Marca", where: { idMarca: query.idMarca } }],
        });
        response(res, 200, "OK", models);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    } else {
      try {
        const models = await ProductModel.findAll({
          include: [{ model: Brand, as: "Marca" }],
        });
        response(res, 200, "OK", models);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { query, params } = req;

    if (query.idMarca) {
      try {
        const model = await ProductModel.findByPk(params.id, {
          include: [{ model: Brand, as: "Marca", where: { idMarca: query.idMarca } }],
        });
        response(res, 200, "OK", model);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    } else {
      try {
        const model = await ProductModel.findByPk(params.id, {
          include: [{ model: Brand, as: "Marca" }],
        });
        response(res, 200, "OK", model);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    }
  };

  newModel = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idMarca: body.idMarca,
        NomeModelo: body.NomeModelo,
        idbloco: body.idbloco ? body.idbloco : null,
      };

      const model = await ProductModel.create(data);
      //   console.log(model);
      response(res, 201, "OK", model);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateModel = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        NomeModelo: body.NomeModelo,
        idbloco: body.idbloco,
      };

      await ProductModel.update(data, {
        where: { idModelo: params.id },
      });
      response(res, 200, "Modelo atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeModel = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await ProductModel.destroy({
        where: { idModelo: params.id },
      });
      response(res, 200, "Modelo excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Models;
