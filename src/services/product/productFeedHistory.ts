import { Request, Response } from "express";
import Service from "../Service";
import { response } from "../../utils/response";
import { ProductFeedHistory } from "../../models/product/productFeedHistory";
import { ProductFeedQueue } from "../../models/product/productFeedQueue";
import { ProductFeedCustomLabel } from "../../models/product/productFeedCustomLabel";
import { GoogleProduct } from "../../models/product/googleProduct";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";

class ProductsFeedHistory {
  public productFeedHistory = Service(ProductFeedHistory);
  constructor() {
    this.productFeedHistory;
  }

  newProductFeedHistory = async (req: Request, res: Response) => {
    const { body } = req;
    try {
      const productFeedQueue = await ProductFeedQueue.findOne({
        where: { Sku: body.sku },
      });

      /*
      if (productFeedQueue) {
        response(res, 409, "Produto já está na fila de feed", productFeedQueue);
        return;
      }
      */

      const googleProduct = await GoogleProduct.findOne({ where: { sku: body.sku } });

      if (!googleProduct) {
        const querySQL = `EXEC InsertGoogleProduct @sku = :sku`;

        await sequelize.query(querySQL, {
          type: QueryTypes.SELECT,
          replacements: { sku: body.sku },
        });
      }

      let customLabel;

      if (body.isStaticLabel) {
        customLabel = {
          Label: body.customLabel,
        };
      } else {
        const customLabels = (
          await ProductFeedCustomLabel.findAll({
            where: { CodLabel: 0 },
          })
        ).sort((a, b) => b.Order - a.Order);

        customLabels.some((labelRule) => {
          const { Argument, Order } = labelRule;

          if (Order === 0) {
            if (Number(body.Lucro) <= Number(Argument)) {
              customLabel = { Label: labelRule.Label };
              return true;
            }
          } else if (Number(body.Lucro) > Number(Argument)) {
            customLabel = { Label: labelRule.Label };
            return true;
          }
        });

        if (!customLabel) {
          response(res, 500, "Erro ao criar custom label");
          return;
        }
      }

      const CustomLabel0: string = customLabel.Label;

      const data = {
        Sku: body.sku,
        DataHora: Date.now(),
        Acao: body.action, // 0 - exclui, 1 - cria, 2 - atualiza
      };

      const googleProductData = {
        customLabel0: CustomLabel0,
        hasStaticCustomLabel: body.isStaticLabel,
      };

      const productFeed = await ProductFeedHistory.create(data);
      await GoogleProduct.update(googleProductData, { where: { sku: body.sku } });

      response(res, 200, "OK", productFeed);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllBySku = async (req: Request, res: Response) => {
    const { sku } = req.params;

    try {
      const productFeedHistory = await ProductFeedHistory.findAll({
        where: { Sku: sku },
        order: [["DataHora", "DESC"]],
      });

      if (productFeedHistory?.length === 0) {
        response(res, 404, "Nenhum registro encontrado");
        return;
      }

      response(res, 200, "OK", productFeedHistory);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default ProductsFeedHistory;
