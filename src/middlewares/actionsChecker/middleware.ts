import { RequestHandler } from "express";
import { Actions as ActionsList } from "./constants";
import { Actions } from "../../models/actions";
import { Profile } from "../../models/user/profile";
import { User } from "../../models/user/user";

export const actionsChecker = (...requiredActions: ActionsList[]) => {
  const handler: RequestHandler = async (req, res, next) => {
    // Using Database to get the permissions.
    // TODO: Use token information to get the permissions
    // needs performance optimization

    const actionsFromDb = await Actions.findAll({
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
    const isAllowed = requiredActions.every((action) => actions.includes(action));
    if (!isAllowed) return res.status(403).json({ message: "Acesso negado!" });
    next();
  };

  return handler;
};
