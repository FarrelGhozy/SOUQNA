# frontend/AGENTS.md

## Stack
React + Vite + React Router + Axios (terpasang, tapi arahkan ke mock dulu). Runtime Bun.

## Perintah
```
bun install
bun run dev      # vite dev
bun run build
```

## Aturan
- Route hanya di `src/routes/` (`router.tsx`, `public.tsx`, `protected.tsx`, `merchant.tsx`, `admin.tsx`, `guards.tsx`). `pages/` tanpa routing logic.
- Layouts: Public, Auth, Account, Merchant, Admin + `<Outlet/>`.
- Data: `src/mocks/*.ts` + akses via `src/lib/api-client.ts` saja. Dilarang fetch langsung ke mock dari komponen.
- Auth dummy: `src/lib/mock-auth.ts`, sesi di `localStorage souqna:session`. Guard baca `/me` mock.
- Format: `src/lib/format.ts` — `formatIDR`, `formatDateWIB`. Semua harga IDR.
- Gambar: `picsum/seed` + `onError` ke `/placeholder.svg`.
- Env: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (dummy dulu). Tanpa secret.
- State: localStorage untuk cart/wishlist/session. Simulasi latency `delay(200-400ms)` agar loading states terlihat.
