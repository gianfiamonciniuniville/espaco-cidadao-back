import { Request, Response } from "express";
import { response } from "../utils/response";
import { SkuRecommendation } from "../models/skuRecommendation";
import { User } from "../models/user/user";
import { SkuRecommendationUser } from "../models/skuRecommendationUser";
import { Department } from "../models/user/department";

export class SkuRecommendationService {
  create = async (req: Request, res: Response) => {
    const { body, user } = req;

    try {
      if (!user) return response(res, 401, "Usuário não autenticado");

      if (!body.Sku) {
        return response(res, 400, "SKU não informado");
      }

      const data = {
        Sku: body.Sku,
        idIndicador: user.id,
        idDepartamento: body.idDepartamento,
        Mensagem: body.Mensagem,
      };

      const recommendation = await SkuRecommendation.create(data);

      if (!body.usuariosIndicados || body.usuariosIndicados.length === 0) {
        response(res, 200, "Indicação de SKU criada com sucesso!");
        return;
      }

      body.usuariosIndicados.forEach(async (user: string) => {
        await SkuRecommendationUser.create({
          idUsuario: Number(user),
          idIndicacaoSku: Number(recommendation.id),
        });
      });

      response(res, 200, "Indicação de SKU criada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const skuRecommendations = await SkuRecommendation.findAll({
        include: [
          {
            model: User,
            as: "Indicador",
            attributes: {
              exclude: ["senhaUsuario", "idUsuario"],
            },
          },
          {
            model: Department,
            as: "Departamento",
          },
          {
            model: SkuRecommendationUser,
            as: "UsuariosIndicados",
            include: [
              {
                model: User,
                as: "Usuario",
                attributes: {
                  exclude: ["senhaUsuario", "idUsuario"],
                },
              },
            ],
          },
        ],
        attributes: {
          exclude: ["idIndicador", "idDepartamento"],
        },
      });
      response(res, 200, "OK", skuRecommendations);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findById = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const skuRecommendation = await SkuRecommendation.findByPk(params.id, {
        include: [
          {
            model: User,
            as: "Indicador",
            attributes: {
              exclude: ["senhaUsuario", "idUsuario"],
            },
          },
          {
            model: Department,
            as: "Departamento",
          },
          {
            model: SkuRecommendationUser,
            as: "UsuariosIndicados",
            include: [
              {
                model: User,
                as: "Usuario",
                attributes: {
                  exclude: ["senhaUsuario", "idUsuario"],
                },
              },
            ],
          },
        ],
        attributes: {
          exclude: ["idIndicador", "idDepartamento"],
        },
      });
      response(res, 200, "OK", skuRecommendation);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllByUserId = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const skuRecommendations = await SkuRecommendationUser.findAll({
        include: {
          model: SkuRecommendation,
          as: "IndicacaoSku",
          include: [
            {
              model: User,
              as: "Indicador",
              attributes: {
                exclude: ["senhaUsuario", "idUsuario"],
              },
            },
            {
              model: Department,
              as: "Departamento",
            },
            {
              model: SkuRecommendationUser,
              as: "UsuariosIndicados",
              include: [
                {
                  model: User,
                  as: "Usuario",
                  attributes: {
                    exclude: ["senhaUsuario", "idUsuario"],
                  },
                },
              ],
            },
          ],
          attributes: {
            exclude: ["idIndicador", "idDepartamento"],
          },
        },
        where: {
          idUsuario: params.id,
        },
        attributes: {
          exclude: ["idUsuario", "idIndicacaoSku"],
        },
      });
      response(res, 200, "OK", skuRecommendations);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllByIndicatorId = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const skuRecommendations = await SkuRecommendation.findAll({
        include: [
          {
            model: SkuRecommendationUser,
            as: "UsuariosIndicados",
            include: [
              {
                model: User,
                as: "Usuario",
                attributes: {
                  exclude: ["senhaUsuario", "idUsuario"],
                },
              },
            ],
          },
          {
            model: Department,
            as: "Departamento",
          },
        ],
        where: {
          idIndicador: params.id,
        },
        attributes: {
          exclude: ["idIndicador", "idDepartamento"],
        },
      });
      response(res, 200, "OK", skuRecommendations);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  remove = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      await SkuRecommendation.destroy({ where: { id: params.id } });
      response(res, 200, "Indicação de SKU excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  setSkuRecommendationUsers = async (req: Request, res: Response) => {
    const { body, params } = req;
    try {
      if (body.usersToAdd && body.usersToAdd.length > 0) {
        body.usersToAdd.forEach(async (user: string) => {
          await SkuRecommendationUser.create({
            idUsuario: Number(user),
            idIndicacaoSku: Number(params.id),
          });
        });
      }

      if (body.usersToRemove && body.usersToRemove.length > 0) {
        body.usersToRemove.forEach(async (user: string) => {
          await SkuRecommendationUser.destroy({
            where: {
              idUsuario: user,
              idIndicacaoSku: Number(params.id),
            },
          });
        });
      }

      response(res, 200, "Usuários definidos com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  update = async (req: Request, res: Response) => {
    const { body, params } = req;

    try {
      await SkuRecommendation.update(body, {
        where: { id: params.id },
      });
      response(res, 200, "Indicação de SKU atualizada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
