import { Request, Response } from "express";

import Service from "../Service";
import { response } from "../../utils/response";
import { Order } from "../../models/product/order";
import { Op, where } from "sequelize";
import { OrderItem } from "../../models/product/orderItem";
import { Customer } from "../../models/customer";
import { Carrier } from "../../models/carrier";
import { Address } from "./../../models/address";

class Orders {
  public order = Service(Order);
  constructor() {
    this.order;
  }

  findAll = async (req: Request, res: Response) => {
    const { query } = req;
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 20;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const formattedThreeDaysAgo = threeDaysAgo.toISOString().split("T")[0];
    const formattedToday = new Date().toISOString().split("T")[0];

    try {
      let whereOrder: {
        Numero?: string;
        OS?: string;
        NotaFiscal?: string | { [Op.not]: null };
        DataCriado?: { [Op.between]: [string, string] };
        DataImportado?: string;
        Ativo?: boolean;
        Enviado?: boolean;
        Entregue?: boolean;
        idCanal?: number;
        TipoPagamento?: string | { [Op.notIn]: string[] } | { [Op.in]: string[] };
      } = {
        DataCriado: {
          [Op.between]: [formattedThreeDaysAgo, formattedToday],
        },
      };

      let whereCustomer: {
        CPF?: string;
        Nome?: { [Op.like]: string };
        Email?: { [Op.like]: string };
      } = {};

      let whereCarrier: {
        idTransportadora?: string;
      } = {};

      let whereOrderItem: {
        sku?: string;
      } = {};

      if (query.orderNumber) {
        whereOrder = {
          ...whereOrder,
          Numero: query.orderNumber.toString(),
        };
      }

      if (query.invoice) {
        whereOrder = {
          ...whereOrder,
          NotaFiscal: query.invoice.toString(),
        };
      }

      if (query.sinceStart) {
        const startSince = new Date(query.sinceStart.toString());
        const endSince = query.sinceEnd ? new Date(query.sinceEnd.toString()) : new Date();
        if (!isNaN(startSince.getTime()) && !isNaN(endSince.getTime())) {
          const formattedStartSince = startSince.toISOString().split("T")[0];
          const formattedEndSince = endSince.toISOString().split("T")[0] + " 23:59:59";
          whereOrder = {
            ...whereOrder,
            DataCriado: {
              [Op.between]: [formattedStartSince, formattedEndSince],
            },
          };
        } else {
          response(res, 422, "Data de consulta no formato inválido", query.since);
        }
      }

      if (query.status) {
        switch (query.status) {
          case "01":
            if (query.invoice) {
              whereOrder = {
                ...whereOrder,
                Enviado: false,
              };
            } else {
              whereOrder = {
                ...whereOrder,
                NotaFiscal: {
                  [Op.not]: null,
                },
                Enviado: false,
              };
            }
            break;
          case "02":
            whereOrder = {
              ...whereOrder,
              Ativo: true,
            };
            break;
          case "03":
            whereOrder = {
              ...whereOrder,
              Enviado: true,
            };
            break;
          case "04":
            whereOrder = {
              ...whereOrder,
              Enviado: true,
            };
            break;
          case "05":
            whereOrder = {
              ...whereOrder,
              Entregue: true,
            };
            break;
          default:
            break;
        }
      }

      if (query.cpf) {
        whereCustomer = {
          CPF: query.cpf.toString().trim(),
        };
      }

      if (query.carrier) {
        whereCarrier = {
          idTransportadora: query.carrier.toString(),
        };
      }

      if (query.sku) {
        whereOrderItem = {
          sku: query.sku.toString(),
        };
      }

      if (query.canal) {
        whereOrder = {
          ...whereOrder,
          idCanal: Number(query.canal),
        };
      }

      if (query.typePayment) {
        if (query.typePayment === "CC") {
          whereOrder = {
            ...whereOrder,
            TipoPagamento: {
              [Op.notIn]: ["Pix", "boleto bancário", "boletobancario_santander"],
            },
          };
        }

        if (query.typePayment === "Pix") {
          whereOrder = {
            ...whereOrder,
            TipoPagamento: "Pix",
          };
        }

        if (query.typePayment === "Boleto") {
          whereOrder = {
            ...whereOrder,
            TipoPagamento: {
              [Op.in]: ["boleto bancário", "boletobancario_santander"],
            },
          };
        }
      }

      if (query.clientName) {
        whereCustomer = {
          ...whereCustomer,
          Nome: {
            [Op.like]: `%${query.clientName}%`,
          },
        };
      }

      if (query.clientEmail) {
        whereCustomer = {
          ...whereCustomer,
          Email: {
            [Op.like]: `%${query.clientEmail}%`,
          },
        };
      }

      const orders = await Order.findAndCountAll({
        where: whereOrder,
        include: [
          {
            model: OrderItem,
            as: "ItemPedido",
            where: whereOrderItem,
          },
          { model: Customer, as: "Cliente", where: whereCustomer },
          { model: Carrier, as: "Transportadora", where: whereCarrier },
          {
            model: Address,
            as: "Endereco",
            where: { idEndereco: { [Op.not]: null } },
          },
        ],
        attributes: {
          exclude: ["idTraAnterior", "idExterno"],
        },
        order: [["DataCriado", "DESC"]],
        distinct: true,
        limit: size,
        offset: (page - 1) * size,
      });

      response(res, 201, "OK", {
        since: [
          query?.sinceStart ? query.sinceStart : formattedThreeDaysAgo,
          query.sinceEnd ? query.sinceEnd : formattedToday,
        ],
        orders: orders.rows,
        total: orders.count,
        limit: size,
        actualPage: page,
        totalPages: Math.ceil(orders.count / size),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  findAllByCpf = async (req: Request, res: Response) => {
    const { cpf } = req.params;
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            as: "ItemPedido",
          },
          { model: Customer, as: "Cliente", where: { CPF: cpf } },
          { model: Carrier, as: "Transportadora" },
        ],
        attributes: {
          exclude: ["idTraAnterior", "idExterno"],
        },
      });

      response(res, 201, "OK", orders);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };
}

export default Orders;
