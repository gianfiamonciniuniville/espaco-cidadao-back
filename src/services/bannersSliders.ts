import { Request, Response } from "express";
import { response } from "../utils/response";
import { readFile, uploadFile } from "../utils/bucketFile";
import * as path from "path";
import { IDataSlider, ITypeBanner, IDataBanner } from "../interfaces/campaign";
import { uploadImageToStorage } from "../middlewares/uploadFile";

class BannersSliders {
  public campaignSlider: IDataSlider;
  constructor() {}

  findAllSlider = async (req: Request, res: Response) => {
    try {
      const slider = await readFile("json-conf", "daba139");
      response(res, 200, "OK", slider);
    } catch (error) {
      response(res, 502);
    }
  };

  findOneSlider = async (req: Request, res: Response) => {
    const { params, query } = req;

    if (query.type !== "desk" && query.type !== "mobile") {
      response(res, 400, "Tipo inválido!");
      return;
    }

    if (isNaN(Number(params.id))) {
      response(res, 400, "Id inválido!");
      return;
    }

    try {
      const slider: any = await readFile("json-conf", "daba139");

      const type = query.type === "desk" ? slider.desk : slider.mobile;

      const item = type.find((x: any) => x.id === Number(params.id));

      if (!item) {
        response(res, 404, "Objeto não encontrado!");
        return;
      }

      response(res, 200, "OK", item);
    } catch (error) {
      response(res, 502);
    }
  };

