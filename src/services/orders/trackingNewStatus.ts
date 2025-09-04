import { Request, Response } from "express";
import { IssueStatusTracking } from "../../models/orderTracking/issueStatusTracking";
import { response } from "../../utils/response";

class NewStatusTracking {
  findAll = async (_: Request, res: Response) => {
    try {
      const status = await IssueStatusTracking.findAndCountAll();
      response(res, 200, "OK", status);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default NewStatusTracking;
