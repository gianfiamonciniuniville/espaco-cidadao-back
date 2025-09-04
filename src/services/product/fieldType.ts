import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { FieldType } from "../../models/product/fieldType";

export default class TypeFieldService {
  public typeField = Service(FieldType);
  constructor() {
    this.typeField;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const typeFields = await FieldType.findAll();
      response(res, 200, "OK", typeFields);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
