import { Request, Response } from "express";
import { response } from "../../utils/response";
import { ProductFeedCustomLabel } from "../../models/product/productFeedCustomLabel";
import { IProductFeedCustomLabel } from "../../interfaces/productFeedCustomLabel";

export default class ProductsFeedCustomLabel {
  constructor() {}

  findAll = async (req: Request, res: Response) => {
    try {
      const customLabel = await ProductFeedCustomLabel.findAll({
        order: [["Order", "ASC"]],
      });
      response(res, 200, "OK", customLabel);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  create = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      body.customLabels.forEach(async (customLabel: IProductFeedCustomLabel) => {
        const data = {
          Argument: customLabel.Argument,
          Label: customLabel.Label,
          CodLabel: customLabel.CodLabel,
          Order: customLabel.Order,
          Comparator: customLabel.Comparator,
        };

        await ProductFeedCustomLabel.create(data);
      });
      response(res, 201, `Foram criados ${body.customLabels.length} custom labels!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  update = async (req: Request, res: Response) => {
    const { body, params } = req;

    try {
      body.customLabels.forEach(async (customLabel: IProductFeedCustomLabel) => {
        const customLabelInTable = await ProductFeedCustomLabel.findByPk(customLabel.idCustomLabel);

        if (!customLabelInTable) {
          return;
        }

        const data = {
          Argument: customLabel.Argument,
          Label: customLabel.Label,
          CodLabel: customLabel.CodLabel,
          Order: customLabel.Order,
          Comparator: customLabel.Comparator,
        };

        await ProductFeedCustomLabel.update(data, {
          where: {
            idCustomLabel: customLabel.idCustomLabel,
          },
        });
      });
      response(res, 201, `Foram atualizados ${body.customLabels.length} custom labels!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  delete = async (req: Request, res: Response) => {
    const { params } = req;

    const customLabel = await ProductFeedCustomLabel.findByPk(params.id);

    if (!customLabel) {
      response(res, 404, "Custom Label não encontrado");
      return;
    }

    try {
      await ProductFeedCustomLabel.destroy({
        where: {
          idCustomLabel: customLabel.idCustomLabel,
        },
      });

      response(res, 200, "OK");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
