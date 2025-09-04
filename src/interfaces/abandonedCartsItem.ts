export interface IAbandonedCartsItem {
  id: number;
  sku: string;
  qty: number;
  name: string;
  price: number;
  quote_id: number;
  new_price: number;
  sent_offer: string;
  coupon: string;
  dt_create: Date;
  dt_update: Date;
  user_updated: string;
}
