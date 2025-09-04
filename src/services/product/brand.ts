import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { Brand } from "./../../models/product/brand";
import { IFile } from "../../interfaces/file";

class Brands {
  public brand = Service(Brand);
  constructor() {
    this.brand;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const brands = await Brand.findAll();
      response(res, 200, "OK", brands);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const brand = await Brand.findByPk(params.id);
      response(res, 200, "OK", brand);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newBrand = async (req: Request, res: Response) => {
    const { body } = req;

    let data = {};

    try {
      data = {
        NomeMarca: body.NomeMarca,
        idbloco: body.idbloco ? body.idbloco : null,
        banner: body.banner,
        titulo: body.titulo,
        descricao: body.descricao,
      };

      if (!req.file) {
        data = { ...data, banner: body.banner };
      } else {
        const { storageUrl } = req.file as IFile;
        data = { ...data, banner: storageUrl };
      }

      const brand = await Brand.create(data);
      response(res, 201, "Marca criada com sucesso!", brand);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateBrand = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      let data = {
        NomeMarca: body.NomeMarca,
        idbloco: body.idbloco ? body.idbloco : null,
        banner: body.banner,
        titulo: body.titulo,
        descricao: body.descricao,
      };

      if (!req.file) {
        data = { ...data, banner: body.banner };
      } else {
        const { storageUrl } = req.file as IFile;
        data = { ...data, banner: storageUrl };
      }

      await Brand.update(data, {
        where: { idMarca: params.id },
      });
      response(res, 200, "Marca atualizada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeBrand = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Brand.destroy({
        where: { idMarca: params.id },
      });
      response(res, 200, "Marca excluida com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Brands;
