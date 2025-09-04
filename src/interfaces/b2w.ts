export interface IProductB2W {
  product: {
    sku: number | string;
    name: string;
    description: string;
    status: string;
    qty: number;
    price: number;
    promotional_price: number;
    cost?: number;
    weight: number;
    height: number;
    length: number;
    width: number;
    brand: string;
    ean: number;
    nbm?: number;
    images: string[];
    categories?: {
      code: string;
      name: string;
    }[];
    specifications?: {
      key: string;
      value: string;
    }[];
  };
}
