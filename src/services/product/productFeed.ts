import { Request, Response } from "express";
import { response } from "../../utils/response";
import { ProductFeed } from "../../models/product/productFeed";

export default class ProductsFeed {
  constructor() {}

  findBySku = async (req: Request, res: Response) => {
    const { sku } = req.params;

    if (!sku) {
      response(res, 400, "SKU não informado");
      return;
    }

    try {
      const productFeed = await ProductFeed.findOne({
        where: {
          Sku: sku,
        },
      });

      response(res, 200, "OK", productFeed);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
