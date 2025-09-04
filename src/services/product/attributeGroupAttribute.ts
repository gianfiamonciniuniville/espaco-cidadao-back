import { Request, Response } from "express";

import { response } from "../../utils/response";
import sequelize from "../../config/database";
import Service from "../Service";

import { Attribute } from "../../models/product/attribute";
import { AttributeGroupAttribute } from "../../models/product/attributeGroupAttribute";
import { AttributeSelect } from "../../models/product/attributeSelect";
import { FieldType } from "../../models/product/fieldType";
import { AttributeGroup } from "../../models/product/attributeGroup";
import { QueryTypes, Sequelize } from "sequelize";

export default class AttributeGroupAttributeService {
  public attributeGroupAttribute = Service(AttributeGroupAttribute);
  constructor() {
    this.attributeGroupAttribute;
  }

  findAll = async (req: Request, res: Response) => {
    const { idGrupoAtributo } = req.params;

    if (!idGrupoAtributo) {
      return response(res, 400, "ID do grupo de atributo não informado");
    }

    try {
      const attributeGroupAttributes = await AttributeGroupAttribute.findAll({
        where: { idGrupoAtributo: idGrupoAtributo },
        include: [
          {
            model: Attribute,
            as: "Atributo",
            attributes: {
              exclude: ["idAtributo"],
            },
            include: [
              { model: AttributeSelect, as: "AtributoSelecao" },
              {
                model: FieldType,
                as: "TipoCampo",
              },
            ],
          },
        ],
        order: [["Ordem", "ASC"]],
      });
      response(res, 200, "OK", attributeGroupAttributes);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  _findValues = async (req: Request, res: Response) => {
    const { idAtributoGrupoAtributo } = req.params;

    if (!idAtributoGrupoAtributo) {
      return response(res, 400, "ID do grupo de atributo não informado");
    }

    try {
      const attributeGroupAttributes = await AttributeGroupAttribute.findOne({
        where: { idAtributoGrupoAtributo: idAtributoGrupoAtributo },
        include: [
          {
            model: Attribute,
            as: "Atributo",
            attributes: {
              exclude: ["idAtributo"],
            },
            include: [
              { model: AttributeSelect, as: "AtributoSelecao" },
              {
                model: FieldType,
                as: "TipoCampo",
              },
            ],
          },
        ],
      });
      response(res, 200, "OK", attributeGroupAttributes);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  addAttribute = async (req: Request, res: Response) => {
    const { params, body } = req;

    if (!params.id) {
      return response(res, 400, "ID do grupo de atributo não informado");
    }

    try {
      for (let a of body?.attributes) {
        await AttributeGroupAttribute.create({
          idGrupoAtributo: Number(params.id),
          idAtributo: a.idAtributo,
        });
      }

      response(res, 201, `${body?.attributes?.length} adicionados com sucesso!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeAttribute = async (req: Request, res: Response) => {
    const { params, body } = req;

    if (!params.id) {
      response(res, 400, "ID do grupo de atributo não informado");
      return;
    }
    try {
      for (let a of body?.attributes) {
        await AttributeGroupAttribute.destroy({
          where: { idGrupoAtributo: params.id, idAtributo: a.idAtributo },
        });
      }
      response(res, 201, `${body?.attributes?.length} atributos removidos com sucesso!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  changeOrder = async (req: Request, res: Response) => {
    const { params, body } = req;

    if (!params.id) {
      return response(res, 400, "ID do grupo de atributo não informado");
    }
    const id = params.id;

    try {
      for (let a of body?.attributes) {
        const idAtributo = a.idAtributo;
        const Ordem = a.Ordem;
        if (!Ordem) continue;
        const query = `UPDATE AtributoGrupoAtributo SET Ordem=:Ordem
          WHERE idAtributo=:idAtributo AND idGrupoAtributo=:id`;
        const selectValues = await sequelize.query(query, {
          type: QueryTypes.SELECT,
          replacements: { id, idAtributo, Ordem },
        });
      }

      response(res, 201, `${body?.attributes?.length} atributos reordenados com sucesso!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
