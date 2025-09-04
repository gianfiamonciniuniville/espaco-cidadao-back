import { Request, Response } from "express";
import { FavoriteSku } from "../../models/product/favoriteSku";
import Service from "../Service";
import { response } from "../../utils/response";
import { IUser, User } from "../../models/user/user";
import { Product } from "../../models/product/product";
import { Channel } from "../../models/product/channel";

export default class FavoriteSkus {
  public favoriteSku = Service(FavoriteSku);
  constructor() {
    this.favoriteSku;
  }

  findAllFavorites = async (req: Request, res: Response) => {
    //@ts-ignore
    const user = req.user as IUser;

    try {
      const favorites = await FavoriteSku.findAll({
        where: { idUsuario: user?.id },
        include: [
          { model: User, as: "Usuario", attributes: { exclude: ["senhaUsuario"] } },
          { model: Product, as: "Produto", required: false },
          { model: Channel, as: "Canal", required: false },
        ],
      });
      response(res, 200, "OK", favorites);
    } catch (error) {
      response(res, 502);
    }
  };

  crateFavorite = async (req: Request, res: Response) => {
    const { body } = req;
    //@ts-ignore
    const user = req.user as IUser;

    const data = {
      idUsuario: user.id,
      Sku: body.Sku,
      idCanal: body.idCanal,
    };

    try {
      const favoriteSku = await FavoriteSku.create(data);

      response(res, 201, "Sku favoritado com sucesso!", favoriteSku);
    } catch (error) {
      response(res, 502);
    }
  };

  deleteFavorite = async (req: Request, res: Response) => {
    const { params } = req;
    //@ts-ignore
    const user = req.user as IUser;

    const favorite = await FavoriteSku.findOne({ where: { Sku: params.sku } });

    if (!favorite) {
      response(res, 404, "Favorito não encontrado!");
      return;
    }

    try {
      await FavoriteSku.destroy({ where: { Sku: params.sku, idUsuario: user.id } });
      response(res, 200, "Favorito excluido com sucesso!");
    } catch (error) {
      response(res, 502);
    }
  };

  findFavoriteBySku = async (req: Request, res: Response) => {
    const { params } = req;
    //@ts-ignore
    const user = req.user as IUser;

    const favorite = await FavoriteSku.findOne({
      where: { Sku: params.sku, idUsuario: user.id },
    });

    if (!favorite) {
      response(res, 404, "Sku não favoritado");
      return;
    }

    return response(res, 200, "OK", favorite);
  };
}
