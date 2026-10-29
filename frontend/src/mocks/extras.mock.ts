import type { MockUser, CartItem, Order, OrderItem, WishlistItem, Conversation, Message, Review, Voucher, Checkout } from '../types/index.js';

export const users: MockUser[] = [
  { id: 'user-buyer-1', full_name: 'Budi Pembeli', email: 'budi@kampus.ac.id', role: 'buyer', hasStore: false },
  { id: 'user-merchant-1', full_name: 'Siti Kantin', email: 'siti@kantin.id', role: 'merchant', hasStore: true, store_id: 'store-01' },
  { id: 'user-admin-1', full_name: 'Admin Souqna', email: 'admin@souqna.id', role: 'admin', hasStore: false },
];

export const initialCart: CartItem[] = [
  { id: 'cart-1', user_id: 'user-buyer-1', product_variant_id: 'var-01a', quantity: 2 },
  { id: 'cart-2', user_id: 'user-buyer-1', product_variant_id: 'var-04a', quantity: 1 },
];

export const checkouts: Checkout[] = [
  { id: 'co-01', buyer_id: 'user-buyer-1', checkout_code: 'SQN-2026-0001', subtotal: 59000, discount_total: 5000, grand_total: 61000, created_at: new Date().toISOString() },
];

export const orders: Order[] = [
  {
    id: 'ord-01', checkout_id: 'co-01', store_id: 'store-01', buyer_id: 'user-buyer-1',
    status: 'out_for_delivery', payment_method: 'cod', payment_status: 'unpaid',
    delivery_method: 'merchant_delivery', delivery_fee: 5000,
    subtotal: 24000, discount_amount: 2000, grand_total: 27000, created_at: new Date().toISOString(),
  },
  {
    id: 'ord-02', checkout_id: 'co-01', store_id: 'store-02', buyer_id: 'user-buyer-1',
    status: 'accepted', payment_method: 'cod', payment_status: 'unpaid',
    delivery_method: 'pickup', delivery_fee: 0,
    subtotal: 35000, discount_amount: 3000, grand_total: 32000, buyer_note: 'Ambil jam 4 sore', created_at: new Date().toISOString(),
  },
  {
    id: 'ord-03', checkout_id: 'co-01', store_id: 'store-03', buyer_id: 'user-buyer-1',
    status: 'completed', payment_method: 'cod', payment_status: 'paid',
    delivery_method: 'pickup', delivery_fee: 0,
    subtotal: 25000, discount_amount: 0, grand_total: 25000, created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const orderItems: OrderItem[] = [
  { id: 'oi-01', order_id: 'ord-03', product_id: 'prod-08', product_variant_id: 'var-08a', product_name_snapshot: 'Jilid Softcover Skripsi', variant_options_snapshot: 'Standar', unit_price_snapshot: 25000, quantity: 1, line_total: 25000 },
];

export const wishlist: WishlistItem[] = [
  { id: 'w-1', user_id: 'user-buyer-1', product_id: 'prod-04', created_at: new Date().toISOString() },
];

const now = Date.now();
export const conversations: Conversation[] = [
  { id: 'conv-01', buyer_id: 'user-buyer-1', store_id: 'store-01', created_at: new Date(now - 86400000 * 2).toISOString() },
];
export const messages: Message[] = [
  { id: 'm-1', conversation_id: 'conv-01', sender_id: 'user-buyer-1', body: 'Kak, geprek level 1 masih ada?', created_at: new Date(now - 86400000 * 1).toISOString() },
  { id: 'm-2', conversation_id: 'conv-01', sender_id: 'user-merchant-1', body: 'Ada kak, ready. Mau diantar atau ambil?', created_at: new Date(now - 86400000 * 1 + 60000).toISOString() },
  { id: 'm-3', conversation_id: 'conv-01', sender_id: 'user-buyer-1', body: 'Pesan lama (simulasi >7 hari, harus disembunyikan UI)', created_at: new Date(now - 86400000 * 8).toISOString() },
];

export const reviews: Review[] = [
  { id: 'r-1', order_item_id: 'oi-01', product_id: 'prod-08', buyer_id: 'user-buyer-1', rating: 5, review_text: 'Jilid rapi, cepat!', created_at: new Date().toISOString() },
];

export const vouchers: Voucher[] = [
  {
    id: 'v-1', code: 'HEMAT5K', description: 'Potongan 5rb min belanja 30rb', discount_type: 'fixed_amount',
    discount_value: 5000, minimum_subtotal: 30000, starts_at: new Date(now - 86400000).toISOString(),
    ends_at: new Date(now + 86400000 * 30).toISOString(), is_active: true,
  },
  {
    id: 'v-2', code: 'KADALUARSA', description: 'Contoh expired', discount_type: 'fixed_amount',
    discount_value: 10000, minimum_subtotal: 0, starts_at: new Date(now - 86400000 * 30).toISOString(),
    ends_at: new Date(now - 86400000).toISOString(), is_active: true,
  },
];
