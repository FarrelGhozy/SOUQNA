# 4. Struktur Repo

> Disarikan dari §7. `frontend/` dan `flutter/` dikerjakan sekarang dengan mock;
> `backend/` + `db/` stub. Struktur di bawah dibagi menjadi **aktual** dan
> **target refactor** agar dokumen tidak mengklaim file yang belum ada.

## 4.1 Struktur root aktual

```text
SOUQNA/
├── frontend/        # React + Vite + Router (Bun) — demo mock
├── flutter/         # Flutter Android — demo mock
├── backend/         # stub Bun + Express (deferred)
├── db/              # stub Drizzle/schema (deferred)
├── docs/
│   ├── proposal/    # dokumen proposal lama
│   ├── *.md         # modularisasi MVP + design system + audit
│   ├── ERD.md       # ERD final
│   └── openapi.yaml # stub kontrak API
├── scripts/
│   └── demo-e2e.sh  # cek parity/build
├── SOUQNA_MVP.md    # baseline terkunci (jangan hapus)
├── TODO.md          # checklist aktif
├── AGENTS.md        # aturan agen global
├── README.md
└── .gitignore
```

Jangan buat `apps/` atau `infra/` baru. Pengganti lama: `apps/web→frontend/`,
`apps/api→backend/+db/`, `apps/mobile→flutter/`,
`infra/scripts→backend/src/scripts/ atau db/seed/`.

## 4.2 `frontend/src/` aktual

```text
App.tsx
main.tsx
index.css
components/ProductCard.tsx
layouts/layouts.tsx          # Public/Auth/Account/Merchant/Admin
lib/
├── api-client.ts            # mock-first, Promise + delay, snake_case
├── mock-auth.ts             # sesi + override profil/toko
└── format.ts                # formatIDR, formatDateWIB, delay
mocks/
├── categories.mock.ts
├── stores.mock.ts
├── products.mock.ts
└── extras.mock.ts           # users, cart, order, chat, review, voucher, audit
pages/                       # halaman flat, tanpa routing logic
routes/
├── router.tsx               # semua route
└── guards.tsx               # RequireAuth/RequireMerchant/RequireAdmin
types/index.ts               # tipe snake_case
```

## 4.3 `frontend/src/` target M10

Target ini **belum ada**; dibuat bertahap lewat issue #12–#15.

```text
styles/
├── tokens.css               # palette, spacing, tipografi
└── base.css                 # reset + style global
components/
├── ui/                      # Button, Input, Card, Badge, Alert, Toast, dll.
├── layout/                   # Header, Sidebar, BottomNav, Container
└── ProductCard.tsx
features/                     # opsional: pecah logika per domain bila perlu
```

Jangan memindahkan semua file sekaligus. Refactor hanya jika memberi manfaat
nyata; struktur flat saat ini masih sah.

## 4.4 `flutter/lib/` aktual

```text
main.dart
app/
├── app.dart                  # MaterialApp + theme
└── bottom_nav.dart           # navigasi 5 tab
core/
├── api/api_client.dart
├── auth/mock_auth.dart
└── utils/money.dart, date_id.dart
features/
├── auth/screens/
├── catalog/screens/
├── cart/screens/
├── orders/screens/
├── merchant/screens/
├── wishlist/screens/
└── chat/screens/
mocks/
├── categories_mock.dart
├── stores_mock.dart
├── products_mock.dart
├── users_mock.dart
└── vouchers_mock.dart
shared/widgets/product_card.dart
```

Tidak ada `app/router.dart`, `core/config`, `core/errors`, atau `shared/theme`
saat ini. Theme target M11 akan ditambahkan.

## 4.5 `flutter/lib/` target M11

```text
shared/
├── theme/app_theme.dart      # ColorScheme + ThemeData UNIDA
└── widgets/                  # AppButton, AppCard, StatusBadge, EmptyState, dll.
```

## 4.6 `backend/` dan `db/` (deferred)

```text
backend/                     # Bun + Express, /api/v1
db/
├── schema/*.ts              # profiles, stores, products, orders, dst.
├── migrations/
├── seed/categories.seed.ts
├── seed/demo.seed.ts
└── drizzle.config.ts
```

Backend/DB/Auth real tidak dikerjakan sebelum M9–M12 stabil. Kontrak interface
tetap mengikuti `docs/api-contract.md`.
