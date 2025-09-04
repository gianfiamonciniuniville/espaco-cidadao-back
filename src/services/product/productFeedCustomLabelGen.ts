import { Request, Response } from "express";
import { response } from "../../utils/response";
import { ProductFeedCustomLabelGen } from "../../models/product/productFeedCustomLabelGen";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";
export default class ProductFeedCustomLabelGenService {
  constructor() {}

  findAll = async (req: Request, res: Response) => {
    try {
      //TODO - CREATE AND FIX MODEL TO RELATE WITH MODELS SEQUELIZE
      const customLabels = await sequelize.query(
        `SELECT pfg.id, pfg.label, pfp.promotion_id FROM ProdutoFeedCustomLabelGen pfg
         LEFT JOIN ProdutoFeedPromotion pfp ON pfp.id = pfg.produto_feed_promotion_id 
        `,
        {
          type: QueryTypes.SELECT,
        },
      );
      response(res, 200, "OK", customLabels);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  create = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        label: body.label,
      };

      const customLabel = await ProductFeedCustomLabelGen.create(data);

      response(res, 201, `Custom Label criada com sucesso!`, customLabel);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  delete = async (req: Request, res: Response) => {
    const { params } = req;

    const customLabel = await ProductFeedCustomLabelGen.findByPk(params.id);

    if (!customLabel) {
      response(res, 404, "Custom Label não encontrado");
      return;
    }

    try {
      await ProductFeedCustomLabelGen.destroy({
        where: {
          id: customLabel.id,
        },
      });

      response(res, 200, "Custom Label excluída com sucesso");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
