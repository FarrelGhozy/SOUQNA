# Strategi Mock Web (Fokus Saat Ini)

Backend ditunda. Web jalan penuh dengan data dummy lokal agar UI/flow bisa didemo.

## Lokasi

```
frontend/src/mocks/
├── categories.mock.ts   # 6 kategori
├── stores.mock.ts       # 4 toko (2 delivery, 1 pickup-only, 1 inactive)
├── products.mock.ts     # ~20 produk + variants + images (picsum + fallback)
├── users.mock.ts        # pembeli, merchant, admin (switch role di UI, bukan Supabase real)
├── cart.mock.ts         # cart awal multi-toko
├── orders.mock.ts       # checkouts + orders semua status
├── wishlist.mock.ts
├── chat.mock.ts         # threads + messages (<7 hari & >7 hari untuk uji purge UI)
├── reviews.mock.ts
└── vouchers.mock.ts     # 1 valid, 1 expired, 1 min-subtotal-tinggi
frontend/src/lib/
├── api-client.ts        # fungsi async Promise<> per docs/api-contract.md, baca mocks + localStorage
├── format.ts            # formatIDR, formatDate Asia/Jakarta
└── mock-auth.ts         # login dummy email apa saja, pilih peran
```

## Aturan

- Komponen/page dilarang import mock langsung — lewat `api-client` saja agar ganti ke Axios real tinggal 1 file.
- Bentuk field sama dengan `docs/data-model.md` (snake_case sama seperti API).
- Harga/stok/total dihitung helper, bukan angka ketikan komponen (simulasi §9).
- Gambar: `https://picsum.photos/seed/<slug>/600/600` + `onError` fallback `/placeholder.svg`.
- State cart/wishlist/auth di `localStorage` (`souqna:*`) agar reload tidak hilang.
- Simulasi keterlambatan: `await delay(300)` di api-client agar loading/empty/error states teruji.
- Voucher: validasi di `api-client` (aktif, expired, min subtotal) meniru backend.
- Checkout dummy: buat `checkouts` + N `orders` di memori/localStorage, kurangi stok mock, kosongkan cart.
- Order transition dummy: hanya izinkan transisi legal (§roles-flows); tolak + toast jika ilegal.
- Chat: filter pesan `>7 hari` disembunyikan di UI (simulasi purge).

## Daftar mock yang harus ada

Lihat `frontend/src/mocks/` — tiap file export array + type dari `src/types/`.
