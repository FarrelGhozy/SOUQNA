// Mock-first API client — bentuk mirror docs/api-contract.md.
// Ganti ke Axios real ke /api/v1 saat backend siap, tanpa ubah komponen.
import { categories } from '../mocks/categories.mock.js';
import { stores } from '../mocks/stores.mock.js';
import { products } from '../mocks/products.mock.js';
import { checkouts, conversations, messages, orders, orderItems, reviews, users, vouchers, wishlist } from '../mocks/extras.mock.js';
import { delay } from './format.js';
import { currentSession } from './mock-auth.js';

export const api = {
  async getCategories() { await delay(); return categories.filter((c) => c.is_active); },
  async getProducts(params: { q?: string; categoryId?: string } = {}) {
    await delay();
    return products.filter((p) => {
      if (p.status !== 'published') return false;
      if (params.categoryId && p.category_id !== params.categoryId) return false;
      if (params.q && !p.name.toLowerCase().includes(params.q.toLowerCase())) return false;
      return true;
    });
  },
  async getProduct(id: string) { await delay(); return products.find((p) => p.id === id) ?? null; },
  async getStore(id: string) { await delay(); return stores.find((s) => s.id === id) ?? null; },
  async getStoreProducts(storeId: string) { await delay(); return products.filter((p) => p.store_id === storeId && p.status === 'published'); },

  async getMe() { await delay(150); return currentSession(); },
  async getCart() {
    await delay();
    const raw = localStorage.getItem('souqna:cart');
    if (raw) return JSON.parse(raw);
    const seed = [
      { id: 'cart-1', variant_id: 'var-01a', quantity: 2 },
      { id: 'cart-2', variant_id: 'var-04a', quantity: 1 },
    ];
    localStorage.setItem('souqna:cart', JSON.stringify(seed));
    return seed;
  },
  async getOrders() { await delay(); return orders; },
  async getOrder(id: string) {
    await delay();
    return { order: orders.find((o) => o.id === id) ?? null, items: orderItems.filter((i) => i.order_id === id) };
  },
  async getCheckouts() { await delay(); return checkouts; },
  async getWishlist() { await delay(); return wishlist; },
  async getConversations() { await delay(); return conversations; },
  async getMessages(convId: string) {
    await delay();
    // Simulasi purge: sembunyikan pesan >7 hari.
    const cutoff = Date.now() - 7 * 86400000;
    return messages.filter((m) => m.conversation_id === convId && new Date(m.created_at).getTime() >= cutoff);
  },
  async getReviews(productId: string) { await delay(); return reviews.filter((r) => r.product_id === productId); },
  async getVouchers() { await delay(); return vouchers; },
  async validateVoucher(code: string, subtotal: number) {
    await delay(200);
    const v = vouchers.find((x) => x.code === code.toUpperCase() && x.is_active);
    if (!v) return { ok: false as const, reason: 'Voucher tidak ditemukan / nonaktif' };
    const t = Date.now();
    if (new Date(v.starts_at).getTime() > t || new Date(v.ends_at).getTime() < t)
      return { ok: false as const, reason: 'Voucher kedaluwarsa' };
    if (subtotal < v.minimum_subtotal) return { ok: false as const, reason: `Min. belanja ${v.minimum_subtotal}` };
    const amount = v.discount_type === 'fixed_amount' ? v.discount_value : Math.min((subtotal * v.discount_value) / 100, v.maximum_discount ?? Infinity);
    return { ok: true as const, amount, voucher: v };
  },
  async getUsers() { await delay(); return users; },
};

export { stores };
