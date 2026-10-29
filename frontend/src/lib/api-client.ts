// Mock-first API client — bentuk mirror docs/api-contract.md.
// Ganti ke Axios real ke /api/v1 saat backend siap, tanpa ubah komponen.
import { categories } from '../mocks/categories.mock.js';
import { stores } from '../mocks/stores.mock.js';
import { products } from '../mocks/products.mock.js';
import {
  checkouts as seedCheckouts, conversations, messages, orders as seedOrders,
  orderItems as seedOrderItems, reviews, users, vouchers, wishlist,
} from '../mocks/extras.mock.js';
import type { Checkout, Order, OrderItem, OrderStatusHistory, Product } from '../types/index.js';
import { delay } from './format.js';
import { currentSession, updateProfile } from './mock-auth.js';

export type ProductSort = 'terbaru' | 'termurah' | 'termahal' | 'nama';
export interface ProductQuery {
  q?: string; categoryId?: string; storeId?: string;
  minPrice?: number; maxPrice?: number; sort?: ProductSort;
  page?: number; limit?: number;
}
export interface Paged<T> { data: T[]; total: number; page: number; limit: number }

// Helper simulasi server: harga dihitung dari varian, bukan input komponen.
export const productMinPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
export const isProductOutOfStock = (p: Product) => p.variants.every((v) => v.stock_quantity === 0);
const activeStoreIds = () => new Set(stores.filter((s) => s.status === 'active').map((s) => s.id));

const hasStorage = () => typeof localStorage !== 'undefined';
const readJSON = <T>(key: string, fallback: T): T => {
  try {
    if (!hasStorage()) return fallback;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
};
const writeJSON = (key: string, v: unknown) => {
  try { if (hasStorage()) localStorage.setItem(key, JSON.stringify(v)); } catch { /* abaikan */ }
};

// --- Stok dummy: override persist agar pengurangan stok selamat reload ---
const STOCK_KEY = 'souqna:stock-overrides';
function applyStockOverrides() {
  const ov = readJSON<Record<string, number>>(STOCK_KEY, {});
  if (Object.keys(ov).length === 0) return;
  for (const p of products) {
    for (const v of p.variants) {
      if (typeof ov[v.id] === 'number') v.stock_quantity = ov[v.id];
    }
  }
}
applyStockOverrides();
function persistStock() {
  const ov: Record<string, number> = {};
  for (const p of products) for (const v of p.variants) ov[v.id] = v.stock_quantity;
  writeJSON(STOCK_KEY, ov);
}

// --- Order/checkout dummy buatan checkout: persist antar reload ---
const CO_KEY = 'souqna:extra-checkouts';
const ORD_KEY = 'souqna:extra-orders';
const OI_KEY = 'souqna:extra-order-items';
const extraCheckouts = (): Checkout[] => readJSON<Checkout[]>(CO_KEY, []);
const extraOrders = (): Order[] => readJSON<Order[]>(ORD_KEY, []);
const extraOrderItems = (): OrderItem[] => readJSON<OrderItem[]>(OI_KEY, []);

// --- Cart ---
export interface CartLine { id: string; variant_id: string; quantity: number }
const CART_KEY = 'souqna:cart';
const seedCart: CartLine[] = [
  { id: 'cart-1', variant_id: 'var-01a', quantity: 2 },
  { id: 'cart-2', variant_id: 'var-04a', quantity: 1 },
];
function loadCart(): CartLine[] {
  const raw = readJSON<CartLine[] | null>(CART_KEY, null);
  if (raw) return raw;
  writeJSON(CART_KEY, seedCart);
  return [...seedCart];
}
function saveCart(c: CartLine[]) { writeJSON(CART_KEY, c); }

function resolveVariant(variantId: string) {
  for (const p of products) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) {
      const s = stores.find((x) => x.id === p.store_id) ?? null;
      return { product: p, variant: v, store: s };
    }
  }
  return null;
}

