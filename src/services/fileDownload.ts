import { Request, Response } from "express";
import { response } from "../utils/response";
import { readFile, uploadFile } from "../utils/bucketFile";
import { IFile } from "../interfaces/file";
import * as path from "path";

interface IMetaData {
  id: number;
  title: string;
  description: string;
  path_icon: string;
  type: string;
}
interface IDataFileDownload {
  sku: number;
  meta_data: IMetaData[];
}

class FileDownload {
  private fileDownload: IDataFileDownload;
  constructor() {}

  findFileDownloadBySku = async (req: Request, res: Response) => {
    const { params } = req;

    if (!params.sku) {
      response(res, 422, "Informe um sku!");
      return;
    }

    try {
      const fileDownload: any = await readFile("json-conf", "file-datasheet");

      const item = fileDownload?.data?.find((x: IDataFileDownload) => x.sku === Number(params.sku));

      if (!item) {
        response(res, 404, "Objeto não encontrado!");
        return;
      }

      response(res, 200, "OK", item);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  createFileDownloadSku = async (req: Request, res: Response) => {
    const { body } = req;

    if (!req.file) {
      response(res, 422, "Insira um arquivo!");
      return;
    }

    const { storageUrl } = req.file as IFile;

    const file: any = await readFile("json-conf", "file-datasheet");

    const verifyExists = file.data.map((item: IDataFileDownload) => item.sku);

    if (verifyExists.includes(Number(body.sku))) {
      response(res, 422, "Sku já cadastrado!");
      return;
    }

    const data = {
      sku: Number(body.sku),
      meta_data: [
        {
          id: 1,
          title: body.title,
          description: body.description,
          path: storageUrl,
          type: path.extname(storageUrl!),
        },
      ],
    };

    try {
      file.data.push(data);
      await uploadFile("json-conf", "file-datasheet", file);
      response(res, 201, "Arquivo enviado sucesso!", file);
    } catch (error) {
      response(res, 502);
    }
  };

  updateFileDownloadBySku = async (req: Request, res: Response) => {
    const { body, params, query } = req;

    const file: any = await readFile("json-conf", "file-datasheet");

    const item = file?.data?.find((x: IDataFileDownload) => x.sku === Number(params.sku));

    if (!item) {
      response(res, 404, "Objeto não encontrado!");
      return;
    }

    if (query.meta_data_id && !req.file) {
      const metaDataItem = item.meta_data.find(
        (x: IMetaData) => x.id === Number(query.meta_data_id),
      );

      if (!metaDataItem) {
        response(res, 404, "ID do objeto dentro de meta_data não encontrado!");
        return;
      }

      const data = {
        title: body.title ? body.title : metaDataItem.title,
        description: body.description ? body.description : metaDataItem.description,
      };

      Object.assign(metaDataItem, data);
    }
    
    if (!query.meta_data_id && req.file) {
      const { storageUrl } = req.file as IFile;

      if (!storageUrl) {
        response(res, 422, "Insira um arquivo para continuar");
        return;
      }

      const lastID = item.meta_data.reduce((maxID: number, x: IMetaData) => {
        return x.id > maxID ? x.id : maxID;
      }, 0);

      const newID = lastID + 1;

      const data = {
        id: newID,
        title: body.title,
        description: body.description,
        path: storageUrl,
        type: path.extname(storageUrl),
      };

      item.meta_data.push(data);
    }

    try {
      await uploadFile("json-conf", "file-datasheet", file);

      response(res, 200, "Arquivo atualizado com sucesso!", file);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  deleteFileDownloadBySku = async (req: Request, res: Response) => {
    const { params, query } = req;

    const file: any = await readFile("json-conf", "file-datasheet");

    if (query.meta_data_id) {
      const item = file?.data?.find((x: IDataFileDownload) => x.sku === Number(params.sku));

      if (!item) {
        response(res, 404, "Objeto não encontrado!");
        return;
      }

      const index = item.meta_data.findIndex((x: IMetaData) => x.id === Number(query.meta_data_id));

      if (index !== -1) {
        item.meta_data.splice(index, 1);
      }
    } else {
      const index = file.data.findIndex(
        (item: IDataFileDownload) => item.sku === Number(params.sku),
      );
      if (index !== -1) {
        file.data.splice(index, 1);
      }
    }
    try {
      await uploadFile("json-conf", "file-datasheet", file);

      response(res, 200, "Arquivo excluido com sucesso!", file);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default FileDownload;
