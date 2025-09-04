export interface IImageContentMagento {
  base64_encoded_data: string;
  type: string;
  name: string;
}

export interface IImageMagento {
  media_type: string;
  label: string;
  position: number | string;
  disabled: boolean;
  types: string[];
  file: string;
  content: IImageContentMagento;
}

export interface IStockProductMagento {
  qty: number;
  is_in_stock: boolean;
}

export interface IExtensionAttrProductMagento {
  category_links: [];
  stock_item: IStockProductMagento;
}

export interface ICustomAttributes {
  attribute_code: string;
  value: string | number;
}

export interface IProductMagento {
  sku: string;
  attribute_set_id: number;
  name: string;
  price: number;
  price_with_schema: {
    original_price: number;
    price_discount: {
      price: number;
      discount: number;
      percent: number;
    };
    price_installments: {
      installment_number: number;
      price: number;
      percent: number;
      discount: number;
      per_installment: number;
    }[];
  };
  status: number;
  visibility: number;
  weight: number;
  media_gallery_entries: IImageMagento[];
  extension_attributes: IExtensionAttrProductMagento;
  custom_attributes: ICustomAttributes[] | [];
}

export interface IStoreFrontRequest {
  sku: string;
  order: number;
}

export interface IStoreFrontJsonGooglBucket {
  skus: IStoreFrontRequest[];
}
