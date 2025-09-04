import { Request, Response } from "express";
import { response } from "../../utils/response";
import { QueryTypes } from "sequelize";
import sequelize from "../../config/database";

export default class publicationActive {
  constructor() {}
  updateActiveFlag = async (req: Request, res: Response) => {
    const { params, body } = req;
    try {
      console.log(params);
      console.log(body);
      const idPublicacao = params.idPublicacao;
      const ativo = body.ativo;
      const query = `UPDATE Publicacao SET Ativo=:ativo WHERE idPublicacao=:idPublicacao;
                    UPDATE e SET Atualizar=1 FROM Estoque e INNER JOIN Publicacao pu ON pu.idProduto=e.idProduto WHERE pu.idPublicacao=:idPublicacao`;
      const result = await sequelize.query(query, {
        type: QueryTypes.UPDATE,
        replacements: { ativo, idPublicacao },
      });
      response(res, 200, "OK", result);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
