# SOUQNA Docs

Modularisasi dari `../SOUQNA_MVP.md` (baseline terkunci, jangan dihapus).
Folder ini adalah acuan kerja harian. Jika dokumen berbeda dengan code, salah
satunya harus diperbaiki lewat issue — lihat `implementation-audit.md`.

## Hierarki sumber kebenaran

1. `../SOUQNA_MVP.md` — baseline produk/arsitektur yang dikunci.
2. `../TODO.md` — status pekerjaan aktif dan bukti penyelesaian.
3. `design-system.md` — acuan visual/komponen web & Flutter.
4. `implementation-audit.md` — gap dokumen vs code yang diketahui.
5. Dokumen topik di bawah ini — detail per area.

## Index

| File | Isi | Sumber MVP |
|---|---|---|
| `product.md` | Ringkasan, tujuan, batasan, keputusan terkunci | §1–§3 |
| `roles-flows.md` | Peran + alur utama (browsing → hapus akun) | §4–§5 |
| `architecture.md` | Komponen, data flow mock, aturan arsitektur, auth | §6 |
| `repo-structure.md` | Struktur aktual + target `frontend/`, `flutter/`, `backend/`, `db/` | §7 |
| `data-model.md` | Konvensi + tabel inti + relasi | §8 |
| `business-rules.md` | Harga, stok, voucher, metrik, otorisasi, anonimisasi | §9 |
| `api-contract.md` | Prefix `/api/v1`, endpoint, error/pagination, ownership | §10 |
| `pages-ux.md` | Route map, halaman web/Android, state, nonfungsional | §11–§12 |
| `design-system.md` | Token Biru UNIDA Gontor, tipografi, komponen, aksesibilitas | baru M9 |
| `implementation-audit.md` | Audit dokumen vs code + matriks status kapabilitas | baru M9 |
| `acceptance-roadmap.md` | Acceptance, status mock/backend, prioritas P0–P2 | §13, §14, §18, §19 |
| `testing-deploy.md` | Strategi uji, quality gate, env, deployment, risiko | §15–§17, §20 |
| `frontend-mock.md` | Arsitektur mock web aktual + localStorage | baru |
| `flutter-mock.md` | Arsitektur mock Android aktual + batasan SDK/persistensi | baru |
| `ERD.md` | ERD final + kolom acuan `db/schema/*` | §8 final M8 |
| `openapi.yaml` | Stub OpenAPI `/api/v1`; backend menyusul | §10 stub M8 |
| `parity-audit.md` | Audit parity web↔Flutter; klaim yang sudah diverifikasi | M8 |
| `accessibility-audit.md` | Audit aksesibilitas WCAG 2.2 AA & responsif web/Flutter | M12 |
| `uat-checklist.md` | UAT checklist final alur pembeli, merchant, dan admin | M12 |
| `release-notes-v1.0.0-demo.md` | Release notes demo v1.0.0-demo ringkasan fitur | M12 |
| `demo-e2e.md` | Skenario demo manual + `./scripts/demo-e2e.sh` | M8 |
| `../TODO.md` | Checklist kerja aktif + issue | turunan §14 |
| `../AGENTS.md` | Aturan agen global | turunan §6–§7 |

## Konvensi

- Bahasa UI: Indonesia. Mata uang: IDR. Zona waktu: Asia/Jakarta.
- Satu Supabase project, satu DB, satu API — web & Android konsumsi API sama.
- Pembayaran: COD saja, tanpa payment gateway.
- Prioritas saat ini: **frontend + Flutter dengan data dummy**. `backend/` dan
  `db/` ditunda, tetapi kontrak API tetap menjadi acuan interface mock.
- Status kapabilitas wajib jelas: **mock**, **parsial**, **target backend**, atau
  **belum**. Jangan menulis “selesai” untuk fitur backend yang belum ada.
- Setiap perubahan perilaku code harus memperbarui dokumen terkait dan TODO.
