# Parity Audit M8 — Web ↔ Flutter (M1–M6)

Tanggal: 2026-10-29. Admin (M7) web prioritas, Android opsional — tidak wajib parity.

## Data (wajib sama persis)

| Aspek | Web (`frontend/src/mocks/`) | Flutter (`flutter/lib/mocks/`) | Status |
|---|---|---|---|
| Kategori | 6 (`cat-01..06`) | 6 (`cat-01..06`) | ✅ |
| Toko | 4 (`store-01..04`, 2 delivery, 1 pickup-only, 1 inactive) | 4 sama | ✅ |
| Produk+varian | 20 produk, ID `prod-01..20` / `var-01a..`, harga/stok/status sama | 20 sama | ✅ |
| Users | buyer / merchant×? / admin | `user-buyer-1`, `user-merchant-1`, `admin` | ✅ |
| Cart awal | `var-01a×2` + `var-04a×1` multi-toko | sama | ✅ |
| Orders seed | `ord-01` out_for_delivery/unpaid, `ord-02` accepted, `ord-03` completed/paid | sama | ✅ |
| Wishlist/chat/review/voucher | 1 wishlist, conv-01 + 3 pesan (1 >7 hari), 1 review, HEMAT5K valid + KADALUARSA expired | sama | ✅ |
| Aturan | harga server-side, tolak toko inactive/hidden, 1 voucher/checkout, 1 ulasan/item, purge 7 hari | sama (`ApiClient.validateCheckout`, `transitionOrder`, `createReview`, `getMessages`) | ✅ |

## Layar (M1–M6)

| Milestone | Web (`frontend/src/pages/`) | Flutter (`flutter/lib/features/`) | Status M8 |
|---|---|---|---|
| M1 katalog | `HomePage`, `SearchPage`, `CategoryListPage` (`/categories`), `ProductDetailPage`, `StoreDetailPage` | `home_screen`, `search_screen` (+`initialCategoryId`), `category_list_screen` (baru M8, tab Kategori), `product_detail_screen` (varian/stok/habis/fallback + wishlist/review/chat), `store_detail_screen` | ✅ diperbaiki M8 |
| M2 auth | `LoginPage`, `RegisterPage`, `ProfilePage`, guards (`RequireAuth/Merchant/Admin`) | `login_screen`, `register_screen`, `profile_screen`, guard tab (`BottomNav._needsAuth` → LoginScreen) + merchant via akun | ✅ |
| M3 cart/checkout | `CartPage`, `CheckoutPage` (pickup/delivery per toko + voucher), `CheckoutSuccessPage` | `cart_screen`, `checkout_screen` (metode per toko + lokasi + voucher + preview server-side), `checkout_success_screen` | ✅ |
| M4 orders/COD | `OrdersPage`, `OrderDetailPage` (cancel/confirm), `MerchantOrdersPage` (+ reuse detail merchant) | `orders_screen`, `order_detail_screen(isMerchant)` (cancel/accept/reject/ready/out/received/paid + histori + toast ilegal), `merchant_orders_screen` | ✅ |
| M5 merchant | `BecomeMerchantPage`, `MerchantDashboardPage`, `MerchantProductsPage`, `MerchantProductFormPage`, `StoreProfilePage` | `become_merchant_screen`, `merchant_dashboard_screen`, `product_list_screen`, `product_form_screen`, `store_profile_screen` (ownership 1 toko, CRUD milik sendiri) | ✅ |
| M6 pendukung | `WishlistPage`, `ChatPage` (purge banner), review di `ProductDetailPage` + `OrderDetailPage` (completed, 1/item, 1–5), voucher di checkout + `AdminVouchersPage` | `wishlist_screen`, `chat_list_screen` + `thread_screen` (hidden count >7 hari), `_ReviewBox` di order detail + list di product detail, voucher di checkout | ✅ |
| M7 admin | 7 halaman (`Admin*`) | disengaja tidak ada (prioritas web, lihat `flutter-mock.md`) | ✅ by design |

## Gap yang diperbaiki di M8 (commit ini)

1. Hapus `flutter/lib/mocks/souqna_mock.dart` — file mati, duplikat `StoreMock`/`ProductMock` dengan konstruktor beda, isi usang (10 produk). Tidak diimpor siapa pun.
2. `product_detail_screen.dart` tombol `+ Keranjang` tadinya snackbar dummy — sekarang panggil `ApiClient.addToCart(variantId)` asli + error stok/toko.
3. Tab Kategori Flutter tadinya langsung `SearchScreen` — sekarang `CategoryListScreen` (parity `/categories`) → ketuk masuk `SearchScreen(initialCategoryId)`.
4. `SearchScreen` tambah `initialCategoryId` agar deep-link kategori dari daftar berfungsi.

## Kontrak api-client

- Web: `frontend/src/lib/api-client.ts` (`Promise` + `delay`, snake_case, hitung server-side).
- Flutter: `flutter/lib/core/api/api_client.dart` (`Future` + delay, nama grup sama: categories/products/store/cart/checkout/orders/merchant/wishlist/review/chat/voucher).
- Ganti ke backend nyata: flip base URL ke `/api/v1` + Bearer token, tanpa ubah komponen (lihat `docs/openapi.yaml` stub M8).

## Cara verifikasi ulang

```bash
./scripts/demo-e2e.sh
```

Cek: ID mock sama, tidak ada import mock langsung dari UI, tidak ada secret di klien, `bun run build` lolos.
