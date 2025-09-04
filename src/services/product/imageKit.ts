import { Request, Response } from "express";
import { ImagemKit } from "../../models/product/imageKit";
import Service from "../Service";
import { response } from "../../utils/response";
import { id } from "date-fns/locale";
import connection from "../../config/database";
import { QueryTypes } from "sequelize";

interface IFileKit {
  storageUrl?: string;
}

interface IImagesList {
  images: ImagemKit[];
}

class ImagemKits {
  public ImagemKits = Service(ImagemKit);
  constructor() {
    this.ImagemKits;
  }
  findAll = async (req: Request, res: Response) => {
    try {
      const imagens = await ImagemKit.findAll();
      response(res, 200, "OK", imagens);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findByProductId = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const imagens = await ImagemKit.findAll({
        where: { idProduto: params.idProduto, ItensPorKit: params.quantidade },
      });
      if (imagens.length === 0) {
        response(res, 404, "O produto não possui imagens por kits", imagens);
      }
      response(
        res,
        200,
        `O produto possui imagens para os kits de ${params.quantidade} cadastradas`,
        imagens,
      );
    } catch (error) {
      console.log(error);
      response(res, 502, "Erro ao buscar imagens por produto", []);
    }
  };

  newImageKit = async (req: Request, res: Response) => {
    const { body }: { body: ImagemKit } = req;

    try {
      const existingImages = await ImagemKit.findAll({
        where: {
          idProduto: body.idProduto,
          ItensPorKit: body.ItensPorKit,
        },
      });

      if (existingImages.length > 0) {
        return response(res, 400, "Já existem imagens cadastradas para os kits 2 e 4");
      }
      if (!req.file) {
        const data = {
          idProduto: Number(body.idProduto),
          NomeImagem: body.NomeImagem,
          Path: body.Path,
          TextoAlternativo: body.TextoAlternativo,
          ItensPorKit: Number(body.ItensPorKit),
        };

        const image = await ImagemKit.create(data);
        response(res, 201, "Imagem de kit cadastrada com sucesso", image);
      } else {
        const { storageUrl } = req.file as IFileKit;
        const data = {
          idProduto: body.idProduto,
          NomeImagem: body.NomeImagem,
          Path: storageUrl,
          TextoAlternativo: body.TextoAlternativo,
          ItensPorKit: body.ItensPorKit,
        };

        const image = await ImagemKit.create(data);
        response(res, 201, "Imagem de kit cadastrada com sucesso", image);
      }
    } catch (e) {
      console.log(e);
      response(res, 502, "Erro ao cadastrar imagem de kit");
    }
  };

  updateImageKit = async (req: Request, res: Response) => {
    const { body }: { body: IImagesList } = req;
    try {
      const results = await Promise.allSettled(
        body.images.map((image: ImagemKit) => {
          const data = {
            NomeImagem: image.NomeImagem,
            Path: image.Path,
            TextoAlternativo: image.TextoAlternativo,
            ItensPorKit: Number(image.ItensPorKit),
          };
          return ImagemKit.update(data, { where: { idImagemKit: image.idImagemKit } });
        }),
      );

      const [errors, success] = results.reduce<[unknown[], [affectedCount: number][]]>(
        ([errors, success], result) => {
          if (result.status === "rejected") {
            errors.push(result.reason);
          } else {
            success.push(result.value);
          }
          return [errors, success];
        },
        [[], []],
      );

      if (errors.length > 0) {
        response(res, 207, "Algumas imagens não foram atualizadas");
      } else {
        response(res, 200, `${success.length} imagens atualizada com sucesso!`);
      }
    } catch (error) {
      console.log(error);
      response(res, 502, "Erro ao atualizar imagens de kit");
    }
  };

  deleteImageKit = async (req: Request, res: Response) => {
    const { body }: { body: IImagesList } = req;

    try {
      body.images.forEach(async (image: ImagemKit) => {
        await ImagemKit.destroy({ where: { idImagemKit: image.idImagemKit } });
      });

      response(res, 200, `${body.images.length} Imagens de kit deletadas com sucesso!`);
    } catch (e) {
      console.log(e);
      response(res, 502, "Erro ao deletar imagem de kit");
    }
  };

  getRelatedImagesKit = async (req: Request, res: Response) => {
    const { idModelo } = req.params;
    try {
      const query = `
        select m.NomeModelo, i.NomeImagem, i.Path from imagemKit i
        inner join produto p on p.idProduto = i.idProduto
        inner join modelo m on m.idModelo = p.idModelo
        where m.idModelo = :idModelo
      `;
      const relatedImages = await connection.query(query, {
        type: QueryTypes.SELECT,
        replacements: { idModelo },
      });
      response(res, 200, "OK", relatedImages);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default ImagemKits;
