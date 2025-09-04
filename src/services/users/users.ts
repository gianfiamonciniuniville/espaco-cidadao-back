import * as bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { createToken, generateToken, getToken } from "../../utils/token";
import { Department } from "../../models/user/department";
import { response } from "../../utils/response";
import Service from "../Service";

import { User } from "../../models/user/user";
import { Profile } from "../../models/user/profile";
import { sendMail } from "../../utils/sendMail";
import { User_Profile } from "../../models/user/user_profile";
import { Op } from "sequelize";
import { UserChannel } from "../../models/user/user_channel";
import { Channel } from "../../models/product/channel";
import { Actions } from "../../models/actions";
dotenv.config();

class Users {
  public user = Service(User);

  constructor() {
    this.user;
  }

  register = async (req: Request, res: Response) => {
    const { body } = req;

    if (!body.name) {
      response(res, 422, "Informe o nome que deseja cadastrar!");
      return;
    }

    if (!body.email) {
      response(res, 422, "Informe o email que deseja cadastrar!");
      return;
    }

    if (!body.password) {
      response(res, 422, "Informe a senha que deseja cadastrar!");
      return;
    }

    if (!body.rePassword) {
      response(res, 422, "Informe a senha que deseja cadastrar!");
      return;
    }

    if (body.password !== body.rePassword) {
      response(res, 422, "As senhas não conferem!");
      return;
    }

    const userExist = await User.findOne({
      where: { emailUsuario: body.email },
    });

    if (userExist) {
      response(res, 422, "E-mail já cadastrado, tente outro!");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(body.password, salt);

    try {
      const user = await User.create({
        nomeUsuario: body.name,
        emailUsuario: body.email,
        senhaUsuario: passHash,
      });

      const token = await createToken(user, req);
      response(res, 201, "Usuario cadastrado com sucesso!", { user, token });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  login = async (req: Request, res: Response) => {
    const { body } = req;

    if (!body.email) {
      response(res, 422, "Informe o e-mail");
      return;
    }
    if (!body.password) {
      response(res, 422, "Informe a senha");
      return;
    }

    try {
      const user = await User.findOne({
        where: { emailUsuario: body.email },
        include: [
          {
            model: Profile,
            as: "Perfil",
            through: { attributes: [] },
            include: [{ model: Department, as: "Departamento" }, { model: Actions }],
          },
          {
            model: UserChannel,
            as: "Canais",
            through: { attributes: [] },

            include: [{ model: Channel, as: "Canal" }],
          },
        ],
      });

      if (!user) {
        response(res, 401, "E-mail ou senha inválidos!");
        return;
      }

      const check = await bcrypt.compare(body.password, user?.senhaUsuario);

      if (!check) {
        response(res, 422, "Senha incorreta!");
        return;
      }

      user.senhaUsuario = "";
      const token = await createToken(user, req);
      response(res, 200, "Login realizado com sucesso!", { user, token });
    } catch (error) {
      console.log(error);
      response(res, 500, "ERROR", { error });
    }
  };

  update = async (req: Request, res: Response) => {
    const { body, params } = req;

    if (body.newPass) {
      if (body.newPass !== body.reNewPass) {
        response(res, 422, "As senhas não conferem!");
        return;
      }
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const data = {
        nomeUsuario: body.nomeUsuario ? body.nomeUsuario : undefined,
        emailUsuario: body.emailUsuario ? body.emailUsuario : undefined,
        senhaUsuario: body.newPass ? await bcrypt.hash(body.newPass, salt) : undefined,
      };

      await User.update(data, { where: { idUsuario: params.id } });
      response(res, 200, `Usuario ${body.name} atualizado com sucesso`);
    } catch (error) {}
  };

  checkUser = async (req: Request, res: Response) => {
    let currentUser;

    try {
      if (req.headers.authorization) {
        const token = getToken(req);

        const decoded = jwt.verify(
          token!,
          JSON.stringify(process.env.JWT_SECRET),
        ) as jwt.JwtPayload;

        currentUser = await User.findByPk(decoded?.id, {
          include: [
            {
              model: Profile,
              as: "Perfil",
              through: { attributes: [] },
              include: [{ model: Department, as: "Departamento" }],
            },
            {
              model: UserChannel,
              as: "Canais",
              through: { attributes: [] },

              include: [{ model: Channel, as: "Canal" }],
            },
          ],
        });
      } else {
        currentUser = null;
      }

      response(res, 200, "OK", currentUser);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  remove = async (req: Request, res: Response) => {
    const { params } = req;

    const userExist = await User.findByPk(params.idUsuario);

    if (!userExist) {
      response(res, 404, "Usuario nao encontrado!");
      return;
    }

    try {
      await User.destroy({ where: { idUsuario: params.idUsuario } });
      response(res, 200, "Usuario excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Profile,
            as: "Perfil",
            through: { attributes: [] },
            include: [{ model: Department, as: "Departamento" }],
          },
          {
            model: UserChannel,
            as: "Canais",
            through: { attributes: [] },

            include: [{ model: Channel, as: "Canal" }],
          },
        ],
        attributes: { exclude: ["senhaUsuario"] },
      });

      response(res, 200, "OK", users);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllPagination = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;
    let usersWhere;

    if (query.nome) {
      usersWhere = { nomeUsuario: { [Op.like]: "%" + query.nome + "%" } };
    } else if (query.email) {
      usersWhere = { emailUsuario: { [Op.like]: "%" + query.email + "%" } };
    }

    try {
      const users = await User.findAndCountAll({
        include: [
          {
            model: Profile,
            as: "Perfil",
            through: { attributes: [] },
            include: [{ model: Department, as: "Departamento" }],
          },
          {
            model: UserChannel,
            as: "Canais",
            through: { attributes: [] },

            include: [{ model: Channel, as: "Canal" }],
          },
        ],
        attributes: { exclude: ["senhaUsuario"] },
        where: usersWhere,
        distinct: true,
        limit: size,
        offset: (page - 1) * size,
      });

      response(res, 200, "OK", {
        users: users.rows,
        total: users.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(users.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const user = await User.findByPk(params.id, {
        include: [
          {
            model: Profile,
            as: "Perfil",
            through: { attributes: [] },
            include: [{ model: Department, as: "Departamento" }],
          },
          {
            model: UserChannel,
            as: "Canais",
            through: { attributes: [] },

            include: [{ model: Channel, as: "Canal" }],
          },
        ],
        attributes: { exclude: ["senhaUsuario"] },
      });

      if (!user) {
        response(res, 404, "User not found!");
        return;
      }

      response(res, 200, "OK", user);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  generatePassword = async (req: Request, res: Response) => {
    const { body } = req;
    if (!body.email) {
      response(res, 422, "Informe um e-mail!");
      return;
    }

    const userExist = await User.findOne({
      where: { emailUsuario: body.email },
    });

    if (!userExist) {
      response(res, 422, "E-mail não cadastrado no sistema!");
      return;
    }

    const pass = `achei${Math.round(Math.random() * 22)}@@${Math.round(Math.random() * 33)}`;
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(pass, salt);

    try {
      await User.update({ senhaUsuario: passHash }, { where: { emailUsuario: body.email } });

      await sendMail({
        to: body.email,
        subject: "Cadastro | Achei Controller",
        view: "users/generatePassword.pug",
        params: {
          email: body.email,
          pass: pass,
        },
      });

      response(res, 200, "Confira a sua caixa de entrada no e-mail informado!");
    } catch (error) {
      response(res, 502);
    }
  };

  registerRequest = async (req: Request, res: Response) => {
    const { body } = req;

    if (!body.email) {
      response(res, 422, "Informe um e-mail!");
      return;
    }
    if (!body.nome) {
      response(res, 422, "Informe um nome!");
      return;
    }

    const userExist = await User.findOne({
      where: { emailUsuario: body.email },
    });

    if (userExist) {
      response(res, 422, "E-mail já cadastrado no sistema!");
      return;
    }

    try {
      const token = await generateToken({ nomeUsuario: body.nome, emailUsuario: body.email });

      await sendMail({
        to: process.env.MAIL_FROM as string,
        subject: "Cadastro | Achei Controller",
        view: "users/requestRegister.pug",
        params: {
          nome: body.nome,
          email: body.email,
          departamento: body.departamento,
          token: token.token,
        },
      });

      response(
        res,
        200,
        "Confira sua caixa de e-mail e aguarde alguns instantes até que o ADM libere seu acesso ao sistema!",
      );
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  validateRegisterRequest = async (req: Request, res: Response) => {
    const { query } = req;

    const profile = await Profile.findByPk(Number(query.perfil));

    if (!profile) {
      response(res, 404, "Perfil não encontrado!");
      return;
    }

    const decoded = jwt.verify(
      query.token as string,
      JSON.stringify(process.env.JWT_SECRET),
    ) as jwt.JwtPayload;

    const pass = `achei${Math.round(Math.random() * 22)}@@${Math.round(Math.random() * 33)}`;
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(pass, salt);

    try {
      const user = await User.create({
        nomeUsuario: decoded.nome,
        emailUsuario: decoded.email,
        senhaUsuario: passHash,
      });

      await User_Profile.create({ idUsuario: user?.idUsuario, idPerfil: Number(query.perfil) });

      await sendMail({
        to: decoded.email,
        subject: "Cadastro | Achei Controller",
        view: "users/register.pug",
        params: {
          name: decoded.name,
          email: decoded.email,
          pass: pass,
        },
      });

      response(res, 200, "Usuario cadastrado com sucesso!", user);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  setLevelAuthorization = async (req: Request, res: Response) => {
    const { params, body } = req;

    const userExists = await User.findByPk(params.id);

    if (!userExists) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }

    try {
      await User.update(
        { nivelAutorizacao: body.nivelAutorizacao },
        { where: { idUsuario: params.id } },
      );

      response(res, 200, "Nivel de autorização atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findProfiles = async (req: Request, res: Response) => {
    const { params } = req;

    const userExists = await User.findByPk(params.id);

    if (!userExists) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }

    try {
      const user: any = await User.findByPk(params.id, {
        include: [
          {
            model: Profile,
            as: "Perfil",
            through: { attributes: [] },
            include: [{ model: Department, as: "Departamento" }],
          },
        ],
        attributes: {
          exclude: [
            "senhaUsuario",
            "idUsuario",
            "nomeUsuario",
            "emailUsuario",
            "nivelAutorizacao",
            "googleId",
            "picture",
          ],
        },
      });

      response(res, 200, "OK", user.Perfil);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findChannels = async (req: Request, res: Response) => {
    const { params } = req;

    const userExists = await User.findByPk(params.id);

    if (!userExists) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }

    try {
      const user: any = await User.findByPk(params.id, {
        include: [
          {
            model: UserChannel,
            as: "Canais",
            through: { attributes: [] },

            include: [{ model: Channel, as: "Canal" }],
          },
        ],
        attributes: {
          exclude: [
            "senhaUsuario",
            "idUsuario",
            "nomeUsuario",
            "emailUsuario",
            "nivelAutorizacao",
            "googleId",
            "picture",
          ],
        },
      });

      response(res, 200, "OK", user.Canais);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  createAllUserChannels = async (req: Request, res: Response) => {
    const { params, body } = req;
    console.log(body);

    const user = await User.findByPk(params.id);

    if (!user) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }
    try {
      body.forEach(async (channelId: number) => {
        UserChannel.create({
          idUsuario: user.idUsuario,
          idCanal: channelId,
        });
      });

      response(res, 201, `Canais do usuário ${user?.nomeUsuario} atualizados com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeUserChannels = async (req: Request, res: Response) => {
    const { params, body } = req;
    console.log(body);

    const user = await User.findByPk(params.id);

    if (!user) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }
    try {
      body.forEach(async (channelId: number) => {
        UserChannel.destroy({
          where: {
            idUsuario: user.idUsuario,
            idCanal: channelId,
          },
        });
      });

      response(res, 201, `Canais do usuário ${user?.nomeUsuario} atualizados com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Users;
