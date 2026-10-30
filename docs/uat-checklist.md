# UAT Checklist Final — SOUQNA v1.0.0-demo

Panduan pengujian penerimaan pengguna (User Acceptance Testing) menyeluruh untuk memastikan seluruh fitur mock-first SOUQNA kampus UNIDA Gontor berjalan mulus sebelum presentasi/rilis portofolio.

---

## 1. Alur Pengunjung & Pembeli (Buyer)

| No | Skenario Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|:--:|---|---|---|:---:|
| 1.1 | **Jelajah Beranda & Kategori** | Buka `/`, klik kategori (Makanan, Percetakan, Busana Muslim, Jasa). | Produk tersaring sesuai kategori, skeleton loader tampil saat memuat data, hero banner UNIDA tampil rapi. | ✅ Lolos |
| 1.2 | **Pencarian & Filter Produk** | Cari kata kunci "geprek", ubah filter sort "termurah". | Menampilkan "Ayam Geprek Sambal Bawang", urutan harga naik, badge harga terendah akurat. | ✅ Lolos |
| 1.3 | **Halaman Detail & Varian** | Buka detail produk, pilih varian rasa/ukuran. | Harga dan stok terupdate dinamis sesuai varian yang dipilih. Varian habis dinonaktifkan. | ✅ Lolos |
| 1.4 | **Keranjang Belanja Multi-Toko** | Tambahkan produk dari Kantin Mbak Siti dan Toko Busana Muslim, buka `/cart`. | Produk terkelompok otomatis per toko merchant. Tombol stepper `+` dan `−` berfungsi akurat. | ✅ Lolos |
| 1.5 | **Penggunaan Voucher Promo** | Masukkan voucher `HEMAT5K` pada checkout jika subtotal ≥ Rp 30.000. | Diskon Rp 5.000 terpotong otomatis dari total tagihan COD. Voucher kedaluwarsa ditolak. | ✅ Lolos |
| 1.6 | **Checkout COD Multi-Toko** | Pilih metode penyerahan (Ambil Sendiri / Diantar Merchant) untuk tiap toko, tentukan lokasi kampus, klik Buat Pesanan. | 1 checkout berhasil memecah menjadi N pesanan per toko (`ord-xx`). Halaman sukses menampilkan ringkasan nomor order. | ✅ Lolos |
| 1.7 | **Riwayat & Pelacakan Pesanan** | Buka `/orders`, filter tab status pesanan ("Menunggu Konfirmasi", "Diproses", "Selesai"). | Pesanan tampil dengan timeline status, badge metode bayar COD, dan status pengantaran. | ✅ Lolos |
| 1.8 | **Konfirmasi Penerimaan Barang** | Pada pesanan berstatus `out_for_delivery` / `ready_for_pickup`, klik "Saya Sudah Menerima Barang". | Status berpindah ke `received_by_buyer`. | ✅ Lolos |
| 1.9 | **Review & Rating Produk** | Beri rating bintang 1–5 dan ulasan teks pada pesanan `completed`. | Ulasan tersimpan, rating rata-rata produk terupdate, ulasan duplikat dicegah (1 ulasan per item). | ✅ Lolos |
| 1.10 | **Wishlist & Chat Langsung** | Klik ikon Wishlist pada produk, lalu buka `/wishlist`. Klik "Chat Toko" untuk berkirim pesan dengan merchant. | Produk tersimpan di wishlist. Obrolan terbuka di `/chat` dengan simulasi purge pesan lama > 7 hari. | ✅ Lolos |

---

## 2. Alur Penjual / Merchant

| No | Skenario Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|:--:|---|---|---|:---:|
| 2.1 | **Masuk sebagai Merchant** | Login menggunakan akun Siti Kantin (`siti@kantin.id`) via tombol 1-klik akun demo. | Mengarahkan pengguna langsung ke Panel Merchant dengan identitas toko terkait. | ✅ Lolos |
| 2.2 | **Dashboard & Metrik Penjualan** | Buka `/merchant`. | Kartu ringkasan menampilkan pendapatan COD selesai, total pesanan masuk, dan produk aktif. | ✅ Lolos |
| 2.3 | **Manajemen Produk & Varian** | Buka `/merchant/products`, tambah produk baru atau edit produk yang ada. | Varian harga, deskripsi, gambar preview, dan jumlah stok tersimpan dan tercermin di katalog publik. | ✅ Lolos |
| 2.4 | **Pemrosesan Pesanan Masuk (COD)** | Buka `/merchant/orders`, pilih pesanan baru. | Merchant dapat menerima pesanan (`accepted`), menandai siap diambil / jalan kurir (`out_for_delivery`), dan mengonfirmasi pelunasan uang tunai COD (`paid`). | ✅ Lolos |
| 2.5 | **Pengaturan Profil Toko** | Buka `/merchant/store`, ubah deskripsi toko, jam operasional, dan lokasi titik ambil kampus. | Informasi toko terupdate pada halaman profil toko publik. | ✅ Lolos |

---

## 3. Alur Administrator Kampus

| No | Skenario Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|:--:|---|---|---|:---:|
| 3.1 | **Masuk sebagai Admin** | Login menggunakan akun Admin Souqna (`admin@souqna.id`). | Sidebar admin panel aktif dengan akses moderasi penuh. | ✅ Lolos |
| 3.2 | **Dashboard Statistik Kampus** | Buka `/admin`. | Statistik ringkas seluruh civitas: jumlah user, toko aktif, total transaksi COD, dan voucher aktif. | ✅ Lolos |
| 3.3 | **Moderasi Produk & Kategori** | Buka `/admin/products` dan `/admin/categories`. | Admin dapat menangguhkan (`suspend`) produk bermasalah, menyembunyikan toko, atau menambah kategori baru. | ✅ Lolos |
| 3.4 | **Manajemen Voucher Promo** | Buka `/admin/vouchers`, buat kode promo baru dengan tipe fixed / persentase. | Voucher langsung dapat divalidasi oleh pembeli saat checkout belanja. | ✅ Lolos |
| 3.5 | **Log Audit Aktivitas** | Buka `/admin/audit-logs`. | Semua aksi moderasi, perubahan status order, dan aktivitas penting tercatat rapi secara kronologis. | ✅ Lolos |

---

## 4. Kriteria Non-Fungsional & Kualitas

- [x] **Tema Biru UNIDA Gontor Konsisten:** Seluruh warna menggunakan token semantik resmi (`--unida-navy`, `--unida-blue`, `--unida-gold`, `--unida-bg`).
- [x] **Aksesibilitas WCAG 2.2 AA:** Kontras rasio teks ≥ 4.5:1, navigasi keyboard penuh, target sentuh ≥ 44px, screen-reader live alerts.
- [x] **Tanpa Secret Klien:** Tidak ada API key sensitif atau secret server di repo frontend atau klien Flutter.
- [x] **Mock-First Parity:** ID, harga, status, dan nama produk sama persis antara Web Vite dan Android Flutter.
