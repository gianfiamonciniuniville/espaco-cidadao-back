import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { Attribute } from "./../../models/product/attribute";
import { FieldType } from "../../models/product/fieldType";
import { AttributeSelect } from "../../models/product/attributeSelect";
import { Op } from "sequelize";

class Attributes {
  public attribute = Service(Attribute);
  constructor() {
    this.attribute;
  }

  findOneAttribute = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const attributes = await Attribute.findOne({
        where: { idAtributo: params.idAtributo },
        include: [
          {
            model: FieldType,
            as: "TipoCampo",
          },
          {
            model: AttributeSelect,
            as: "AtributoSelecao",
          },
        ],
      });
      response(res, 200, "OK", attributes);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAll = async (req: Request, res: Response) => {
    const { query } = req;
    switch (true) {
      case Object.keys(query).includes("CodAtributo"):
        try {
          const returnOFOperation = await Attribute.findAll({
            where: { CodAtributo: { [Op.like]: "%" + query.CodAtributo + "%" } },
          });
          return response(res, 200, "Ok", returnOFOperation);
        } catch (err) {
          return response(res, 502);
        }
      case Object.keys(query).includes("Rotulo"):
        try {
          const returnOFOperation = await Attribute.findAll({
            where: { Rotulo: { [Op.like]: "%" + query.Rotulo + "%" } },
          });
          return response(res, 200, "Ok", returnOFOperation);
        } catch (err) {
          return response(res, 502);
        }
      default:
        try {
          const attributes = await Attribute.findAll({
            include: [
              {
                model: FieldType,
                as: "TipoCampo",
              },
              {
                model: AttributeSelect,
                as: "AtributoSelecao",
              },
            ],
          });
          return response(res, 200, "OK", attributes);
        } catch (err) {
          return response(res, 502);
        }
    }
  };

  findAllPagination = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;
    let whereAttributes;

    if (Object.keys(query).includes("CodAtributo")) {
      whereAttributes = { CodAtributo: { [Op.like]: "%" + query.CodAtributo + "%" } };
    } else if (Object.keys(query).includes("Rotulo")) {
      whereAttributes = { Rotulo: { [Op.like]: "%" + query.Rotulo + "%" } };
    }

    try {
      const attributes = await Attribute.findAndCountAll({
        include: [
          {
            model: FieldType,
            as: "TipoCampo",
          },
          {
            model: AttributeSelect,
            as: "AtributoSelecao",
          },
        ],
        where: whereAttributes,
        distinct: true,
        limit: size,
        offset: (page - 1) * size,
      });
      return response(res, 200, "OK", {
        attributes: attributes.rows,
        total: attributes.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(attributes.count / size),
      });
    } catch (err) {
      return response(res, 502);
    }
  };

  newAttribute = async (req: Request, res: Response) => {
    const { body } = req;

    const orderExists = await Attribute.findOne({
      where: { CodAtributo: body.CodAtributo },
    });

    if (orderExists) {
      response(res, 422, "Código ja cadastrado, digite outro!");
      return;
    }

    try {
      const data = {
        idTipoCampo: body.idTipoCampo,
        CodAtributo: body.CodAtributo,
        Rotulo: body.Rotulo,
      };

      const attribute = await Attribute.create(data);
      response(res, 201, "OK", attribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAttribute = async (req: Request, res: Response) => {
    const { params, body } = req;

    const orderExists = await Attribute.findOne({
      where: {
        CodAtributo: body.CodAtributo,
        idAtributo: {
          [Op.not]: params.id,
        },
      },
    });

    if (orderExists) {
      response(res, 422, "Código ja cadastrado, digite outro!");
      return;
    }

    try {
      const data = {
        idTipoCampo: body.idTipoCampo,
        CodAtributo: body.CodAtributo,
        Rotulo: body.Rotulo,
      };

      await Attribute.update(data, {
        where: { idAtributo: params.id },
      });
      response(res, 200, "Atributo atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeAttribute = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Attribute.destroy({
        where: { idAtributo: params.id },
      });
      response(res, 200, "Atributo excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(
        res,
        502,
        "O atributo não pode ser excluido pois tem valores e produtos relacionados! Exclua suas relações e tente novamente!",
      );
    }
  };
}

export default Attributes;
