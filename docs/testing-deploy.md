# 10. Testing, Quality Gate, Env, Deploy & Risiko

> Disarikan dari §15–§17, §20. Fokus saat ini: demo mock web + Flutter.

## 10.1 Status verifikasi

| Pemeriksaan | Status | Catatan |
|---|---|---|
| `cd frontend && bun run build` | Lolos | Vite build sukses (~250ms) |
| `cd frontend && bun run typecheck` | Lolos | `tsc --noEmit` 0 errors |
| `cd frontend && bun run test` | Lolos | 18 unit tests (5 test suites) lolos |
| `cd frontend && bun run verify` | Lolos | Gabungan typecheck + test + build |
| `./scripts/demo-e2e.sh` | Lolos | Parity ID, status, harga, dan build |
| `flutter analyze` | Siap di CI | `flutter/analysis_options.yaml` aktif |
| GitHub Actions CI | Aktif | `.github/workflows/ci.yml` pada push/PR |

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

## 10.8 Deployment Web Statis & Panduan Rilis

### 10.8.1 Deployment Web Statis (Vercel / Netlify / Cloudflare Pages)

Aplikasi web SOUQNA adalah SPA murni berbasis Vite + React tanpa dependensi server runtime saat mode demo mock.

Langkah deployment ke provider hosting statis:
1. Hubungkan repository GitHub `FarrelGhozy/SOUQNA` ke Vercel / Netlify / Cloudflare Pages.
2. Atur konfigurasi build:
   - **Root Directory:** `frontend`
   - **Build Command:** `bun run build` (atau `vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `bun install`
3. SPA Rewrites / Routing:
   - Karena router menggunakan client-side routing (`createBrowserRouter`), pastikan rewrite rule mengarahkan seluruh path `/*` ke `/index.html`.
   - File konfigurasi `frontend/vercel.json` atau `frontend/public/_redirects` dapat dipakai untuk rewrite otomatis.
4. **Keamanan:** Tidak diperlukan env secret di klien. Seluruh data berjalan mock-first di memori browser dan localStorage.

### 10.8.2 Panduan Build Android (Flutter)

Setelah Flutter SDK terpasang di workstation:
1. Masuk ke direktori `flutter/`:
   ```bash
   cd flutter && flutter pub get
   ```
2. Jalankan pemeriksaan linter:
   ```bash
   flutter analyze
   ```
3. Build APK rilis demo:
   ```bash
   flutter build apk --release
   ```
   Output APK rilis berada di `build/app/outputs/flutter-apk/app-release.apk`.


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
