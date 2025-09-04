import { Request, Response } from "express";
import { Attribute } from "../../models/product/attribute";
import { AttributeGroup } from "../../models/product/attributeGroup";

import { response } from "../../utils/response";
import Service from "../Service";

import { ProductGroupAttribute } from "../../models/product/productGroupAttribute";

class ProductGroupsAttribute {
  public productGroupAttribute = Service(ProductGroupAttribute);
  constructor() {
    this.productGroupAttribute;
  }

  findOne = async (req: Request, res: Response) => {
    const { query, params } = req;
    const pageAsNumber = Number(query.page);
    const sizeAsNumber = Number(query.size);

    let page = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
      page = pageAsNumber;
    }

    let size = 100;
    if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && size < 100) {
      size = sizeAsNumber;
    }

    try {
      const productGroupAttribute = await ProductGroupAttribute.findAndCountAll({
        where: { idProduto: params.idProduto },
        include: [
          {
            model: AttributeGroup,
            as: "GrupoAtributo",
          },
        ],
        limit: size,
        offset: page * size,
      });
      response(res, 200, "OK", {
        att: productGroupAttribute.rows,
        actualPage: page,
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newProductAttributeGroup = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idProduto: body.idProduto,
        idGrupoAtributo: body.idGrupoAtributo,
      };

      const productGroupAttribute = await ProductGroupAttribute.create(data);
      response(res, 201, "OK", productGroupAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  remove = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await ProductGroupAttribute.destroy({
        where: { idProdutoGrupoAtributo: params.idProdutoGrupoAtributo },
      });
      response(res, 200, "Produto Grupo Atributo excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default ProductGroupsAttribute;
