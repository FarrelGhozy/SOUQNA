# SOUQNA — Pasar Kita

Marketplace kampus + UMKM sekitar. COD saja.

## Dokumen

- Baseline: `SOUQNA_MVP.md` (dikunci, jangan hapus)
- Kerja harian: `docs/` (index di `docs/README.md`), `TODO.md`, `AGENTS.md`
- Fokus saat ini: **frontend + flutter dummy**; `backend/` + `db/` stub

## Stack (terkunci 29 Okt 2026, diverifikasi via registry)

| Komponen | Versi |
|---|---|
| Bun | 1.4.x (`bun upgrade` ke 1.4.4) |
| React / ReactDOM / @types | 19.3.1 / 19.3.1 / 19.3.0 |
| Vite / @vitejs/plugin-react | 8.3.5 / 6.1.2 |
| React Router DOM | 7.18.5 |
| Axios | 1.21.0 |
| TypeScript | 7.0.2 (native) |
| Flutter / Dart | 3.47.8 / 3.13.7 |
| Dio / intl / shared_prefs / supabase_flutter | 5.11.1 / 0.20.3 / 2.5.6 / 2.18.3 |
| Backend (nanti): Express / Drizzle / supabase-js | 5.3.0 / 0.45.4 / 2.118.0 |

## Jalan cepat

```sh
# Web (Bun)
cd frontend && bun install && bun run dev   # → http://localhost:5173

# Android (butuh Flutter SDK — belum ada di mesin ini)
cd flutter && flutter pub get && flutter run
```

Login dummy web: buka `/login`, pilih peran buyer/merchant/admin.

## Struktur

`frontend/` React+Vite+Router · `flutter/` Android · `backend/` stub · `db/` stub · `docs/` modular.
