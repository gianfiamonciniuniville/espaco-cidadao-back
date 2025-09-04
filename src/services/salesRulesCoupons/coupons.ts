import axios from "axios";
import { Request, Response } from "express";
import https from "https";

import { coupons } from "../../config/axios";
import { response } from "../../utils/response";
import { IUserToken } from "../../middlewares/checkToken";

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

class CouponsService {
  async findCouponById(req: Request, res: Response) {
    try {
      const { query } = req;
      const result = await axios.get(`${coupons}/listCouponsById?ruleId=${query.ruleId}`, {
        httpsAgent,
      });

      response(res, 200, "Cupom listado com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async couponGenerator(req: Request, res: Response) {
    try {
      const { body } = req;
      const user = req.user as IUserToken;

      const result = await axios.post(`${coupons}/couponGenerator`, body, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Cupom aleatório gerado com sucesso!", result.data);
    } catch (error: any) {
      console.log(error);
      response(res, 502);
    }
  }

  async new(req: Request, res: Response) {
    try {
      const { body } = req;
      const user = req.user as IUserToken;

      const result = await axios.post(`${coupons}/createCoupon`, body, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Cupom criado com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { body, params } = req;
      const user = req.user as IUserToken;

      const result = await axios.put(`${coupons}/updateCoupon/${params.couponId}`, body, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Cupom atualizado com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { params } = req;
      const user = req.user as IUserToken;

      const result = await axios.delete(`${coupons}/deleteCoupon/${params.couponId}`, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Cupom deletado com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }
}

export default CouponsService;
