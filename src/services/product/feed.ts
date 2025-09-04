import { Request, Response } from "express";
import { response } from "../../utils/response";
import { Feed } from "../../models/product/feed";

export default class Feeds {
  constructor() {}

  findAll = async (req: Request, res: Response) => {
    try {
      const feeds = await Feed.findAll();

      response(res, 200, "OK", feeds);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
