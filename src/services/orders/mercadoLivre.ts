import { Request, Response } from "express";
import { generateTokenMl } from "../../utils/token";
import { mercadoLivre } from "../../config/axios";
import dotenv from "dotenv";
import { response } from "../../utils/response";
dotenv.config();

const { ML_SELLER } = process.env;
class MercadoLivre {
  public mercadoLivre: any;
  constructor() {}

  findAllOrders = async (req: Request, res: Response) => {
    const today = new Date(Date.now());
    const from = new Date();
    from.setDate(today.getDate() - 10);
    const datestr = from.toISOString().replace("Z", "");
    const token = await generateTokenMl();

    try {
      const result = await mercadoLivre.get(
        `/orders/search?seller=${ML_SELLER}&order.date_created.from=${datestr}-04:00&tags.not=integrado`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      if (result.status !== 200) {
        return response(res, 400, "algum erro com ML");
      }
      //console.log(result?.data);
      let data = result?.data.results.filter(
        (x: any) => x["mediations"] && x["status"] !== "cancelled",
      );
      response(res, 200, "OK", data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default MercadoLivre;
