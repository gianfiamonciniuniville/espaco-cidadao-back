import { Request, Response } from "express";

import Service from "./Service";
import { response } from "../utils/response";
import { Mlisting } from "../models/mlisting";
import sequelize from "../config/database";
import { QueryTypes } from "sequelize";

class Mlistings {
  public mlisting = Service(Mlisting);
  constructor() {
    this.mlisting;
  }
  findAll = async (req: Request, res: Response) => {
    try {
      const mlistings = await Mlisting.findAll();
      response(res, 200, "OK", mlistings);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  findOne = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const mlisting = await Mlisting.findByPk(params.idMLB);
      response(res, 200, "OK", mlisting);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  findByMLB = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const mlb = params.mlb;
      const mlistings = await Mlisting.findOne({ where: { MLB: mlb } });
      response(res, 200, "OK", mlistings);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  keepZero = async (req: Request, res: Response) => {
    /* assim funciona, mas não usa a MLlocalApi e procedure pra guardar histórico e email do usuário etc. */
    const { params, body } = req;
    try {
      const mlb = params.mlb;
      const { manterZero } = body;
      await Mlisting.update({ ManterZero: manterZero === true ? 1 : 0 }, { where: { MLB: mlb } });
      await sequelize.query(`UPDATE e SET e.Atualizar=1 FROM Estoque e INNER JOIN MLB m ON e.IdProduto=m.IdProduto AND e.IdCanal=47 WHERE m.Mlb=:mlb`,
        {type: QueryTypes.UPDATE, replacements: {mlb}});

      response(res, 200, `${mlb} Manter Zero ${manterZero === true ? "Ativado" : "Desativado"}`);
    } catch (error) {
      console.log(error);
      response(res, 502, "Erro ao manter zero!!");
    }
  };
  findByidProduto = async (req: Request, res: Response) => {
    const { params } = req;
    const idProduto = params.idProduto;
    try {
      const mlistings = await Mlisting.findAll({ where: { idProduto: idProduto } });
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
      const query = `SELECT m.* FROM MLB m 
         INNER JOIN Produto p ON p.idProduto=m.idProduto
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
  search = async (req: Request, res: Response) => {
    const { query } = req;
    const sku = query.sku as string;
    const mlb = query.mlb as string;
    const nome = query.nome as string;
    const status = query.status as string;
    const estoque = query.estoque as string;
    const kit = query.kit as string;
    const envio = query.envio as string;
    const manterZero = query.manterZero as string;

    try {
      let replacements = {};
      let joins = "";
      let wheres = " WHERE 1=1 ";
      if (sku) {
        replacements = { ...replacements, sku: sku };
        wheres += ` AND p.sku=:sku `;
      }
      if (estoque) {
        if (estoque === "com") {
          wheres += ` AND (e.Quantidade / m.ItensPorMLB) > 0 `;
        } else if (estoque === "sem") {
          wheres += ` AND (e.Quantidade / m.ItensPorMLB) = 0 `;
        }
      }
      if (kit) {
        if (kit === "sim") {
          wheres += ` AND m.ItensPorMLB > 1 `;
        } else if (kit === "nao") {
          wheres += ` AND m.ItensPorMLB=1 `;
        }
      }
      if (mlb) {
        wheres += ` AND m.MLB=:mlb `;
        replacements = { ...replacements, mlb: mlb };
      }
      if (nome) {
        const nomeArg = `%${nome}%`;
        replacements = { ...replacements, nome: nomeArg };
        wheres += ` AND m.Nome LIKE :nome `;
      }
      if (status) {
        replacements = { ...replacements, status };
        wheres += ` AND m.Status=:status `;
      }
      if (envio) {
        if (envio === "outros") {
          wheres += ` AND m.Envio NOT IN ('me1', 'me2') `;
        } else {
          replacements = { ...replacements, envio };
          wheres += ` AND m.Envio=:envio `;
        }
      }

      if (manterZero) {
        if (manterZero === "true") {
          wheres += ` AND m.manterZero=1 `;
        } else if (manterZero === "false") {
          wheres += ` AND m.manterZero=0 OR m.manterZero IS NULL `;
        }
      }

      const querySQL = `SELECT m.idMLB, m.idProduto, m.MLB, m.ItensPorMLB,
      m.tipo, m.taxa, m.envio, m.status, m.nome, m.dimension, m.manterZero,
      p.Sku, p.NomeProduto, e.Quantidade as Quantidade, 
      p.Peso * m.ItensPorMlb as Peso, m.created, m.updated,
      mp.price, mp.original_price, mp.promotion, pc.custo_medio, pc.custo_tabela,
      CASE WHEN m.envio='me2' THEN [dbo].[PesoCubado](p.idProduto, m.ItensPorMLB) else null end as pesoCubado,
      CASE WHEN m.envio='me2' THEN 
		  CASE WHEN p.Peso * m.ItensPorMLB >  [dbo].[PesoCubado](p.idProduto, m.ItensPorMLB) 
			  then [dbo].[me2Tabela](p.Peso*m.ItensPorMLB)
		    ELSE [dbo].[me2Tabela]([dbo].[PesoCubado](p.idProduto, m.ItensPorMLB))
		    END
	    ELSE NULL END as PreçoTabela
      FROM MLB m 
      INNER JOIN Produto p ON p.idProduto=m.idProduto 
      INNER JOIN Estoque e ON e.idProduto=m.idProduto AND e.idCanal=47
      LEFT JOIN 
        (SELECT pc.* FROM ProdutoCusto pc 
          INNER JOIN (select sku, max(data_hora) data from produtocusto group by sku) pc2 
          ON pc2.sku=pc.sku AND pc2.data=pc.data_hora) pc
        ON pc.sku=p.sku 
      LEFT JOIN MLBprices mp ON m.idmlb=mp.idmlb
      ${joins} ${wheres}`;

      const pageQuery = query.page ? String(query.page) : "1";
      const limitQuery = query.limit ? String(query.limit) : "10";
      const page = (parseInt(pageQuery) - 1) * parseInt(limitQuery) + 1;
      const limit = parseInt(pageQuery) * parseInt(limitQuery);

      const rowNumberQuery = `SELECT ROW_NUMBER() OVER (ORDER BY updated DESC) AS RowNum, * FROM (${querySQL}) AS resultquery`;
      const paginationQuery = `SELECT * FROM (${rowNumberQuery}) AS result WHERE RowNum >= ${page} AND RowNum <= ${limit} ORDER BY RowNum`;

      const queryTotalCount = `
      SELECT COUNT(*) AS total
      FROM (${querySQL}) AS result;
    `;

      const totalCountResult = await sequelize.query(queryTotalCount, {
        type: QueryTypes.SELECT,
        replacements: replacements,
      });

      const totalCount = (totalCountResult[0] as { total: number }).total;

      const mlistings = await sequelize.query(paginationQuery, {
        type: QueryTypes.SELECT,
        replacements: replacements,
      });
      response(res, 200, "OK", {
        data: mlistings,
        total: totalCount,
        actualPage: parseInt(pageQuery),
        totalPages: Math.ceil(totalCount / parseInt(limitQuery)),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Mlistings;
