# AGENTS.md — SOUQNA

Aturan kerja agen di repo ini. Dibaca sebelum mengubah apa pun.

## 1. Bahasa & konteks

- Jawab singkat, teknis, Indonesia bila user Indonesia. Tanpa emoji kecuali diminta.
- Verifikasi dengan baca file + eksekusi (`bun`, tes) bila memungkinkan. Jangan klaim tanpa bukti.
- Jika dokumen dan code berbeda, catat di `docs/implementation-audit.md` lalu perbaiki lewat issue — jangan diam-diam menormalkan bug.

## 2. Prioritas saat ini

- **Fokus: `frontend/` + `flutter/` dengan data dummy.** `backend/` + `db/` stub — jangan implementasi backend/DB/Auth real kecuali user minta eksplisit.
- Fase M9–M12: dokumentasi/design system → correctness mock + UI web → Flutter/UX → quality/release.
- Acuan: `SOUQNA_MVP.md` (baseline) + `docs/*.md`. `TODO.md` adalah status kerja aktif.
- Tema visual: **Biru UNIDA Gontor** di `docs/design-system.md`. Jangan menambah warna brand baru tanpa memperbarui dokumen itu.

## 3. Perintah & runtime

- JS runtime = **Bun** (`bun install`, `bun run dev`, `bunx`). Dilarang campur `npm/npx` untuk `frontend/`/`backend/`.
- Web dev: `bun --bun vite` sesuai MVP. Flutter: `flutter pub get && flutter run` (SDK belum ada di mesin ini — buat struktur manual saja).
- Cek instruksi lokal (README/AGENTS per folder) sebelum perintah generik.
- Quality gate yang tersedia: `cd frontend && bun run build`, `bunx tsc --noEmit`, `./scripts/demo-e2e.sh`.

## 4. Struktur & file

- Jangan buat folder `apps/` atau `infra/` baru. Ikuti `docs/repo-structure.md`.
- Utamakan edit file ada daripada buat baru. Jangan buat file kecuali perlu.
- Route web terpusat `frontend/src/routes/router.tsx`; guard baca sesi mock lewat `mock-auth.currentSession()`.
- Parity data: `frontend/src/mocks/*` ↔ `flutter/lib/mocks/*` — ID/slug/harga/stok/status harus sama.
- Dokumentasi baru/berubah wajib masuk index `docs/README.md` dan, bila relevan, `TODO.md`.

## 5. Mock-first (wajib)

- UI dilarang import mock langsung — lewat `api-client` (`frontend/src/lib/api-client.ts`, `flutter/lib/core/api/api_client.dart`) yang return `Promise/Future` + `delay` simulasi.
- Field snake_case sama seperti kontrak API agar ganti ke backend nyata tinggal ganti transport.
- Harga/total/voucher dihitung helper (simulasi server), bukan dari input komponen.
- Gambar remote wajib ada `onError/errorBuilder` fallback.
- Status data mock tidak boleh bocor antar user: order/cart/ownership harus mengikuti aturan di issue #11.

## 6. Larangan

- Dilarang taruh secret di `VITE_*`, source Flutter, atau commit `.env`.
- Dilarang akses tabel bisnis langsung dari klien; semua lewat `api-client`.
- Dilarang perluas scope (push notif, payment digital, kurir, AI) sebelum M9–M12 stabil.
- Dilarang mengklaim backend/Auth/DB/Google login selesai selama masih mock.
- Plan mode: jika aktif, diskusi saja, tulis rencana hanya di `/home/fazy/.opencode/plan` bila diminta.

## 7. Gaya kode & UI

- Komentar singkat, tanpa chain-of-thought panjang. Referensi file `path:line` saat tunjuk kode.
- Web: gunakan token di `frontend/src/styles/tokens.css` (target M10); jangan taruh hex langsung di page/component.
- Flutter: gunakan theme di `flutter/lib/shared/theme/app_theme.dart` (target M11), bukan `colorSchemeSeed` acak.
- Status order/pembayaran/pemenuhan memakai label Indonesia, bukan enum mentah.
- Sertakan loading/empty/error/success state untuk halaman yang memuat data.
- Jangan memakai `alert()` untuk feedback utama; gunakan toast/alert komponen.
