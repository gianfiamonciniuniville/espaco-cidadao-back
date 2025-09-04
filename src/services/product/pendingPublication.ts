import { Request, Response } from "express";
import Service from "../Service";
import { response } from "../../utils/response";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";

class PendingPublication {
  public pendingPublication = Service(PendingPublication);

  constructor() {
    this.pendingPublication;
  }

  findPendingPublications = async (req: Request, res: Response) => {
    try {
      const { query } = req;
      const idProduto = Number(query.idProduto);
      const idCanal = Number(query.idCanal);

      let sqlQuery = `SET NOCOUNT ON;
          SELECT * FROM PublicacaoPendente WHERE AindaPendente=1 `
      if (!isNaN(idProduto) && idProduto > 0) {
        sqlQuery += "AND idProduto=" + idProduto;
      }
      if (!isNaN(idCanal) && idCanal > 0) {
        sqlQuery += "AND idCanal=" + idCanal;
      }
      const result = await sequelize.query(sqlQuery, {type: QueryTypes.SELECT});

      response(res, 200, "total: " + result.length, result);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }
}

export default PendingPublication;
