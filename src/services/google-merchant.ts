import { Request, Response } from "express";
import { response } from "./../utils/response";
import Merchant from "../clients/google/merchant";
import { Product } from "../models/product/product";

export interface IAttributeValues {
  Atributo: string;
  Valor?: string;
}

class GoogleMerchant {
  private merchant: Merchant;
  constructor() {
    this.merchant = new Merchant();
  }

  getProductInMerchantById = async (req: Request, res: Response) => {
    const { params } = req;

    const product = await Product.findOne({ where: { Sku: params.sku } });

    if (!product) {
      response(res, 404, "Produto não encontrado!");
      return;
    }

    try {
      const productFeed = await this.merchant.getOneProductById(product.Sku);
      response(res, 200, "OK", productFeed);
    } catch (error) {
      if (error instanceof Error) {
        response(res, 404, error.message);
        return;
      }
      response(res, 502);
    }
  };

  getAllProductsInMerchant = async (req: Request, res: Response) => {
    const { query } = req;

    try {
      const products = await this.merchant.getAllProducts();

      response(res, 200, "ok", products);
    } catch (error) {
      response(res, 502);
    }
  };

  getAllFeeds = async (req: Request, res: Response) => {
    try {
      const feeds = await this.merchant.getAllFeeds();

      response(res, 200, "ok", feeds);
    } catch (error) {
      response(res, 502);
    }
  };
}

export default GoogleMerchant;
