import { Channel } from "./../../models/product/channel";
import { Category } from "./../../models/product/category";
import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";
import { Product } from "../../models/product/product";
import { ProductCategory } from "../../models/product/productCategory";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";

class Categories {
  public category = Service(Category);
  constructor() {
    this.category;
  }

  findAll = async (req: Request, res: Response) => {
    const { query } = req;
    if (query.idCanal) {
      try {
        const categories = await Category.findAll({
          include: [
            {
              model: Channel,
              as: "Canal",
              where: { idCanal: query.idCanal },
            },
          ],
        });
        response(res, 200, "OK", categories);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    } else {
      try {
        const categories = await Category.findAll({
          include: [{ model: Channel, as: "Canal" }],
        });
        response(res, 200, "OK", categories);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    }
  };
  findAllInProduct = async (req: Request, res: Response) => {
    const { idProduto } = req.params;
    if (idProduto) {
      try {
        const categories = await sequelize.query(
          `SELECT C.* FROM Categoria C 
        INNER JOIN CategoriaProduto CP ON CP.IdCategoria=C.IdCategoria 
        WHERE CP.IdProduto=:idProduto 
        ORDER BY C.IdCanal, C.IdCategoria`,
          {
            type: QueryTypes.SELECT,
            replacements: { idProduto },
          },
        );
        response(res, 200, "OK", categories);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    }
  };
  findAllProductsInOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (id) {
      try {
        const categories = await sequelize.query(
          `SELECT P.* FROM Produto P 
        INNER JOIN CategoriaProduto CP ON CP.IdProduto=P.IdProduto 
        WHERE CP.IdCategoria=:id 
        ORDER BY P.IdProduto`,
          {
            type: QueryTypes.SELECT,
            replacements: { id },
          },
        );
        response(res, 200, "OK", categories);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params, query } = req;

    if (query.idCanal) {
      try {
        const categories = await Category.findByPk(params.id, {
          include: [
            {
              model: Channel,
              as: "Canal",
              where: { idCanal: query.idCanal },
            },
          ],
        });
        response(res, 200, "OK", categories);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    } else {
      try {
        const categories = await Category.findByPk(params.id, {
          include: [{ model: Channel, as: "Canal" }],
        });
        response(res, 200, "OK", categories);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    }
  };

  newCategoryInProduct = async (req: Request, res: Response) => {
    const { params, body } = req;

    const data = {
      idProduto: Number(body.idProduto),
      idCategoria: Number(params.id),
    };

    try {
      await ProductCategory.create(data);
      response(res, 201, "Categoria adicionada ao produto com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeCategoryInProduct = async (req: Request, res: Response) => {
    const { params, query } = req;

    const data = {
      idProduto: Number(query.idProduto),
      idCategoria: Number(params.id),
    };

    try {
      await ProductCategory.destroy({
        where: { idCategoria: data.idCategoria, idProduto: data.idProduto },
      });
      response(res, 201, "Categoria removida do produto com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newCategory = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idCanal: body.idCanal,
        NomeCategoria: body.NomeCategoria,
        CodCategoria: body.CodCategoria,
        idCategoriaPai: body.idCategoriaPai,
      };

      const category = await Category.create(data);
      response(res, 201, "Categoria criada com sucesso", category);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateCategory = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idCanal: body.idCanal,
        NomeCategoria: body.NomeCategoria,
        CodCategoria: body.CodCategoria,
        idCategoriaPai: body.idCategoriaPai,
      };

      await Category.update(data, {
        where: { idCategoria: params.id },
      });
      response(res, 200, "Categoria atualizada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeCategory = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Category.destroy({
        where: { idCategoria: params.id },
      });
      response(res, 200, "Categoria excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Categories;
