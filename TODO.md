# TODO — SOUQNA (Fokus: Frontend + Flutter Dummy, Backend Nanti)

Acuan: `SOUQNA_MVP.md` + `docs/`. Backend/`db/` sengaja stub.
Centang `[x]` saat demo lolos di web **dan** Flutter (kecuali admin — web saja).

## M0 — Fondasi klien + docs [prioritas 1]

- [x] Pecah MVP jadi `docs/*.md` + index
- [x] Tulis `TODO.md` + `AGENTS.md`
- [x] Scaffold `frontend/` (Vite+React+Router+Bun, Axios terpasang, api-client mock-first)
- [x] Struktur `flutter/` manual (pubspec + lib/app+core+features+shared+mocks)
- [x] Data dummy parity web↔Android (6 kategori, 4 toko, ~20 produk+varian, cart, orders, wishlist, chat, reviews, vouchers, 3 users)
- [ ] README cara jalan `bun install && bun run dev` (web) dan `flutter pub get && flutter run` (android)

## M1 — Katalog publik (tanpa login)

- [ ] Beranda: kategori, produk aktif/terbaru, tersedia
- [ ] Search `q` + filter kategori/harga + sort + pagination dummy
- [ ] Detail produk: varian, harga/stok per varian, label habis, gambar fallback
- [ ] Detail toko + produk toko; toko inactive disembunyikan dari checkout
- [ ] Loading/empty/error states + format IDR + tanggal WIB

## M2 — Auth dummy + profil

- [ ] Login/register dummy (email apa saja) + switch peran pembeli/merchant/admin
- [ ] Guard route: `/cart /checkout /orders /wishlist /chat /me` minta login
- [ ] Profil edit nama/telepon/lokasi (localStorage), logout
- [ ] Guard merchant (`hasStore`) dan admin (`isAdmin`); tanpa role dari input user

## M3 — Cart + checkout dummy

- [ ] Cart multi-toko, ubah qty, hapus; persist localStorage
- [ ] Checkout: pilih pickup/delivery per toko, input lokasi, kode voucher (valid/expired/min-subtotal)
- [ ] Simulasi `POST /checkout`: hitung server-side di helper, 1 checkout → N orders, kurangi stok, kosongkan cart, gagal atomik jika stok kurang
- [ ] Ringkasan multi-merchant + tolak 1 order tidak batalkan lain (UI)

## M4 — Pesanan + COD dummy

- [ ] List/detail order pembeli; merchant list/detail order tokonya
- [ ] Transisi legal saja: cancel (pending), accept/reject, ready/out-for-delivery, confirm-received, mark-paid, completed = terima + lunas
- [ ] Toast jelas saat transisi ilegal; histori status tampil

## M5 — Merchant dummy

- [ ] Form Jadi Merchant → buat 1 toko, tolak toko kedua
- [ ] Dashboard ringkas + profil toko (delivery fee)
- [ ] CRUD produk + varian + stok + gambar URL; milik sendiri saja

## M6 — Wishlist, review, chat dummy

- [ ] Wishlist per user (unique), minta login
- [ ] Review hanya order-item completed milik sendiri, 1 per item, rating 1–5
- [ ] Chat teks per toko, pesan >7 hari disembunyikan (simulasi purge), thread tetap ada

## M7 — Admin UI (web prioritas)

- [ ] Dashboard statistik sederhana, users, kategori CRUD, moderasi hide/publish, orders lihat, voucher CRUD, audit log dummy

## M8 — Parity + demo

- [ ] Tiap layar M1–M6 ada di Flutter dengan data sama
- [ ] Skrip demo E2E (search → login → toko → produk → cart 2 toko → checkout → proses → COD → review/wishlist/chat → voucher)
- [ ] `docs/ERD.md` + OpenAPI stub saat backend dimulai

## NANTI (jangan kerjakan sekarang)

Backend Express+Drizzle, migrasi/seed, Supabase Auth real, Storage real, purge job real, hapus akun+anonimisasi real, rate-limit/CORS/audit real.
