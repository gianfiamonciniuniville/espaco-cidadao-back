import { Request, Response } from "express";

import Service from "./Service";
import { response } from "./../utils/response";

import { Department } from "./../models/user/department";

class Departments {
  public department = Service(Department);
  constructor() {
    this.department;
  }

  new = async (req: Request, res: Response) => {
    const { body } = req;
    try {
      const department = await Department.create({
        nomeDepartamento: body.nomeDepartamento,
      });

      response(res, 201, "OK", department);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const departments = await Department.findAll();
      response(res, 201, "OK", departments);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  remove = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      await Department.destroy({ where: { idDepartamento: params.id } });
      response(res, 200, "Departamento excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Departments;
