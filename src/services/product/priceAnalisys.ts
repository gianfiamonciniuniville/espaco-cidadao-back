import { Request, Response } from "express";
import { PriceSuggestion } from "../../models/product/priceSuggestion";
import { Product } from "../../models/product/product";
import { response } from "../../utils/response";
import axios from "axios";
import https from "https";
import { priceDB } from "../../config/axios";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

class PriceAnalisys {
  findAllPrices = async (req: Request, res: Response) => {
    try {
      const prices = await axios.get(
        `${priceDB}/products/prices?estoque=0&filtro=pneu&consulta=0&id_list=`,
        { httpsAgent },
      );
      response(res, 200, "OK", prices.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default PriceAnalisys;
