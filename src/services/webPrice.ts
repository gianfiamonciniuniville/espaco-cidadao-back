import { Request, Response } from "express";
import { response } from "./../utils/response";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database";

class WebPrice {
  searchPrices = async (req: Request, res: Response) => {
    const { query } = req;

    let querySQL = `
    exec PriceM_SEL03TestzinBolado @Filtro=:filtro, @Estoque=:estoque, @Consulta=:consulta, 
    @id_list=:id_list, @Canal=:idCanal, @CustomLabel0=:customLabel0, @CustomLabelEstatica=:customLabelEstatica,
    @FilaParaPublicar=:filaParaPublicar`;
    if (query.idCanal == '45') {
      querySQL = `
    exec PriceM_SEL03 @Filtro=:filtro, @Estoque=:estoque, @Consulta=:consulta, 
    @id_list=:id_list, @Canal=:idCanal, @CustomLabel0=:customLabel0, @CustomLabelEstatica=:customLabelEstatica`
    }

    try {
      const prices = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: {
          filtro: query.filtro,
          estoque: query.estoque,
          consulta: query.consulta,
          id_list: query.id_list ? query.id_list : "",
          idCanal: query.idCanal,
          customLabel0: query.customLabel0 ? query.customLabel0 : null,
          customLabelEstatica: query.customLabelEstatica ? query.customLabelEstatica : null,
          filaParaPublicar: query.filaParaPublicar ? query.filaParaPublicar : null,
        },
      });

      response(res, 200, "OK", { prices, total: prices.length });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  chartDayBySku = async (req: Request, res: Response) => {
    const { query } = req;

    const querySQL = `
    exec PriceChart_SEL01 @Sku=:sku
    `;

    try {
      const chartDay = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: {
          sku: query.sku,
        },
      });

      response(res, 200, "OK", chartDay);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  getSellers = async (req: Request, res: Response) => {
    const { query } = req;

    const querySQL = `
      exec WebPrice_SEL_sellers @filtro=:filtro
    `;

    try {
      const sellers = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: {
          filtro: query.filtro,
        },
      });

      response(res, 200, "OK", sellers);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  getMktPlaces = async (req: Request, res: Response) => {
    const { query } = req;

    const querySQL = `
      exec WebPrice_SEL_marketplaces @filtro=:filtro
    `;

    try {
      const mktPlaces = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: {
          filtro: query.filtro,
        },
      });

      response(res, 200, "OK", mktPlaces);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  getWebPrice = async (req: Request, res: Response) => {
    const { query } = req;

    const querySQL = `
      exec WebPrice_SEL_sku @sku=:sku
    `;

    try {
      const webPrice = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: {
          sku: query.sku,
        },
      });

      response(res, 200, "OK", webPrice);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  getTaxGroup = async (req: Request, res: Response) => {
    const querySQL = `
      exec TaxGroup;
    `;

    try {
      const taxGroup = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
      });

      response(res, 200, "OK", taxGroup);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
export default WebPrice;
