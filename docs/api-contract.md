# 7. Kontrak API `/api/v1`

> Disarikan dari §10. Backend belum ada — mock frontend/flutter meniru bentuk
> request/response ini. `docs/openapi.yaml` adalah stub; jangan menganggap semua
> endpoint sudah lengkap.

## 7.1 Konvensi

- Base path: `/api/v1`.
- Auth: `Authorization: Bearer <access_token>` untuk endpoint login.
- JSON snake_case; harga integer IDR; waktu ISO-8601, tampil Asia/Jakarta.
- Pagination: `page` (mulai 1), `limit` (default 12, maks 50).
- Response list: `{ data, total, page, limit }`.
- Error: `{ error: { code, message, details? } }` dengan HTTP status sesuai.
- Jangan percaya `user_id`, `role`, `price`, `total`, `discount`, atau `status`
  dari body klien.

## 7.2 Health & profil

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/health` | publik |
| GET | `/me` | login |
| PATCH | `/me` | login |
| POST | `/me/delete-request` | login (opsional UX) |

## 7.3 Katalog & toko (publik)

- `GET /categories`
- `GET /products?q&categoryId&storeId&minPrice&maxPrice&sort&page&limit`
- `GET /products/:id`
- `GET /stores/:id`
- `GET /stores/:id/products`
- `GET /products/:id/reviews`

Produk hidden/nonaktif/toko nonaktif tidak boleh muncul sebagai dapat dibeli.
Detail produk publik tidak boleh membocorkan data admin.

## 7.4 Merchant & produk

- `POST /merchant/store` (login, belum punya toko)
- `GET/PATCH /merchant/store`
- `GET /merchant/products`
- `POST /merchant/products`
- `GET/PATCH/DELETE /merchant/products/:id`
- `POST /merchant/products/:id/variants`
- `PATCH/DELETE /merchant/variants/:id`
- `POST /uploads/sign`

Semua mutasi wajib cek kepemilikan toko, bukan `store_id` dari klien.

## 7.5 Keranjang & checkout (login)

- `GET /cart`
- `POST /cart/items`
- `PATCH/DELETE /cart/items/:itemId`
- `POST /checkout/validate`
- `POST /checkout`
- `GET /checkouts/:id`

Body checkout: varian+qty, pemenuhan per toko, lokasi, kode voucher.
Harga/diskon/fee/total dihitung server. 1 checkout → N order (1 per toko).
Gagal satu item = gagal atomik, tanpa mutasi stok/order.
`GET /checkouts/:id` hanya untuk pembeli pemilik, merchant terkait, atau admin.

## 7.6 Pesanan

Pembeli:

- `GET /orders` — **hanya order milik sendiri**
- `GET /orders/:id` — hanya pemilik/admin
- `POST /orders/:id/cancel` — hanya saat pending
- `POST /orders/:id/confirm-received` — hanya pembeli

Merchant:

- `GET /merchant/orders` — hanya toko sendiri
- `POST /merchant/orders/:id/accept`
- `POST /merchant/orders/:id/reject`
- `POST /merchant/orders/:id/ready-for-pickup`
- `POST /merchant/orders/:id/out-for-delivery`
- `POST /merchant/orders/:id/mark-paid`

Tanpa endpoint generik ubah status. Transisi ilegal → 409/422 + pesan jelas.

## 7.7 Wishlist, ulasan, chat

- `GET /wishlist`
- `POST/DELETE /wishlist/:productId`
- `GET /products/:id/reviews`
- `POST /order-items/:itemId/review` — completed milik sendiri, 1 per item
- `GET /conversations`
- `POST /conversations`
- `GET/POST /conversations/:id/messages` — peserta thread; pesan >7 hari
  disembunyikan

## 7.8 Admin (`/admin/*` + middleware role)

- `GET /admin/users`
- `POST /admin/users/:id/send-password-recovery`
- `DELETE /admin/users/:id`
- `POST/PATCH/DELETE /admin/categories/:id`
- `GET /admin/products`
- `POST /admin/products/:id/hide|publish`
- `GET /admin/orders`
- `GET/POST/PATCH/DELETE /admin/vouchers...`
- `GET /admin/audit-logs`

Admin tidak memproses pembayaran dan tidak boleh melihat password.

## 7.9 Bentuk mock

- `frontend/src/lib/api-client.ts` menyediakan fungsi per grup dan menghitung
  total di helper (simulasi server).
- `flutter/lib/core/api/api_client.dart` mirror nama/behavior yang sama.
- Saat backend siap: ganti transport ke Axios/Dio, pertahankan bentuk data.
- Gap mock yang diketahui (order/cart ownership) ada di
  `docs/implementation-audit.md`; perbaikan issue #11.
