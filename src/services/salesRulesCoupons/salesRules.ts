import axios from "axios";
import { Request, Response } from "express";
import https from "https";

import { ApiMagentoConfigs, salesRules } from "../../config/axios";
import { response } from "../../utils/response";
import { IUserToken } from "../../middlewares/checkToken";
import { RequestWall } from "../../utils/requestWall";
import { DiscountCoupons } from "../../models/descountCoupons";
import { SaleRules } from "../../models/saleRules";
import { getFutureDate } from "../../utils/date";

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const magentoLink = `${ApiMagentoConfigs.hostProd}/rest/default/V1`;
const magentoClient = axios.create({
  baseURL: magentoLink,
});

const wall = new RequestWall({
  onRequest(error) {
    // We want to retry if the error is a 401
    if (axios.isAxiosError(error)) return error.response?.status === 401;
  },

  beforeRetry: async function () {
    const { data: token } = await axios.post<string>(
      `${ApiMagentoConfigs.hostProd}/rest/all/V1/integration/admin/token`,
      {
        username: ApiMagentoConfigs.usernameProd,
        password: ApiMagentoConfigs.password,
      },
    );

    if (token) {
      magentoClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      throw new Error("Failed to refresh Magento token");
    }
  },
});

class RulesService {
  async findSaleRuleById(req: Request, res: Response) {
    try {
      const { params } = req;
      const result = await axios.get(`${salesRules}/listSaleRule/${params.ruleId}`, {
        httpsAgent,
      });

      response(res, 200, "Regra listada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async findAllActiveRules(req: Request, res: Response) {
    try {
      const result = await axios.get(`${salesRules}/listActiveRules`, {
        httpsAgent,
      });

      response(res, 200, "Regra listada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async findAllRules(req: Request, res: Response) {
    try {
      const result = await axios.get(`${salesRules}/listAllRules`, {
        httpsAgent,
      });

      response(res, 200, "Regra listada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }
  async findAllInactiveRules(req: Request, res: Response) {
    try {
      const result = await axios.get(`${salesRules}/listInactiveRules`, {
        httpsAgent,
      });

      response(res, 200, "Regra listada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async findSaleRuleByStatus(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const result = await axios.get(`${salesRules}/listRulesStatus?status=${status}`, {
        httpsAgent,
      });

      response(res, 200, "Regra listada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async new(req: Request, res: Response) {
    const { body } = req;
    const user = req.user as IUserToken;

    try {
      const result = await axios.post(`${salesRules}/createSaleRule`, body, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Regra criada com sucesso!", result.data);
    } catch (error: any) {
      console.log(error);
      response(res, 502);
    }
  }

  async update(req: Request, res: Response) {
    const { body, params } = req;
    const user = req.user as IUserToken;

    try {
      const result = await axios.put(`${salesRules}/updateSaleRule/${params.ruleId}`, body, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Regra atualizada com sucesso!", result.data);
    } catch (error: any) {
      console.log(error);
      response(res, 502);
    }
  }

  async activate(req: Request, res: Response) {
    const { params } = req;
    const user = req.user as IUserToken;

    try {
      const result = await axios.put(`${salesRules}/activateSaleRule/${params.ruleId}`, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Regra ativada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async disable(req: Request, res: Response) {
    const { params } = req;
    const user = req.user as IUserToken;

    try {
      const result = await axios.put(`${salesRules}/disableSaleRule/${params.ruleId}`, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Regra desativada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async delete(req: Request, res: Response) {
    const { params } = req;
    const user = req.user as IUserToken;

    try {
      const result = await axios.delete(`${salesRules}/deleteSaleRule/${params.ruleId}`, {
        httpsAgent,
        params: { userEmail: user.email },
      });

      response(res, 200, "Regra deletada com sucesso!", result.data);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async getActivesCoupons(req: Request, res: Response) {
    try {
      const { data: rules } = await wall.addTask(() =>
        magentoClient.get<{
          items: Rule[];
        }>("salesRules/search", {
          params: {
            [QueryFields(1).CONDITION]: "eq",
            [QueryFields(1).FIELD]: "is_active",
            [QueryFields(1).VALUE]: 1,
            ...(req.query.ruleName && {
              [QueryFields(0).CONDITION]: "like",
              [QueryFields(0).FIELD]: "name",
              [QueryFields(0).VALUE]: `%${req.query.ruleName}%`,
            }),
          },
        }),
      );

      const rulesIds = rules.items.map((rule) => rule.rule_id);

      const { data: coupons } = await wall.addTask(() =>
        magentoClient.get<{
          items: Coupon[];
          total_count: number;
        }>("coupons/search", {
          params: {
            [QueryFields(0).FIELD]: "rule_id",
            [QueryFields(0).CONDITION]: "in",
            [QueryFields(0).VALUE]: rulesIds.join(","),
            [QueryFieldsOrder.FIELD]: "created_at",
            [QueryFieldsOrder.DIRECTION]: "DESC",
            [QueryFieldsOrder.PAGE_SIZE]: req.query.pageSize ?? 10,
            [QueryFieldsOrder.CURRENT_PAGE]: req.query.currentPage ?? 1,
          },
        }),
      );

      const formatted = coupons.items.map((coupon) => {
        const rule = rules.items.find((rule) => rule.rule_id === coupon.rule_id)!;
        const discountType = Object.keys(discountTypesMap).find(
          (key) => discountTypesMap[key] === rule.simple_action,
        );

        return {
          id: coupon.coupon_id,
          label: rule.name,
          description: rule.description,
          code: coupon.code,
          active: rule.is_active,
          uses: {
            byCoupon: rule.uses_per_coupon,
            byCustomer: rule.uses_per_customer,
          },
          discount: {
            type: discountType,
            value: rule.discount_amount,
            quantity: rule.discount_qty,
          },
          condition: {
            skus:
              rule.action_condition?.conditions
                ?.filter(({ attribute_name }) => {
                  return attribute_name === "sku";
                })
                .map(({ value }) => value) ?? [],
          },
        };
      });

      const responseFormattedWithTotalCount = { items: formatted, totalCount: coupons.total_count };

      response(res, 200, "Regra listada com sucesso!", responseFormattedWithTotalCount);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async getInactivesCoupons(req: Request, res: Response) {
    try {
      const { data: rules } = await wall.addTask(() =>
        magentoClient.get<{
          items: Rule[];
        }>("salesRules/search", {
          params: {
            [QueryFields(1).CONDITION]: "eq",
            [QueryFields(1).FIELD]: "is_active",
            [QueryFields(1).VALUE]: 0,
            ...(req.query.ruleName && {
              [QueryFields(0).CONDITION]: "like",
              [QueryFields(0).FIELD]: "name",
              [QueryFields(0).VALUE]: `%${req.query.ruleName}%`,
            }),
          },
        }),
      );

      const rulesIds = rules.items.map((rule) => rule.rule_id);

      const { data: coupons } = await wall.addTask(() =>
        magentoClient.get<{ items: Coupon[]; total_count: number }>("coupons/search", {
          params: {
            [QueryFields(0).FIELD]: "rule_id",
            [QueryFields(0).CONDITION]: "in",
            [QueryFields(0).VALUE]: rulesIds.join(","),
            [QueryFieldsOrder.FIELD]: "created_at",
            [QueryFieldsOrder.DIRECTION]: "DESC",
            [QueryFieldsOrder.PAGE_SIZE]: req.query.pageSize ?? 10,
            [QueryFieldsOrder.CURRENT_PAGE]: req.query.currentPage ?? 1,
          },
        }),
      );

      const formatted = coupons.items.map((coupon) => {
        const rule = rules.items.find((rule) => rule.rule_id === coupon.rule_id)!;
        const discountType = Object.keys(discountTypesMap).find(
          (key) => discountTypesMap[key] === rule.simple_action,
        );
        return {
          id: coupon.coupon_id,
          label: rule.name,
          description: rule.description,
          code: coupon.code,
          active: rule.is_active,
          uses: {
            byCoupon: rule.uses_per_coupon,
            byCustomer: rule.uses_per_customer,
          },
          discount: {
            type: discountType,
            value: rule.discount_amount,
            quantity: rule.discount_qty,
          },
          condition: {
            skus:
              rule.action_condition?.conditions
                ?.filter(({ attribute_name }) => {
                  return attribute_name === "sku";
                })
                .map(({ value }) => value) ?? [],
          },
        };
      });

      const responseFormattedWithTotalCount = { items: formatted, totalCount: coupons.total_count };

      response(res, 200, "Regra listada com sucesso!", responseFormattedWithTotalCount);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async createCoupon(req: Request, res: Response) {
    try {
      const body = req.body as RequestBody;
      const discountType = discountTypesMap[body.discount.type] ?? "by_fixed";
      const newRule = {
        rule: {
          uses_per_coupon: body.uses.byCoupon,
          uses_per_customer: body.uses.byCustomer,
          discount_amount: body.discount.value,
          simple_action: discountType,
          action_condition: body.condition?.skus?.length
            ? {
                condition_type: `Magento\\SalesRule\\Model\\Rule\\Condition\\Product\\Combine`,
                aggregator_type: "all",
                operator: "",
                value: "1",
                conditions: body.condition.skus.map((sku) => ({
                  condition_type: `Magento\\SalesRule\\Model\\Rule\\Condition\\Product`,
                  operator: "==",
                  attribute_name: "sku",
                  value: sku.toString(),
                })),
              }
            : undefined,
          is_active: body.active,
          discount_qty: body.discount.quantity,
          name: body.label,
          description: body.description,

          // Constant Values

          is_rss: false,
          stop_rules_processing: false,
          is_advanced: true,
          sort_order: 10, // Priority of the rule
          times_used: 0,
          discount_step: 0,
          use_auto_generation: false,
          apply_to_shipping: discountType === "cart_fixed",
          website_ids: [1],
          customer_group_ids: [0, 1, 2, 3],
          coupon_type: "SPECIFIC_COUPON",
        },
      } satisfies CouponCreation;

      const { data: ruleResponse } = await wall.addTask(() =>
        magentoClient.post("salesRules", newRule),
      );

      const { data: newCoupon } = await wall.addTask(() =>
        magentoClient.post("coupons", {
          coupon: {
            code: body.code,
            rule_id: ruleResponse.rule_id,
            times_used: 0,
            is_primary: true,
          },
        }),
      );

      const dateTime = new Date().toISOString();

      Promise.all([
        SaleRules.create({
          rule_name: body.label,
          rule_id: ruleResponse.rule_id,
          coupon_type: "SPECIFIC_COUPON",
          created_at: dateTime,
          description: body.description,
          discount_amount: body.discount.value.toString(),
          discount_total_qty: body.discount.quantity.toString(),
          simples_action: discountType,
          status: body.active,
          updated_at: dateTime,
          user_email_created: (req.user as IUserToken).email,
          user_email_updated: (req.user as IUserToken).email,
          discount_sku: body.condition?.skus?.join(",") ?? "",
        }),
        DiscountCoupons.create({
          coupon_id: newCoupon.coupon_id,
          coupon_code: newCoupon.code,
          created_at: dateTime,
          updated_at: dateTime,
          coupon_sent: true,
          rule_id: newCoupon.rule_id,
          rule_name: body.label,
          expiration_date: getFutureDate(dateTime, 1),
          user_email_created: (req.user as IUserToken).email,
          user_email_updated: (req.user as IUserToken).email,
        }),
      ]).catch((error) => console.log(error));

      res.json([ruleResponse, newCoupon]);
    } catch (error) {
      console.log(error);
      response(res, 502);
    }
  }

  async editCoupon(req: Request, res: Response) {
    try {
      const { couponId } = req.params;
      const { data: coupon } = await magentoClient.get<Coupon>(`coupons/${couponId}`);
      const { data: rule } = await magentoClient.get<Rule>(`salesRules/${coupon.rule_id}`);
      const { code, discount, label, description, condition, uses, active } = req.body;
      const { skus } = condition;
      const { byCustomer, byCoupon } = uses;
      const { value: discountAmount, type, quantity } = discount;
      const discountType = discountTypesMap[type] ?? "by_fixed";
      const existingConditions = rule.action_condition?.conditions ?? [];

      // Remove all sku attributes and replace them
      const newConditions = [
        ...existingConditions.filter((c) => c.attribute_name !== "sku"),
        ...(skus?.length
          ? skus.map((sku: string) => ({
              condition_type: `Magento\\SalesRule\\Model\\Rule\\Condition\\Product`,
              operator: "==",
              attribute_name: "sku",
              value: sku ?? "",
            }))
          : []),
      ];

      const [{ data: newCoupon }, { data: newRule }] = await Promise.all([
        wall.addTask(() =>
          magentoClient.put(`coupons/${couponId}`, {
            coupon: {
              ...coupon,
              code: code,
            },
          }),
        ),
        wall.addTask(() =>
          magentoClient.put(`salesRules/${rule.rule_id}`, {
            rule: {
              ...rule,
              action_condition: {
                ...(rule.action_condition ?? {}),
                conditions: newConditions,
              },
              name: label,
              description: description,
              discount_amount: discountAmount,
              simple_action: discountType,
              uses_per_customer: byCustomer,
              uses_per_coupon: byCoupon,
              discount_qty: quantity,
              apply_to_shipping: discountType === "cart_fixed",
              is_active: active,
            },
          }),
        ),
      ]);

      Promise.all([
        (() => {
          const oldSkus = existingConditions
            .filter((condition) => condition.attribute_name === "sku")
            .map((condition) => condition.value);
          const areSkusEqual = skus.every((sku: string) => oldSkus.includes(sku));
          return SaleRules.update(
            {
              rule_name: label,
              discount_total_qty: quantity,
              simples_action: discountType,

              discount_amount:
                rule.discount_amount === discountAmount
                  ? `${rule.discount_amount}`
                  : `${rule.discount_amount} -> ${discountAmount}`,
              discount_sku: areSkusEqual
                ? oldSkus.join(",")
                : `${oldSkus.join(",")} -> ${skus.join(",")}`,

              status: active,
              updated_at: new Date().toISOString(),
              user_email_updated: (req.user as IUserToken).email,
              description: description,
            },
            { where: { rule_id: rule.rule_id } },
          );
        })(),

        DiscountCoupons.update(
          {
            rule_name: label,
            coupon_code: code,
            updated_at: new Date().toISOString(),
            user_email_updated: (req.user as IUserToken).email,
          },
          { where: { coupon_id: couponId } },
        ),
      ]).catch((error) => console.log(error));

      res.json([newCoupon, newRule]);
    } catch (error) {
      response(res, 502);
      console.log(error);
    }
  }

  async deleteCoupon(req: Request, res: Response) {
    try {
      const { couponId } = req.params;
      await wall.addTask(() =>
        magentoClient.post(`coupons/deleteByIds`, {
          ids: [couponId],
        }),
      );
      const dateTime = new Date().toISOString();

      DiscountCoupons.update(
        {
          deleted_at: dateTime,
          updated_at: dateTime,
          user_email_deleted: (req.user as IUserToken).email,
        },
        { where: { coupon_id: couponId } },
      ).catch((error) => console.log(error));

      res.json({ message: "Coupon deleted" });
    } catch (error) {
      response(res, 502);
      console.log(error);
    }
  }

  async getRuleByName(name: string) {
    const data = await wall.addTask(() =>
      magentoClient.get("salesRules/search", {
        params: {
          [QueryFields(0).CONDITION]: "eq",
          [QueryFields(0).FIELD]: "name",
          [QueryFields(0).VALUE]: name,
        },
      }),
    );

    return data;
  }
}

const discountTypesMap: Record<string, string> = {
  fixed: "by_fixed",
  percentage: "by_percent",
  cart_fixed: "cart_fixed",
};

const QueryFields = (index: number) => ({
  CONDITION: `searchCriteria[filterGroups][${index}][filters][0][conditionType]`,
  FIELD: `searchCriteria[filterGroups][${index}][filters][0][field]`,
  VALUE: `searchCriteria[filterGroups][${index}][filters][0][value]`,
});

const QueryFieldsOrder = {
  FIELD: "searchCriteria[sortOrders][0][field]",
  DIRECTION: "searchCriteria[sortOrders][0][direction]",
  PAGE_SIZE: "searchCriteria[pageSize]",
  CURRENT_PAGE: "searchCriteria[currentPage]",
};

export default RulesService;

interface CouponCreation {
  rule: {
    website_ids: [1];
    customer_group_ids: [0, 1, 2, 3];
    is_rss: false;
    // ISO

    uses_per_customer: number;
    is_active: boolean;
    stop_rules_processing: false;
    is_advanced: true;
    sort_order: number;

    discount_amount: number;
    discount_step: 0;
    apply_to_shipping: boolean;
    times_used: 0;
    /** Force coupon type */
    coupon_type: "SPECIFIC_COUPON";
    /** Enable automatic coupon name generation. */
    use_auto_generation: boolean;

    /** Determine how many times the coupon can be used. Set 0 for unlimited uses */
    uses_per_coupon: number;

    action_condition?: {
      operator: string;
      value: string;
      condition_type: string;

      conditions?: Condition[];
      extesion_attributes?: {};
      attribute_name?: string;
      aggregator_type?: string;
    };

    condition?: {
      condition_type: string;
      operator: string;
      value: string;

      aggregator_type?: string;
      attribute_name?: string;
      conditions?: Condition[];
      extension_attributes?: {};
    };
    simple_action?: string;
    simple_free_shipping?: "0";
    rule_id?: number;
    /** The start date when the coupon is active */
    from_date?: string;
    /** The end date when the coupon is active  */
    to_date?: string;
    discount_qty?: number;
    name?: string;
    description?: string;
    product_ids?: number[];
  };
}

interface Condition {
  operator: string;
  value: string;
  condition_type: string;
  attribute_name: string;
}

interface Coupon {
  coupon_id: number;
  rule_id: number;
  code: string;
  usage_limit: number;
  usage_per_customer: number;
  times_used: number;
  is_primary: boolean;
  created_at: string;
  type: number;
}

interface Rule {
  rule_id: number;
  name: string;
  description: string;
  is_active: number;
  action_condition: {
    conditions: Condition[];
  };
  condition: {
    conditions: Condition[];
  };
  discount_amount: number;
  simple_action: string;
  uses_per_customer: number;
  uses_per_coupon: number;
  discount_qty: number;
}

interface RequestBody {
  label: string;
  description: string;
  code: string;
  uses: {
    byCustomer: number;
    byCoupon: number;
  };
  active: boolean;
  discount: {
    quantity: number;
    value: number;
    type: "fixed" | "percentage" | "cart_fixed";
  };
  condition: {
    skus: number[];
  };
}
