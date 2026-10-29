# Demo E2E M8 — Web + Android (mock-first)

Alur wajib (lihat `docs/testing-deploy.md` + issue #8): search → login → toko → produk → cart 2 toko → checkout → proses 2 merchant → COD selesai → review/wishlist/chat → voucher → admin.

## 1. Web (desktop + mobile)

```bash
cd frontend && bun install && bun run dev   # http://localhost:5173
```

| Langkah | Aksi | Harapan |
|---|---|---|
| 1 Search | Buka `/search`, ketik `geprek`, filter kategori Makanan, sort termurah | `prod-01` muncul, pagination jalan, empty state bila `q=zzzz` |
| 2 Login | `/login` email apa saja → pilih peran pembeli | sesi `souqna:session`, guard `/cart` lolos |
| 3 Toko | `/stores/store-01` aktif; `/stores/store-04` banner nonaktif | produk toko tampil; toko inactive tidak bisa checkout |
| 4 Produk | `/products/prod-01` pilih varian, cek stok; `/products/prod-16` label habis | harga/stok per varian, `onError` fallback, tombol disable bila habis/hidden |
| 5 Cart 2 toko | tambah `var-01a×2` + `var-04a×1`, buka `/cart` ubah qty/hapus | multi-toko, persist `localStorage`, blokir stok kurang |
| 6 Checkout | `/checkout`: toko-01 `merchant_delivery` + lokasi, toko-02 `pickup`, kode `HEMAT5K` → Hitung total → Buat pesanan | preview server-side `sub − disc + fee`, 1 checkout → N orders, cart kosong, `SQN-2026-*` |
| 7 Proses merchant | login merchant → `/merchant/orders` → accept → ready/out-for-delivery → mark-paid (tunai) | hanya transisi legal; toast jelas bila ilegal; histori tercatat |
| 8 COD selesai | login pembeli → `/orders/:id` → Saya sudah terima | `completed` hanya bila terima + lunas |
| 9 Review/wishlist/chat | order completed → beri ★5 (1/item, tolak kedua); produk → wishlist (unik, tolak duplikat); `/chat` kirim teks, pesan >7 hari disembunyikan | validasi 1–5, ≤500 char; chat ≤2000 char |
| 10 Voucher+admin | coba `KADALUARSA` (tolak) → login admin → `/admin/vouchers` nonaktifkan → `/admin` audit tercatat | validasi aktif/expired/min-subtotal di `api-client` |

Uji juga di viewport mobile (DevTools 390px): bottom nav/grid tetap rapi, gambar fallback jalan.

## 2. Android (emulator, setelah SDK ada)

```bash
flutter pub get && flutter run
```

Bottom nav: Beranda → Kategori (daftar, ketuk → search terfilter) → Keranjang → Pesanan → Akun.
Ulangi langkah 1–9 di atas: Beranda (kategori + terbaru + tersedia) → detail produk (+Keranjang asli) → checkout per-toko → Pesanan (aksi kontekstual) → review di order completed → Wishlist/Chat dari Akun → merchant via Akun (dashboard/produk/order/toko).

## 3. Cek otomatis (tanpa emulator)

```bash
./scripts/demo-e2e.sh
```

Memeriksa parity ID mock web↔flutter, larangan import mock langsung dari UI, larangan secret, dan `bun run build`.
Flutter `analyze`/`test` dijalankan manual setelah SDK terinstal (catat hasilnya di issue).

## 4. Masuk backend (setelah M8 hijau)

- `docs/ERD.md` final → `db/schema/*.ts` + migrasi + seed dari mock yang sama.
- `docs/openapi.yaml` stub → lengkapi examples saat endpoint Express ditulis.
- Ganti transport `api-client` ke Axios/Dio real `/api/v1` + Bearer token; UI tanpa ubah.
