import { query, Request, Response } from "express";
import { OrdersTracking } from "../../models/orderTracking";
import { col, FindAttributeOptions, fn, literal, Order, WhereAttributeHashValue } from "sequelize";
import { Op } from "sequelize";
import { response } from "../../utils/response";
import { holidays } from "./holidays";
import {
  addBusinessDays,
  format,
  eachDayOfInterval,
  isWeekend,
  isPast,
  subMonths,
  intervalToDuration,
} from "date-fns";

class OrderTracking {
  #getCarrierArray = (status: string[]) => {
    if (!Array.isArray(status) || status.length === 0) return null;
    return status;
  };

  #getStatusArray = (status: string[]) => {
    if (!Array.isArray(status) || status.length === 0) return null;
    return status.map((s) => this.#statusList[s]);
  };

  #isAlmostDelayed = (status: string | null, deliveryDate: string | null) => {
    if (!deliveryDate || !status) return false;
    const getStatusKey = Object.keys(this.#statusList).find(
      (key) => this.#statusList[key] === status,
    );
    if (!getStatusKey || parseInt(getStatusKey) > 4) return false;

    const estimatedDate = new Date(deliveryDate);
    const pasou = isPast(estimatedDate);
    if (pasou) return true;

    const daysUntilDelivery = intervalToDuration({
      start: estimatedDate,
      end: new Date(),
    }).days;

    const delayed = Number(daysUntilDelivery) < 3;

    return !isNaN(Number(daysUntilDelivery)) ? delayed : false;
  };

  findAll = async (req: Request, res: Response) => {
    try {
      const getQuery = createQueryParser(req.query);
      const getArray = createArrayParser(req.query);

      const page = getQuery("page") ? Number(getQuery("page")) : 1;
      const limit = getQuery("size") ? Number(getQuery("size")) : 5;

      const carrierQuery = this.#getCarrierArray(getArray("carrier"));
      const statusQuery = this.#getStatusArray(getArray("status"));
      const cpfQuery = getQuery("cpf");
      const nfQuery = getQuery("nf-code");
      const orderQuery = getQuery("order-number");
      const startDate = getQuery("start-date") ?? undefined;
      const endDate = getQuery("end-date") ?? undefined;

      const sortBy = getQuery("sort") ?? "data_criado";
      const order = getQuery("order") === "desc" ? "DESC" : "ASC";

      const onlyNf = getQuery("only-with-nf") === "false" ? false : true;

      const data = await OrdersTracking.findAndCountAll({
        attributes: this.#columns,
        where: {
          ...(Array.isArray(statusQuery) && { status_entrega: { [Op.in]: statusQuery } }),
          ...(Array.isArray(carrierQuery) && { transportadora: { [Op.in]: carrierQuery } }),
          ...(cpfQuery && { cliente_cpf: cpfQuery }),
          ...(nfQuery && { nota_fiscal: nfQuery }),
          ...(orderQuery && { pedido: orderQuery }),
          ...(Boolean(startDate || endDate) && {
            data_criado: createDateRange(startDate, endDate),
          }),
          ...(onlyNf && {
            /// Search for orders with a existing NF (avoiding null and "0")
            [Op.and]: [{ nota_fiscal: { [Op.not]: null } }, { nota_fiscal: { [Op.ne]: "0" } }],
          }),
        },
        order: this.#createSortBy(sortBy, order),
        limit: limit,
        offset: (page - 1) * limit,
      });

      const mappedData = data.rows.map(this.#mapValues.bind(this));

      response(res, 200, "OK", {
        since: [startDate, endDate],
        results: mappedData,
        total: data.count,
        limit: limit,
        actualPage: page,
        totalPages: Math.ceil(data.count / limit),
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  };

  async findBackorders(req: Request, res: Response) {
    try {
      const requestDate = new Date();
      const getArray = createArrayParser(req.query);
      const getQuery = createQueryParser(req.query);
      const statusQuery = this.#getStatusArray(getArray("status"));
      const carrierQuery = this.#getCarrierArray(getArray("carrier"));
      const cpfQuery = getQuery("cpf");
      const nfQuery = getQuery("nf-code");
      const orderQuery = getQuery("order-number");

      const data = await OrdersTracking.findAll({
        attributes: [
          "pedido",
          "nota_fiscal",
          "data_embarcado",
          "transportadora",
          "origem",
          "dias_pra_entrega",
          "previsao_entrega",
          "cidade",
          "uf",
          "chave_nf",
          "status_entrega",
          "nome",
        ],
        where: {
          ...(Array.isArray(statusQuery)
            ? { status_entrega: { [Op.in]: statusQuery, [Op.ne]: "Entregue" } }
            : {
                status_entrega: {
                  [Op.ne]: "Entregue",
                },
              }),

          ...(Array.isArray(carrierQuery) && { transportadora: { [Op.in]: carrierQuery } }),
          ...(cpfQuery && { cliente_cpf: cpfQuery }),
          ...(nfQuery && { nota_fiscal: nfQuery }),
          ...(orderQuery && { pedido: orderQuery }),
          // transportadora: {
          //   // Adicionado porque nunca tem pedidos entregue por Gubel. Erro de integração
          //   // mas agora tem kk
          //   [Op.ne]: "Gubel Transportes",
          // },
          // Only orders created in the last month
          data_criado: createDateRange(subMonths(requestDate, 2)),
          cancelado: {
            [Op.ne]: "S",
          },
        },
      });

      // Due high data amount
      // Using imperative approach to make the algorithm faster
      const filteredData = [];
      for (let i = 0; i < data.length; i++) {
        const order = data[i];

        // Avoid orders without delivery date
        if (!order.dias_pra_entrega && !order.previsao_entrega) {
          continue;
        }

        // On website orders, we can only rely on the delivery days.
        if (order.origem === "WebSite") {
          if (!order.data_embarcado) continue;

          const deliveryDays = this.#calculateShippingDays({
            sourceName: order.origem,
            startDate: order.data_criado,
            estimatedDeliveryDays: order.dias_pra_entrega,
            estimatedDate: order.previsao_entrega,
          });

          if (!deliveryDays.estimatedDate) continue;

          const estimatedDate = new Date(deliveryDays.estimatedDate);

          // If the estimated date is in the past
          if (isPast(estimatedDate)) {
            filteredData.push({
              orderId: order.pedido.toString(),
              nf: order.nota_fiscal,
              embarkedDate: order.data_embarcado,
              nfKey: order.chave_nf?.trim(),
              estimatedDate: deliveryDays.estimatedDate,
              carrier: order.transportadora,
              delayedDays: intervalToDuration({ start: estimatedDate, end: requestDate }).days ?? 0,
              client: order.nome,
              status: order.status_entrega,
              shipping: {
                city: order.cidade?.trim(),
                state: order.uf,
              },
            });
          }
        } else {
          if (!order.previsao_entrega) continue;
          const estimatedDate = new Date(order.previsao_entrega);
          if (isPast(estimatedDate)) {
            filteredData.push({
              orderId: order.pedido.toString(),
              nf: order.nota_fiscal,
              embarkedDate: order.data_embarcado,
              nfKey: order.chave_nf?.trim(),
              estimatedDate: estimatedDate.toISOString(),
              carrier: order.transportadora,
              delayedDays: intervalToDuration({ start: estimatedDate, end: requestDate }).days ?? 0,
              status: order.status_entrega,
              client: order.nome,
              shipping: {
                city: order.cidade?.trim(),
                state: order.uf,
              },
            });
          }
        }
      }

      filteredData.sort((a, b) => {
        return b.delayedDays - a.delayedDays;
      });

      response(res, 200, "OK", {
        entries: filteredData.length,
        orders: filteredData,
      });
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  #calculateShippingDays = ({
    sourceName,
    startDate,
    estimatedDeliveryDays,
    estimatedDate,
  }: {
    sourceName: string | null;
    estimatedDeliveryDays: number | null;
    estimatedDate: string | null;
    startDate: string | null;
  }) => {
    if (sourceName === "WebSite") {
      if (!startDate || !estimatedDeliveryDays) {
        return {
          estimatedDeliveryDays: estimatedDeliveryDays,
          estimatedDate: estimatedDate,
        };
      }
      // First, we need to calculate the first estimated delivery date based on the start date and estimated delivery days
      const startingDate = new Date(startDate);
      const firstEstimatedDeliveryDate = addBusinessDays(startingDate, estimatedDeliveryDays);

      // Then, we need to calculate the number of holidays between the start date and the first estimated delivery date
      const holidaysCount = eachDayOfInterval({
        start: startingDate,
        end: firstEstimatedDeliveryDate,
      }).reduce((count, day) => {
        if (isWeekend(day)) return count;
        return holidays.has(format(day, "dd/MM/yyyy")) ? count : count;
      }, 0);

      // for each holiday on bussiness days, we need to add one business day
      let newDate = addBusinessDays(firstEstimatedDeliveryDate, holidaysCount);
      // check again if the day is a holiday.
      while (holidays.has(format(newDate, "dd/MM/yyyy"))) {
        newDate = addBusinessDays(newDate, 1);
      }

      return {
        estimatedDeliveryDays: estimatedDeliveryDays || null,
        estimatedDate: newDate.toISOString(),
      };
    } else {
      return {
        // Tudo que não seja website, usa o prazo de entrega
        estimatedDeliveryDays: null,
        estimatedDate: estimatedDate,
      };
    }
  };

  #mapValues(rawOrder: OrdersTracking) {
    const order = rawOrder.toJSON();
    const deliveryDays = this.#calculateShippingDays({
      sourceName: order.origem,
      startDate: order.data_criado,
      estimatedDeliveryDays: order.dias_pra_entrega,
      estimatedDate: order.previsao_entrega,
    });

    return {
      orderId: order.pedido,
      status: order.status_entrega,
      nf: {
        code: order.nota_fiscal === "0" ? null : order.nota_fiscal,
        // Sometimes, is only a big empty string
        key: order.chave_nf?.trim() ?? null,
        iat: order.data_nf,
        exp: order.data_embarcado,
      },
      carrier: {
        name: order.transportadora,
      },
      source: {
        name: order.origem,
      },

      customer: {
        name: order.nome,
        cpf: order.cliente_cpf,
        address: {
          uf: order.uf,
          cep: order.cep?.trim(),
          city: order.cidade,
        },
      },

      shipping: {
        cost: order.frete,
        ...deliveryDays,
      },
      createdAt: order.data_criado,
      isDelayed: this.#isAlmostDelayed(order.status_entrega, deliveryDays.estimatedDate),
    };
  }

  // This doesn't handle ALL columns, just the ones that are needed.
  // TODO: handle all
  #createSortBy = (sortBy: string, order: string): Order => {
    if (this.#nonSensitiveColumns.includes(sortBy)) {
      return [[fn("LOWER", fn("TRIM", col(sortBy))), order]];
    } else if (sortBy === "dias_pra_entrega") {
      // Atualmente, o banco de dados salva prazo de entrega e data de entrega,
      // mas não sempre é certa a informação. Quando a compra é pelo
      // website, dias pra entrega é apenas usado. Quando é outro marketplace,
      // esse valor é ignorado e o prazo de entrega é usado.

      return [
        [literal("CASE WHEN previsao_entrega IS NULL THEN dias_pra_entrega ELSE NULL END"), order],
      ];
    } else {
      return [[sortBy, order]];
    }
  };

  // Status list based on StatusEnum.Texto() in Microservice ConRastreadorStatusSol - StatusPedido.cs
  // Numbers came from frontend, it's just for mapping, might be divergent from backend
  #statusList: Record<string, string> = {
    "01": "Em Separação",
    "02": "Com a Transportadora",
    "03": "Em Trânsito",
    "04": "Saiu para Entrega",
    "05": "Entregue",
    // Mapped issues status codes appear in filters as the following numbers:
    "06": "Com Ocorrencia",
    "07": "Pedido para Devolucao",
    "08": "Retornando",
    "09": "Devolvido",
    "10": "Cancelado",
  };

  #columns: FindAttributeOptions = [
    "pedido",
    "status_entrega",
    "nota_fiscal",
    "chave_nf",
    "data_nf",
    "data_embarcado",
    "transportadora",
    "origem",
    "nome",
    "cliente_cpf",
    "uf",
    "cep",
    "cidade",
    "frete",
    "data_criado",
    "dias_pra_entrega",
    "previsao_entrega",
  ];

  #nonSensitiveColumns = ["nome", "cidade"];
}

