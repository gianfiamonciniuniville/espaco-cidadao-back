import { Request, Response } from "express";

import { response } from "../../utils/response";
import Service from "../Service";
import sequelize from "../../config/database";
import { AttributeGroup } from "../../models/product/attributeGroup";
import { QueryTypes } from "sequelize";
import { Op } from "sequelize";
import { IAttributeGroupCount } from "../../interfaces/attributeGroup";

class GroupsAttribute {
  public groupAttribute = Service(AttributeGroup);

  constructor() {
    this.groupAttribute;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const groupAttribute = await AttributeGroup.findAll({
        order: [["nomegrupoatributo", "asc"]],
      });
      response(res, 200, "OK", groupAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllPagination = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;

    const attributeGroupWhere = {
      NomeGrupoAtributo: { [Op.like]: "%" + (query.search || "") + "%" },
    };

    try {
      const attributeGroups = await AttributeGroup.findAndCountAll({
        order: [["nomegrupoatributo", "asc"]],
        distinct: true,
        limit: size,
        offset: (page - 1) * size,
        where: attributeGroupWhere,
      });

      const query = ` 
        select ga.idGrupoAtributo, count(*) as Total from GrupoAtributo ga
        inner join produtogrupoatributo pga on pga.idGrupoAtributo=ga.idGrupoAtributo
        group by ga.idGrupoAtributo, ga.NomeGrupoAtributo
        order by NomeGrupoAtributo
      `;

      const selectValues: IAttributeGroupCount[] = await sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const attributeGroupsWithCount: any = [];
      attributeGroups.rows.map((attributeGroup) => {
        selectValues.map((value) => {
          if (attributeGroup.dataValues.idGrupoAtributo === value.idGrupoAtributo) {
            attributeGroupsWithCount.push({ ...attributeGroup.dataValues, Total: value.Total });
          }
        });
      });

      response(res, 200, "OK", {
        attributeGroups: attributeGroupsWithCount,
        total: attributeGroups.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(attributeGroups.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllCounting = async (req: Request, res: Response) => {
    try {
      const query = ` 
      select ga.idGrupoAtributo, ga.NomeGrupoAtributo, count(*) as Total from GrupoAtributo ga
inner join produtogrupoatributo pga on pga.idGrupoAtributo=ga.idGrupoAtributo
group by ga.idGrupoAtributo, ga.NomeGrupoAtributo
order by NomeGrupoAtributo
 `;

      const selectValues = await sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
      response(res, 200, "OK", selectValues);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      const groupAttribute = await AttributeGroup.findOne({
        where: { idGrupoAtributo: params.idGrupoAtributo },
      });

      if (!groupAttribute) {
        response(res, 404, "Grupo de Atributos não encontrado!");
        return;
      }

      response(res, 200, "OK", groupAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newAttributeGroup = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idCanal: body.idCanal,
        NomeGrupoAtributo: body.NomeGrupoAtributo,
        Ordem: body.Ordem,
      };

      const groupAttribute = await AttributeGroup.create(data);
      response(res, 201, "OK", groupAttribute);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAttributeGroup = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idCanal: Number(body.idCanal),
        NomeGrupoAtributo: body.NomeGrupoAtributo,
        Ordem: body.Ordem,
      };

      await AttributeGroup.update(data, {
        where: { idGrupoAtributo: params.id },
      });
      response(res, 200, "Grupo Atributo atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeAttributeGroup = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await AttributeGroup.destroy({
        where: { idGrupoAtributo: params.id },
      });
      response(res, 200, "GrupoAtributo excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default GroupsAttribute;
