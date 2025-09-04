import { Department } from "./../models/user/department";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { response } from "./../utils/response";
import Service from "./Service";

import { User } from "../models/user/user";
import { User_Profile } from "../models/user/user_profile";
import { Profile } from "./../models/user/profile";
import { sendMail } from "../utils/sendMail";
import { Profile_Department } from "../models/user/profile_department";
dotenv.config();

class Profiles {
  public profile = Service(Profile);

  constructor() {
    this.profile;
  }

  new = async (req: Request, res: Response) => {
    const { body } = req;

    if (!body.nomePerfil) {
      response(res, 422, "Insira um nome que deseja cadastrar!");
      return;
    }

    const profileExist = await Profile.findOne({
      where: { nomePerfil: body.nomePerfil },
    });

    if (profileExist) {
      response(res, 422, "Perfil já existente, insira outro nome!");
      return;
    }

    try {
      const profile = await Profile.create({ nomePerfil: body.nomePerfil });
      response(res, 201, "Perfil cadastrado com sucesso!", profile);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  update = async (req: Request, res: Response) => {
    const { params, body } = req;
    const profileExist = await Profile.findByPk(params.id);

    if (!profileExist) {
      response(res, 404, "Perfil não encontrado");
      return;
    }

    try {
      const data = {
        nomePerfil: body.nomePerfil ? body.nomePerfil : undefined,
      };

      await Profile.update(data, { where: { idPerfil: params.id } });

      response(res, 200, "Perfil atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  remove = async (req: Request, res: Response) => {
    const { params } = req;

    const profileExist = await Profile.findByPk(params.id);

    if (!profileExist) {
      response(res, 404, "Perfil não encontrado!");
      return;
    }

    try {
      await Profile.destroy({ where: { idPerfil: params.id } });
      response(res, 200, `Perfil ${profileExist.nomePerfil} excluído com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  createAllUserProfiles = async (req: Request, res: Response) => {
    const { params, body } = req;
    console.log(body);

    const user = await User.findByPk(params.id);

    if (!user) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }
    try {
      body.forEach(async (profileId: number) => {
        User_Profile.create({
          idUsuario: user.idUsuario,
          idPerfil: profileId,
        });
      });

      response(res, 201, `Perfis do usuário ${user?.nomeUsuario} atualizados com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeUserProfiles = async (req: Request, res: Response) => {
    const { params, body } = req;
    console.log(body);

    const user = await User.findByPk(params.id);

    if (!user) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }
    try {
      body.forEach(async (profileId: number) => {
        User_Profile.destroy({
          where: {
            idUsuario: user.idUsuario,
            idPerfil: profileId,
          },
        });
      });

      response(res, 201, `Perfil do usuário ${user?.nomeUsuario} atualizados com sucesso`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  createUserProfile = async (req: Request, res: Response) => {
    const { params, body } = req;

    const user = await User.findByPk(body.idUsuario);

    if (!user) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }

    if (!params.idPerfil) {
      response(res, 422, "Informe um idPerfil!");
      return;
    }

    const profile = await Profile.findByPk(params.idPerfil);

    if (!profile) {
      response(res, 404, "Perfil não encontrado!");
      return;
    }

    try {
      await User_Profile.create({
        idUsuario: body.idUsuario,
        idPerfil: params.idPerfil,
      });

      response(
        res,
        201,
        `Perfil ${profile.nomePerfil} cadastrado com sucesso no usuário ${user?.nomeUsuario} `,
      );
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeUserProfile = async (req: Request, res: Response) => {
    const { params } = req;

    const user = await User.findByPk(params.idUsuario);

    if (!user) {
      response(res, 404, "Usuario não encontrado!");
      return;
    }

    if (!params.idPerfil) {
      response(res, 422, "Informe um idPerfil!");
      return;
    }

    const profile = await Profile.findByPk(params.idPerfil);

    if (!profile) {
      response(res, 404, "Perfil não encontrado!");
      return;
    }

    try {
      const user_profile = await User_Profile.findOne({
        where: {
          idUsuario: params.idUsuario,
          idPerfil: params.idPerfil,
        },
      });

      if (!user_profile) {
        response(res, 404, "Relacionamento não encontrado!");
        return;
      }

      await user_profile.destroy();

      response(
        res,
        200,
        `Perfil ${profile.nomePerfil} removido do usuário ${user.nomeUsuario} com sucesso.`,
      );
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const profiles = await Profile.findAll();

      response(res, 200, "OK", profiles);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const profile = await Profile.findByPk(params.id, {
        include: [{ model: Department, as: "Departamento" }],
      });

      if (!profile) {
        response(res, 404, "Profile not found!");
        return;
      }

      response(res, 200, "OK", profile);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  requestProfile = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      await sendMail({
        to: process.env.MAIL_FROM as string,
        subject: "Perfil | Achei Controller",
        view: "users/requestProfile.pug",
        params: {
          nome: body.nome,
          email: body.email,
          id: body.id,
        },
      });

      response(
        res,
        200,
        "Confira a sua caixa de entrada no seu e-mail e aguarde alguns instantes até que o Adm aprove sua solicitação!",
      );
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  validateRequestProfile = async (req: Request, res: Response) => {
    const { query } = req;

    const profile = await Profile.findByPk(Number(query.profile));

    if (!profile) {
      response(res, 404, "Perfil não encontrado!");
      return;
    }

    try {
      await User_Profile.create({ idUsuario: Number(query.user), idPerfil: Number(query.profile) });

      response(res, 200, "Usuario cadastrado com sucesso ao perfil selecionado!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  profileDepartment = async (req: Request, res: Response) => {
    const { body, params } = req;

    const profile = await Profile.findOne({
      where: { idPerfil: params.id },
      include: [{ model: Department, as: "Departamento", required: false }],
    });

    try {
      for (let d of body.departments) {
        const existDepartment = profile?.Departamento?.find(
          (dep) => dep.idDepartamento === d.idDepartamento,
        );

        if (existDepartment) {
          await Profile_Department.destroy({
            where: { idDepartamento: existDepartment.idDepartamento, idPerfil: params.id },
          });
        } else {
          await Profile_Department.create({
            idDepartamento: d.idDepartamento,
            idPerfil: params.id,
          });
        }
      }

      response(res, 200, "OK");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newProfileDepartment = async (req: Request, res: Response) => {
    const { body, params } = req;

    try {
      await Profile_Department.create({
        idDepartamento: body.idDepartamento,
        idPerfil: params.id,
      });

      const profile = await Profile.findByPk(params.id, {
        include: [{ model: Department, as: "Departamento" }],
      });

      response(res, 200, "OK", profile);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeProfileDepartment = async (req: Request, res: Response) => {
    const { body, params } = req;

    try {
      await Profile_Department.destroy({
        where: { idDepartamento: body.idDepartamento, idPerfil: params.id },
      });

      const profile = await Profile.findByPk(params.id, {
        include: [{ model: Department, as: "Departamento" }],
      });

      response(res, 200, "OK", profile);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Profiles;
