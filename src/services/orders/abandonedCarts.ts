import { Request, Response } from "express";
import { response } from "../../utils/response";
import { QueryTypes } from "sequelize";
import sequelize from "../../config/database";

class AbandonedCarts {
  findAbandonedCartBySku = async (req: Request, res: Response) => {
    const { Sku } = req.params;

    try {
      const querySQL = `
       exec CarrinhoAbandonado_Lista @sku=:Sku
        `;

      const abandonedCart = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: {
          Sku,
        },
      });

      response(res, 200, "Success", abandonedCart);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  searchDynamicAbandonedCarts = async (req: Request, res: Response) => {
    const { query } = req;
    const sku = query.sku as string;
    const customer_region_code = query.customer_region_code as string;
    const customer_city = query.customer_city as string;
    const name = query.name as string;
    const created_at = query.created_at as string;

    try {
      let replacements: any = {};
      let where = " WHERE 1=1 ";

      where += " AND cai.sent_offer IS NULL ";

      if (sku) {
        replacements.sku = sku;
        where += " AND cai.sku = :sku ";
      }

      if (customer_region_code) {
        replacements.customer_region_code = customer_region_code;
        where += " AND ca.customer_region_code = :customer_region_code ";
      }

      if (customer_city) {
        replacements.customer_city = customer_city;
        where += " AND ca.customer_city = :customer_city ";
      }

      if (name) {
        const nameArg = `%${name}%`;
        replacements.name = nameArg;
        where += " AND cai.[name] LIKE :name ";
      }

      if (created_at) {
        const dateArg = `${created_at}%`;
        replacements.created_at = dateArg;
        where += " AND ca.created_at LIKE :created_at ";
      }

      const querySQL = `
            SELECT 
                ca.id, 
                ca.customer_firstname, 
                ca.customer_lastname, 
                ca.customer_email, 
                ca.customer_telephone, 
                ca.customer_region_code, 
                ca.customer_city, 
                ca.created_at,
                cai.[name], 
                cai.qty, 
                cai.price, 
                cai.quote_id, 
                cai.new_price, 
                cai.sent_offer,
                cai.sku,
                cai.quote_id
            FROM 
                CarrinhoAbandonadoItem cai
            INNER JOIN 
                CarrinhoAbandonado ca 
            ON 
          cai.quote_id = ca.id
        ${where}
      `;

      const abandonedCart = await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: replacements,
      });

      response(res, 200, "Success", abandonedCart);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default AbandonedCarts;
