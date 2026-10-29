# 7. Kontrak API `/api/v1`

> Disarikan dari §10. Backend belum ada — mock frontend/flutter harus meniru bentuk request/response ini agar tinggal ganti base URL nanti.

## Health & profil

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/health` | publik |
| GET | `/me` | login |
| PATCH | `/me` | login |
| POST | `/me/delete-request` | login (opsional UX) |

## Katalog & toko (publik)

`GET /categories`, `GET /products?q&categoryId&storeId&minPrice&maxPrice&sort&page&limit`, `GET /products/:id`, `GET /stores/:id`, `GET /stores/:id/products`.

## Merchant & produk

`POST /merchant/store` (login, belum punya toko), `GET/PATCH /merchant/store`, `GET /merchant/products`, `POST /merchant/products`, `GET/PATCH/DELETE /merchant/products/:id`, `POST /merchant/products/:id/variants`, `PATCH/DELETE /merchant/variants/:id`, `POST /uploads/sign`.

## Keranjang & checkout (login)

`GET /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/:itemId`, `POST /checkout/validate`, `POST /checkout`, `GET /checkouts/:id`.
Body checkout: varian+qty, pemenuhan per toko, lokasi, kode voucher. Harga/diskon/total dihitung server.

## Pesanan

Pembeli: `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancel` (hanya saat pending), `POST /orders/:id/confirm-received`.
Merchant: `GET /merchant/orders`, `POST /merchant/orders/:id/accept|reject|ready-for-pickup|out-for-delivery|mark-paid`.
Tanpa endpoint generik ubah status sembarang.

## Wishlist, ulasan, chat

`GET /wishlist`, `POST/DELETE /wishlist/:productId`, `GET /products/:id/reviews`, `POST /order-items/:itemId/review` (completed milik sendiri), `GET /conversations`, `POST /conversations`, `GET/POST /conversations/:id/messages`.

## Admin (`/admin/*` + middleware role)

`GET /admin/users`, `POST /admin/users/:id/send-password-recovery`, `DELETE /admin/users/:id`, `POST/PATCH/DELETE /admin/categories/:id`, `GET /admin/products`, `POST /admin/products/:id/hide|publish`, `GET /admin/orders`, `GET/POST/PATCH /admin/vouchers...`, `GET /admin/audit-logs`.

## Bentuk mock

- `frontend/src/lib/api-client.ts` sediakan fungsi per grup di atas, kembalikan `Promise` dari `mocks/`.
- `flutter/lib/core/api/*` mirror nama yang sama.
- Simpan contoh JSON respons di `docs/api-contract.md` nanti (OpenAPI menyusul saat backend mulai).
