import { Request, Response } from "express";
import { response } from "../utils/response";
import { TaxInstallment } from "../models/taxInstallment";
import { ITaxInstallment } from "../interfaces/taxInstallment";
import { discountedInstallment } from "../config/axios";
import https from "https";
import axios from "axios";

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

export class TaxInstallmentService {
  updateMany = async (req: Request, res: Response) => {
    const { body } = req;
    try {
      const updatePromises = body.taxInstallments.map(async (taxInstallment: ITaxInstallment) => {
        await TaxInstallment.update(
          { taxa: taxInstallment.taxa },
          { where: { numero_parcela: taxInstallment.numero_parcela } },
        );
      });

      await Promise.all(updatePromises);

      const data = body.taxInstallments.map((taxInstallment: ITaxInstallment) => ({
        numero_parcela: taxInstallment.numero_parcela,
        taxa: taxInstallment.taxa,
      }));

      const result = await axios.put(`${discountedInstallment}/DiscountedCreditCard`, data, {
        httpsAgent,
      });

      if (result.status === 200) {
        response(res, 200, "Lista de TaxaParcelas atualizada com sucesso!");
      } else {
        response(res, 502, "Erro ao atualizar a API externa.");
      }
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  create = async (req: Request, res: Response) => {
    const { body } = req;

    try {
      const taxInstallment = await TaxInstallment.create({
        taxa: body.taxa,
        numero_parcela: body.numero_parcela,
      });

      response(res, 200, "Taxa de parcela criada com sucesso!", taxInstallment);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const taxInstallments = await TaxInstallment.findAll({});
      response(res, 200, "OK", taxInstallments);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
  remove = async (req: Request, res: Response) => {
    const { params } = req;
    try {
      await TaxInstallment.destroy({ where: { id: params.id } });
      response(res, 200, "TaxaParcela excluída com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  update = async (req: Request, res: Response) => {
    const { body, params } = req;

    try {
      await TaxInstallment.update(
        { taxa: body.taxa, numero_parcela: body.numero_parcela },
        {
          where: { id: params.id },
        },
      );
      response(res, 200, "Indicação de SKU atualizada com sucesso!");
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}
