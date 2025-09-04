import { Request, Response } from "express";
import { response } from "../utils/response";
import { mlScraper } from "../config/axios";

export class MLScraperService {
  findItemsOrScrapBySku = async (req: Request, res: Response) => {
    const { params } = req;

    if (!params.sku) {
      response(res, 422, "Informe um sku!");
      return;
    }

    try {
      const { data } = await mlScraper.get(`/mercado-libre/${params.sku}`);

      response(res, 200, "ok", data);
    } catch (error) {
      response(res, 503);
    }
  };
}
