import { Request, Response } from "express";
import { response } from "../utils/response";
import axios from "axios";
import { IUserToken } from "../middlewares/checkToken";
import https from "https";
import { metaNotification } from "../config/axios";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import _ from "lodash";

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

class MetaNotification {
  async abandonedCartsReminder(req: Request, res: Response) {
    try {
      const { body } = req;
      const user = req.user as IUserToken;

      await axios.post(
        `${metaNotification}/abandoned-carts-reminder/?userEmail=${user?.email}`,
        body,
        {
          httpsAgent,
        },
      );
    } catch (error) {
      console.error("Error sending reminder and updating:", error);
      throw error;
    }
  }

  async abandonedCartsReminderBySku(req: Request, res: Response) {
    try {
      const { params } = req;
      const user = req.user;

      const result = await axios.post(
        `${metaNotification}/abandoned-carts-reminder-sku/${params.sku}?userEmail=${user?.email}`,
        {
          httpsAgent,
        },
      );
      response(res, 200, "Lembrete de carrinho abandonado enviado com sucesso!", result.data);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      response(res, 502);
    }
  }

  async findCitiesByUF(req: Request, res: Response) {
    const { params } = req;
    try {
      const querySQL = `
        exec Cidades_Lista @uf=:uf
        `;

      const cities = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: {
          uf: params.uf,
        },
      });
      response(res, 200, "Success", cities);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }
}

export default MetaNotification;
