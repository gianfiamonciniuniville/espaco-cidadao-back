import { Request, Response } from "express";
import { SkuObservation } from "../../models/product/skuObservation";
import Service from "../Service";
import { response } from "../../utils/response";
import { IUser, User } from "../../models/user/user";
import { Product } from "../../models/product/product";
import { Channel } from "../../models/product/channel";

export default class SkuObservations {
  public skuObservation = Service(SkuObservation);
  constructor() {
    this.skuObservation;
  }

  findAllObservations = async (req: Request, res: Response) => {
    //@ts-ignore
    const user = req.user as IUser;

    try {
      const observations = await SkuObservation.findAll({
        where: { idUsuario: user?.id },
        include: [
          { model: User, as: "Usuario", attributes: { exclude: ["senhaUsuario"] } },
          { model: Product, as: "Produto", required: false },
        ],
      });
      response(res, 200, "OK", observations);
    } catch (error) {
      response(res, 502);
    }
  };

  createObservation = async (req: Request, res: Response) => {
    const { body } = req;
    //@ts-ignore
    const user = req.user as IUser;

    const data = {
      idUsuario: user.id,
      Sku: body.Sku,
    };

    try {
      const skuObservation = await SkuObservation.create(data);
      response(res, 201, "Produto favoritado com sucesso!", skuObservation);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  deleteObservation = async (req: Request, res: Response) => {
    const { params } = req;
    //@ts-ignore
    const user = req.user as IUser;

    const observation = await SkuObservation.findOne({
      where: { Sku: params.sku, idUsuario: user.id },
    });

    if (!observation) {
      response(res, 404, "Favorito não encontrado!");
      return;
    }

    try {
      await SkuObservation.destroy({ where: { Sku: params.sku } });
      response(res, 200, "Produto desfavoritado com sucesso!");
    } catch (error) {
      response(res, 502);
    }
  };

  findObservationBySku = async (req: Request, res: Response) => {
    const { params } = req;
    //@ts-ignore
    const user = req.user as IUser;

    const observation = await SkuObservation.findOne({
      where: { Sku: params.sku, idUsuario: user.id },
    });

    if (!observation) {
      response(res, 404, "Sku não favoritado");
      return;
    }

    return response(res, 200, "OK", observation);
  };
}
