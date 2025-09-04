export interface IProductOlist {
  product: {
    seller_id: string;
    gtin: string; // EAN
    name: string;
    brand: string;
    description: string;
    prices: [
      {
        channel_slug: string;
        currency: string;
        minimum_quantity: number;
        offer: string;
        value: string;
        price_freight_shift: string;
      },
    ];
    stock: number;
    attributes: [
      {
        attribute_name: string;
        attribute_value: string;
      },
    ];
    categories: string[];
    tags: string[];
    photos: string[];
    product_measures: [
      {
        height_unit: string;
        height_value: string;
        length_unit: string;
        length_value: string;
        weight_unit: string;
        weight_value: string;
        width_unit: string;
        width_value: string;
      },
    ];
    package_measures: [
      {
        height_unit: string;
        height_value: string;
        length_unit: string;
        length_value: string;
        weight_unit: string;
        weight_value: string;
        width_unit: string;
        width_value: string;
        capacity: number;
      },
    ];
    /*
    free_shipping?: boolean;
    group?: string;
    product_code?: string;
    status?: string;
    */
  };
}
