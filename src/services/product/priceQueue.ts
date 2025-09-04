import { Request, Response } from "express";
import { response } from "../../utils/response";
import { PriceQueueHistory } from "../../models/product/priceQueueHistory";
import { Channel } from "../../models/product/channel";
import { Op, Order, WhereOptions } from "sequelize";
import { Product } from "../../models/product/product";
import { PriceRule } from "../../models/product/priceRule";
import { IPriceQueueHistory } from "../../interfaces/priceQueueHistory";
import { adjustPrice } from "../../utils/adjustPrice";

class PricesQueue {
  constructor() {}

  newPriceQueueHistory = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      if (body?.prices) {
        await Promise.all(
          body?.prices?.map(async (p: any) => {
            const priceRule = await PriceRule.findOne({ where: { idCanal: p.idCanal } });
            const discountValue = priceRule?.perc_descontoavista;
            await PriceQueueHistory.create({
              Sku: p.Sku,
              PrecoLista: adjustPrice(p.PrecoLista, discountValue),
              PrecoListaAntigo: adjustPrice(p.PrecoListaAntigo, discountValue),
              PrecoCarrinho: p.PrecoCarrinho ? adjustPrice(p.PrecoCarrinho, discountValue) : null,
              PrecoCarrinhoAntigo: p.PrecoCarrinhoAntigo
                ? adjustPrice(p.PrecoCarrinhoAntigo, discountValue)
                : null,
              EmailUsuario: p.EmailSugestor,
              DataHora: Date.now(),
              idCanal: p.idCanal,
              NotificarCarrinhoAbandonado: p.NotificarCarrinhoAbandonado,
              Code: p.Code,
              ItensPorKit: p.ItensPorKit,
            });

            //await ProductFeedHistory.create({ Sku: p.Sku, Acao: 2 });
            //melhor deixar pro ControllerFilaPreço fazer isso depois de alterar o preço
          }),
        );
      }

      response(res, 201, `Foram enviadas ${body.prices.length} alterações de preço!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllPriceQueueHistoryBySku = async (req: Request, res: Response) => {
    const { params, query } = req;
    try {
      const priceHistory = await PriceQueueHistory.findAndCountAll({
        where: {
          Sku: params.sku,
          [Op.or]: [
            { DataHoraUpdate: { [Op.gte]: new Date("2023-12-16") } },
            { DataHoraUpdate: null },
          ],
        } as WhereOptions<IPriceQueueHistory>,
        order: [["DataHoraUpdate", `${query?.order || "DESC"}`]],
        include: [
          {
            model: Channel,
            as: "Canal",
            include: [{ model: PriceRule, as: "RegraPreco" }],
            attributes: { exclude: ["TokenFixo", "TokenDinamico", "DescricaoComposta"] },
          },
          {
            model: Product,
            as: "Produto",
          },
        ],
      });

      if (priceHistory?.rows?.length === 0) {
        response(res, 404, "Nenhuma alteração de preço registrada");
        return;
      }

      response(res, 200, "OK", { prices: priceHistory.rows, total: priceHistory.count });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllPriceQueueHistory = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;

    try {
      let whereQueue: { Sku?: number; EmailUsuario?: { [Op.like]: string }; idCanal?: number } = {};

      if (query.sku) {
        whereQueue = { ...whereQueue, Sku: Number(query.sku) };
      }

      if (query.user) {
        whereQueue = {
          ...whereQueue,
          EmailUsuario: { [Op.like]: "%" + query.user + "%" },
        };
      }

      let order: Order = [["DataHoraUpdate", "DESC"]];

      if (query.order === "asc") {
        order = [["DataHoraUpdate", "ASC"]];
      }

      if (!isNaN(Number(query.canal)) && query.canal) {
        whereQueue = { ...whereQueue, idCanal: Number(query.canal) };
      }

      const queueHistoryMetaData = await PriceQueueHistory.findAndCountAll({
        where: whereQueue,
        limit: size,
        offset: (page - 1) * size,
      });

      const priceHistory = await PriceQueueHistory.findAndCountAll({
        where: whereQueue,
        include: [
          {
            model: Channel,
            as: "Canal",
            include: [{ model: PriceRule, as: "RegraPreco" }],
            attributes: { exclude: ["TokenFixo", "TokenDinamico", "DescricaoComposta"] },
          },
          {
            model: Product,
            as: "Produto",
          },
        ],
        order,
        limit: size,
        offset: (page - 1) * size,
      });

      response(res, 200, `OK`, {
        priceQueueHistory: priceHistory.rows,
        total: queueHistoryMetaData.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(queueHistoryMetaData.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default PricesQueue;
