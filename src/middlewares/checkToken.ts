//MODULOS EXTERNOS
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getToken } from "../utils/token";
import dotenv from "dotenv";
dotenv.config();

export interface IUserToken {
  id: number;
  email: string;
  iat: number;
  permissions: string[];
}

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  try {
    const verify = jwt.verify(token, JSON.stringify(process.env.JWT_SECRET));
    //@ts-ignore
    req.user = verify;
    next(); 
  } catch (error) {
    return res.status(400).json({ message: "Token Inválido!" });
  }
};
 