export interface CartDetailed extends CartLine {
  product_id: string; product_name: string; store_id: string; store_name: string;
  variant_label: string; unit_price: number; line_total: number;
  stock_quantity: number; purchasable: boolean; block_reason?: string;
}
function detailLine(c: CartLine): CartDetailed {
  const r = resolveVariant(c.variant_id);
  if (!r) {
    return {
      ...c, product_id: '', product_name: '(varian dihapus)', store_id: '', store_name: '-',
      variant_label: c.variant_id, unit_price: 0, line_total: 0,
      stock_quantity: 0, purchasable: false, block_reason: 'Varian tidak ditemukan.',
    };
  }
  const blocked =
    r.product.status !== 'published' ? 'Produk disembunyikan.' :
    !r.store || r.store.status !== 'active' ? 'Toko nonaktif.' :
    r.variant.stock_quantity <= 0 ? 'Stok habis.' : undefined;
  return {
    ...c, product_id: r.product.id, product_name: r.product.name,
    store_id: r.product.store_id, store_name: r.store?.name ?? '-',
    variant_label: r.variant.label, unit_price: r.variant.price,
    line_total: r.variant.price * c.quantity,
    stock_quantity: r.variant.stock_quantity,
    purchasable: !blocked, block_reason: blocked,
  };
}

// --- Checkout (simulasi server: hitung ulang, atomik) ---
export type FulfillmentMethod = 'pickup' | 'merchant_delivery';
export interface FulfillmentInput { method: FulfillmentMethod; location?: string }
export interface CheckoutInput {
  items: { variant_id: string; quantity: number }[];
  fulfillment: Record<string, FulfillmentInput>;
  voucher_code?: string;
  buyer_note?: string;
}
export interface StoreBreakdown {
  store_id: string; store_name: string; subtotal: number;
  discount_amount: number; delivery_fee: number; delivery_method: FulfillmentMethod;
  grand_total: number; lines: CartDetailed[];
}
export interface CheckoutPreview {
  perStore: StoreBreakdown[]; subtotal: number; discount_total: number;
  delivery_total: number; grand_total: number; voucher_code?: string;
}
export interface CheckoutResult { checkout: Checkout; orders: Order[]; items: OrderItem[] }

function voucherAmount(code: string, subtotal: number): { ok: true; amount: number } | { ok: false; reason: string } {
  const v = vouchers.find((x) => x.code === code.toUpperCase() && x.is_active);
  if (!v) return { ok: false, reason: 'Voucher tidak ditemukan / nonaktif' };
  const t = Date.now();
  if (new Date(v.starts_at).getTime() > t || new Date(v.ends_at).getTime() < t)
    return { ok: false, reason: 'Voucher kedaluwarsa' };
  if (subtotal < v.minimum_subtotal) return { ok: false, reason: `Min. belanja ${v.minimum_subtotal}` };
  const amount = v.discount_type === 'fixed_amount'
    ? v.discount_value
    : Math.min((subtotal * v.discount_value) / 100, v.maximum_discount ?? Infinity);
  return { ok: true, amount };
}

