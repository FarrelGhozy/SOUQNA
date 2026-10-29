# SOUQNA Docs

Modularisasi dari `../SOUQNA_MVP.md` (baseline, jangan dihapus).
File root tetap acuan kontrak; folder ini untuk kerja harian agar tidak scroll 1360 baris.

## Index

| File | Isi | Sumber MVP |
|---|---|---|
| `product.md` | Ringkasan, tujuan, batasan, keputusan terkunci | §1–§3 |
| `roles-flows.md` | Peran + alur utama (browsing → hapus akun) | §4–§5 |
| `architecture.md` | Komponen, diagram, aturan arsitektur, auth | §6 |
| `repo-structure.md` | Struktur `frontend/`, `backend/`, `db/`, `flutter/` | §7 |
| `data-model.md` | Konvensi + tabel inti + relasi | §8 |
| `business-rules.md` | Harga, stok, voucher, otorisasi, anonimisasi | §9 |
| `api-contract.md` | Prefix `/api/v1` + tabel endpoint | §10 |
| `pages-ux.md` | Halaman web/Android + nonfungsional | §11–§12 |
| `acceptance-roadmap.md` | Acceptance + tahap implementasi + prioritas P0/P1/P2 | §13, §14, §18, §19 |
| `testing-deploy.md` | Strategi uji + env + risiko | §15, §16, §17, §20 |
| `frontend-mock.md` | Strategi dummy/mock web (fokus saat ini) | baru |
| `flutter-mock.md` | Strategi dummy/mock Android (fokus saat ini) | baru |
| `../TODO.md` | Checklist kerja aktif (frontend + flutter dummy) | turunan §14 |
| `../AGENTS.md` | Aturan agen global | turunan §6–§7 |

## Konvensi

- Bahasa UI: Indonesia. Mata uang: IDR. Zona waktu: Asia/Jakarta.
- Satu Supabase project, satu DB, satu API — web & Android konsumsi API sama.
- Pembayaran: COD saja, tanpa payment gateway.
- Prioritas saat ini: **frontend + flutter dengan data dummy**. `backend/` dan `db/` ditunda, tapi kontrak API (§10) tetap jadi acuan interface mock.
