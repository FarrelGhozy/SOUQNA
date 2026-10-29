# 4. Struktur Repo (Wajib Diikuti)

> Disarikan dari §7. `frontend/` dan `flutter/` dikerjakan sekarang dengan mock; `backend/` + `db/` stub saja.

```
SOUQNA/
├── frontend/        # React + Vite + Router (Bun) — FOKUS SEKARANG (mock)
├── flutter/         # Flutter Android + Dio — FOKUS SEKARANG (mock mirror)
├── backend/         # Bun + Express (NANTI — stub dulu)
├── db/              # Drizzle schema/migrasi/seed (NANTI — stub dulu)
├── docs/
│   ├── proposal/    # dokumen proposal lama (tex)
│   ├── *.md         # modularisasi MVP (folder ini)
│   └── ERD.md       # TODO: diagram relasi (belum ada)
├── SOUQNA_MVP.md    # baseline 1360 baris (jangan hapus)
├── TODO.md          # checklist aktif
├── AGENTS.md        # aturan agen
├── .gitignore
└── README.md
```

Jangan buat `apps/` atau `infra/` baru. Pengganti lama: `apps/web→frontend/`, `apps/api→backend/+db/`, `apps/mobile→flutter/`, `infra/scripts→backend/src/scripts/ atau db/seed/`.

## `frontend/src/` (wajib)

```
app/providers.tsx, App.tsx (<RouterProvider>)
routes/router.tsx, public.tsx, protected.tsx, merchant.tsx, admin.tsx, guards.tsx
layouts/PublicLayout, AuthLayout, AccountLayout, MerchantLayout, AdminLayout
pages/home, catalog, auth, account, cart, checkout, orders, wishlist, chat,
      merchant/*, admin/*
features/auth, catalog, cart, checkout, orders, merchant, chat, reviews, wishlist, admin
components/ lib/api-client.ts (Axios, mock-first) lib/supabase.ts hooks/ utils/ types/
mocks/*.ts          # ← tambahan fase dummy (lihat docs/frontend-mock.md)
main.tsx
```

Aturan Router: semua route di `routes/router.tsx`; `pages/` tanpa logika routing; guard baca sesi mock (`/me` mock), bukan localStorage role.

## `flutter/lib/` (wajib)

```
app/ core/api/ (dio client mock-first) core/auth/ core/config/ core/errors/
features/catalog, auth, cart, checkout, orders, merchant, chat, reviews, wishlist, profile
shared/ mocks/*.dart  # ← mirror frontend/src/mocks
main.dart
```

Bottom nav: Beranda, Kategori/Pencarian, Keranjang, Pesanan, Akun. Merchant dari menu akun jika punya toko. Admin di Android opsional (prioritaskan web).

## `db/` (NANTI — stub)

```
schema/*.ts (profiles, stores, products, cart, checkout, orders, vouchers, chat, reviews, admin)
migrations/ seed/categories.seed.ts, demo.seed.ts drizzle.config.ts index.ts
```

Buat `frontend/src/routes|layouts|pages`, `backend/src/modules`, `db/schema` di Tahap 1 agar fondasi tidak berubah-ubah.
