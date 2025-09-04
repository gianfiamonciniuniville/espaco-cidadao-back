import { NextFunction, Request, Response } from "express";

export const log = async (req: Request, res: Response, next: NextFunction) => {
  console.log("REQUEST");

  console.log("METHOD - ", req.method);
  console.log("ENDPOINT - ", req.originalUrl);

  next();
};