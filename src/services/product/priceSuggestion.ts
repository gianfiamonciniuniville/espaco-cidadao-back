import { Request, Response } from "express";
import { PriceSuggestion } from "../../models/product/priceSuggestion";
import { Product } from "../../models/product/product";
import { response } from "../../utils/response";
import { Channel } from "../../models/product/channel";
import { Order } from "sequelize";
import { Op } from "sequelize";

class PriceSuggestions {
  newSuggestion = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      if (!body?.prices) {
        return response(res, 400, "Precisa enviar os precos");
      }
      const results = await Promise.allSettled(
        body.prices.map(async (product: any) => {
          const productFromDatabase = await Product.findOne({ where: { Sku: product.Sku } });
          if (!productFromDatabase) throw new Error(`Product with Sku ${product.Sku} not found`);
          const price = Number(product.PrecoCarrinho || product.PrecoLista);
          const cost = product.CustoMedio || 0;
          const tax = product.TaxaMax;
          const extraCost = product.DescProduto?.includes("Pneu ") ? 0 : price * NOT_PNEU_FEE;
          const { percentProfit: percentProfitMax, profit: calcProfitMax } = this.#calculateProfit(
            price,
            cost + extraCost,
            tax,
          );

          return PriceSuggestion.create({
            idProduto: productFromDatabase.idProduto,
            Sku: product.Sku,
            NomeProduto: product.NomeProduto,
            PrecoLista: product.PrecoLista,
            CustoMedio: product.CustoMedio,
            CustoTabela: product.CustoTabela,
            PrecoListaAntigo: product.PrecoListaAntigo,
            PrecoCarrinho: product.PrecoCarrinho,
            PrecoCarrinhoAntigo: product.PrecoCarrinhoAntigo,
            DataPromoInicio: product.DataPromoInicio,
            DataPromoFim: product.DataPromoFim,
            EmailSugestor: product.EmailSugestor,
            TaxaMax: product.TaxaMax,
            LucroPiorCaso: calcProfitMax,
            PercentualLucroPiorCaso: percentProfitMax,
            DataSugestao: Date.now(),
            idCanal: product.idCanal,
            Code: product.Code,
            ItensPorKit: product.ItensPorKit,
          });
        }),
      );
      const validatedResults = results.filter((result) => result.status === "fulfilled");
      response(res, 201, `Foram enviadas ${validatedResults.length} novas sugestões de preço!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllSuggestion = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;

    try {
      let whereSuggestion: {
        Sku?: number;
        EmailSugestor?: { [Op.like]: string };
        idCanal?: number;
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

      if (query.canal) {
        whereSuggestion = { ...whereSuggestion, idCanal: Number(query.canal) };
      }

      const suggestionMetaData = await PriceSuggestion.findAndCountAll({
        where: whereSuggestion,
        limit: size,
        offset: (page - 1) * size,
      });

      const prices = await PriceSuggestion.findAndCountAll({
        where: whereSuggestion,
        include: [{ model: Channel, as: "Canal" }],
        order,
        limit: size,
        offset: (page - 1) * size,
      });

      response(res, 200, `OK`, {
        priceSuggestions: prices.rows,
        total: suggestionMetaData.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(suggestionMetaData.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOneSuggestion = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const price = await PriceSuggestion.findOne({
        where: { Sku: params.sku },
        include: [{ model: Channel, as: "Canal" }],
      });

      response(res, 200, `OK`, price);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  #calculateProfit = (price: number, cost: number, tax: number) => {
    const profit = price * (1 - tax / 100) - cost;
    const percentProfit = (profit / price) * 100;

    return {
      profit,
      percentProfit,
    };
  };
}

const NOT_PNEU_FEE = 0.02;

export default PriceSuggestions;
