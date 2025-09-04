import { Request, Response } from "express";
import { response } from "../../utils/response";
import sequelize from "../../config/database";
import Service from "../Service";

import { ProductAttributeValue } from "../../models/product/productAttributeValue";
import { QueryTypes } from "sequelize";

class ProductAttributesValue {
  public productAttributeValue = Service(ProductAttributeValue);
  constructor() {
    this.productAttributeValue;
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    const { idProdutoAtributoValor } = req.params;

    try {
      const query = ` 
      SELECT PAV.idProdutoAtributoValor, A.idAtributo, A.idTipoCampo, SA.idSelecao, SA.Valor, SA.Padrao, A.CodAtributo
        FROM ProdutoAtributoValor PAV
      INNER JOIN Atributo A  ON  A.idAtributo = PAV.idAtributo
      LEFT JOIN  AtributoSelecao SA ON SA.idAtributo = A.idAtributo
        WHERE PAV.idProdutoAtributoValor = :idProdutoAtributoValor`;

      const selectValues = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idProdutoAtributoValor },
      });

      response(res, 200, "OK", selectValues);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findValuesByIdGroupAttribute = async (req: Request, res: Response): Promise<void> => {
    const { idGrupoAtributo, idProduto } = req.params;

    try {
      const query = `
      SELECT AGA.*, PAV.Valor, PAV.idProdutoAtributoValor, A.idAtributo, A.idTipoCampo, A.Rotulo, A.CodAtributo FROM AtributoGrupoAtributo AGA
        INNER JOIN ProdutoAtributoValor PAV ON PAV.idAtributo = AGA.idAtributo
        INNER JOIN Atributo A ON A.idAtributo = AGA.idAtributo
          WHERE AGA.idGrupoAtributo = ${idGrupoAtributo} AND idProduto = ${idProduto} 
      UNION
      SELECT AGA2.*, '' as Valor, '' as idProdutoAtributoValor, A.idAtributo, A.idTipoCampo, A.Rotulo, A.CodAtributo FROM AtributoGrupoAtributo AGA2
        INNER JOIN ProdutoAtributoValor PAV2 ON PAV2.idAtributo = AGA2.idAtributo
        INNER JOIN Atributo A ON A.idAtributo = AGA2.idAtributo
          WHERE AGA2.idGrupoAtributo = ${idGrupoAtributo} 
            AND A.idAtributo not in (SELECT idAtributo FROM ProdutoAtributoValor WHERE idProduto = ${idProduto})
            AND PAV2.idAtributo IN (SELECT idAtributo FROM AtributoGrupoAtributo where idGrupoAtributo = ${idGrupoAtributo})
        ORDER BY A.CodAtributo ASC;
      `;

      const attributeGroupAttribute = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        //replacements: { idGrupoAtributo, idProduto },
        //logging: true,
      });

      response(res, 200, "OK", attributeGroupAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  getAtributesByGroupAndProduct = async (req: Request, res: Response): Promise<void> => {
    const { idGrupoAtributo, idProduto } = req.params;

    try {
      const query = `
      exec getAtributesByGroupAndProduct @idGrupoAtributo=:idGrupoAtributo, @idProduto=:idProduto
      `;

      const attributeGroupAttribute = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idGrupoAtributo, idProduto },
      });

      response(res, 200, "OK", attributeGroupAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findProductGroupAttribute = async (req: Request, res: Response): Promise<void> => {
    const { idGrupoAtributo } = req.params;

    try {
      const query = `
      SELECT DISTINCT A.idAtributo, A.CodAtributo
        FROM ProdutoGrupoAtributo PGA
        INNER JOIN GrupoAtributo GA ON GA.idGrupoAtributo = PGA.idGrupoAtributo
        INNER JOIN AtributoGrupoAtributo AGA ON AGA.idGrupoAtributo = GA.idGrupoAtributo
        INNER JOIN Produto P ON P.idProduto = PGA.idProduto
        LEFT JOIN Atributo A ON A.idAtributo = AGA.idAtributo
        WHERE PGA.idGrupoAtributo = :idGrupoAtributo
        ORDER BY A.CodAtributo ASC;
      `;

      const productGroupAttribute = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idGrupoAtributo },
      });

      response(res, 200, "OK", productGroupAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  createAttributeValue = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const existingValue = await ProductAttributeValue.findOne({
        where: {
          idProduto: Number(body.idProduto),
          idAtributo: Number(body.idAtributo),
        },
      });

      if (existingValue && existingValue.idProdutoAtributoValor !== 0) {
        response(
          res,
          206,
          `Valor já existe para idProduto ${body.idProduto} e idAtributo ${body.idAtributo}`,
        );
      } else {
        const value = {
          idProduto: Number(body.idProduto),
          idAtributo: Number(body.idAtributo),
          Valor: body.Valor,
        };

        response(
          res,
          200,
          `Atributos vinculados com sucesso`,
          await ProductAttributeValue.create(value),
        );
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  _createAttributeValue = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      body.values.forEach(async (v: any) => {
        if (v.idTipoCampo && v.idTipoCampo === 3) {
          for (const valor in v.Selecoes) {
            const value = {
              idProduto: Number(v.idProduto),
              idAtributo: Number(v.idAtributo),
              Valor: v.Selecoes[valor],
            };
            await ProductAttributeValue.create(value);
          }
        } else {
          const value = {
            idProduto: Number(v.idProduto),
            idAtributo: Number(v.idAtributo),
            Valor: v.Valor,
          };
          await ProductAttributeValue.create(value);
        }
      });

      response(res, 200, `Atributos vinculados com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAttributeValue = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const value = {
        Valor: body.Valor,
      };

      await ProductAttributeValue.update(value, {
        where: { idProdutoAtributoValor: Number(params.idProdutoAtributoValor) },
      });

      response(res, 200, "Valor atualizado com sucesso");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  _updateAttributeValue = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      body?.values?.forEach(async (v: any) => {
        await ProductAttributeValue.update(
          { Valor: v.Valor },
          {
            where: { idProdutoAtributoValor: Number(v.idProdutoAtributoValor) },
          },
        );
      });

      response(res, 200, `${body.values.length} valores atualizados com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAttributeValueMulti = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const idProduto = body.idProduto;
      const idAtributo = body.idAtributo;
      const Valores = body.Valores.join("§");
      const query =
        "exec UpdateMultiSelectAttribute @idProduto=:idProduto, @idAtributo=:idAtributo, @Valores=:Valores";
      const productGroupAttribute = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idProduto, idAtributo, Valores },
      });

      response(res, 200, `${body.Valores.length} valores atualizados com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  remove = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await ProductAttributeValue.destroy({
        where: { idProdutoAtributoValor: params.idProdutoAtributoValor },
      });

      response(res, 200, "Valor excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  removeMulti = async (req: Request, res: Response) => {
    try {
      const { idProduto, idAtributo } = req.params;
      const query = `
      DELETE FROM ProdutoAtributoValor WHERE idProduto=:idProduto AND idAtributo=:idAtributo
      `;

      const attributeGroupAttribute = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: {
          idProduto,
          idAtributo,
        },
      });

      response(res, 200, "Valor excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default ProductAttributesValue;
