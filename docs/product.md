# 1. Produk — SOUQNA

> Disarikan dari `SOUQNA_MVP.md` §1–§3. Detail penuh tetap di file root.

## Ringkasan

Marketplace kampus + UMKM sekitar. Pola marketplace modern dengan scope kecil
untuk proyek akademik Web & Android, dikerjakan dengan standar produk nyata:
alur jelas, data konsisten, UI rapi, dan kualitas terukur.

- Web: React + Vite + React Router (runtime Bun), HTTP: Axios
- Android: Flutter, HTTP: Dio
- Backend (ditunda): Bun + Express + Drizzle ORM + Supabase PostgreSQL
- Auth: Supabase Auth (email/password + Google)
- File: Supabase Storage. Scheduler: cleanup chat 7 hari.
- Tema: Biru UNIDA Gontor (`docs/design-system.md`).

Tanpa payment gateway. COD: bayar tunai saat serah terima, merchant menandai
lunas manual.

Browsing katalog tanpa login. Login wajib untuk: checkout, wishlist, chat,
ulasan, jadi merchant.

## Tujuan

1. Katalog + kategori + pencarian + detail + variasi + stok.
2. Checkout multi-merchant dalam 1 proses.
3. Pecah jadi 1 order per toko.
4. Merchant kelola toko/produk/variasi/stok/pesanan.
5. Status pesanan & status bayar COD terpisah.
6. Wishlist, chat teks, ulasan, voucher, admin sederhana.
7. Web & Android pakai backend + DB bisnis yang sama.

## Tidak termasuk MVP

Payment gateway/QRIS/VA, kurir eksternal/GPS, ekspedisi nasional, chat
gambar/video/voice, multi-toko per akun, variasi lintas-kombinasi kompleks,
AI/rekomendasi/iklan/flash-sale/loyalty, iOS wajib, moderasi AI, dark mode.

## Prinsip

- Sederhana, bisa didemo, tetapi tidak asal jadi.
- Backend sumber kebenaran harga/stok/auth/voucher/status.
- Validasi server wajib; validasi UI saja tidak cukup.
- Web/Android tidak akses tabel bisnis langsung — lewat API.
- Jangan perluas scope sebelum M9–M12 stabil.
- Status kapabilitas harus jujur: mock vs target backend.

## Keputusan terkunci (ringkas)

| Topik | Keputusan |
|---|---|
| Pendaftaran | Terbuka, tanpa pre-input admin |
| Login | Email/password + Google via Supabase |
| Browsing | Tanpa login boleh |
| Transaksi | Wajib login |
| Peran | 1 akun = pembeli + merchant |
| Aktivasi merchant | Otomatis setelah form toko valid; 1 akun 1 toko |
| Variasi | Harga+stok per variasi |
| Keranjang | Multi-merchant, per user |
| Checkout | 1 grup `checkouts` → N `orders` (1 per toko) |
| Pembayaran | COD saja; lunas ditandai merchant setelah terima tunai |
| Selesai | `received_by_buyer` + `paid` dua-duanya |
| Pemenuhan | Ambil sendiri / diantar merchant; biaya ditentukan merchant |
| Voucher | Admin saja |
| Chat | Teks saja, pesan auto-hapus 7 hari, thread tetap ada |
| Ulasan | Hanya untuk item order `completed`, 1 ulasan per order-item |
| Wishlist | Per akun |
| Reset password | Admin picu email recovery; admin tidak lihat password |
| Hapus user | Cek order aktif dulu; riwayat selesai dipertahankan anonim; email boleh daftar lagi; toko lama tidak pulih |
| Admin | Users, kategori, moderasi produk, orders, voucher; bukan pemroses pembayaran |
| Tema | Biru UNIDA Gontor; gold hanya aksen |
