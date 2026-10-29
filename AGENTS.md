# AGENTS.md — SOUQNA

Aturan kerja agen di repo ini. Dibaca sebelum mengubah apa pun.

## 1. Bahasa & konteks

- Jawab炖 singkat, teknis, Indonesia bila user Indonesia. Tanpa emoji kecuali diminta.
- Verifikasi dengan baca file + eksekusi (`bun`, tes) bila memungkinkan. Jangan klaim tanpa bukti.

## 2. Prioritas saat ini

- **Fokus: `frontend/` + `flutter/` dengan data dummy.** `backend/` + `db/` stub — jangan implementasi backend/DB/Auth real kecuali user minta eksplisit.
- Acuan: `SOUQNA_MVP.md` (baseline) + `docs/*.md`. `TODO.md` adalah status kerja aktif.

## 3. Perintah & runtime

- JS runtime = **Bun** (`bun install`, `bun run dev`, `bunx`). Dilarang campur `npm/npx` untuk `frontend/`/`backend/`.
- Web dev: `bun --bun vite` sesuai MVP. Flutter: `flutter pub get && flutter run` (SDK belum ada di mesin ini — buat struktur manual saja).
- Cek instruksi lokal (README/AGENTS per folder) sebelum perintah generik.

## 4. Struktur & file

- Jangan buat folder `apps/` atau `infra/` baru. Ikuti `docs/repo-structure.md`.
- Utamakan edit file ada daripada buat baru. Jangan buat file kecuali perlu.
- Route web terpusat `frontend/src/routes/router.tsx`; guard baca sesi mock, bukan role localStorage mentah.
- Parity data: `frontend/src/mocks/*` ↔ `flutter/lib/mocks/*` — ID/slug/harga/stok/status harus sama.

## 5. Mock-first (wajib)

- UI dilarang import mock langsung — lewat `api-client` (`frontend/src/lib/api-client.ts`, `flutter/lib/core/api/api_client.dart`) yang return `Promise/Future` + `delay` simulasi.
- Field snake_case sama seperti kontrak API agar ganti ke backend nyata tinggal ganti transport.
- Harga/total/voucher dihitung helper (simulasi server), bukan dari input komponen.
- Gambar remote wajib ada `onError/errorBuilder` fallback.

## 6. Larangan

- Dilarang taruh secret di `VITE_*`, source Flutter, atau commit `.env`.
- Dilarang akses tabel bisnis langsung dari klien; semua lewat `api-client`.
- Dilarang perluas scope (push notif, payment digital, kurir, AI) sebelum TODO M0–M8 stabil.
- Plan mode: jika aktif, diskusi saja, tulis rencana hanya di `/home/fazy/.opencode/plan` bila diminta.

## 7. Gaya kode

- Komentar singkat, tanpa chain-of-thought panjang. Referensi file `path:line` saat tunjuk kode.
