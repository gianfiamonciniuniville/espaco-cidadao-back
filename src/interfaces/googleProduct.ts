export interface IGoogleProduct {
  id: number;
  sku: string;
  title: string;
  gtin: string;
  description: string;
  image: string;
  link: string;
  customLabel0?: string;
  customLabel1_id?: number | null;
  customLabel2_id?: number | null;
  customLabel3_id?: number | null;
  customLabel4_id?: number | null;
  googleProductCategory?: number;
  productTypes?: string;
  hasInstallments: boolean;
  hasShipping: boolean;
  hasStaticCustomLabel: boolean;
}
