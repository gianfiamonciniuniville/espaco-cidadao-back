import { Request, Response } from "express";
import { response } from "../../utils/response";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";

export default class ProductStock {
  constructor() {}
  findByIdProduct = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const idProduto = params.idProduto;
      const query = `SELECT e.idCanal, e.Quantidade FROM Estoque e 
         WHERE idProduto=:idProduto`;
      const mlistings = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idProduto },
      });
      response(res, 200, "OK", mlistings);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  findBySku = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const sku = params.sku;
      const query = `SELECT e.idCanal, e.Quantidade FROM Estoque e 
         INNER JOIN Produto p ON p.idProduto=e.idProduto
         WHERE p.sku=:sku`;
      const mlistings = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { sku },
      });
      response(res, 200, "OK", mlistings);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  flagProductToUpdateBySku = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const sku = params.sku;
      const query = `UPDATE e SET ATUALIZAR=1 FROM Estoque e 
         INNER JOIN Produto p ON p.idProduto=e.idProduto
         WHERE p.sku=:sku`;
      const result = await sequelize.query(query, {
        type: QueryTypes.UPDATE,
        replacements: { sku },
      });
      response(res, 200, "OK");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  flagProductToUpdateByIdProduct = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const idProduto = params.idProduto;
      const query = `UPDATE e SET ATUALIZAR=1 FROM Estoque e 
         WHERE idProduto=:idProduto`;
      const result = await sequelize.query(query, {
        type: QueryTypes.UPDATE,
        replacements: { idProduto },
      });
      response(res, 200, "OK", result);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
