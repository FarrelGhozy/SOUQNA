# Strategi Mock Web

Backend ditunda. Web berjalan penuh dengan data dummy lokal agar UI dan alur
bisa didemokan. Dokumen ini menjelaskan **kondisi aktual**; target redesign ada
di `docs/design-system.md` dan issue M10.

## 1. Lokasi dan tanggung jawab

```text
frontend/src/
├── mocks/
│   ├── categories.mock.ts   # 6 kategori
│   ├── stores.mock.ts       # 4 toko (2 delivery, 1 pickup-only, 1 inactive)
│   ├── products.mock.ts     # 20 produk + varian + gambar
│   └── extras.mock.ts       # users, cart seed, checkout, order, order item,
│                            # wishlist, chat, review, voucher
├── lib/
│   ├── api-client.ts        # seluruh operasi bisnis + hitung server-side
│   ├── mock-auth.ts         # sesi, login/register dummy, override profil
│   └── format.ts            # formatIDR, formatDateWIB, delay
└── types/index.ts           # tipe snake_case
```

Tidak ada `users.mock.ts`, `cart.mock.ts`, `orders.mock.ts`, `wishlist.mock.ts`,
`chat.mock.ts`, `reviews.mock.ts`, atau `vouchers.mock.ts` terpisah. Seed
tersebut berada di `extras.mock.ts` dan operasi runtime disimpan di
`localStorage` oleh `api-client.ts`.

## 2. Aturan

- Komponen/page/layout/route **dilarang** import `mocks/` langsung. Semua lewat
  `src/lib/api-client.ts`.
- Bentuk field sama dengan `docs/data-model.md` (snake_case).
- Harga/stok/total/voucher dihitung helper di `api-client`, bukan input komponen.
- Gambar: `https://picsum.photos/seed/<slug>/600/600` + `onError` fallback
  `/placeholder.svg`.
- Simulasi latency: `delay(200–400ms)` agar loading state terlihat.
- Voucher divalidasi di `api-client`: aktif, masa berlaku, minimum subtotal.
- Checkout dummy: hitung ulang, kurangi stok, buat 1 checkout + N order,
  kosongkan cart. Gagal validasi = tidak ada mutasi.
- Transisi order hanya legal sesuai `docs/roles-flows.md`; stok kembali sekali
  saat cancel/reject.
- Chat: pesan lebih dari 7 hari disembunyikan; thread tetap ada.

## 3. localStorage

Semua key berprefix `souqna:`. Ini adalah simulasi database, bukan kontrak
backend.

| Key | Isi |
|---|---|
| `souqna:session` | Snapshot user login |
| `souqna:extra-users` | User yang dibuat lewat email asing |
| `souqna:profile-overrides` | Override nama/telepon/lokasi/hasStore |
| `souqna:cart` | Cart aktif (catatan: masih global, lihat §5) |
| `souqna:extra-stores`, `souqna:store-overrides` | Toko merchant baru/ubah |
| `souqna:extra-products`, `souqna:product-overrides` | Produk merchant baru/ubah |
| `souqna:stock-overrides`, `souqna:stock-returned` | Stok dan idempotensi |
| `souqna:extra-checkouts`, `souqna:extra-orders`, `souqna:extra-order-items` | Checkout/order baru |
| `souqna:order-overrides`, `souqna:extra-history` | Status dan histori |
| `souqna:wishlist`, `souqna:wishlist-deleted` | Wishlist + tombstone |
| `souqna:extra-conversations`, `souqna:extra-messages` | Chat |
| `souqna:extra-reviews` | Ulasan baru |
| `souqna:extra-categories`, `souqna:category-overrides` | Kategori admin |
| `souqna:extra-vouchers`, `souqna:voucher-overrides` | Voucher admin |
| `souqna:extra-audit-logs` | Audit log admin |

## 4. Reset data demo

```js
// DevTools console di http://localhost:5173
Object.keys(localStorage)
  .filter((k) => k.startsWith('souqna:'))
  .forEach((k) => localStorage.removeItem(k));
location.reload();
```

## 5. Batasan yang diketahui

1. **Cart masih global** (`souqna:cart`), belum per user. Ganti akun masih
   melihat cart yang sama. Perbaikan: issue #11.
2. **Order pembeli belum difilter per buyer**; `getOrders()` mengembalikan semua
   order. Perbaikan: issue #11.
3. **`getOrder`/`getCheckout` belum memeriksa kepemilikan**. Perbaikan: issue #11.
4. Beberapa field snapshot backend (`handover_location_snapshot`, snapshot
   pembeli) belum ada di tipe mock. Akan diselaraskan saat backend dimulai.
5. Admin delete account/reset password belum ada di UI; lihat issue #21.

## 6. Verifikasi

```bash
cd frontend && bun run build
cd frontend && bunx tsc --noEmit
./scripts/demo-e2e.sh
```