const createQueryParser = (query: Request["query"]) => {
  return (key: string): string | null => {
    const value = query[key];
    if (Array.isArray(value)) {
      const element = value.at(0);
      if (!element) return null;
      return typeof element === "string" ? element : null;
    }
    return value && typeof value === "string" ? value : null;
  };
};

const createArrayParser = (query: Request["query"]) => {
  return (key: string): string[] => {
    const value = query[key];
    if (!Array.isArray(value)) return [];
    const element = value.at(0);
    if (typeof element === "string" && element.length === 0) return [];
    return value as Array<string>;
  };
};

const createDateRange = (
  start?: number | string | Date,
  end?: number | string | Date,
): WhereAttributeHashValue<string> => {
  if (start && end) {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    endDateObj.setDate(endDateObj.getDate() + 1);

    return {
      [Op.between]: [
        startDateObj.toISOString().split("T")[0],
        endDateObj.toISOString().split("T")[0],
      ],
    };
  }

  if (start) {
    const startDateObj = new Date(start);
    return {
      [Op.gte]: startDateObj.toISOString().split("T")[0],
    };
  }

  if (end) {
    const endDateObj = new Date(end);
    endDateObj.setDate(endDateObj.getDate() + 1);

    return {
      [Op.lt]: endDateObj.toISOString().split("T")[0],
    };
  }

  return {};
};

export default OrderTracking;
