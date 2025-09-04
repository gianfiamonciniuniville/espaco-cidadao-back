import { Request, Response } from "express";
import { response } from "../../utils/response";
import { Product } from "../../models/product/product";
import { ProductCost } from "../../models/product/productCost";

class ProductsCost {
  constructor() {}

  findAllPriceCostBySku = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const product = await Product.findOne({ where: { Sku: params.sku } });

      if (!product) {
        response(res, 404, "SKU não encontrado");
        return;
      }

      const productCost = await ProductCost.findAll({
        where: { sku: product.Sku },
      });

      if (!productCost) {
        response(res, 404, "Nenhum custo registrado para esse sku");
        return;
      }

      response(res, 200, "OK", productCost);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default ProductsCost;
