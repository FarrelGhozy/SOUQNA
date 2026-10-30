# 8. Halaman, Route & UX

> Disarikan dari §11–§12, dilengkapi route aktual dan target M10–M12.
> Acuan visual: `docs/design-system.md`.

## 8.1 Route web aktual

| Route | Layout | Guard | Halaman | Status |
|---|---|---|---|---|
| `/` | Public | — | Beranda | Ada |
| `/search` | Public | — | Pencarian + filter | Ada |
| `/categories` | Public | — | Daftar kategori | Ada |
| `/products/:productId` | Public | — | Detail produk | Ada |
| `/stores/:storeId` | Public | — | Detail toko | Ada |
| `/login` | Auth | — | Login dummy | Ada |
| `/register` | Auth | — | Register dummy | Ada |
| `/cart` | Account | login | Keranjang | Ada |
| `/checkout` | Account | login | Checkout | Ada |
| `/checkout/success/:checkoutId` | Account | login | Sukses checkout | Ada |
| `/orders` | Account | login | Pesanan pembeli | Ada |
| `/orders/:orderId` | Account | login | Detail pesanan | Ada |
| `/wishlist` | Account | login | Wishlist | Ada |
| `/chat` | Account | login | Chat | Ada |
| `/me` | Account | login | Profil | Ada |
| `/become-merchant` | Account | login | Jadi merchant | Ada |
| `/merchant` | Merchant | punya toko | Dashboard merchant | Ada |
| `/merchant/store` | Merchant | punya toko | Profil toko | Ada |
| `/merchant/products` | Merchant | punya toko | Daftar produk | Ada |
| `/merchant/products/new` | Merchant | punya toko | Form produk | Ada |
| `/merchant/products/:productId/edit` | Merchant | punya toko | Edit produk | Ada |
| `/merchant/orders` | Merchant | punya toko | Order toko | Ada |
| `/merchant/orders/:orderId` | Merchant | punya toko | Detail order toko | Ada |
| `/admin` | Admin | admin | Dashboard admin | Ada |
| `/admin/users` | Admin | admin | Users | Ada |
| `/admin/categories` | Admin | admin | Kategori | Ada |
| `/admin/products` | Admin | admin | Moderasi produk | Ada |
| `/admin/orders` | Admin | admin | Semua order | Ada |
| `/admin/vouchers` | Admin | admin | Voucher | Ada |
| `/admin/audit-logs` | Admin | admin | Audit log | Ada |
| `*` | Public | — | 404 | **Belum** (issue #17) |
| `/reset-password` | Auth | — | Reset password | **Belum** (backlog #21) |

Aturan: semua route tetap di `frontend/src/routes/router.tsx`; `pages/` tidak
mengatur routing.

### 8.1a Mode navbar

- Pembeli (default): Beranda, Cari, Kategori, Keranjang, Pesanan, Wishlist,
  Chat. Mobile: Beranda, Cari, Keranjang, Pesanan, Akun.
- Penjual (`seller_mode` + `hasStore`): header/sidebar/bottom-nav ganti fokus
  jualan — Ringkasan, Produk, Pesanan Masuk, Pengaturan Toko, plus tombol
  persisten `Kembali ke Pasar` / `Ke Pembeli`. Navbar pembeli disembunyikan
  total agar tidak campur konteks (rekomendasi Seller Centre).
- Masuk `/merchant*` otomatis aktifkan mode; keluar hapus flag per-user.
  Guard `RequireMerchant` tetap cek `hasStore`, mode tidak membuka akses.

### 8.1b Card produk

- `ProductCard` wajib tampilkan nama toko di bawah nama produk, link ke
  `/stores/:storeId` (web) / detail toko (Flutter). Fallback `-` bila toko
  tidak ketemu, truncate 1 baris.
- Parent resolve sekali via `api.getStores()` → map `store_id → name`, oper
  sebagai prop `storeName`. Dilarang import mock langsung dari komponen.

## 8.2 Halaman web target

### Publik & auth

- **Beranda:** hero singkat, CTA belanja, kategori, produk terbaru, tersedia.
- **Pencarian:** search, filter kategori/harga, sort, pagination; filter sticky
  di desktop, collapsible di mobile.
- **Kategori:** grid card dengan deskripsi.
- **Detail produk:** 2 kolom desktop; gambar, varian, stok, harga, toko,
  wishlist/chat, ulasan.
- **Detail toko:** header toko, status, metode pemenuhan, produk toko.
- **Login/register:** split-screen brand + form; label “mode demo” jelas.

### Akun & transaksi

- Profil, cart, checkout, sukses checkout, pesanan, detail pesanan, wishlist,
  chat, jadi merchant.
- Cart dikelompokkan per toko; status blokir item terlihat.
- Checkout punya ringkasan sticky di desktop.
- Pesanan memakai badge status + timeline.

### Merchant

- Dashboard ringkas, profil toko, daftar/form produk, order toko.
- Sidebar desktop, drawer/tab mobile.

### Admin

- Dashboard, users, kategori, produk, order, voucher, audit.
- Tabel desktop; card list mobile.
- Aksi sensitif memakai konfirmasi.

## 8.3 Android

Bottom nav 5 tab: Beranda, Kategori/Pencarian, Keranjang, Pesanan, Akun.
Merchant via menu Akun jika punya toko. Admin Android opsional (prioritas web).

Layar aktual: `home_screen`, `category_list_screen`, `search_screen`,
`product_detail_screen`, `store_detail_screen`, `cart_screen`,
`checkout_screen`, `checkout_success_screen`, `orders_screen`,
`order_detail_screen`, `merchant_*`, `wishlist_screen`, `chat_list_screen`,
`thread_screen`, `login_screen`, `register_screen`, `profile_screen`.

## 8.4 State wajib

Setiap halaman yang memuat data wajib punya:

1. **Loading:** skeleton untuk daftar/card; spinner untuk submit.
2. **Empty:** pesan + CTA bila relevan.
3. **Error:** pesan manusiawi + “Coba lagi”.
4. **Success:** feedback toast/inline, bukan `alert()`.
5. **Forbidden:** pesan jelas bila bukan pemilik/role.

## 8.5 Label status

Gunakan label bahasa Indonesia, bukan enum mentah:

| Status | Label |
|---|---|
| `pending_merchant_confirmation` | Menunggu konfirmasi |
| `accepted` | Diterima merchant |
| `ready_for_pickup` | Siap diambil |
| `out_for_delivery` | Sedang diantar |
| `received_by_buyer` | Diterima, menunggu pelunasan |
| `completed` | Selesai |
| `rejected` | Ditolak |
| `cancelled` | Dibatalkan |

Pembayaran: `unpaid` → “Belum dibayar”, `paid` → “Lunas (COD)”.
Pemenuhan: `pickup` → “Ambil sendiri”, `merchant_delivery` → “Diantar merchant”.

## 8.6 Nonfungsional

- Bahasa Indonesia, IDR, WIB.
- Responsif web desktop+mobile; Android multi-ukuran.
- Kontras AA, fokus keyboard, touch target 44 px.
- Pagination katalog/pesan/order/admin.
- Jangan fetch tanpa batas; gambar punya fallback.
- Keamanan backend nanti: validasi, parameterized, rate limit, CORS ketat,
  tanpa secret di log, batas upload, cegah IDOR, audit, backup.
- Transaksi nanti: checkout atomik, cegah oversell, cancel/reject idempotent,
  catat histori, total dari server.
