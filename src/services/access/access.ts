import { Op } from "sequelize";
import { Actions as ActionsModel } from "../../models/actions";
import { response } from "../../utils/response";
import { Response, Request } from "express";
import { Actions } from "../../middlewares/actionsChecker";
import { Profile } from "../../models/user/profile";
import { User } from "../../models/user/user";

export default class AccessService {
  async getUserTokenAccess(req: Request, res: Response) {
    const actionsFromDb = await ActionsModel.findAll({
      attributes: ["acao"],
      include: [
        {
          model: Profile,
          required: true,
          include: [
            {
              model: User,
              where: { idUsuario: req.user?.id },
            },
          ],
        },
      ],
    });

    const actions = [...new Set(actionsFromDb.map((action) => action.acao))];
    response(res, 200, "OK", {
      permissions: actions,
    });
  }

  async getProfileAccess(req: Request, res: Response) {
    const { profileId } = req.params;
    const actions = await ActionsModel.findAll({
      where: { perfil_id: profileId },
      attributes: ["acao"],
      group: ["acao"],
    });

    response(res, 200, "OK", {
      permissions: actions.map((action) => action.acao),
    });
  }

  async updateProfileAccess(req: Request, res: Response) {
    const { profileId } = req.params;
    const { grantedPermissions, removedPermissions } = req.body;
    const actionValues = Object.values(Actions);
    const validGrantedPermissions = (grantedPermissions as string[]).filter((permission) => {
      return actionValues.some((action) => action === permission);
    });
    const validRemovedPermissions = (removedPermissions as string[]).filter((permission) => {
      return actionValues.some((action) => action === permission);
    });

    const searchedActions = await ActionsModel.findAll({
      where: {
        perfil_id: profileId,
        acao: {
          [Op.in]: [...validGrantedPermissions, ...validRemovedPermissions],
        },
      },
    });

    const actionsToCreate = validGrantedPermissions.reduce<{ perfil_id: string; acao: string }[]>(
      (acc, permission) => {
        if (!searchedActions.some((validation) => validation.acao === permission)) {
          acc.push({
            perfil_id: profileId,
            acao: permission,
          });
        }
        return acc;
      },
      [],
    );

    const actionsToDelete = validRemovedPermissions.reduce<string[]>((acc, permission) => {
      if (searchedActions.some((validation) => validation.acao === permission)) {
        acc.push(permission);
      }
      return acc;
    }, []);

    await Promise.all([
      ActionsModel.destroy({
        where: { perfil_id: profileId, acao: { [Op.in]: actionsToDelete } },
      }),
      ActionsModel.bulkCreate(actionsToCreate),
    ]);

    return res.status(200).json({ message: "OK" });
  }
}