  newSlider = async (req: Request, res: Response) => {
    const { body } = req;

    const storageUrl = await uploadImageToStorage(req?.file!);

    if (body.ordem < 0) {
      response(res, 422, "A ordem deve ser maior que zero");
      return;
    }

    const file: any = await readFile("json-conf", "daba139");

    const data = {
      id: 0,
      extension: path.extname(storageUrl!),
      title: body.title,
      alt: body.alt,
      ordem: Number(body.ordem),
      path: storageUrl,
      link: body.link,
    };

    if (body.type === "desk") {
      const verifyExists = file.desk.map((item: IDataSlider) => item.id);
      const order = file.desk.map((item: IDataSlider) => item.ordem);

      const lastId = file.desk.reduce((acc: number, item: IDataSlider) => {
        return item.id > acc ? item.id : acc;
      }, 0);

      data.id = lastId + 1;

      if (verifyExists.includes(data.id)) {
        response(res, 422, "Id já existe!");
        return;
      }

      if (order.includes(data.ordem)) {
        response(res, 422, "Ordem já existe!");
        return;
      }

      file.desk.push(data);
      file.desk.sort((a: IDataSlider, b: IDataSlider) => a.ordem - b.ordem);
    }

    if (body.type === "mobile") {
      const verifyExists = file.mobile.map((item: IDataSlider) => item.id);
      const order = file.mobile.map((item: IDataSlider) => item.ordem);

      const lastId = file.mobile.reduce((acc: number, item: IDataSlider) => {
        return item.id > acc ? item.id : acc;
      }, 0);

      data.id = lastId + 1;

      if (verifyExists.includes(data.id)) {
        response(res, 422, "Id já existe!");
        return;
      }

      if (order.includes(data.ordem)) {
        response(res, 422, "Ordem já existe!");
        return;
      }

      file.mobile.push(data);
      file.mobile.sort((a: IDataSlider, b: IDataSlider) => a.ordem - b.ordem);
    }

    try {
      await uploadFile("json-conf", "daba139", file);

      response(res, 201, "OK", file);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateSlider = async (req: Request, res: Response) => {
    const { body, params } = req;
    const file: any = await readFile("json-conf", "daba139");
    let storageUrl;

    if (req.file) {
      storageUrl = await uploadImageToStorage(req?.file!);
    }

    // if (body.ordem < 0) {
    //   response(res, 422, "A ordem deve ser maior que zero");
    //   return;
    // }

    const data = {
      id: Number(params.id),
      extension: body.extension,
      title: body.title,
      ordem: Number(body.ordem),
      path: storageUrl ? storageUrl : body.path,
      link: body.link,
    };

    if (body.type === "desk") {
      const itemIndex = file.desk.findIndex((item: IDataSlider) => item.id === Number(params.id));

      if (itemIndex === -1) {
        response(res, 404, "Objeto não encontrado!");
        return;
      }

      file.desk[itemIndex] = data;

      // não vem ordem diferente do frontend, logo nao precisa verificar se a ordem já existe
      // const order = file.desk.map((item: IDataSlider) => item.ordem);
      // if (order.includes(data.ordem)) {
      //   response(res, 422, "Ordem já existe!");
      //   return;
      // }

      file.desk.sort((a: IDataSlider, b: IDataSlider) => a.ordem - b.ordem);
    }

    if (body.type === "mobile") {
      const itemIndex = file.mobile.findIndex((item: IDataSlider) => item.id === Number(params.id));

      if (itemIndex === -1) {
        response(res, 404, "Objeto não encontrado!");
        return;
      }

      file.mobile[itemIndex] = data;

      // não vem ordem diferente do frontend, logo nao precisa verificar se a ordem já existe
      // const order = file.mobile.map((item: IDataSlider) => item.ordem);
      // if (order.includes(data.ordem)) {
      //   response(res, 422, "Ordem já existe!");
      //   return;
      // }

      file.mobile.sort((a: IDataSlider, b: IDataSlider) => a.ordem - b.ordem);
    }

    try {
      await uploadFile("json-conf", "daba139", file);

      response(res, 200, "OK", file);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  removeSlider = async (req: Request, res: Response) => {
    const { params, query } = req;

    const slider: any = await readFile("json-conf", "daba139");

    if (query.type === "desk") {
      slider.desk = slider.desk.filter(
        (item: IDataSlider) => item.id !== null && item.id !== Number(params.id),
      );
    }

    if (query.type === "mobile") {
      slider.mobile = slider.mobile.filter(
        (item: IDataSlider) => item.id !== null && item.id !== Number(params.id),
      );
    }

    try {
      await uploadFile("json-conf", "daba139", slider);

      response(res, 200, "OK", slider);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllBanner = async (req: Request, res: Response) => {
    try {
      const banner = await readFile("json-conf", "dslmib1029");
      response(res, 200, "OK", banner);
    } catch (error) {
      response(res, 502);
    }
  };

  findOneBanner = async (req: Request, res: Response) => {
    const { params, query } = req;

    if (query.page !== "home") {
      response(res, 400, "Tipo inválido!");
      return;
    }

    if (isNaN(Number(params.id))) {
      response(res, 400, "Id inválido!");
      return;
    }

    const file: any = await readFile("json-conf", "dslmib1029");
    const homePage = file.page.find((item: ITypeBanner) => item.id === "home");

    try {
      if (query.type === "desk") {
        const item = homePage.desk.find((x: any) => x.id === Number(params.id));
        if (!item) {
          response(res, 404, "Objeto não encontrado!");
          return;
        }
        response(res, 200, "OK", item);
      }

      if (query.type === "mobile") {
        const item = homePage.mobile.find((x: any) => x.id === Number(params.id));
        if (!item) {
          response(res, 404, "Objeto não encontrado!");
          return;
        }
        response(res, 200, "OK", item);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  newBanner = async (req: Request, res: Response) => {
    const { body } = req;

    const file: any = await readFile("json-conf", "dslmib1029");

    const storageUrl = await uploadImageToStorage(req?.file!);

    const homePage = file.page.find((item: ITypeBanner) => item.id === "home");

    const data = {
      id: 0,
      colsize: Number(body.colsize),
      ordem: Number(body.ordem),
      image: {
        path: storageUrl,
        title: body.title,
        alt: body.alt,
        link: body.link,
      },
    };

    if (body.page === "home" && body.type === "desk") {
      const lastId = homePage.desk.reduce((acc: number, item: IDataBanner) => {
        return item.id > acc ? item.id : acc;
      }, 0);

      data.id = lastId + 1;

      const order = homePage.desk.map((item: IDataBanner) => item.ordem);

      if (order.includes(data.ordem)) {
        response(res, 422, "Ordem já existe!");
        return;
      }

      homePage.desk.push(data);
      homePage.desk.sort((a: IDataBanner, b: IDataBanner) => a.ordem - b.ordem);
    }

    if (body.page === "home" && body.type === "mobile") {
      const lastId = homePage.mobile.reduce((acc: number, item: IDataBanner) => {
        return item.id > acc ? item.id : acc;
      }, 0);

      data.id = lastId + 1;

      const order = homePage.mobile.map((item: IDataBanner) => item.ordem);

      if (order.includes(data.ordem)) {
        response(res, 422, "Ordem já existe!");
        return;
      }

      homePage.mobile.push(data);
      homePage.mobile.sort((a: IDataBanner, b: IDataBanner) => a.ordem - b.ordem);
    }

    try {
      await uploadFile("json-conf", "dslmib1029", file);

      response(res, 201, "OK", file);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateBanner = async (req: Request, res: Response) => {
    try {
      const { body, params } = req;
      const file: any = await readFile("json-conf", "dslmib1029");
      const homePage = file.page.find((item: ITypeBanner) => item.id === "home");

      let storageUrl;

      if (req.file) {
        storageUrl = await uploadImageToStorage(req?.file!);
      }

      const data = {
        id: Number(params.id),
        colsize: Number(body.colsize),
        ordem: Number(body.ordem),
        image: {
          path: storageUrl ? storageUrl : body.path,
          title: body.title,
          alt: body.alt || "",
          link: body.link,
        },
      };

      if (body.page === "home" && body.type === "desk") {
        const itemIndex = homePage.desk.findIndex(
          (item: IDataBanner) => item.id === Number(params.id),
        );

        if (itemIndex === -1) {
          return response(res, 404, "Objeto não encontrado!");
        }

        // não vem ordem diferente do frontend, logo nao precisa verificar se a ordem já existe
        // const orderExists = homePage.desk.some((item: IDataBanner) => item.ordem === data.ordem);
        // if (orderExists) {
        //   return response(res, 422, "Ordem já existe!");
        // }

        homePage.desk[itemIndex] = data;
        homePage.desk.sort((a: IDataBanner, b: IDataBanner) => a.ordem - b.ordem);
      }

      if (body.page === "home" && body.type === "mobile") {
        const itemIndex = homePage.mobile.findIndex(
          (item: IDataBanner) => item.id === Number(params.id),
        );

        if (itemIndex === -1) {
          return response(res, 404, "Objeto não encontrado!");
        }

        // não vem ordem diferente do frontend, logo nao precisa verificar se a ordem já existe
        // const orderExists = homePage.mobile.some((item: IDataBanner) => item.ordem === data.ordem);
        // if (orderExists) {
        //   return response(res, 422, "Ordem já existe!");
        // }

        homePage.mobile[itemIndex] = data;
        homePage.mobile.sort((a: IDataBanner, b: IDataBanner) => a.ordem - b.ordem);
      }

      await uploadFile("json-conf", "dslmib1029", file);

      return response(res, 201, "OK", file);
    } catch (error) {
      console.log(error);
      return response(res, 502);
    }
  };

  removeBanner = async (req: Request, res: Response) => {
    const { params, query } = req;

    const banner: any = await readFile("json-conf", "dslmib1029");

    const homePage = banner.page.find((item: ITypeBanner) => item.id === "home");

    if (query.page === "home" && query.type === "desk") {
      homePage.desk = homePage.desk.filter(
        (item: IDataBanner) => item.id !== null && item.id !== Number(params.id),
      );
    }

    if (query.page === "home" && query.type === "mobile") {
      homePage.mobile = homePage.mobile.filter(
        (item: IDataBanner) => item.id !== null && item.id !== Number(params.id),
      );
    }

    try {
      await uploadFile("json-conf", "dslmib1029", banner);

      response(res, 200, "OK", banner);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAllBanner = async (req: Request, res: Response) => {
    const { body } = req;
    try {
      await uploadFile("json-conf", "dslmib1029", body);

      response(res, 200, "OK", body);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  updateAllSlider = async (req: Request, res: Response) => {
    const { body } = req;
    try {
      await uploadFile("json-conf", "daba139", body);

      response(res, 200, "OK", body);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default BannersSliders;
