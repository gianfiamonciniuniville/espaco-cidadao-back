import { PriceSuggestionHistory } from "./../../models/product/priceSuggestionHistory";
import { Request, Response } from "express";
import Service from "../Service";
import { response } from "../../utils/response";
import { PriceSuggestion } from "../../models/product/priceSuggestion";
import { Channel } from "../../models/product/channel";
import { PriceQueueHistory } from "../../models/product/priceQueueHistory";
import { errorLogger, infoLogger } from "../../config/logger";
import { Op, Order } from "sequelize";
import { PriceRule } from "../../models/product/priceRule";
import { adjustPrice } from "../../utils/adjustPrice";

class PriceSuggestionsHistory {
  newPriceSuggestionHistory = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      if (!body?.prices?.length) throw new Error("Nenhum Preço Sugestão Encontrado");

      const priceSuggentionsFromDB = await PriceSuggestion.findAll({
        where: {
          idPrecoSugestao: {
            [Op.in]: body.prices.map((price: any) => price.idPrecoSugestao),
          },
        },
      });

      const newPriceSuggestions = priceSuggentionsFromDB.map((priceSuggestion) => {
        const price = body.prices.find(
          (price: any) => price.idPrecoSugestao === priceSuggestion.idPrecoSugestao,
        );

        infoLogger.info({
          message: `body.prices /*${JSON.stringify(
            body.prices,
          )}*/ && Elemento percorrido no body.prices /*${JSON.stringify(
            price,
          )}*/ && Verifica se PreçoSugestão Existe /*${JSON.stringify(priceSuggestion)}*/`,
        });

        if (!price) throw new Error("Preço Sugestão Nao Encontrado");
        const dataSuggestion = {
          DataSugestao: priceSuggestion.DataSugestao,
          DataAutorizacao: Date.now(),
          Autorizado: price.Autorizado,
          EmailAutorizador: price.EmailAutorizador,
          EmailSugestor: priceSuggestion.EmailSugestor,
          PrecoLista: priceSuggestion.PrecoLista,
          PrecoCarrinho: priceSuggestion.PrecoCarrinho,
          PrecoCarrinhoAntigo: priceSuggestion.PrecoCarrinhoAntigo,
          PrecoListaAntigo: priceSuggestion.PrecoListaAntigo,
          Sku: priceSuggestion.Sku,
          NomeProduto: priceSuggestion.NomeProduto,
          idCanal: priceSuggestion.idCanal,
          idProduto: priceSuggestion.idProduto,
          DataPromoInicio: priceSuggestion.DataPromoInicio,
          DataPromoFim: priceSuggestion.DataPromoFim,
          CustoMedio: priceSuggestion.CustoMedio,
          CustoTabela: priceSuggestion.CustoTabela,
          TaxaMax: priceSuggestion.TaxaMax,
          ItensPorKit: priceSuggestion.ItensPorKit,
          Code: priceSuggestion.Code,
        };
        return dataSuggestion;
      });
      const approvedPriceSuggestions = newPriceSuggestions.filter(
        (priceSuggestion) => priceSuggestion.Autorizado === "S",
      );

      await this.#sendToPublishQueue(approvedPriceSuggestions);

      const idsToErase = priceSuggentionsFromDB
        .map((price) => price.idPrecoSugestao)
        .filter((id): id is number => typeof id === "number");

      this.#updatePriceSuggestionHistory(newPriceSuggestions, { ids: idsToErase });

      const priceSuggestions = await PriceSuggestion.findAndCountAll({
        include: [{ model: Channel, as: "Canal" }],
        distinct: true,
        order: [["DataSugestao", "DESC"]],
        limit: 10,
        offset: (1 - 1) * 10,
      });

      response(res, 201, "Dados de autorização enviados com sucesso!", {
        priceSuggestions: priceSuggestions.rows,
        total: priceSuggestions.count,
        limit: 10,
        actualPage: 1,
        totalPages: Math.ceil(priceSuggestions.count / 10),
      });
    } catch (error) {
      errorLogger.error(JSON.stringify(error));
      console.log(error);
      response(res, 502);
    }
  };

  #sendToPublishQueue = async (body: any[]) => {
    const priceRules = await PriceRule.findAll({
      where: {
        idCanal: {
          [Op.in]: body.map((price: any) => price.idCanal),
        },
      },
    });
    const requests = body.map((newPrices: any) => {
      const priceRule = priceRules.find((priceRule) => priceRule.idCanal === newPrices.idCanal);
      const discount = priceRule?.perc_descontoavista;
      const dataQueue = {
        DataHora: newPrices.DataAutorizacao,
        EmailUsuario: newPrices.EmailSugestor,
        PrecoCarrinho: newPrices.PrecoCarrinho
          ? adjustPrice(newPrices.PrecoCarrinho, discount)
          : null,
        PrecoCarrinhoAntigo: newPrices.PrecoCarrinhoAntigo
          ? adjustPrice(newPrices.PrecoCarrinhoAntigo, discount)
          : null,
        PrecoLista: adjustPrice(newPrices.PrecoLista, discount),
        PrecoListaAntigo: adjustPrice(newPrices.PrecoListaAntigo, discount),
        Sku: newPrices.Sku,
        DataPromoInicio: newPrices.DataPromoInicio,
        DataPromoFim: newPrices.DataPromoFim,
        idCanal: newPrices.idCanal,
        CustoMedio: newPrices.CustoMedio,
        CustoTabela: newPrices.CustoTabela,
        TaxaMax: newPrices.TaxaMax,
        Code: newPrices.Code,
        ItensPorKit: newPrices.ItensPorKit,
      };
      return dataQueue;
    });

    return PriceQueueHistory.bulkCreate(requests);
  };

  /** Update history and delete suggestions */
  async #updatePriceSuggestionHistory(records: any[], { ids }: { ids: number[] }) {
    PriceSuggestionHistory.bulkCreate(records).catch((error) => {
      console.log(error);
    });

    PriceSuggestion.destroy({
      where: {
        idPrecoSugestao: {
          [Op.in]: ids,
        },
      },
    }).catch((error) => {
      console.log(error);
    });
  }

  findAllPriceSuggestionHistory = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;

    try {
      let whereSuggestion: {
        Sku?: number;
        idCanal?: number;
        EmailSugestor?: { [Op.like]: string };
        Autorizado?: string;
      } = {};

      if (query.sku) {
        whereSuggestion = { ...whereSuggestion, Sku: Number(query.sku) };
      }

      if (query.user) {
        whereSuggestion = {
          ...whereSuggestion,
          EmailSugestor: { [Op.like]: "%" + query.user + "%" },
        };
      }

      let order: Order = [["DataSugestao", "DESC"]];

      if (query.order === "asc") {
        order = [["DataSugestao", "ASC"]];
      }

      if (query.orderAuth) {
        whereSuggestion = { ...whereSuggestion, Autorizado: query.orderAuth as string };
      }

      if (!isNaN(Number(query.canal)) && query.canal) {
        whereSuggestion = { ...whereSuggestion, idCanal: Number(query.canal) };
      }

      const suggestionHistory = await PriceSuggestionHistory.findAndCountAll({
        where: whereSuggestion,
        include: [{ model: Channel, as: "Canal" }],
        distinct: true,
        order,
        limit: size,
        offset: (page - 1) * size,
      });

      response(res, 200, `OK`, {
        priceSuggestionsHistory: suggestionHistory.rows,
        total: suggestionHistory.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(suggestionHistory.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default PriceSuggestionsHistory;
