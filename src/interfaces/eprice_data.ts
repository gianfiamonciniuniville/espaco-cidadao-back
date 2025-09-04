export interface IEpriceData {
  id: number;
  id_url: number;
  custom_data: string;
  title: string;
  direct_link: string;
  price: number;
  in_stock: boolean;
  updated_at: Date;
  total_price?: number;
  number_installments?: number;
  lowest_installment_price?: number;
}
