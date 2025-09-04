import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { Channel } from "./../../models/product/channel";
import { PriceRule } from "../../models/product/priceRule";

class Channels {
  public channel = Service(Channel);
  constructor() {
    this.channel;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const channels = await Channel.findAll({
        include: [{ model: PriceRule, as: "RegraPreco", attributes: ["perc_descontoavista"] }],
      });

      response(res, 200, "OK", channels);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const channel = await Channel.findByPk(params.id);
      response(res, 200, "OK", channel);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newChannel = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        NomeCanal: body.NomeCanal,
        TokenDinamico: body.TokenDinamico,
        TokenFixo: body.TokenFixo,
        DescricaoComposta: body.DescricaoComposta,
        SubCanalAnyMarket: body.SubCanalAnyMarket,
      };

      const channel = await Channel.create(data);
      response(res, 201, "OK", channel);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateChannel = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        NomeCanal: body.NomeCanal,
        TokenDinamico: body.TokenDinamico,
        TokenFixo: body.TokenFixo,
        DescricaoComposta: body.DescricaoComposta,
        SubCanalAnyMarket: body.SubCanalAnyMarket,
      };

      await Channel.update(data, {
        where: { idCanal: params.id },
      });
      response(res, 200, "Canal atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeChannel = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Channel.destroy({
        where: { idCanal: params.id },
      });
      response(res, 200, "Canal excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Channels;
