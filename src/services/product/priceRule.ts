import { Request, Response } from "express";
import { response } from "../../utils/response";
import { PriceRule } from "../../models/product/priceRule";
import { discountedInstallment } from "../../config/axios";
import https from "https";
import axios from "axios";

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

class PriceRuleService {
  create = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idCanal: body.idCanal,
        perc_descontoavista: body.perc_descontoavista,
        perc_taxamktplace: body.perc_taxamktplace,
      };

      const price = await PriceRule.create(data);
      response(res, 201, "OK", price);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  update = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idCanal: body.idCanal,
        perc_descontoavista: body.perc_descontoavista,
        perc_taxamktplace: body.perc_taxamktplace,
      };

      await PriceRule.update(data, {
        where: { idRegraPreco: params.id },
      });
      response(res, 200, "RegraPreco atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  remove = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await PriceRule.destroy({
        where: { idRegraPreco: params.id },
      });
      response(res, 200, "RegraPreco excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const priceRules = await PriceRule.findAll({});
      response(res, 200, "OK", priceRules);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  updatePriceRuleByChannelId = async (req: Request, res: Response) => {
    const { body, params } = req;

    try {
      const priceRule = await PriceRule.findOne({
        where: { idCanal: params.id },
      });

      if (!priceRule) response(res, 404, "Regra de preço não encontrada");

      const data = {
        perc_descontoavista: body.perc_descontoavista,
        perc_taxamktplace: body.perc_taxamktplace,
      };

      await PriceRule.update(data, {
        where: { idCanal: params.id },
      });

      const result = await axios.put(`${discountedInstallment}/DiscountedPixSlip`, data, {
        httpsAgent,
      });

      if (result.status === 200) {
        response(res, 200, "Regra de preço atualizada com sucesso!");
      } else {
        response(res, 502, "Erro ao atualizar a API externa.");
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findPriceRuleByChannelId = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const priceRule = await PriceRule.findOne({
        where: { idCanal: params.id },
      });

      if (!priceRule) response(res, 404, "Regra de preço não encontrada");

      response(res, 200, "OK", priceRule);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default PriceRuleService;
