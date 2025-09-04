export interface IAbandonedCarts {
  id: number;
  created_at: Date | null;
  updated_at: Date | null;
  items_count: number | null;
  items_qty: number | null;
  customer_id: number | null;
  customer_email: string | null;
  customer_firstname: string | null;
  customer_lastname: string | null;
  customer_region_code: string | null;
  customer_region: string | null;
  customer_city: string | null;
  customer_telephone: string | null;
  customer_postcode: string | null;
  dt_create: Date | null;
  dt_update: Date | null;
  sent_offer: string | null;
  user_updated: string | null;
}
