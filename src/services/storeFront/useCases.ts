import { apiMagento } from "../../config/axios";
import {
  IProductMagento,
  IStoreFrontJsonGooglBucket,
  IStoreFrontRequest,
} from "../../interfaces/magento";
import { ProductDetailsFragment } from "../../interfaces/productFullDetailFragmentMagento";
import { readFile, uploadFile } from "../../utils/bucketFile";

// const NAME_ATTRIBUTE_STOREFRONT = process.env.API_MAGENTO_NAME_ATTRIBUTE_STOREFRONT || "";

export const getProduct = async (sku: string) => {
  try {
    const data = await getAllSkusInStoreFront();
    const productFind = data?.skus?.find((item) => item.sku === sku);
    if (!productFind) {
      return null;
    }
    return productFind;
  } catch (error) {
    console.log(error);
  }
};

export const getAllProducts = async () => {
  const data = await getAllSkusInStoreFront();

  if (data?.skus === undefined || data?.skus.length === 0) {
    return [];
  }

  try {
    const query = `
     query GetStoreFront {
        products(
            filter: { sku: { in: ${JSON.stringify(data.skus?.map((sku) => sku.sku))} } }
        ) {
             items {
                uid
                sku
                name
                url_key
                small_image {
                    url
                }
                image {
                    url
                }
                ...ProductDetailsFragment
            }
            filters {
                filter_items {
                    label
                    value_string
                    ... on SwatchLayerFilterItemInterface {
                        swatch_data {
                            value
                            type
                        }
                    }
                }
            }
        }
    }
    ${ProductDetailsFragment}
    `;

    const { data: getAllProductsReturn } = await apiMagento.post<{
      data: {
        products: {
          items: IProductMagento[];
        };
      };
    }>("/graphql", { query });

    return sortBySkuOrder(getAllProductsReturn.data.products.items, data.skus);
  } catch (error) {
    console.log(error);
  }
};

export const getAllSkusInStoreFront = async () => {
  try {
    const data = (await readFile("json-conf", "vitrine-de-pneus")) as IStoreFrontJsonGooglBucket;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateProductsToStoreFront = async ({
  skus,
}: {
  skus: { sku: string; order: number }[];
}) => {
  try {
    await uploadFile("json-conf", "vitrine-de-pneus", { skus: skus });
  } catch (error) {
    console.log(error);
  }
};

export const deleteAllFromStoreFront = async () => {
  try {
    await uploadFile("json-conf", "vitrine-de-pneus", { skus: [] });
  } catch (error) {
    console.log(error);
  }
};

export const sortBySkuOrder = (
  targetArray: IProductMagento[],
  sortReference: IStoreFrontRequest[],
) => {
  if (!targetArray || !sortReference) {
    return [];
  }

  const orderMap = new Map<string, number>();

  for (const ref of sortReference) {
    orderMap.set(ref.sku, ref.order);
  }

  return targetArray.sort((a, b) => {
    const orderA = orderMap.get(a.sku) ?? Infinity;
    const orderB = orderMap.get(b.sku) ?? Infinity;
    return orderA - orderB;
  });
};

// export const getAllProducts = async () => {
//   try {
//     const { data: response } = await apiMagento.get("rest/default/V1/products", {
//       params: {
//         "searchCriteria[filter_groups][0][filters][0][field]": "tire_showcase",
//         "searchCriteria[filter_groups][0][filters][0][value]": "1",
//         "searchCriteria[filter_groups][0][filters][0][condition_type]": "eq",
//         "searchCriteria[sortOrders][0][field]": "tire_showcase_order",
//         "searchCriteria[sortOrders][0][direction]": "ASC",
//         "searchCriteria[pageSize]": "100",
//       },
//     });

//     return response;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const putProduct = async (sku: string, isStoreFront: boolean, isStoreFrontOrder: number) => {
//   try {
//     const { data: response } = await apiMagento.put<IProductMagento>("rest/V1/products/" + sku, {
//       product: {
//         custom_attributes: [
//           {
//             attribute_code: NAME_ATTRIBUTE_STOREFRONT,
//             value: isStoreFront ? "1" : "0",
//           },
//           {
//             attribute_code: `${NAME_ATTRIBUTE_STOREFRONT}_order`,
//             value: isStoreFrontOrder === 0 ? "" : isStoreFrontOrder.toString(),
//           },
//         ],
//       },
//     });

//     return response;
//   } catch (error) {
//     console.log(error);
//   }
// };
