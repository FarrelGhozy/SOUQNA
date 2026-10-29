// Tipe mock — mirror docs/data-model.md, snake_case seperti kontrak API.
export interface Category { id: string; name: string; slug: string; description?: string; is_active: boolean }
export interface Store {
  id: string; owner_id: string; name: string; slug: string; description: string;
  logo_url?: string; pickup_location: string; delivery_available: boolean;
  delivery_fee: number; status: 'active' | 'inactive' | 'suspended';
}
export interface ProductVariant {
  id: string; product_id: string; sku?: string; label: string;
  options: Record<string, string>; price: number; stock_quantity: number; is_active: boolean;
}
export interface Product {
  id: string; store_id: string; category_id: string; name: string; slug: string;
  description: string; status: 'draft' | 'published' | 'hidden' | 'suspended';
  image_url: string; variants: ProductVariant[];
}
export interface CartItem { id: string; user_id: string; product_variant_id: string; quantity: number }
export interface Checkout { id: string; buyer_id: string; checkout_code: string; subtotal: number; discount_total: number; grand_total: number; created_at: string }
export type OrderStatus = 'pending_merchant_confirmation' | 'accepted' | 'ready_for_pickup' | 'out_for_delivery' | 'received_by_buyer' | 'completed' | 'rejected' | 'cancelled';
export interface Order {
  id: string; checkout_id: string; store_id: string; buyer_id: string;
  status: OrderStatus; payment_method: 'cod'; payment_status: 'unpaid' | 'paid';
  delivery_method: 'pickup' | 'merchant_delivery'; delivery_fee: number;
  subtotal: number; discount_amount: number; grand_total: number; buyer_note?: string; created_at: string;
}
export interface OrderItem {
  id: string; order_id: string; product_id: string; product_variant_id: string;
  product_name_snapshot: string; variant_options_snapshot: string;
  unit_price_snapshot: number; quantity: number; line_total: number;
}
export interface MockUser { id: string; full_name: string; email: string; role: 'buyer' | 'merchant' | 'admin'; hasStore: boolean; store_id?: string }
export interface WishlistItem { id: string; user_id: string; product_id: string; created_at: string }
export interface Conversation { id: string; buyer_id: string; store_id: string; created_at: string }
export interface Message { id: string; conversation_id: string; sender_id: string; body: string; created_at: string }
export interface Review { id: string; order_item_id: string; product_id: string; buyer_id: string; rating: number; review_text?: string; created_at: string }
export interface Voucher {
  id: string; code: string; description: string; discount_type: 'percentage' | 'fixed_amount';
  discount_value: number; minimum_subtotal: number; maximum_discount?: number;
  starts_at: string; ends_at: string; is_active: boolean;
}
