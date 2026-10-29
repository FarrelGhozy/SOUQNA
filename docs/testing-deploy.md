# 10. Testing, Quality Gate, Env, Deploy & Risiko

> Disarikan dari §15–§17, §20. Fokus saat ini: demo mock web + Flutter.

## 10.1 Status verifikasi

| Pemeriksaan | Status | Catatan |
|---|---|---|
| `cd frontend && bun run build` | Lolos | Vite build sukses |
| `cd frontend && bunx tsc --noEmit` | Lolos | Per 2026-10-30 |
| `./scripts/demo-e2e.sh` | Lolos | Parity ID + build |
| Unit/component test | Belum ada | Issue #19 |
| Lint/format | Belum ada | Issue #19 |
| `flutter analyze` | Belum diverifikasi | SDK belum terpasang |
| `flutter test` | Belum ada | Issue #19 |
| CI | Belum ada | Issue #19 |

Jangan menulis “semua test lolos” selama tabel ini masih ada yang belum.

## 10.2 Test minimum

### Unit

- Subtotal/diskon/fee/total.
- Voucher: valid, expired, min subtotal, max discount, alokasi proporsional.
- Transisi status legal/ilegal.
- Syarat `completed` = terima + lunas.
- Stok kembali tepat sekali saat cancel/reject.
- Review hanya order-item completed milik sendiri, 1 per item.
- Wishlist unik per user.

### Integrasi (setelah backend)

- Multi-order per toko.
- Gagal stok tanpa parsial.
- Reject/cancel mengembalikan stok sekali.
- Anti lintas-toko/lintas-user (IDOR).
- Purge chat 7 hari tanpa hapus thread.
- Hapus akun aman + anonimisasi.

### E2E demo

Search → login → toko → produk → cart 2 toko → checkout → proses 2 merchant →
COD selesai → review/wishlist/chat → voucher → admin.

## 10.3 Quality gate yang harus dibuat (issue #19)

```bash
# frontend/package.json target
bun run lint
bun run typecheck
bun run test
bun run build
bun run verify        # gabungan semua
```

Aturan:

- PR wajib lolos lint + typecheck + test + build.
- Perubahan UI wajib menyertakan screenshot 390/768/1280 px.
- Perubahan perilaku wajib memperbarui dokumen + test.
- Tidak boleh ada `console.log`/`alert()` untuk feedback utama.
- Tidak boleh ada hex liar di page/component (gunakan token).
- Tidak boleh import mock langsung dari UI.
- Script parity diperkuat untuk memeriksa nilai, bukan hanya ID.

## 10.4 Env backend (nanti)

```text
NODE_ENV, PORT=3000, DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY (server only), WEB_ORIGIN,
MOBILE_DEEP_LINK_SCHEME=souqna
```

Jangan commit `.env`.

## 10.5 Env web

```text
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Dilarang `VITE_*` secret server. Saat mock, env ini belum dipakai untuk HTTP.

## 10.6 Flutter

API URL + Supabase publik via env/flavor. Deep-link OAuth/recovery terdaftar.
Tanpa secret server di klien. Flutter SDK belum ada di mesin dev; jalankan
`flutter analyze`/`flutter test` di mesin/CI yang memilikinya.

## 10.7 Migrasi & seed (nanti)

Drizzle sumber perubahan; jangan edit prod manual tanpa migration. Seed
kategori+demo idempotent. Admin awal via prosedur terkontrol, tanpa hardcode.
Perintah via Bun: `bun install`, `bun run dev`,
`bunx drizzle-kit generate/migrate`, `bun run seed`.

## 10.8 Deployment

- Web: build statis Vite, deploy ke Vercel/Netlify/alternatif. Tidak ada secret
  di build env klien.
- Android: build release setelah SDK tersedia; catat signing/keystore di luar
  repo.
- Dokumentasi langkah deploy + UAT ada di issue #20.
- Jangan deploy sebelum build/typecheck/test hijau dan demo script lolos.

## 10.9 Risiko → mitigasi

| Risiko | Mitigasi |
|---|---|
| Stok minus | Transaksi atomik + constraint |
| Harga palsu | Hitung server, snapshot |
| Ubah order orang | Ownership check tiap endpoint |
| Admin diambil alih | Role dari seed/DB, bukan profil klien |
| Multi-order inkonsisten | 1 transaksi |
| Stok tidak kembali | Idempotent cancel/reject |
| Chat membesar | Purge 7 hari |
| Hapus akun hilangkan riwayat | Anonimisasi + SET NULL |
| Token lama | Cek profil aktif |
| Gambar liar | Validasi MIME/size + storage |
| Scope creep | Selesaikan M9–M12 dulu |
| UI tidak konsisten | Token + komponen + review screenshot |

## 10.10 Referensi

Supabase Auth overview/Google/recovery, JS reset-password/admin-delete-user,
Drizzle Supabase connection/existing-project (URL di §20 MVP).
