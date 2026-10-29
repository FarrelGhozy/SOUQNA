# SOUQNA — Pasar Kita

Marketplace kampus + UMKM sekitar. COD saja, tanpa payment gateway.

Proyek ini adalah **demo mock-first** untuk tugas akhir Web & Android. Web dan
Flutter memakai data dummy yang sama; backend/DB/Auth real sengaja ditunda.
Fokus fase berikutnya adalah mematangkan UI/UX, correctness mock, dan quality
gate — bukan menambah fitur di luar MVP.

## Status

| Area | Status |
|---|---|
| Web React + Vite + React Router | Demo mock M1–M7 berjalan |
| Flutter Android | Struktur + layar mock M1–M6; SDK belum terpasang di mesin dev ini |
| Backend Express + Drizzle + Supabase | **Deferred** — stub |
| Auth/DB/Storage real | **Deferred** |
| Tema Biru UNIDA Gontor | Dirancang di `docs/design-system.md`; implementasi di M10–M11 |

Rincian gap dan status per kapabilitas: `docs/implementation-audit.md`.
Pekerjaan aktif: `TODO.md`. Issue: GitHub #9–#21.

## Dokumen

- Baseline terkunci: `SOUQNA_MVP.md` (jangan hapus).
- Index kerja: `docs/README.md`.
- Design system: `docs/design-system.md`.
- Kontrak API: `docs/api-contract.md` + `docs/openapi.yaml`.
- Aturan agen: `AGENTS.md`, `frontend/AGENTS.md`, `flutter/AGENTS.md`.

## Stack

Versi aktual mengikuti lockfile `frontend/bun.lock` dan `flutter/pubspec.yaml`.

| Komponen | Versi |
|---|---|
| Bun | 1.4.4 |
| React / ReactDOM | 19.3.1 |
| Vite / plugin React | 8.3.5 / 6.1.2 |
| React Router DOM | 7.18.5 |
| TypeScript | 7.0.2 |
| Flutter / Dart | target 3.47.8 / 3.13.7 (belum terpasang di mesin ini) |
| Dio / intl / shared_preferences / supabase_flutter | 5.11.1 / 0.20.3 / 2.5.6 / 2.18.3 |
| Backend (nanti) | Bun + Express + Drizzle + Supabase |

Axios dan Dio sudah dideklarasikan sebagai transport cadangan, tetapi
`api-client` saat ini masih mock murni. Jangan menganggap HTTP nyata sudah aktif.

## Jalan cepat

```sh
# Web (Bun)
cd frontend
bun install
bun run dev      # http://localhost:5173
bun run build
bunx tsc --noEmit

# Cek parity/demo tanpa backend
./scripts/demo-e2e.sh

# Android (setelah Flutter SDK terpasang)
cd flutter
flutter pub get
flutter run
flutter analyze
flutter test
```

Login demo web: buka `/login`, masukkan email apa saja atau pilih akun preset
buyer/merchant/admin. Ini bukan Supabase Auth.

Reset data demo web: hapus key `souqna:*` di localStorage lewat DevTools.
Reset Flutter: clear app data / uninstall aplikasi.

## Struktur

`frontend/` React+Vite+Router · `flutter/` Android · `backend/` stub · `db/` stub · `docs/` modular.

```text
frontend/src/
├── components/          # ProductCard + komponen UI (target M10)
├── layouts/             # Public/Auth/Account/Merchant/Admin
├── lib/                 # api-client mock, auth, format
├── mocks/               # categories, stores, products, extras
├── pages/               # halaman flat
├── routes/              # router.tsx + guards.tsx
└── types/               # tipe snake_case

flutter/lib/
├── app/                 # app.dart + bottom_nav.dart
├── core/                # api, auth, utils
├── features/            # layar per fitur
├── mocks/               # mirror data web
└── shared/widgets/      # ProductCard + widget bersama
```

## Aturan penting

- UI **tidak boleh** import mock langsung; semua lewat `api-client`.
- Field memakai snake_case seperti kontrak API.
- Harga/total/voucher dihitung helper, bukan input komponen.
- Gambar remote wajib punya fallback.
- Jangan commit secret, `.env`, service-role key, atau token.
- Backend/DB/Auth real tidak dikerjakan sebelum M9–M12 stabil.
