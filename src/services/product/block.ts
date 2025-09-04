import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";

import { Block } from "./../../models/product/block";

class Blocks {
  public block = Service(Block);
  constructor() {
    this.block;
  }

  findAll = async (req: Request, res: Response) => {
    try {
      const blocks = await Block.findAll();
      response(res, 200, "OK", blocks);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newBlock = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const data = {
        idCanal: body.idCanal,
        codBloco: body.codBloco,
        NomeBloco: body.NomeBloco,
      };

      const block = await Block.create(data);
      response(res, 201, "OK", block);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateBlock = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        idCanal: body.idCanal,
        codBloco: body.codBloco,
        NomeBloco: body.NomeBloco,
      };

      await Block.update(data, {
        where: { idBloco: params.id },
      });
      response(res, 200, "Bloco atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeBlock = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      await Block.destroy({
        where: { idBloco: params.id },
      });
      response(res, 200, "Bloco excluido com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Blocks;
