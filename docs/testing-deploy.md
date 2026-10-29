# 10. Testing, Env, Risiko

> Disarikan dari §15–§17, §20.

## Uji minimum

Unit: subtotal/diskon/fee/total, voucher, transisi status, syarat completed, stok kembali.
Integrasi (nanti backend): multi-order per toko, gagal stok tanpa parsial, reject/cancel kembalikan sekali, anti lintas-toko, review hanya completed, purge 7 hari, hapus akun aman.
E2E demo: search → register → buat toko → buat produk variasi → cart 2 toko → checkout → 2 merchant proses → COD selesai → review/wishlist/chat → admin voucher/kategori/users.

## Env backend (nanti)

```
NODE_ENV, PORT=3000, DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY (server only), WEB_ORIGIN, MOBILE_DEEP_LINK_SCHEME=souqna
```
Jangan commit `.env`.

## Env web

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
```
Dilarang `VITE_*` secret server.

## Flutter

API URL + Supabase publik via env/flavor. Deep-link OAuth/recovery terdaftar. Tanpa secret server di klien.

## Migrasi & seed (nanti)

Drizzle sumber perubahan; jangan edit prod manual tanpa migration. Seed kategori+demo idempotent. Admin awal via prosedur terkontrol, tanpa hardcode. Perintah via Bun: `bun install`, `bun run dev`, `bunx drizzle-kit generate/migrate`, `bun run seed`.

## Risiko → mitigasi

Stok minus→transaksi atomik+constraint; harga palsu→hitung server; ubah order orang→ownership per endpoint; admin diambil→bukan dari profil; multi-order inkonsisten→1 transaksi; stok tidak kembali→idempotent; chat membesar→purge; hapus akun hilangkan riwayat→anonimisasi+SET NULL; token lama→cek profil aktif; gambar liar→validasi+sign; scope creep→alur inti dulu.

## Referensi

Supabase Auth overview/Google/recovery, JS reset-password/admin-delete-user, Drizzle Supabase connection/existing-project (URL di §20 MVP).
