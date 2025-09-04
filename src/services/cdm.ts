import axios from "axios";
import { Request, Response } from "express";
import https from "https";

import { cdmProd } from "../config/axios";
import { response } from "../utils/response";
import { IFile } from "../interfaces/file";
import { IUser } from "../models/user/user";
import { IUserToken } from "../middlewares/checkToken";

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

class Cdm {
  findAll = async (req: Request, res: Response) => {
    try {
      const result = await axios.get(`${cdmProd}/pdrlist`, {
        httpsAgent,
      });

      response(res, 200, "OK", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllWithExtraInfo = async (req: Request, res: Response) => {
    try {
      const { cep, name, raio } = req.query;
      const result = await axios.get(`${cdmProd}/cdmfull`, {
        params: {
          ...(cep && { cep }),
          ...(name && { name }),
          ...(raio && { raio }),
        },
        httpsAgent,
      });

      response(res, 200, "OK", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllByDistance = async (req: Request, res: Response) => {
    const { query } = req;

    try {
      if (query.cep && query.raio) {
        const result = await axios.get(`${cdmProd}/pdr?cep=${query.cep}&raio=${query.raio}`, {
          httpsAgent,
        });

        response(res, 200, "OK", result.data);
      }

      if (query.cep && !query.raio) {
        const result = await axios.get(`${cdmProd}/pdr?cep=${query.cep}`, {
          httpsAgent,
        });

        response(res, 200, "OK", result.data);
      }

      if (!query.cep && !query.raio) {
        const result = await axios.get(`${cdmProd}/pdrlist`, {
          httpsAgent,
        });

        response(res, 200, "OK", result.data);
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOne = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const result = await axios.get(`${cdmProd}/cdm/${params.id}`, {
        httpsAgent,
      });

      if (!result) {
        response(res, 404, "Centro de Montagem não encontrado!");
        return;
      }

      response(res, 200, "OK", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findOneWithExtraInfo = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const result = await axios.get(`${cdmProd}/cdmfull/${params.id}`, {
        httpsAgent,
      });

      if (!result) {
        response(res, 404, "Centro de Montagem não encontrado!");
        return;
      }

      response(res, 200, "OK", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findInfoById = async (req: Request, res: Response) => {
    const { params } = req;

    try {
      const result = await axios.get(`${cdmProd}/info/${params.id}`);

      response(res, 200, "OK", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  new = async (req: Request, res: Response) => {
    const { body } = req;
    //@ts-ignore
    const user = req.user as IUserToken;
    if (req.file) {
      const { storageUrl } = req.file as IFile;
      try {
        body.imagem = storageUrl;
        const result = await axios.post(
          `${cdmProd}/cdm?email=${user.email}`,
          { ...body, offers: Boolean(body.offers), mont_gratis: Boolean(body.mont_gratis) },
          { httpsAgent },
        );
        if (result) {
          return response(res, 201, "Centro de montagem cadastrado com sucesso!", body.imagem);
        }
      } catch (error: any) {
        return console.log(error.response);
      }
    } else {
      try {
        const result = await axios.post(
          `${cdmProd}/cdm?email=${user.email}`,
          { ...body, offers: Boolean(body.offers), mont_gratis: Boolean(body.mont_gratis) },
          { httpsAgent },
        );
        if (result) {
          return response(res, 201, "Centro de montagem cadastrado com sucesso!", body.imagem);
        }
      } catch (error) {
        console.log(error);
        return console.log(error);
      }
    }
  };

  update = async (req: Request, res: Response) => {
    const { body, params } = req;
    //@ts-ignore
    const user = req.user as IUserToken;

    if (req.file) {
      const { storageUrl } = req.file as IFile;
      body.imagem = storageUrl;
      try {
        const result = await axios.put(
          `${cdmProd}/cdm/${params.id}?email=${user.email}`,
          { ...body, offers: Boolean(body.offers), mont_gratis: Boolean(body.mont_gratis) },
          {
            httpsAgent,
          },
        );
        response(res, 200, "Centro de montagem atualizado com sucesso!", result.data);
      } catch (error) {
        console.log(error);
        response(res, 502);
      }
    } else {
      try {
        const result = await axios.put(
          `${cdmProd}/cdm/${params.id}?email=${user.email}`,
          { ...body, offers: Boolean(body.offers), mont_gratis: Boolean(body.mont_gratis) },
          {
            httpsAgent,
          },
        );
        response(res, 200, "Centro de montagem atualizado com sucesso!", result.data);
      } catch (error: any) {
        console.log(error.response.data);
        response(res, 502);
      }
    }
  };

  validate = async (req: Request, res: Response) => {
    const { params, body } = req;
    //@ts-ignore
    const user = req.user as IUserToken;

    try {
      const result = await axios.put(`${cdmProd}/validate/${params.id}?email=${user.email}`, {
        httpsAgent,
      });

      response(res, 200, "Centro de Montagem validado com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  invalidate = async (req: Request, res: Response) => {
    const { params, body } = req;
    //@ts-ignore
    const user = req.user as IUserToken;

    try {
      const result = await axios.put(`${cdmProd}/invalidate/${params.id}?email=${user.email}`, {
        httpsAgent,
      });

      response(res, 200, "Centro de Montagem invalidado com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Cdm;
