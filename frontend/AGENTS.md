# frontend/AGENTS.md

## Stack

React 19 + Vite + React Router + TypeScript. Runtime Bun.
Axios dideklarasikan sebagai transport cadangan; `src/lib/api-client.ts` saat ini
masih mock murni.

## Perintah

```sh
bun install
bun run dev      # vite dev
bun run build
bunx tsc --noEmit
```

## Struktur aktual

```text
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/          # ProductCard; komponen UI reusable target M10
├── layouts/layouts.tsx  # Public/Auth/Account/Merchant/Admin
├── lib/
│   ├── api-client.ts    # mock-first, Promise + delay, snake_case
│   ├── mock-auth.ts     # sesi + override profil/toko
│   └── format.ts        # formatIDR, formatDateWIB, delay
├── mocks/
│   ├── categories.mock.ts
│   ├── stores.mock.ts
│   ├── products.mock.ts
│   └── extras.mock.ts   # users, cart, order, chat, review, voucher, audit
├── pages/               # halaman flat (tanpa routing logic)
├── routes/
│   ├── router.tsx       # semua route
│   └── guards.tsx
└── types/index.ts       # tipe snake_case
```

## Aturan

- Route hanya di `src/routes/router.tsx`; `pages/` tanpa routing logic.
- Layout: Public, Auth, Account, Merchant, Admin + `<Outlet/>`.
- Data: `src/mocks/*.ts` hanya diakses lewat `src/lib/api-client.ts`. Dilarang
  import mock langsung dari page/component/layout/route.
- Auth dummy: `src/lib/mock-auth.ts`, sesi di `localStorage souqna:session`.
  Guard memakai `currentSession()` sinkron. `/me` async adalah target backend,
  bukan perilaku saat ini.
- Format: `src/lib/format.ts` — `formatIDR`, `formatDateWIB`. Semua harga IDR.
- Gambar: `picsum/seed` + `onError` ke `/placeholder.svg`.
- Env: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
  (dummy dulu). Tanpa secret server.
- State: localStorage untuk cart/wishlist/session. Simulasi latency
  `delay(200–400ms)` agar loading state terlihat.
- Cart/order wajib mengikuti aturan scoping per user (issue #11). Jangan
  menambah state global baru tanpa mempertimbangkannya.

## Tema & UI

- Token warna/tipografi/komponen: `../docs/design-system.md`.
- Implementasi target: `src/styles/tokens.css` + komponen di `src/components/ui/`.
- Palette: navy `#0B2A4A`, blue `#1E6091`, blue-hover `#164E77`, gold `#D4AF37`,
  bg `#F1F5F9`, text `#0F172A`.
- Jangan memakai gold untuk teks di atas putih atau teks putih di atas gold.
- Jangan taruh hex langsung di page/component; gunakan token/class.
- Feedback utama memakai toast/alert komponen, bukan `alert()`.
- Setiap halaman data wajib punya loading/empty/error/success state.
- Jangan ubah signature `api-client` atau field snake_case hanya demi tampilan.
