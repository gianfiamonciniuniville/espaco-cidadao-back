import { Request, Response } from "express";
import Service from "../Service";
import { response } from "../../utils/response";
import { GoogleProduct } from "../../models/product/googleProduct";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";
import { ProductFeedHistory } from "../../models/product/productFeedHistory";
import { IProductFeedQueue } from "../../interfaces/productFeedQueue";
import { Product } from "../../models/product/product";

class GoogleProductService {
  public googleProduct = Service(GoogleProduct);
  constructor() {
    this.googleProduct;
  }

  createGoogleProduct = async (req: Request, res: Response) => {
    const { params } = req;

    const productExists = await Product.findOne({ where: { Sku: params.sku } });

    if (!productExists) return response(res, 404, "Produto não encontrado");

    try {
      const querySQL = `EXEC InsertGoogleProduct @sku = :sku`;

      await sequelize.query(querySQL, {
        type: QueryTypes.SELECT,
        replacements: { sku: params.sku },
      });

      const googleProduct = await GoogleProduct.findOne({ where: { sku: params.sku } });
      response(res, 200, "OK", googleProduct);
    } catch (error) {
      response(res, 502);
    }
  };
  findAllGoogleProduct = async (req: Request, res: Response) => {
    const products = await sequelize.query(
      `SELECT pg.* FROM ProdutoGoogle pg
       INNER JOIN Produto p ON p.Sku = pg.sku 
      `,
      {
        type: QueryTypes.SELECT,
      },
    );

    try {
      response(res, 200, "OK", products);
    } catch (error) {
      response(res, 502);
    }
  };
  updateGoogleProduct = async (req: Request, res: Response) => {
    const { params, body } = req;

    try {
      const data = {
        title: body.title,
        description: body.description,
        image: body.image,
        link: body.link,
        customLabel0: body.customLabel0,
        customLabel1_id: body.customLabel1_id ? body.customLabel1_id : null,
        customLabel2_id: body.customLabel2_id ? body.customLabel2_id : null,
        customLabel3_id: body.customLabel3_id ? body.customLabel3_id : null,
        customLabel4_id: body.customLabel4_id ? body.customLabel4_id : null,
        hasInstallments: body.hasInstallments,
        hasShipping: body.hasShipping,
        hasStaticCustomLabel: body.hasStaticCustomLabel,
      };

      await GoogleProduct.update(data, {
        where: { sku: params.sku },
      });

      const dataGoogleQueue: IProductFeedQueue = {
        Sku: body.sku,
        Acao: 2,
        DataHora: new Date(),
      };

      await ProductFeedHistory.create(dataGoogleQueue);

      response(res, 200, "Produto Google atualizado com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateManyGoogleProducts = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      for (const googleProduct of body.googleProducts) {
        const data = {
          title: googleProduct.title,
          description: googleProduct.description,
          image: googleProduct.image,
          link: googleProduct.link,
          customLabel0: googleProduct.customLabel0,
          customLabel1_id: googleProduct.customLabel1_id ? googleProduct.customLabel1_id : null,
          customLabel2_id: googleProduct.customLabel2_id ? googleProduct.customLabel2_id : null,
          customLabel3_id: googleProduct.customLabel3_id ? googleProduct.customLabel3_id : null,
          customLabel4_id: googleProduct.customLabel4_id ? googleProduct.customLabel4_id : null,
          hasInstallments: googleProduct.hasInstallments,
          hasShipping: googleProduct.hasShipping,
          hasStaticCustomLabel: googleProduct.hasStaticCustomLabel,
        };

        await GoogleProduct.update(data, {
          where: { sku: googleProduct.sku },
        });

        const dataGoogleQueue: IProductFeedQueue = {
          Sku: googleProduct.sku,
          Acao: 2,
          DataHora: new Date(),
        };

        await ProductFeedHistory.create(dataGoogleQueue);
      }
      response(res, 200, "Produtos Google atualizados com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findGoogleProductBySku = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const product = await GoogleProduct.findOne({ where: { sku: params.sku } });

      if (!product) return response(res, 404, "Produto não encontrado");
      
      response(res, 200, "OK", product);
    } catch (error) {
      response(res, 502);
    }
  };
}

export default GoogleProductService;
