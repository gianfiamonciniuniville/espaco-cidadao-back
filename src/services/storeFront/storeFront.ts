import { response } from "../../utils/response";
import { Request, Response } from "express";
import { Product } from "../../models/product/product";
import Service from "../Service";
import { IProductMagento, IStoreFrontRequest } from "../../interfaces/magento";
import {
  deleteAllFromStoreFront,
  getAllProducts,
  getAllSkusInStoreFront,
  getProduct,
  updateProductsToStoreFront,
} from "./useCases";
import { googleCloud } from "../../config/googleCloud";
import { cleanFileName } from "../../utils/cleanFileName";

// const NAME_ATTRIBUTE_STOREFRONT = process.env.API_MAGENTO_NAME_ATTRIBUTE_STOREFRONT || "";

export class StoreFrontService {
  public storeFront = Service(Product);
  constructor() {
    this.storeFront;
  }

  getAll = async (_: Request, res: Response) => {
    try {
      const responseGetAll = await getAllProducts();

      response(res, 200, "OK", responseGetAll);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  udpdateProducts = async (req: Request, res: Response) => {
    const { body } = req;
    const dataBody = body?.listOfSkus as IStoreFrontRequest[];

    try {
      const productsAlreadyInStoreFront = await getAllSkusInStoreFront();

      const skusInStoreFront: IStoreFrontRequest[] = dataBody ?? [];

      if (dataBody === undefined || dataBody.length === 0) {
        await deleteAllFromStoreFront();
      }

      const { listOfError, listOfChanges, listOfInserts, listOfDeletes } = await putProducts({
        listOfSkus: skusInStoreFront,
        allProducts: productsAlreadyInStoreFront?.skus!,
      });

      await updateProductsToStoreFront({ skus: skusInStoreFront });

      const listOfResults = {
        listOfChanges: listOfChanges,
        listOfDeletes: listOfDeletes,
        listOfInserts: listOfInserts,
        listOfError: listOfError,
      };

      response(res, 200, stringfyResultUpdateStoreFront({ result: listOfResults }));
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  async editBrands(req: Request, res: Response) {
    try {
      const values = req.body;
      const bucket = googleCloud.bucket("json-conf");
      const brandFile = bucket.file(JSON_BRANDS_DESTINATION);
      await brandFile.save(JSON.stringify(values), {
        contentType: "application/json",
        metadata: {
          contentDisposition: 'inline; filename="marcas_disponiveis.json"',
          cacheControl: "public, no-cache",
        },
      });
      brandFile.makePublic();
      res.status(200).json(values);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async getBrands(_: Request, res: Response) {
    try {
      const pepito = googleCloud.bucket("json-conf");
      const world = pepito.file(JSON_BRANDS_DESTINATION);
      const data = await world.download();
      res.status(200).json(JSON.parse(data.toString()));
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async uploadImage(req: Request, res: Response) {
    const { file } = req;
    if (!file) return res.status(400).send({ error: "File not found" });
    try {
      const bucket = googleCloud.bucket("json-conf");
      const cleanName = cleanFileName(new Date().getTime().toString() + "_" + file.originalname);
      const imageFileContainer = bucket.file(`imagens-marcas/${cleanName}`);
      await imageFileContainer.save(file.buffer, {
        contentType: file.mimetype,
        metadata: {
          contentDisposition: `inline; filename="${cleanName}"`,
        },
      });
      imageFileContainer.makePublic();
      return res.json({
        url: "https://storage.googleapis.com/json-conf/imagens-marcas/" + cleanName,
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }
}

const JSON_BRANDS_DESTINATION = "imagens-marcas/brands.json";

const putProducts = async ({
  listOfSkus,
  allProducts,
}: {
  listOfSkus: IStoreFrontRequest[];
  allProducts: { sku: string; order: number }[];
}): Promise<{
  listOfChanges: string[];
  listOfInserts: string[];
  listOfDeletes: string[];
  listOfError: string[];
}> => {
  const listOfError: string[] = [];
  const listOfChanges: string[] = [];
  const listOfDeletes: string[] = [];
  const listOfInserts: string[] = [];

  for (const { sku, order } of listOfSkus) {
    const product = await getProduct(sku);

    // Para separar inseridos(novo), deletedos e alterados
    if (!allProducts?.some((item) => item.sku === sku)) {
      listOfInserts.push(sku);
    }
    if (
      !listOfInserts.some((item) => item === sku) &&
      !allProducts?.some((item) => item.sku === sku)
    ) {
      listOfDeletes.push(sku);
    }

    if (product?.order !== order) {
      listOfChanges.push(sku);
    }
  }

  return { listOfChanges, listOfDeletes, listOfInserts, listOfError };
};

export const stringfyResultUpdateStoreFront = ({
  result,
}: {
  result: {
    listOfChanges: string[];
    listOfDeletes: string[];
    listOfInserts: string[];
    listOfError: string[];
  };
}) => {
  const inserts = result.listOfInserts.length > 0 ? `Novo: ${result.listOfInserts.join(", ")}` : "";
  const deletes =
    result.listOfDeletes.length > 0 ? `Removidos: ${result.listOfDeletes.join(", ")}` : "";
  const changed =
    result.listOfChanges.length > 0 ? `Alterado Ordem: ${result.listOfChanges.join(", ")}` : "";
  const errors = result.listOfError.length > 0 ? `Erro: ${result.listOfError.join(", ")}` : "";

  return `${inserts} \n ${deletes} \n ${changed} \n ${errors}`;
};
