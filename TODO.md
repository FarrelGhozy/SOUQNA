# TODO — SOUQNA

> Status: baseline demo mock M0–M8 selesai.
> Fokus berikutnya: M9 dokumentasi → M10 correctness + web UI → M11 Flutter/UX →
> M12 quality & release.
>
> Aturan: centang hanya setelah ada bukti (build/test/demo/screenshot) dan
> tautkan issue/PR. Jangan menandai selesai hanya karena file sudah dibuat.
> Backend/DB/Auth real tetap **deferred** sampai M9–M12 stabil.

## Baseline M0–M8 — demo mock (arsip)

- [x] Struktur repo, frontend Vite+React+Router, Flutter manual, mock parity awal.
- [x] M1 katalog publik, search/filter/sort/pagination, detail produk/toko.
- [x] M2 auth dummy, profil, guard pembeli/merchant/admin.
- [x] M3 cart multi-toko, checkout COD, voucher, 1 checkout → N order.
- [x] M4 pesanan + transisi COD, histori status.
- [x] M5 merchant: 1 toko, CRUD produk/varian/stok.
- [x] M6 wishlist, review, chat + simulasi purge 7 hari.
- [x] M7 admin web: dashboard, users, kategori, produk, order, voucher, audit.
- [x] M8 parity web↔Flutter + `scripts/demo-e2e.sh` + ERD/OpenAPI stub.

Catatan: baseline di atas adalah **demo mock**, bukan backend/Auth/DB produksi.
Lihat `docs/implementation-audit.md` untuk gap yang masih ada.

## M9 — Dokumentasi & design system

- [x] Audit dokumen vs code + matriks status kapabilitas — issue #9, `docs/implementation-audit.md`.
- [x] Design system + token Biru UNIDA Gontor — issue #10, `docs/design-system.md`.
- [x] Sinkronkan `README.md`, `AGENTS.md`, `frontend/AGENTS.md`, `flutter/AGENTS.md`.
- [x] Sinkronkan `docs/frontend-mock.md`, `docs/flutter-mock.md`, `docs/repo-structure.md`.
- [x] Sinkronkan `docs/data-model.md`, `docs/ERD.md`, `docs/parity-audit.md`.
- [x] Sinkronkan `docs/pages-ux.md`, `docs/acceptance-roadmap.md`, `docs/testing-deploy.md`.
- [x] Sinkronkan `docs/api-contract.md`, `docs/openapi.yaml`, `docs/demo-e2e.md`.
- [x] Reset TODO + buat milestone/label/issue GitHub #9–#21.
- [x] Verifikasi akhir M9: build/tsc/demo lolos dan `git diff` hanya dokumentasi.
  Bukti 2026-10-30: `bun run build`, `bunx tsc --noEmit`, `./scripts/demo-e2e.sh`
  lolos; tidak ada perubahan di `frontend/src`, `flutter/lib`, `backend/src`,
  atau `db/schema`.

## M10 — Correctness & web UI

- [x] Scoping order/cart/ownership mock web+Flutter — issue #11.
- [x] Fondasi UI web: token, layout, komponen reusable — issue #12.
- [x] Redesign halaman publik & auth web — issue #13.
- [x] Redesign halaman akun & transaksi web — issue #14.
- [x] Redesign merchant & admin web — issue #15.
- [x] Regression check: alur demo M1–M7 tetap lolos setelah redesign.
  Bukti 2026-10-30: `bun run build`, `bunx tsc --noEmit`, `./scripts/demo-e2e.sh` lolos 100%.

## M11 — Flutter parity & UX

- [x] Tema & shared components Flutter — issue #16 (`AppTheme.lightTheme` Biru UNIDA).
- [x] Perbaiki persistensi mock auth Flutter — issue #16 (JSON snapshot + override profil).
- [x] UX states, label status, toast/404/error boundary — issue #17 (`NotFoundPage`, `ToastProvider`, skeleton loader, label status Bahasa Indonesia).
- [x] Samakan copy dan perilaku web↔Flutter untuk alur inti.
- [x] Catat hasil `flutter analyze`/`flutter test` atau blocker SDK (Flutter SDK belum ada di environment ini; code contract dan parity ID terverifikasi lewat `./scripts/demo-e2e.sh`).

## M12 — Quality & release

- [x] Testing, lint, typecheck, CI — issue #19 (`bun run verify`, 18 unit tests lolos, `.github/workflows/ci.yml`).
- [x] Accessibility & responsive QA — issue #18 (audit WCAG 2.2 AA, kontras 14.54:1, reduced motion, `docs/accessibility-audit.md`).
- [x] Performance budget + deployment + UAT + portfolio — issue #20 (`docs/uat-checklist.md`, SPA redirect configs, `docs/testing-deploy.md`).
- [x] Demo ulang dari state reset, screenshot, release notes `v1.0.0-demo` (`docs/release-notes-v1.0.0-demo.md`, `./scripts/demo-e2e.sh`).
- [x] Update README/TODO dengan bukti akhir.
  Bukti 2026-10-30: `bun run verify` (typecheck 0 errors, 18 unit tests pass 100%, build 273ms) dan `./scripts/demo-e2e.sh` lolos tanpa celah. Issue #18, #19, #20 selesai dan ditutup.

## Backlog (setelah M12)

- [ ] Mock UI reset password & hapus akun admin — issue #21.
- [ ] Backend Express + Drizzle + Supabase Auth/DB/Storage.
- [ ] Purge chat job real, rate limit, CORS, audit server.
- [ ] Hapus akun + anonimisasi real.
- [ ] Google OAuth dan recovery email real.

## Definition of Done demo akhir

- Web dan Android memakai data/perilaku parity.
- Semua alur inti bisa didemokan tanpa error.
- Tema UNIDA konsisten; tidak ada hex liar di halaman.
- Loading/empty/error/success state tersedia di layar utama.
- Build web, typecheck, test, dan Flutter check tercatat.
- Tidak ada secret di klien/repo.
- Dokumentasi tidak mengklaim backend/Auth/DB yang belum ada.
