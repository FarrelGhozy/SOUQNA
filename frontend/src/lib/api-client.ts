// Mock-first API client — bentuk mirror docs/api-contract.md.
// Ganti ke Axios real ke /api/v1 saat backend siap, tanpa ubah komponen.
import { categories } from '../mocks/categories.mock.js';
import { stores } from '../mocks/stores.mock.js';
import { products } from '../mocks/products.mock.js';
import {
  checkouts as seedCheckouts, conversations, messages, orders as seedOrders,
  orderItems as seedOrderItems, reviews, users, vouchers, wishlist,
} from '../mocks/extras.mock.js';
import type { Checkout, AdminAuditLog, Category, Conversation, Message, MockUser, Order, OrderItem, OrderStatusHistory, Product, ProductVariant, Review, Store, Voucher, WishlistItem } from '../types/index.js';
import { delay } from './format.js';
import { attachStore, currentSession, updateProfile } from './mock-auth.js';

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
const activeStoreIds = () => new Set(allStores().filter((s) => s.status === 'active').map((s) => s.id));

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

// --- Toko merchant dummy: base + extra (localStorage) + override profil ---
const MSTORE_KEY = 'souqna:extra-stores';
const STORE_OV_KEY = 'souqna:store-overrides';
let extraStoreCache: Store[] | null = null;
function extraStores(): Store[] {
  if (!extraStoreCache) extraStoreCache = readJSON<Store[]>(MSTORE_KEY, []);
  return extraStoreCache;
}
function saveExtraStores() { writeJSON(MSTORE_KEY, extraStores()); }
function applyStoreOverrides() {
  const ov = readJSON<Record<string, Partial<Store>>>(STORE_OV_KEY, {});
  for (const s of stores) {
    const o = ov[s.id];
    if (o) Object.assign(s, o);
  }
}
applyStoreOverrides();
function saveStoreOv(s: Store) {
  const ov = readJSON<Record<string, Partial<Store>>>(STORE_OV_KEY, {});
  ov[s.id] = { ...s };
  writeJSON(STORE_OV_KEY, ov);
}
function allStores(): Store[] { return [...stores, ...extraStores()]; }
function persistStore(s: Store) {
  if (stores.some((x) => x.id === s.id)) saveStoreOv(s);
  else saveExtraStores();
}
const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `toko-${Date.now()}`;
function uniqueSlug(base: string): string {
  const taken = new Set(allStores().map((s) => s.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
function myStore(): Store | null {
  const me = currentSession();
  if (!me) return null;
  return allStores().find((s) => s.owner_id === me.id) ?? null;
}

// --- Produk merchant dummy: base (+override persist) + extra (localStorage) ---
const MPROD_KEY = 'souqna:extra-products';
const PROD_OV_KEY = 'souqna:product-overrides';
let extraProductCache: Product[] | null = null;
function extraProducts(): Product[] {
  if (!extraProductCache) {
    extraProductCache = readJSON<Product[]>(MPROD_KEY, []);
    const ov = readJSON<Record<string, number>>(STOCK_KEY, {});
    for (const p of extraProductCache) {
      for (const v of p.variants) {
        if (typeof ov[v.id] === 'number') v.stock_quantity = ov[v.id];
      }
    }
  }
  return extraProductCache;
}
function saveExtraProducts() { writeJSON(MPROD_KEY, extraProducts()); }
function applyProductOverrides() {
  const ov = readJSON<Record<string, Product>>(PROD_OV_KEY, {});
  for (const p of products) {
    const snap = ov[p.id];
    if (!snap || !Array.isArray(snap.variants)) continue;
    const stocks = new Map(p.variants.map((v) => [v.id, v.stock_quantity]));
    Object.assign(p, { ...snap, id: p.id, store_id: p.store_id });
    for (const v of p.variants) {
      if (stocks.has(v.id)) v.stock_quantity = stocks.get(v.id)!;
    }
  }
}
function saveProdOv(p: Product) {
  const ov = readJSON<Record<string, Product>>(PROD_OV_KEY, {});
  ov[p.id] = JSON.parse(JSON.stringify(p)) as Product;
  writeJSON(PROD_OV_KEY, ov);
}
function allProducts(): Product[] { return [...products, ...extraProducts()]; }
function persistProduct(p: Product) {
  if (products.some((x) => x.id === p.id)) saveProdOv(p);
  else saveExtraProducts();
}
applyProductOverrides();

// --- Wishlist/chat/review dummy: seed + extra (localStorage) ---
const WL_KEY = 'souqna:wishlist';
const WL_DEL_KEY = 'souqna:wishlist-deleted';
const CONV_KEY = 'souqna:extra-conversations';
const MSG_KEY = 'souqna:extra-messages';
const REV_KEY = 'souqna:extra-reviews';

let extraWishlistCache: WishlistItem[] | null = null;
let extraConvCache: Conversation[] | null = null;
let extraMsgCache: Message[] | null = null;
let extraRevCache: Review[] | null = null;
function extraWishlist(): WishlistItem[] {
  if (!extraWishlistCache) extraWishlistCache = readJSON<WishlistItem[]>(WL_KEY, []);
  return extraWishlistCache;
}
function saveWishlist() { writeJSON(WL_KEY, extraWishlist()); }
function allWishlist(): WishlistItem[] {
  const tomb = new Set(readJSON<string[]>(WL_DEL_KEY, []));
  return [...wishlist.filter((w) => !tomb.has(w.id)), ...extraWishlist()];
}
function extraConversations(): Conversation[] {
  if (!extraConvCache) extraConvCache = readJSON<Conversation[]>(CONV_KEY, []);
  return extraConvCache;
}
function saveConversations() { writeJSON(CONV_KEY, extraConversations()); }
function allConversations(): Conversation[] {
  return [...conversations, ...extraConversations()];
}
function extraMessages(): Message[] {
  if (!extraMsgCache) extraMsgCache = readJSON<Message[]>(MSG_KEY, []);
  return extraMsgCache;
}
function saveMessages() { writeJSON(MSG_KEY, extraMessages()); }
function allMessages(): Message[] {
  return [...messages, ...extraMessages()];
}
function extraReviews(): Review[] {
  if (!extraRevCache) extraRevCache = readJSON<Review[]>(REV_KEY, []);
  return extraRevCache;
}
function saveReviews() { writeJSON(REV_KEY, extraReviews()); }
function allReviews(): Review[] {
  return [...reviews, ...extraReviews()];
}
function isParticipant(conv: Conversation, userId: string): boolean {
  if (conv.buyer_id === userId) return true;
  const st = allStores().find((s) => s.id === conv.store_id);
  return !!st && st.owner_id === userId;
}

// --- Admin dummy: users/kategori/moderasi/voucher/audit (web prioritas) ---
const CAT_KEY = 'souqna:extra-categories';
const CAT_OV_KEY = 'souqna:category-overrides';
const VCH_KEY = 'souqna:extra-vouchers';
const VCH_OV_KEY = 'souqna:voucher-overrides';
const AUD_KEY = 'souqna:extra-audit-logs';
const EXTRA_USERS_KEY = 'souqna:extra-users';
const PROFILE_OV_KEY = 'souqna:profile-overrides';

function requireAdmin(): MockUser {
  const me = currentSession();
  if (!me || me.role !== 'admin') throw new Error('Hanya admin.');
  return me;
}
let extraCatCache: Category[] | null = null;
let extraVchCache: Voucher[] | null = null;
function extraCategories(): Category[] {
  if (!extraCatCache) extraCatCache = readJSON<Category[]>(CAT_KEY, []);
  return extraCatCache;
}
function saveCategories() { writeJSON(CAT_KEY, extraCategories()); }
function applyCategoryOverrides(list: Category[]): Category[] {
  const ov = readJSON<Record<string, Category>>(CAT_OV_KEY, {});
  return list.map((c) => (ov[c.id] ? { ...c, ...ov[c.id], id: c.id } : c));
}
function allCategories(): Category[] {
  return applyCategoryOverrides([...categories, ...extraCategories()]);
}
function saveCategoryOv(c: Category) {
  const ov = readJSON<Record<string, Category>>(CAT_OV_KEY, {});
  ov[c.id] = { ...c };
  writeJSON(CAT_OV_KEY, ov);
}
function persistCategory(c: Category) {
  if (categories.some((x) => x.id === c.id)) saveCategoryOv(c);
  else saveCategories();
}
function extraVouchers(): Voucher[] {
  if (!extraVchCache) extraVchCache = readJSON<Voucher[]>(VCH_KEY, []);
  return extraVchCache;
}
function saveVouchers() { writeJSON(VCH_KEY, extraVouchers()); }
function allVouchers(): Voucher[] {
  const ov = readJSON<Record<string, Voucher>>(VCH_OV_KEY, {});
  return [
    ...vouchers.map((v) => (ov[v.id] ? { ...v, ...ov[v.id], id: v.id } : v)),
    ...extraVouchers(),
  ];
}
function persistVoucher(v: Voucher) {
  if (vouchers.some((x) => x.id === v.id)) {
    const ov = readJSON<Record<string, Voucher>>(VCH_OV_KEY, {});
    ov[v.id] = { ...v };
    writeJSON(VCH_OV_KEY, ov);
  } else saveVouchers();
}
function extraAuditLogs(): AdminAuditLog[] {
  return readJSON<AdminAuditLog[]>(AUD_KEY, []);
}
function logAdmin(action: string, target_type: string, target_id: string, metadata?: Record<string, unknown>) {
  const me = currentSession();
  const logs = extraAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}`, admin_user_id: me?.id ?? 'unknown',
    action, target_type, target_id, ...(metadata ? { metadata } : {}),
    created_at: new Date().toISOString(),
  });
  writeJSON(AUD_KEY, logs.slice(0, 200));
}
function allUsers(): MockUser[] {
  const extras = readJSON<MockUser[]>(EXTRA_USERS_KEY, []);
  const ov = readJSON<Record<string, Partial<MockUser>>>(PROFILE_OV_KEY, {});
  const apply = (u: MockUser) => (ov[u.id] ? { ...u, ...ov[u.id] } : u);
  const seen = new Set<string>();
  const out: MockUser[] = [];
  for (const u of [...users, ...extras]) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    out.push(apply(u));
  }
  return out;
}

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
const seedCart: CartLine[] = [
  { id: 'cart-1', variant_id: 'var-01a', quantity: 2 },
  { id: 'cart-2', variant_id: 'var-04a', quantity: 1 },
];
function cartKey(): string {
  const me = currentSession();
  return me ? `souqna:cart:${me.id}` : 'souqna:cart:guest';
}
function loadCart(): CartLine[] {
  const key = cartKey();
  const raw = readJSON<CartLine[] | null>(key, null);
  if (raw !== null) return raw;
  const legacy = readJSON<CartLine[] | null>('souqna:cart', null);
  const me = currentSession();
  const initial = (!me || me.id === 'user-buyer-1') ? (legacy ?? seedCart) : [];
  writeJSON(key, initial);
  return [...initial];
}
function saveCart(c: CartLine[]) { writeJSON(cartKey(), c); }

function resolveVariant(variantId: string) {
  for (const p of allProducts()) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) {
      const s = allStores().find((x) => x.id === p.store_id) ?? null;
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
  const v = allVouchers().find((x) => x.code === code.toUpperCase() && x.is_active);
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
    const st = allStores().find((x) => x.id === sid);
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
    const st = allStores().find((x) => x.id === sid)!;
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
    for (const p of allProducts()) {
      const v = p.variants.find((x) => x.id === it.product_variant_id);
      if (v) v.stock_quantity += it.quantity;
    }
  }
  persistStock();
  saveExtraProducts();
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
  const store = allStores().find((s) => s.id === o.store_id);
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
  async getCategories() { await delay(); return allCategories().filter((c) => c.is_active); },
  async getStores() { await delay(); return allStores().filter((s) => s.status === 'active'); },

  async getProducts(params: ProductQuery = {}): Promise<Paged<Product>> {
    await delay();
    const active = activeStoreIds();
    let list = allProducts().filter((p) => {
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

  async getProduct(id: string) { await delay(); return allProducts().find((p) => p.id === id) ?? null; },
  async getStore(id: string) { await delay(); return allStores().find((s) => s.id === id) ?? null; },
  async getStoreProducts(storeId: string) { await delay(); return allProducts().filter((p) => p.store_id === storeId && p.status === 'published'); },

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
    saveExtraProducts();

    const seq = extraCheckouts().length + seedCheckouts.length + 1;
    const checkout: Checkout = {
      id: `co-${Date.now()}`, buyer_id: me.id,
      checkout_code: `SQN-2026-${String(seq).padStart(4, '0')}`,
      subtotal: prev.subtotal, discount_total: prev.discount_total,
      grand_total: prev.grand_total, created_at: new Date().toISOString(),
    };
    const orders: Order[] = prev.perStore.map((ps, i) => ({
      id: `ord-${Date.now()}-${i}`, checkout_id: checkout.id, store_id: ps.store_id, buyer_id: me.id,
      buyer_name_snapshot: me.full_name,
      handover_location_snapshot: input.fulfillment[ps.store_id]?.location || undefined,
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
    const me = currentSession();
    if (me && me.role !== 'admin' && co.buyer_id !== me.id) {
      throw new Error('Akses ditolak: checkout ini bukan milik Anda.');
    }
    const allO = [...seedOrders, ...extraOrders()];
    return { checkout: co, orders: allO.filter((o) => o.checkout_id === id) };
  },

  async getOrders() {
    await delay();
    const me = currentSession();
    if (!me) return [];
    if (me.role === 'admin') return allOrders();
    return allOrders().filter((o) => o.buyer_id === me.id);
  },
  async getOrder(id: string) {
    await delay();
    const ord = findOrder(id);
    if (!ord) return { order: null, items: [] as OrderItem[] };
    const me = currentSession();
    if (me && me.role !== 'admin') {
      const isBuyer = ord.buyer_id === me.id;
      const isStoreOwner = allStores().some((s) => s.id === ord.store_id && s.owner_id === me.id);
      if (!isBuyer && !isStoreOwner) {
        throw new Error('Akses ditolak: pesanan ini bukan milik Anda.');
      }
    }
    const allI = [...seedOrderItems, ...extraOrderItems()];
    return { order: ord, items: allI.filter((i) => i.order_id === id) };
  },
  async getMerchantOrders() {
    await delay();
    const me = currentSession();
    if (!me) throw new Error('Wajib login.');
    const mine = allStores().filter((s) => s.owner_id === me.id).map((s) => s.id);
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
  // --- Merchant dummy: toko + produk milik sendiri (simulasi server: ownership) ---
  async getMyStore(): Promise<Store | null> {
    await delay(150);
    const s = myStore();
    return s ? { ...s } : null;
  },
  async createMyStore(input: {
    name: string; description?: string; logo_url?: string;
    pickup_location: string; delivery_available: boolean; delivery_fee: number;
  }): Promise<Store> {
    await delay(300);
    const me = currentSession();
    if (!me) throw new Error('Wajib login untuk jadi merchant.');
    if (myStore()) throw new Error('Akun ini sudah memiliki toko — 1 akun hanya 1 toko.');
    const name = input.name.trim();
    if (name.length < 3) throw new Error('Nama toko minimal 3 karakter.');
    const pickup = input.pickup_location.trim();
    if (!pickup) throw new Error('Lokasi pickup wajib diisi.');
    const fee = Math.floor(Number(input.delivery_fee));
    if (!Number.isFinite(fee) || fee < 0) throw new Error('Biaya antar tidak valid.');
    const logo = input.logo_url?.trim() ?? '';
    const slug = uniqueSlug(slugify(name));
    const store: Store = {
      id: `store-${Date.now()}`, owner_id: me.id, name, slug,
      description: input.description?.trim() || 'Toko merchant SOUQNA.',
      ...(logo ? { logo_url: logo } : {}),
      pickup_location: pickup, delivery_available: input.delivery_available,
      delivery_fee: input.delivery_available ? fee : 0, status: 'active',
    };
    extraStores().push(store);
    saveExtraStores();
    attachStore(store.id);
    return { ...store };
  },
  async updateMyStore(patch: {
    name?: string; description?: string; logo_url?: string;
    pickup_location?: string; delivery_available?: boolean; delivery_fee?: number;
  }): Promise<Store> {
    await delay(250);
    if (!currentSession()) throw new Error('Wajib login.');
    const s = myStore();
    if (!s) throw new Error('Belum punya toko.');
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (name.length < 3) throw new Error('Nama toko minimal 3 karakter.');
      s.name = name;
    }
    if (patch.description !== undefined) s.description = patch.description.trim();
    if (patch.logo_url !== undefined) {
      if (patch.logo_url.trim()) s.logo_url = patch.logo_url.trim();
      else delete s.logo_url;
    }
    if (patch.pickup_location !== undefined) {
      if (!patch.pickup_location.trim()) throw new Error('Lokasi pickup wajib diisi.');
      s.pickup_location = patch.pickup_location.trim();
    }
    if (patch.delivery_available !== undefined) s.delivery_available = patch.delivery_available;
    if (patch.delivery_fee !== undefined) {
      const fee = Math.floor(Number(patch.delivery_fee));
      if (!Number.isFinite(fee) || fee < 0) throw new Error('Biaya antar tidak valid.');
      s.delivery_fee = fee;
    }
    if (!s.delivery_available) s.delivery_fee = 0;
    persistStore(s);
    return { ...s };
  },
  async getMyProducts(): Promise<Product[]> {
    await delay(200);
    if (!currentSession()) throw new Error('Wajib login.');
    const s = myStore();
    if (!s) throw new Error('Belum punya toko.');
    return allProducts()
      .filter((p) => p.store_id === s.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v })) }));
  },
  async createMyProduct(input: {
    name: string; category_id: string; description?: string;
    status?: Product['status']; image_url?: string;
    variants: { label: string; price: number; stock_quantity: number }[];
  }): Promise<Product> {
    await delay(300);
    if (!currentSession()) throw new Error('Wajib login.');
    const s = myStore();
    if (!s) throw new Error('Belum punya toko.');
    const name = input.name.trim();
    if (name.length < 3) throw new Error('Nama produk minimal 3 karakter.');
    if (!categories.some((c) => c.id === input.category_id && c.is_active))
      throw new Error('Kategori tidak valid.');
    const status = input.status ?? 'draft';
    if (!['draft', 'published', 'hidden'].includes(status))
      throw new Error('Status tidak valid (draft/published/hidden).');
    if (!input.variants || input.variants.length === 0)
      throw new Error('Produk minimal punya 1 varian.');
    const now = new Date().toISOString();
    const id = `prod-${Date.now()}`;
    const variants: ProductVariant[] = input.variants.map((v, i) => {
      const label = v.label.trim();
      if (!label) throw new Error(`Varian ke-${i + 1}: label wajib diisi.`);
      const price = Math.floor(Number(v.price));
      const stock = Math.floor(Number(v.stock_quantity));
      if (!Number.isFinite(price) || price < 0) throw new Error(`Varian "${label}": harga tidak valid.`);
      if (!Number.isFinite(stock) || stock < 0) throw new Error(`Varian "${label}": stok tidak valid.`);
      return {
        id: `var-${Date.now()}-${i}`, product_id: id, label,
        options: { varian: label }, price, stock_quantity: stock, is_active: true,
      };
    });
    const p: Product = {
      id, store_id: s.id, category_id: input.category_id, name,
      slug: `${slugify(name)}-${id.slice(-4)}`,
      description: input.description?.trim() || '-',
      status, image_url: input.image_url?.trim() || `https://picsum.photos/seed/${id}/600/600`,
      variants, created_at: now,
    };
    extraProducts().push(p);
    saveExtraProducts();
    return { ...p, variants: p.variants.map((v) => ({ ...v })) };
  },
  async updateMyProduct(id: string, patch: {
    name?: string; category_id?: string; description?: string;
    status?: Product['status']; image_url?: string;
  }): Promise<Product> {
    await delay(250);
    if (!currentSession()) throw new Error('Wajib login.');
    const s = myStore();
    if (!s) throw new Error('Belum punya toko.');
    const p = allProducts().find((x) => x.id === id);
    if (!p) throw new Error('Produk tidak ditemukan.');
    if (p.store_id !== s.id) throw new Error('Bukan produk tokomu — tidak bisa diubah.');
    if (patch.name !== undefined) {
      if (patch.name.trim().length < 3) throw new Error('Nama produk minimal 3 karakter.');
      p.name = patch.name.trim();
    }
    if (patch.category_id !== undefined) {
      if (!categories.some((c) => c.id === patch.category_id && c.is_active))
        throw new Error('Kategori tidak valid.');
      p.category_id = patch.category_id;
    }
    if (patch.description !== undefined) p.description = patch.description.trim();
    if (patch.status !== undefined) {
      if (!['draft', 'published', 'hidden'].includes(patch.status))
        throw new Error('Status tidak valid (draft/published/hidden).');
      p.status = patch.status;
    }
    if (patch.image_url !== undefined && patch.image_url.trim()) p.image_url = patch.image_url.trim();
    persistProduct(p);
    return { ...p, variants: p.variants.map((v) => ({ ...v })) };
  },
  async deleteMyProduct(id: string): Promise<void> {
    await delay(250);
    if (!currentSession()) throw new Error('Wajib login.');
    const s = myStore();
    if (!s) throw new Error('Belum punya toko.');
    const p = allProducts().find((x) => x.id === id);
    if (!p) throw new Error('Produk tidak ditemukan.');
    if (p.store_id !== s.id) throw new Error('Bukan produk tokomu — tidak bisa dihapus.');
    const extras = extraProducts();
    const i = extras.findIndex((x) => x.id === id);
    if (i >= 0) {
      extras.splice(i, 1);
      saveExtraProducts();
    } else {
      // Arsip aman: hidden agar snapshot order tetap valid.
      p.status = 'hidden';
      persistProduct(p);
    }
  },
  async createMyVariant(productId: string, input: {
    label: string; price: number; stock_quantity: number;
  }): Promise<ProductVariant> {
    await delay(250);
    if (!currentSession()) throw new Error('Wajib login.');
    const s = myStore();
    if (!s) throw new Error('Belum punya toko.');
    const p = allProducts().find((x) => x.id === productId);
    if (!p) throw new Error('Produk tidak ditemukan.');
    if (p.store_id !== s.id) throw new Error('Bukan produk tokomu.');
    const label = input.label.trim();
    if (!label) throw new Error('Label varian wajib diisi.');
    const price = Math.floor(Number(input.price));
    const stock = Math.floor(Number(input.stock_quantity));
    if (!Number.isFinite(price) || price < 0) throw new Error('Harga tidak valid.');
    if (!Number.isFinite(stock) || stock < 0) throw new Error('Stok tidak valid.');
    const v: ProductVariant = {
      id: `var-${Date.now()}`, product_id: p.id, label,
      options: { varian: label }, price, stock_quantity: stock, is_active: true,
    };
    p.variants.push(v);
    persistProduct(p);
    persistStock();
    saveExtraProducts();
    return { ...v };
  },
  async updateMyVariant(variantId: string, patch: {
    label?: string; price?: number; stock_quantity?: number; is_active?: boolean;
  }): Promise<ProductVariant> {
    await delay(250);
    if (!currentSession()) throw new Error('Wajib login.');
    const s = myStore();
    if (!s) throw new Error('Belum punya toko.');
    const p = allProducts().find((x) => x.variants.some((v) => v.id === variantId));
    if (!p) throw new Error('Varian tidak ditemukan.');
    if (p.store_id !== s.id) throw new Error('Bukan produk tokomu.');
    const v = p.variants.find((x) => x.id === variantId)!;
    if (patch.label !== undefined) {
      if (!patch.label.trim()) throw new Error('Label varian wajib diisi.');
      v.label = patch.label.trim();
    }
    if (patch.price !== undefined) {
      const price = Math.floor(Number(patch.price));
      if (!Number.isFinite(price) || price < 0) throw new Error('Harga tidak valid.');
      v.price = price;
    }
    if (patch.stock_quantity !== undefined) {
      const stock = Math.floor(Number(patch.stock_quantity));
      if (!Number.isFinite(stock) || stock < 0) throw new Error('Stok tidak valid.');
      v.stock_quantity = stock;
    }
    if (patch.is_active !== undefined) v.is_active = patch.is_active;
    persistProduct(p);
    persistStock();
    saveExtraProducts();
    return { ...v };
  },
  // --- Wishlist per user (unique), wajib login ---
  async getWishlist(): Promise<WishlistItem[]> {
    await delay(150);
    const me = currentSession();
    if (!me) throw new Error('Wajib login untuk membuka wishlist.');
    return allWishlist().filter((w) => w.user_id === me.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async isWishlisted(productId: string): Promise<boolean> {
    await delay(100);
    const me = currentSession();
    if (!me) return false;
    return allWishlist().some((w) => w.user_id === me.id && w.product_id === productId);
  },
  async addToWishlist(productId: string): Promise<WishlistItem[]> {
    await delay(200);
    const me = currentSession();
    if (!me) throw new Error('Wajib login untuk menyimpan wishlist.');
    const p = allProducts().find((x) => x.id === productId);
    if (!p) throw new Error('Produk tidak ditemukan.');
    const st = allStores().find((x) => x.id === p.store_id);
    if (p.status !== 'published' || !st || st.status !== 'active')
      throw new Error('Produk tidak tersedia untuk wishlist.');
    if (allWishlist().some((w) => w.user_id === me.id && w.product_id === productId))
      throw new Error('Sudah ada di wishlist.');
    extraWishlist().push({
      id: `w-${Date.now()}`, user_id: me.id, product_id: productId,
      created_at: new Date().toISOString(),
    });
    saveWishlist();
    return allWishlist().filter((w) => w.user_id === me.id);
  },
  async removeFromWishlist(productId: string): Promise<WishlistItem[]> {
    await delay(200);
    const me = currentSession();
    if (!me) throw new Error('Wajib login.');
    const wl = extraWishlist();
    const i = wl.findIndex((w) => w.user_id === me.id && w.product_id === productId);
    if (i >= 0) {
      wl.splice(i, 1);
      saveWishlist();
    } else if (wishlist.some((w) => w.user_id === me.id && w.product_id === productId)) {
      // Seed bersifat read-only: catat tombstone agar hapus persist.
      const tomb = readJSON<string[]>(WL_DEL_KEY, []);
      const seed = wishlist.find((w) => w.user_id === me.id && w.product_id === productId)!;
      if (!tomb.includes(seed.id)) {
        tomb.push(seed.id);
        writeJSON(WL_DEL_KEY, tomb);
      }
    }
    return allWishlist().filter((w) => w.user_id === me.id);
  },

  // --- Chat teks per toko (wajib login; purge >7 hari disimulasikan) ---
  async getConversations(): Promise<Conversation[]> {
    await delay(150);
    const me = currentSession();
    if (!me) throw new Error('Wajib login untuk membuka chat.');
    const mineStores = new Set(allStores().filter((s) => s.owner_id === me.id).map((s) => s.id));
    return allConversations().filter((c) => c.buyer_id === me.id || mineStores.has(c.store_id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async getOrCreateConversation(storeId: string): Promise<Conversation> {
    await delay(200);
    const me = currentSession();
    if (!me) throw new Error('Wajib login untuk chat.');
    const st = allStores().find((x) => x.id === storeId);
    if (!st) throw new Error('Toko tidak ditemukan.');
    const ex = allConversations().find((c) => c.buyer_id === me.id && c.store_id === storeId);
    if (ex) return ex;
    const c: Conversation = {
      id: `conv-${Date.now()}`, buyer_id: me.id, store_id: storeId,
      created_at: new Date().toISOString(),
    };
    extraConversations().push(c);
    saveConversations();
    return c;
  },
  async getMessages(convId: string): Promise<{ messages: Message[]; hidden: number }> {
    await delay(150);
    const me = currentSession();
    if (!me) throw new Error('Wajib login.');
    const conv = allConversations().find((c) => c.id === convId);
    if (!conv) throw new Error('Thread tidak ditemukan.');
    if (!isParticipant(conv, me.id)) throw new Error('Bukan peserta thread ini.');
    // Simulasi purge: pesan >7 hari disembunyikan, thread tetap ada.
    const cutoff = Date.now() - 7 * 86400000;
    const all = allMessages()
      .filter((m) => m.conversation_id === convId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const visible = all.filter((m) => new Date(m.created_at).getTime() >= cutoff);
    return { messages: visible, hidden: all.length - visible.length };
  },
  async sendMessage(convId: string, body: string): Promise<Message> {
    await delay(200);
    const me = currentSession();
    if (!me) throw new Error('Wajib login.');
    const conv = allConversations().find((c) => c.id === convId);
    if (!conv) throw new Error('Thread tidak ditemukan.');
    if (!isParticipant(conv, me.id)) throw new Error('Bukan peserta thread ini.');
    const text = body.trim();
    if (!text) throw new Error('Pesan tidak boleh kosong.');
    if (text.length > 2000) throw new Error('Pesan maksimal 2000 karakter.');
    const m: Message = {
      id: `m-${Date.now()}`, conversation_id: convId, sender_id: me.id,
      body: text, created_at: new Date().toISOString(),
    };
    extraMessages().push(m);
    saveMessages();
    return m;
  },

  // --- Ulasan: hanya order-item completed milik sendiri, 1 per item ---
  async getReviews(productId: string) {
    await delay();
    return allReviews().filter((r) => r.product_id === productId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async getReviewForItem(orderItemId: string): Promise<Review | null> {
    await delay(100);
    return allReviews().find((r) => r.order_item_id === orderItemId) ?? null;
  },
  async createReview(orderItemId: string, rating: number, reviewText?: string): Promise<Review> {
    await delay(250);
    const me = currentSession();
    if (!me) throw new Error('Wajib login untuk memberi ulasan.');
    const item = [...seedOrderItems, ...extraOrderItems()].find((i) => i.id === orderItemId);
    if (!item) throw new Error('Item pesanan tidak ditemukan.');
    const order = findOrder(item.order_id);
    if (!order || order.buyer_id !== me.id) throw new Error('Hanya item milikmu yang bisa diulas.');
    if (order.status !== 'completed') throw new Error('Ulasan hanya untuk pesanan selesai (completed).');
    if (allReviews().some((r) => r.order_item_id === orderItemId))
      throw new Error('Sudah memberi ulasan untuk item ini (1 ulasan per item).');
    const rate = Math.floor(Number(rating));
    if (!Number.isFinite(rate) || rate < 1 || rate > 5) throw new Error('Rating 1–5.');
    const text = reviewText?.trim() ?? '';
    if (text.length > 500) throw new Error('Ulasan maksimal 500 karakter.');
    const r: Review = {
      id: `r-${Date.now()}`, order_item_id: orderItemId, product_id: item.product_id,
      buyer_id: me.id, rating: rate, ...(text ? { review_text: text } : {}),
      created_at: new Date().toISOString(),
    };
    extraReviews().push(r);
    saveReviews();
    return r;
  },
  async getVouchers() { await delay(); return allVouchers(); },
  async validateVoucher(code: string, subtotal: number) {
    await delay(200);
    const r = voucherAmount(code, subtotal);
    if (!r.ok) return { ok: false as const, reason: (r as { reason: string }).reason };
    return { ok: true as const, amount: (r as { amount: number }).amount };
  },
  async getUsers() { await delay(); return allUsers(); },

  // --- Admin (mock-first; semua aksi juga dicatat di audit log) ---
  async getAdminStats() {
    requireAdmin();
    await delay(200);
    const orders = allOrders();
    const byStatus: Record<string, number> = {};
    for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    const prods = allProducts();
    return {
      users: allUsers().length,
      stores: allStores().length,
      activeStores: allStores().filter((s) => s.status === 'active').length,
      products: prods.length,
      publishedProducts: prods.filter((p) => p.status === 'published').length,
      orders: orders.length,
      ordersByStatus: byStatus,
      revenue: orders.filter((o) => o.status === 'completed')
        .reduce((s, o) => s + o.grand_total, 0),
      activeVouchers: allVouchers().filter((v) => v.is_active).length,
      reviews: allReviews().length,
      conversations: allConversations().length,
    };
  },
  async getAdminUsers() {
    requireAdmin();
    await delay(150);
    return allUsers();
  },
  async sendPasswordRecovery(userId: string) {
    requireAdmin();
    await delay(250);
    const u = allUsers().find((x) => x.id === userId);
    if (!u) throw new Error('Pengguna tidak ditemukan.');
    logAdmin('send_password_recovery', 'user', userId, { email: u.email });
    return { ok: true as const, message: `Tautan pemulihan dikirim ke ${u.email} (dummy).` };
  },
  async deleteAdminUser(userId: string) {
    requireAdmin();
    await delay(300);
    const u = allUsers().find((x) => x.id === userId);
    if (!u) throw new Error('Pengguna tidak ditemukan.');
    if (u.role === 'admin') throw new Error('Akun admin tidak dapat dihapus.');

    // Cek apakah user memiliki pesanan aktif yang belum selesai
    const activeOrders = allOrders().filter(
      (o) => (o.buyer_id === userId || (u.store_id && o.store_id === u.store_id)) &&
             !['completed', 'cancelled', 'rejected'].includes(o.status)
    );
    if (activeOrders.length > 0) {
      throw new Error(`Gagal: Pengguna memiliki ${activeOrders.length} pesanan COD aktif yang belum selesai.`);
    }

    // Anonimisasi data user (simulasi mock)
    const ov = readJSON<Record<string, Partial<MockUser>>>('souqna:profile-overrides', {});
    ov[userId] = {
      ...ov[userId],
      full_name: 'Pengguna Dinonaktifkan (Anonim)',
      email: `anonymized-${userId}@souqna.id`,
      phone: undefined,
      default_location: undefined,
    };
    writeJSON('souqna:profile-overrides', ov);

    logAdmin('delete_user', 'user', userId, { anonymized: true, previous_email: u.email });
    return { ok: true as const, message: `Akun ${u.email} berhasil dinonaktifkan dan dianonimisasi (Simulasi).` };
  },
  async getAdminCategories() {
    requireAdmin();
    await delay(150);
    return allCategories();
  },
  async createCategory(input: { name: string; description?: string }) {
    requireAdmin();
    await delay(250);
    const name = input.name.trim();
    if (name.length < 3) throw new Error('Nama kategori minimal 3 karakter.');
    const slugBase = slugify(name);
    const taken = new Set(allCategories().map((c) => c.slug));
    let slug = slugBase;
    let i = 2;
    while (taken.has(slug)) slug = `${slugBase}-${i++}`;
    const c: Category = {
      id: `cat-${Date.now()}`, name, slug,
      description: input.description?.trim(), is_active: true,
    };
    extraCategories().push(c);
    saveCategories();
    logAdmin('create_category', 'category', c.id, { name });
    return c;
  },
  async updateCategory(id: string, patch: { name?: string; description?: string; is_active?: boolean }) {
    requireAdmin();
    await delay(250);
    const c = allCategories().find((x) => x.id === id);
    if (!c) throw new Error('Kategori tidak ditemukan.');
    if (patch.name !== undefined) {
      if (patch.name.trim().length < 3) throw new Error('Nama kategori minimal 3 karakter.');
      c.name = patch.name.trim();
    }
    if (patch.description !== undefined) c.description = patch.description.trim();
    if (patch.is_active !== undefined) c.is_active = patch.is_active;
    persistCategory(c);
    logAdmin('update_category', 'category', id, { ...patch });
    return { ...c };
  },
  async deleteCategory(id: string) {
    requireAdmin();
    await delay(250);
    const c = allCategories().find((x) => x.id === id);
    if (!c) throw new Error('Kategori tidak ditemukan.');
    // Nonaktif saja agar produk historis tetap terbaca.
    c.is_active = false;
    persistCategory(c);
    logAdmin('delete_category', 'category', id, { name: c.name });
  },
  async getAdminProducts(q?: string) {
    requireAdmin();
    await delay(200);
    const query = (q ?? '').toLowerCase();
    return allProducts()
      .filter((p) => !query || `${p.name} ${p.slug}`.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async setProductStatusAdmin(productId: string, status: 'published' | 'hidden' | 'suspended') {
    requireAdmin();
    await delay(250);
    const p = allProducts().find((x) => x.id === productId);
    if (!p) throw new Error('Produk tidak ditemukan.');
    p.status = status;
    persistProduct(p);
    logAdmin('moderate_product', 'product', productId, { status });
    return { ...p };
  },
  async getAdminOrders() {
    requireAdmin();
    await delay(200);
    return allOrders();
  },
  async getAdminVouchers() {
    requireAdmin();
    await delay(150);
    return allVouchers().sort((a, b) => a.code.localeCompare(b.code));
  },
  async createVoucher(input: {
    code: string; description?: string; discount_type: 'percentage' | 'fixed_amount';
    discount_value: number; minimum_subtotal: number; maximum_discount?: number;
    starts_at: string; ends_at: string; is_active?: boolean;
  }) {
    requireAdmin();
    await delay(250);
    const code = input.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,20}$/.test(code)) throw new Error('Kode 3–20 char alfanumerik.');
    if (allVouchers().some((v) => v.code === code)) throw new Error('Kode voucher sudah dipakai.');
    if (!['percentage', 'fixed_amount'].includes(input.discount_type)) throw new Error('Tipe diskon tidak valid.');
    const value = Number(input.discount_value);
    if (!Number.isFinite(value) || value <= 0) throw new Error('Nilai diskon tidak valid.');
    if (input.discount_type === 'percentage' && value > 100) throw new Error('Persen maksimal 100.');
    const min = Number(input.minimum_subtotal);
    if (!Number.isFinite(min) || min < 0) throw new Error('Min. subtotal tidak valid.');
    const start = new Date(input.starts_at);
    const end = new Date(input.ends_at);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end)
      throw new Error('Rentang tanggal tidak valid.');
    const v: Voucher = {
      id: `v-${Date.now()}`, code,
      description: input.description?.trim() || code,
      discount_type: input.discount_type, discount_value: value,
      minimum_subtotal: Math.floor(min),
      ...(input.maximum_discount != null ? { maximum_discount: Math.floor(Number(input.maximum_discount)) } : {}),
      starts_at: start.toISOString(), ends_at: end.toISOString(),
      is_active: input.is_active ?? true,
    };
    extraVouchers().push(v);
    saveVouchers();
    logAdmin('create_voucher', 'voucher', v.id, { code });
    return v;
  },
  async updateVoucher(id: string, patch: {
    description?: string; discount_value?: number; minimum_subtotal?: number;
    maximum_discount?: number; starts_at?: string; ends_at?: string; is_active?: boolean;
  }) {
    requireAdmin();
    await delay(250);
    const v = allVouchers().find((x) => x.id === id);
    if (!v) throw new Error('Voucher tidak ditemukan.');
    if (patch.description !== undefined) v.description = patch.description.trim();
    if (patch.discount_value !== undefined) {
      const value = Number(patch.discount_value);
      if (!Number.isFinite(value) || value <= 0) throw new Error('Nilai diskon tidak valid.');
      if (v.discount_type === 'percentage' && value > 100) throw new Error('Persen maksimal 100.');
      v.discount_value = value;
    }
    if (patch.minimum_subtotal !== undefined) {
      const min = Number(patch.minimum_subtotal);
      if (!Number.isFinite(min) || min < 0) throw new Error('Min. subtotal tidak valid.');
      v.minimum_subtotal = Math.floor(min);
    }
    if (patch.maximum_discount !== undefined) v.maximum_discount = Math.floor(Number(patch.maximum_discount));
    if (patch.starts_at !== undefined) {
      const d = new Date(patch.starts_at);
      if (isNaN(d.getTime())) throw new Error('Tanggal mulai tidak valid.');
      v.starts_at = d.toISOString();
    }
    if (patch.ends_at !== undefined) {
      const d = new Date(patch.ends_at);
      if (isNaN(d.getTime())) throw new Error('Tanggal berakhir tidak valid.');
      v.ends_at = d.toISOString();
    }
    if (new Date(v.starts_at) >= new Date(v.ends_at)) throw new Error('Rentang tanggal tidak valid.');
    if (patch.is_active !== undefined) v.is_active = patch.is_active;
    persistVoucher(v);
    logAdmin('update_voucher', 'voucher', id, { ...patch });
    return { ...v };
  },
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    requireAdmin();
    await delay(150);
    return extraAuditLogs();
  },
};

export { stores };
