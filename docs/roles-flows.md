# 2. Peran & Alur Utama

> Disarikan dari §4–§5. Aturan otorisasi final di backend (nanti); mock
> frontend/flutter harus meniru aturan ini.

## 2.1 Peran

### Pengunjung (tanpa login)

Boleh: katalog, kategori, detail produk/toko/harga/stok/ulasan, search/filter.
Tidak boleh: checkout, wishlist, chat, ulasan, kelola toko.

### Pembeli (login)

+ profil/kontak, keranjang **milik sendiri**, wishlist, checkout 1–N toko,
lihat order **milik sendiri**, batal selama `pending_merchant_confirmation`,
konfirmasi terima, pakai voucher, chat teks, ulasan (order selesai), daftar jadi
merchant.

### Merchant (login + 1 toko aktif, tetap bisa belanja)

Boleh: buat/update 1 toko, CRUD produk/variasi/stok/gambar miliknya, lihat order
tokonya, accept/reject (saat pending), `ready_for_pickup` /
`out_for_delivery`, `mark-paid` setelah terima tunai, atur `delivery_available` +
`delivery_fee`, balas chat.

Tidak boleh: ubah produk/order toko lain, bikin voucher, ubah status sembarang,
selesaikan order 1 aksi.

### Admin (role via backend aman, bukan dari registrasi)

Users, trigger recovery email, hapus akun (cek order aktif + anonimisasi),
kategori, hide produk, lihat orders bermasalah, voucher CRUD, audit log.

Tidak: lihat password plaintext, pakai role kiriman klien, tandai lunas
sembarangan, memproses pembayaran.

## 2.2 Guard aktual

- Web: `RequireAuth`, `RequireMerchant`, `RequireAdmin` di
  `frontend/src/routes/guards.tsx` membaca `currentSession()` dari
  `mock-auth.ts` (sinkron). `/me` async adalah target backend.
- Flutter: `BottomNav` menampilkan login untuk tab personal bila sesi null;
  merchant lewat menu akun; admin tidak ditampilkan.
- Role tidak pernah diambil dari input form. Switch peran demo hanya antar akun
  preset.
- Backend nanti wajib memvalidasi token dan kepemilikan di setiap endpoint.

## 2.3 Alur

### Browsing → search

Home → kategori/produk aktif/terbaru → search `q` + filter kategori/harga →
detail + pilih variasi → login jika mau wishlist/chat/checkout.

### Auth

Supabase email/Google → Bearer token ke API → API validasi. Role admin tidak
dari registrasi publik. Reset password/Google login belum ada di mock.

### Jadi merchant

Login → Pengaturan → Jadi Merchant → isi nama/deskripsi/logo/lokasi
pickup/delivery+fee → backend validasi 1 toko/akun (unique constraint).

### Kelola produk

Produk: nama/kategori/deskripsi/gambar. Minimal 1 variasi (opsi/harga/stok).
Status `draft/published/hidden/suspended`. Stok 0 semua → label habis, tidak bisa
checkout.

### Keranjang & checkout multi-merchant

Keranjang multi-toko, per user. Backend hitung ulang harga/stok/fee/voucher.
Pilih `pickup` / `merchant_delivery` per toko + lokasi serah terima.
1 `checkouts` + N `orders`. Gagal 1 item → gagal atomik semua. Sukses → hapus
item dari keranjang. Tolakan 1 toko tidak batalkan toko lain.

### Status order

`pending_merchant_confirmation` → `accepted` → `ready_for_pickup` /
`out_for_delivery` → `received_by_buyer` → `completed` (syarat:
`received_by_buyer` + `payment_status=paid`). Akhir lain: `rejected`, `cancelled`
(hanya saat pending, oleh pembeli). Stok kembali saat reject/cancel, sekali.

### Bayar COD

`payment_status`: `unpaid` / `paid`. `payment_method` selalu `cod`. Merchant
tandai `paid` hanya setelah terima tunai.

### Chat

Thread pembeli–toko (unik per pasangan). Teks ≤2000 char. Pesan auto-hapus
>7 hari via job; thread tetap ada.

### Ulasan & wishlist

1 ulasan per order-item selesai, rating 1–5. Wishlist per user, unique
`(user_id, product_id)`.

### Hapus user (admin)

Cek order aktif → tolak hapus jika ada → nonaktifkan toko/produk → anonimisasi
snapshot PII → hapus Auth via service-role (backend) → tolak token lama tanpa
profil aktif. Email boleh daftar lagi sebagai identitas baru.

## 2.4 Pelanggaran yang harus ditolak

- Membaca order/checkout user lain dengan mengganti ID (IDOR).
- Melihat cart user lain setelah switch akun.
- Merchant mengubah produk/order toko lain.
- Pembeli cancel setelah merchant menerima.
- Merchant mark-paid sebelum menerima tunai.
- Menyelesaikan order hanya dengan satu aksi.
- Review item yang belum completed atau milik orang lain.
- Menulis role admin dari form register/profil.
