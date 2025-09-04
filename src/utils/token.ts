import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { IUser, User } from "../models/user/user";
import { mercadoLivre } from "../config/axios";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const { JWT_SECRET, ML_CLIENT_ID, ML_CLIENT_SECRET, ML_REFRESH_TOKEN, ML_CODE, ML_REDIRECT_URI } =
  process.env;

export interface IToken {
  id: number;
  email: string;
}

export const createGoogleToken = async (user: IUser, req: Request) => {
  const token = jwt.sign(
    {
      id: user.idUsuario,
      email: user.emailUsuario,
    },
    JSON.stringify(JWT_SECRET),
  );

  return {
    mensagem: "Usuário autenticado com sucesso!",
    token: token,
    idUsuario: user.idUsuario,
    emailUsuario: user.emailUsuario,
  };
};

export const createToken = async (user: IUser, req: Request) => {
  const profileActions: string[] = (user as any)?.dataValues.Perfil.flatMap(
    ({ Actions }: { Actions: any }) => {
      return Actions.map(({ acao }: { acao: string }) => acao);
    },
  );
  const uniqueActions = [...new Set(profileActions)];
  const token = jwt.sign(
    {
      id: user.idUsuario,
      email: user.emailUsuario,
      permissions: uniqueActions,
    },
    JSON.stringify(JWT_SECRET),
  );

  return token;
};

export const getToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  return token;
};

export const getUserByToken = async (token: jwt.JwtPayload | any) => {
  const decoded = jwt.verify(token, JSON.stringify(JWT_SECRET));
  const id = (decoded as IToken).id;

  const user = await User.findOne({ where: { idUsuario: id } });

  return user;
};

export const generateToken = async (user: IUser) => {
  //Cria o token de auth
  const token = jwt.sign(
    {
      nome: user.nomeUsuario,
      email: user.emailUsuario,
    },
    JSON.stringify(JWT_SECRET),
    { expiresIn: "1d" },
  );

  //Retorna o token de auth pro ADM
  return {
    token,
  };
};

export const generateTokenMl = async () => {
  const result = await mercadoLivre.post(
    `/oauth/token?client_id=${ML_CLIENT_ID}&client_secret=${ML_CLIENT_SECRET}&redirect_uri=${ML_REDIRECT_URI}&grant_type=refresh_token&refresh_token=${ML_REFRESH_TOKEN}&code=${ML_CODE}`,
  );
  return result?.data?.access_token;
};

// export const getMagentoToken = async (url: string, username: string, password: string) => {
//   try {
//     const { data: response } = await axios.post(`${url}/rest/all/V1/integration/admin/token`, {
//       username,
//       password,
//     });

//     // prettier-ignore
//     const newToken = (response as string).replace("\"", "");
//     return newToken;
//   } catch (e) {
//     return new Error(`Error getting magento token: ${e}`);
//   }
// };
