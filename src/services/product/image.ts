import { NextFunction, Request, Response } from "express";

import { response } from "../../utils/response";
import Service from "../Service";

import { Image } from "../../models/product/image";
import { QueryTypes } from "sequelize";
import sequelize from "../../config/database";
import { IImage } from "../../interfaces/image";

interface IFile extends Express.Multer.File {
  storageUrl?: string;
}

class Images {
  public image = Service(Image);
  constructor() {
    this.image;
  }

  newImage = async (req: Request, res: Response) => {
    const { body } = req;
    const lastImage = await Image.findOne({
      where: {
        idProduto: body.idProduto,
      },
      order: [["Ordem", "DESC"]],
      limit: 1,
    });

    const lastOrder = lastImage ? lastImage.Ordem : 0;
    const nextOrder = lastOrder! + 1;

    if (body.Ordem > 0) {
      const orderExists = await Image.findOne({
        where: { idProduto: body.idProduto, Ordem: body.Ordem },
      });

      if (orderExists) {
        response(res, 422, "Ordem ja cadastrada, escolha outra!");
        return;
      }
    }

    try {
      if (!req.file) {
        const data = {
          idProduto: body.idProduto,
          NomeImagem: body.NomeImagem,
          Ordem: body.Ordem ? body.Ordem : (nextOrder as any),
          TextoAlternativo: body.TextoAlternativo,
          Path: body.Path,
        };

        const image = await Image.create(data);
        response(res, 201, "Imagem cadastrada com sucesso", image);
      } else {
        const { storageUrl } = req.file as IFile;
        const data = {
          idProduto: body.idProduto,
          NomeImagem: body.NomeImagem,
          Ordem: body.Ordem ? body.Ordem : (nextOrder as any),
          TextoAlternativo: body.TextoAlternativo,
          Path: storageUrl,
        };

        const image = await Image.create(data);
        response(res, 201, "Imagem cadastrada com sucesso", image);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  // updateImage = async (req: Request, res: Response) => {
  //   const { params, body } = req;

  //   try {
  //     if (!req.file) {
  //       const data = {
  //         idProduto: body.idProduto,
  //         NomeImagem: body.NomeImagem,
  //         Ordem: body.Ordem,
  //         TextoAlternativo: body.TextoAlternativo,
  //         Path: body.Path,
  //       };

  //       await Image.update(data, {
  //         where: { idImagem: params.id },
  //       });
  //       response(res, 200, "Imagem atualizada com sucesso!");
  //     } else {
  //       const { storageUrl } = req.file as IFile;
  //       const data = {
  //         idProduto: body.idProduto,
  //         NomeImagem: body.NomeImagem,
  //         Ordem: body.Ordem,
  //         TextoAlternativo: body.TextoAlternativo,
  //         Path: storageUrl,
  //       };

  //       await Image.update(data, {
  //         where: { idImagem: params.id },
  //       });
  //       response(res, 200, "Imagem atualizada com sucesso!");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     response(res, 502);
  //   }
  // };

  updateListImage = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      body.images.forEach(async (image: IImage) => {
        const data = {
          idProduto: image.idProduto,
          NomeImagem: image.NomeImagem,
          Ordem: image.Ordem,
          TextoAlternativo: image.TextoAlternativo,
          Path: image.Path,
        };

        await Image.update(data, {
          where: { idImagem: image.idImagem },
        });
      });

      response(res, 200, `${body.images.length} imagens atualizada com sucesso!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeListImage = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      body.images.forEach(async (image: IImage) => {
        await Image.destroy({
          where: { idImagem: image.idImagem },
        });
      });

      response(res, 200, `${body.images.length} imagens excluidas com sucesso!`);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  // removeImage = async (req: Request, res: Response) => {
  //   const { params } = req;

  //   try {
  //     await Image.destroy({
  //       where: { idImagem: params.id },
  //     });
  //     response(res, 200, "Imagem excluída com sucesso!");
  //   } catch (error) {
  //     console.log(error);
  //     response(res, 502);
  //   }
  // };

  getRelatedImages = async (req: Request, res: Response): Promise<void> => {
    const { idModelo } = req.params;
    try {
      const query = `
        select m.NomeModelo, i.NomeImagem, i.Path from imagem i
        inner join produto p on p.idProduto = i.idProduto
        inner join modelo m on m.idModelo = p.idModelo
        where m.idModelo = :idModelo
      `;
      const relatedImgs = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idModelo },
      });

      response(res, 200, "Ok", relatedImgs);
    } catch (error) {
      response(res, 502);
    }
  };
}

export default Images;
