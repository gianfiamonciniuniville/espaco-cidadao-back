import { Request, Response } from "express";
import { response } from "../utils/response";
import { mlLocalApi } from "../config/axios";
import { IUserToken } from "../middlewares/checkToken";
import { AxiosError } from "axios";

class MLApi {
  getFullItem = async (req: Request, res: Response) => {
    const { query } = req;
    try {
      const mlb = query.mlb;
      const result = await mlLocalApi.get(`/mlbfull`, { params: { mlb: mlb } });
      response(res, 200, "OK", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  saveOrUpdateMLB = async (req: Request, res: Response) => {
    const { query } = req;
    const user = req.user as IUserToken;
    try {
      const mlb = query.mlb;
      const result = await mlLocalApi.get(`/mlbupdate`, {
        params: { mlb: mlb, email: user.email },
      });
      console.log(result);
      if (result.status === 200) {
        response(res, 200, "OK", result.data);
      } else {
        response(res, 500, "Something Wrong", result.data);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return response(res, 404, error.response.data);
        }
        if (error.response?.status === 400) {
          return response(res, 400, error.response.data);
        }
      }
      response(res, 502);
    }
  };
  changeToMe2 = async (req: Request, res: Response) => {
    const { query } = req;
    const user = req.user as IUserToken;
    try {
      const mlb = query.mlb;
      const result = await mlLocalApi.get(`/mlbtome2`, {
        params: { mlb: mlb, email: user.email },
      });
      if (result.status == 200) {
        response(res, 200, "OK", result.data);
      } else {
        response(res, 500, "Something Wrong", result.data);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  changeToMe1 = async (req: Request, res: Response) => {
    const { query } = req;
    const user = req.user as IUserToken;
    try {
      const mlb = query.mlb;
      const result = await mlLocalApi.get(`/mlbtome1`, {
        params: { mlb: mlb, email: user.email },
      });
      if (result.status == 200) {
        response(res, 200, "OK", result.data);
      } else {
        response(res, 500, "Something Wrong", result.data);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  changePrice = async (req: Request, res: Response) => {
    const { query } = req;
    const user = req.user as IUserToken;
    try {
      const mlb = query.mlb;
      const price = query.price as string;
      const numberPrice = Number(price);
      if (!price || isNaN(numberPrice) || numberPrice === 0) {
        response(res, 422, "invalid price " + price);
        return;
      }
      const result = await mlLocalApi.get(`/changeprice`, {
        params: { mlb: mlb, price: price, email: user.email },
      });
      if (result.status == 200) {
        response(res, 200, "OK", result.data);
      } else {
        response(res, 500, "Something Wrong", result.data);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  changeKeepZeroFlag = async (req: Request, res: Response) => {
    const { params } = req;
    const user = req.user as IUserToken;
    try {
      const mlb = params.mlb;
      const result = await mlLocalApi.get(`/changezeroflag`, {
        params: { mlb: mlb, email: user.email },
      });
      if (result.status == 200) {
        response(res, 200, "OK", result.data);
      } else {
        response(res, 500, "Something Wrong", result.data);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default MLApi;
