import transporter from "../config/email";
import path from "path";
import * as pug from "pug";
import { FindAttributeOptions, IncludeOptions } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export default (model: any, defaulOptions: any = {}) => {
  const findAll = async (req: any = {}, query: any = {}, options: any = {}) => {
    const include = options.include;
    const attributes = options.attributes;
    const result = await model.findAll({ include, attributes });
    return result;
  };

  const findByPk = async (req: any = {}, query: number, options: any = {}) => {
    const include: IncludeOptions = options.include;
    const attributes: FindAttributeOptions = options.attributes;

    const result = await model.findByPk(query, { include, attributes });
    return result;
  };

  const findOne = async (req: any = {}, query: any = {}, options: any = {}) => {
    const result = await model.findOne(query, options);
    return result;
  };

  return {
    findAll,
    findByPk,
    findOne
  };
};