/** Validasi + hitung preview. Murni (tanpa mutasi) — dipakai UI sebelum submit. */
export function previewCheckout(input: CheckoutInput): CheckoutPreview {
  const errors: string[] = [];
  const lines: CartDetailed[] = input.items.map((it, i) =>
    detailLine({ id: `in-${i}`, variant_id: it.variant_id, quantity: it.quantity }));

  for (const l of lines) {
    if (!l.product_id) { errors.push(`Varian ${l.variant_id} tidak ditemukan.`); continue; }
    if (l.block_reason) errors.push(`${l.product_name} (${l.variant_label}): ${l.block_reason}`);
    else if (l.quantity < 1) errors.push(`${l.product_name}: qty minimal 1.`);
    else if (l.quantity > l.stock_quantity) errors.push(`${l.product_name} (${l.variant_label}): sisa ${l.stock_quantity}.`);
  }

  const byStore = new Map<string, CartDetailed[]>();
  for (const l of lines) {
    if (!l.store_id) continue;
    const arr = byStore.get(l.store_id) ?? [];
    arr.push(l);
    byStore.set(l.store_id, arr);
  }
  if (byStore.size === 0 && errors.length === 0) errors.push('Keranjang kosong.');

  for (const [sid] of byStore) {
    const f = input.fulfillment[sid];
    const st = stores.find((x) => x.id === sid);
    if (!f) { errors.push(`Pilih pickup/diantar untuk toko ${(st?.name ?? sid)}.`); continue; }
    if (f.method === 'merchant_delivery') {
      if (!st?.delivery_available) errors.push(`${st?.name ?? sid} tidak melayani pengantaran.`);
      else if (!f.location?.trim()) errors.push(`Isi lokasi serah terima untuk ${st?.name ?? sid}.`);
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);
  let discountTotal = 0;
  const code = input.voucher_code?.trim();
  if (code) {
    const r = voucherAmount(code, subtotal);
    if (!r.ok) errors.push(`Voucher: ${r.reason}`);
    else discountTotal = Math.min(r.amount, subtotal);
  }

  if (errors.length > 0) throw new Error(errors.join(' '));

  // Alokasi diskon proporsional per toko (pembulatan di toko terakhir).
  const sids = [...byStore.keys()];
  const perStore: StoreBreakdown[] = sids.map((sid, idx) => {
    const ls = byStore.get(sid)!;
    const st = stores.find((x) => x.id === sid)!;
    const f = input.fulfillment[sid];
    const sub = ls.reduce((s, l) => s + l.line_total, 0);
    const disc = idx < sids.length - 1
      ? Math.round((discountTotal * sub) / subtotal)
      : discountTotal - sids.slice(0, -1).reduce((s, _, j) => s + Math.round((discountTotal * byStore.get(sids[j])!.reduce((a, l) => a + l.line_total, 0)) / subtotal), 0);
    const fee = f.method === 'pickup' ? 0 : st.delivery_fee;
    return {
      store_id: sid, store_name: st.name, subtotal: sub,
      discount_amount: disc, delivery_fee: fee, delivery_method: f.method,
      grand_total: sub - disc + fee, lines: ls,
    };
  });

  return {
    perStore,
    subtotal,
    discount_total: discountTotal,
    delivery_total: perStore.reduce((s, x) => s + x.delivery_fee, 0),
    grand_total: perStore.reduce((s, x) => s + x.grand_total, 0),
    voucher_code: code?.toUpperCase(),
  };
}

// --- Order + transisi COD (simulasi server: hanya transisi legal) ---
export type OrderAction =
  | 'cancel' | 'accept' | 'reject' | 'ready-for-pickup'
  | 'out-for-delivery' | 'confirm-received' | 'mark-paid';

const ORD_OV_KEY = 'souqna:order-overrides';
const HIST_KEY = 'souqna:extra-history';
const RETURNED_KEY = 'souqna:stock-returned';
const dayAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const seedHistory: OrderStatusHistory[] = [
  { id: 'h-01a', order_id: 'ord-01', from_status: 'created', to_status: 'pending_merchant_confirmation', changed_by: 'user-buyer-1', note: 'Checkout dibuat.', created_at: dayAgo(2) },
  { id: 'h-01b', order_id: 'ord-01', from_status: 'pending_merchant_confirmation', to_status: 'accepted', changed_by: 'user-merchant-1', note: 'Pesanan diterima.', created_at: dayAgo(2) },
  { id: 'h-01c', order_id: 'ord-01', from_status: 'accepted', to_status: 'out_for_delivery', changed_by: 'user-merchant-1', note: 'Kurir toko jalan.', created_at: dayAgo(1) },
  { id: 'h-02a', order_id: 'ord-02', from_status: 'created', to_status: 'pending_merchant_confirmation', changed_by: 'user-buyer-1', note: 'Checkout dibuat.', created_at: dayAgo(2) },
  { id: 'h-02b', order_id: 'ord-02', from_status: 'pending_merchant_confirmation', to_status: 'accepted', changed_by: 'user-merchant-1', note: 'Pesanan diterima.', created_at: dayAgo(1) },
  { id: 'h-03a', order_id: 'ord-03', from_status: 'created', to_status: 'pending_merchant_confirmation', changed_by: 'user-buyer-1', note: 'Checkout dibuat.', created_at: dayAgo(5) },
  { id: 'h-03b', order_id: 'ord-03', from_status: 'pending_merchant_confirmation', to_status: 'accepted', changed_by: 'user-merchant-1', created_at: dayAgo(4) },
  { id: 'h-03c', order_id: 'ord-03', from_status: 'accepted', to_status: 'ready_for_pickup', changed_by: 'user-merchant-1', created_at: dayAgo(4) },
  { id: 'h-03d', order_id: 'ord-03', from_status: 'ready_for_pickup', to_status: 'completed', changed_by: 'user-buyer-1', note: 'Diterima + lunas.', created_at: dayAgo(3) },
];

function orderOverrides(): Record<string, Partial<Pick<Order, 'status' | 'payment_status'>>> {
  return readJSON<Record<string, Partial<Pick<Order, 'status' | 'payment_status'>>>>(ORD_OV_KEY, {});
}
function extraHistory(): OrderStatusHistory[] {
  return readJSON<OrderStatusHistory[]>(HIST_KEY, []);
}
function returnedSet(): Set<string> {
  return new Set(readJSON<string[]>(RETURNED_KEY, []));
}

function allOrders(): Order[] {
  const ov = orderOverrides();
  const apply = (o: Order): Order => (ov[o.id] ? { ...o, ...ov[o.id] } : o);
  return [...extraOrders().map(apply), ...seedOrders.map(apply)]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function findOrder(id: string): Order | null {
  return allOrders().find((o) => o.id === id) ?? null;
}

function persistOrder(o: Order) {
  const ov = orderOverrides();
  ov[o.id] = { status: o.status, payment_status: o.payment_status };
  writeJSON(ORD_OV_KEY, ov);
  const extras = extraOrders();
  const i = extras.findIndex((x) => x.id === o.id);
  if (i >= 0) {
    extras[i] = { ...o };
    writeJSON(ORD_KEY, extras);
  }
}

function pushHistory(orderId: string, from: string, to: Order['status'], note?: string) {
  const me = currentSession();
  const h: OrderStatusHistory = {
    id: `h-${Date.now()}`, order_id: orderId, from_status: from, to_status: to,
    changed_by: me?.id ?? 'system', note, created_at: new Date().toISOString(),
  };
  writeJSON(HIST_KEY, [...extraHistory(), h]);
}

/** Kembalikan stok tepat sekali (idempotent) saat cancel/reject. */
function returnStockOnce(o: Order) {
  const done = returnedSet();
  if (done.has(o.id)) return;
  const items = [...seedOrderItems, ...extraOrderItems()].filter((i) => i.order_id === o.id);
  for (const it of items) {
    for (const p of products) {
      const v = p.variants.find((x) => x.id === it.product_variant_id);
      if (v) v.stock_quantity += it.quantity;
    }
  }
  persistStock();
  done.add(o.id);
  writeJSON(RETURNED_KEY, [...done]);
}

const TERMINAL: Order['status'][] = ['completed', 'rejected', 'cancelled'];

/** Terapkan transisi legal; lempar Error jelas bila ilegal. */
function applyTransition(orderId: string, action: OrderAction): Order {
  const me = currentSession();
  if (!me) throw new Error('Wajib login.');
  const o = findOrder(orderId);
  if (!o) throw new Error('Pesanan tidak ditemukan.');
  const store = stores.find((s) => s.id === o.store_id);
  const isBuyer = o.buyer_id === me.id;
  const isMerchant = store?.owner_id === me.id;
  const from = o.status;

  const needBuyer = () => { if (!isBuyer) throw new Error('Hanya pembeli pemilik pesanan.'); };
  const needMerchant = () => { if (!isMerchant) throw new Error('Hanya merchant pemilik toko.'); };

  switch (action) {
    case 'cancel': {
      needBuyer();
      if (from !== 'pending_merchant_confirmation') throw new Error('Batal hanya saat menunggu konfirmasi merchant.');
      o.status = 'cancelled';
      returnStockOnce(o);
      break;
    }
    case 'accept': {
      needMerchant();
      if (from !== 'pending_merchant_confirmation') throw new Error('Terima hanya saat menunggu konfirmasi.');
      o.status = 'accepted';
      break;
    }
    case 'reject': {
      needMerchant();
      if (from !== 'pending_merchant_confirmation') throw new Error('Tolak hanya saat menunggu konfirmasi.');
      o.status = 'rejected';
      returnStockOnce(o);
      break;
    }
    case 'ready-for-pickup': {
      needMerchant();
      if (from !== 'accepted') throw new Error('Siap-ambil hanya dari status accepted.');
      if (o.delivery_method !== 'pickup') throw new Error('Pesanan antar pakai out-for-delivery.');
      o.status = 'ready_for_pickup';
      break;
    }
    case 'out-for-delivery': {
      needMerchant();
      if (from !== 'accepted') throw new Error('Antar hanya dari status accepted.');
      if (o.delivery_method !== 'merchant_delivery') throw new Error('Pesanan ambil-sendiri pakai ready-for-pickup.');
      o.status = 'out_for_delivery';
      break;
    }
    case 'confirm-received': {
      needBuyer();
      if (from !== 'ready_for_pickup' && from !== 'out_for_delivery')
        throw new Error('Konfirmasi terima hanya setelah barang siap/diantar.');
      o.status = o.payment_status === 'paid' ? 'completed' : 'received_by_buyer';
      break;
    }
    case 'mark-paid': {
      needMerchant();
      if (o.payment_status === 'paid') throw new Error('Sudah lunas.');
      if (TERMINAL.includes(from)) throw new Error('Pesanan sudah final.');
      o.payment_status = 'paid';
      if (from === 'received_by_buyer') o.status = 'completed';
      break;
    }
  }

  persistOrder(o);
  pushHistory(orderId, from, o.status,
    action === 'mark-paid' ? 'Tunai diterima merchant.' : undefined);
  return o;
}

export const api = {
  async getCategories() { await delay(); return categories.filter((c) => c.is_active); },
  async getStores() { await delay(); return stores.filter((s) => s.status === 'active'); },

  async getProducts(params: ProductQuery = {}): Promise<Paged<Product>> {
    await delay();
    const active = activeStoreIds();
    let list = products.filter((p) => {
      if (p.status !== 'published') return false;
      if (!active.has(p.store_id)) return false; // toko nonaktif tidak tampil di katalog
      if (params.categoryId && p.category_id !== params.categoryId) return false;
      if (params.storeId && p.store_id !== params.storeId) return false;
      if (params.q) {
        const q = params.q.toLowerCase();
        const hay = `${p.name} ${p.description} ${p.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const min = productMinPrice(p);
      if (params.minPrice != null && min < params.minPrice) return false;
      if (params.maxPrice != null && min > params.maxPrice) return false;
      return true;
    });

    const sort = params.sort ?? 'terbaru';
    list = [...list].sort((a, b) => {
      if (sort === 'termurah') return productMinPrice(a) - productMinPrice(b);
      if (sort === 'termahal') return productMinPrice(b) - productMinPrice(a);
      if (sort === 'nama') return a.name.localeCompare(b.name, 'id');
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const limit = Math.min(Math.max(params.limit ?? 12, 1), 50);
    const page = Math.max(params.page ?? 1, 1);
    const total = list.length;
    const data = list.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },

  async getProduct(id: string) { await delay(); return products.find((p) => p.id === id) ?? null; },
  async getStore(id: string) { await delay(); return stores.find((s) => s.id === id) ?? null; },
  async getStoreProducts(storeId: string) { await delay(); return products.filter((p) => p.store_id === storeId && p.status === 'published'); },

  async getMe() { await delay(150); return currentSession(); },
  async updateMe(patch: { full_name?: string; phone?: string; default_location?: string }) {
    await delay(200);
    return updateProfile(patch);
  },

  // --- Cart (multi-toko, persist) ---
  async getCart(): Promise<CartLine[]> { await delay(); return loadCart(); },
  async getCartDetailed(): Promise<CartDetailed[]> { await delay(); return loadCart().map(detailLine); },
  async addToCart(variantId: string, quantity = 1) {
    await delay(150);
    const r = resolveVariant(variantId);
    if (!r) throw new Error('Varian tidak ditemukan.');
    if (r.product.status !== 'published') throw new Error('Produk disembunyikan.');
    if (!r.store || r.store.status !== 'active') throw new Error('Toko nonaktif — tidak bisa checkout.');
    if (r.variant.stock_quantity <= 0) throw new Error('Stok habis.');
    if (quantity < 1) throw new Error('Qty minimal 1.');
    const cart = loadCart();
    const ex = cart.find((c) => c.variant_id === variantId);
    const want = (ex?.quantity ?? 0) + quantity;
    if (want > r.variant.stock_quantity) throw new Error(`Sisa stok ${r.variant.stock_quantity}.`);
    if (ex) ex.quantity = want;
    else cart.push({ id: `cart-${Date.now()}`, variant_id: variantId, quantity });
    saveCart(cart);
    return cart;
  },
  async updateCartItemQty(id: string, quantity: number) {
    await delay(150);
    const cart = loadCart();
    const it = cart.find((c) => c.id === id);
    if (!it) throw new Error('Item tidak ada di keranjang.');
    if (quantity <= 0) {
      const next = cart.filter((c) => c.id !== id);
      saveCart(next);
      return next;
    }
    const r = resolveVariant(it.variant_id);
    if (r && quantity > r.variant.stock_quantity) throw new Error(`Sisa stok ${r.variant.stock_quantity}.`);
    it.quantity = quantity;
    saveCart(cart);
    return cart;
  },
  async removeCartItem(id: string) {
    await delay(150);
    const next = loadCart().filter((c) => c.id !== id);
    saveCart(next);
    return next;
  },
  async clearCart() { await delay(100); saveCart([]); return []; },

  // --- Checkout ---
  async validateCheckout(input: CheckoutInput): Promise<CheckoutPreview> {
    await delay(250);
    return previewCheckout(input);
  },
  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    await delay(400);
    const me = currentSession();
    if (!me) throw new Error('Wajib login untuk checkout.');
    // Hitung + validasi dulu (tanpa mutasi). Gagal → atomik, tanpa order/stok berubah.
    const prev = previewCheckout(input);

    // Mutasi: kurangi stok.
    for (const ps of prev.perStore) {
      for (const l of ps.lines) {
        const r = resolveVariant(l.variant_id);
        if (r) r.variant.stock_quantity -= l.quantity;
      }
    }
    persistStock();

    const seq = extraCheckouts().length + seedCheckouts.length + 1;
    const checkout: Checkout = {
      id: `co-${Date.now()}`, buyer_id: me.id,
      checkout_code: `SQN-2026-${String(seq).padStart(4, '0')}`,
      subtotal: prev.subtotal, discount_total: prev.discount_total,
      grand_total: prev.grand_total, created_at: new Date().toISOString(),
    };
    const orders: Order[] = prev.perStore.map((ps, i) => ({
      id: `ord-${Date.now()}-${i}`, checkout_id: checkout.id, store_id: ps.store_id, buyer_id: me.id,
      status: 'pending_merchant_confirmation', payment_method: 'cod', payment_status: 'unpaid',
      delivery_method: ps.delivery_method, delivery_fee: ps.delivery_fee,
      subtotal: ps.subtotal, discount_amount: ps.discount_amount, grand_total: ps.grand_total,
      buyer_note: input.fulfillment[ps.store_id].method === 'merchant_delivery'
        ? [input.fulfillment[ps.store_id].location, input.buyer_note].filter(Boolean).join(' · ')
        : input.buyer_note,
      created_at: new Date().toISOString(),
    }));
    const items: OrderItem[] = prev.perStore.flatMap((ps, i) =>
      ps.lines.map((l, j) => ({
        id: `oi-${Date.now()}-${i}-${j}`, order_id: orders[i].id,
        product_id: l.product_id, product_variant_id: l.variant_id,
        product_name_snapshot: l.product_name,
        variant_options_snapshot: l.variant_label,
        unit_price_snapshot: l.unit_price, quantity: l.quantity, line_total: l.line_total,
      })));

    writeJSON(CO_KEY, [...extraCheckouts(), checkout]);
    writeJSON(ORD_KEY, [...extraOrders(), ...orders]);
    writeJSON(OI_KEY, [...extraOrderItems(), ...items]);
    saveCart([]);
    for (const o of orders) pushHistory(o.id, 'created', 'pending_merchant_confirmation', 'Checkout dibuat.');

    return { checkout, orders, items };
  },
  async getCheckout(id: string) {
    await delay();
    const all = [...seedCheckouts, ...extraCheckouts()];
    const co = all.find((c) => c.id === id) ?? null;
    if (!co) return { checkout: null, orders: [] as Order[] };
    const allO = [...seedOrders, ...extraOrders()];
    return { checkout: co, orders: allO.filter((o) => o.checkout_id === id) };
  },

  async getOrders() {
    await delay();
    return allOrders();
  },
  async getOrder(id: string) {
    await delay();
    const allI = [...seedOrderItems, ...extraOrderItems()];
    return { order: findOrder(id), items: allI.filter((i) => i.order_id === id) };
  },
  async getMerchantOrders() {
    await delay();
    const me = currentSession();
    if (!me) throw new Error('Wajib login.');
    const mine = stores.filter((s) => s.owner_id === me.id).map((s) => s.id);
    return allOrders().filter((o) => mine.includes(o.store_id));
  },
  async getOrderHistory(orderId: string): Promise<OrderStatusHistory[]> {
    await delay(150);
    return [...seedHistory, ...extraHistory()].filter((h) => h.order_id === orderId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },
  async transitionOrder(orderId: string, action: OrderAction) {
    await delay(250);
    return applyTransition(orderId, action);
  },
  async getCheckouts() {
    await delay();
    return [...extraCheckouts(), ...seedCheckouts];
  },
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
    const r = voucherAmount(code, subtotal);
    if (!r.ok) return { ok: false as const, reason: (r as { reason: string }).reason };
    return { ok: true as const, amount: (r as { amount: number }).amount };
  },
  async getUsers() { await delay(); return users; },
};

export { stores };
