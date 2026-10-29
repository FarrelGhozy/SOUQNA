# 3. Arsitektur

> Disarikan dari §6. Backend belum dibangun; bagian ini menjadi acuan interface
> mock dan target migrasi.

## 3.1 Komponen

| Komponen | Teknologi | Status |
|---|---|---|
| Web | React 19 + Vite + React Router (Bun) | Demo mock |
| HTTP web | Axios | Terpasang, belum dipakai HTTP |
| Android | Flutter | Demo mock |
| HTTP Android | Dio | Terpasang, belum dipakai HTTP |
| Auth SDK | Supabase JS/Flutter | Dideklarasikan, belum aktif |
| Backend | Bun + Express | Stub |
| ORM | Drizzle | Stub |
| DB | Supabase PostgreSQL | Stub |
| File | Supabase Storage | Target |
| Scheduler | Managed job purge 7 hari | Target |

## 3.2 Data flow saat ini (mock)

```text
Page/Screen
   │  (hanya lewat api-client)
   ▼
frontend/src/lib/api-client.ts  ◄── mocks/*.ts
flutter/lib/core/api/api_client.dart ◄── mocks/*.dart
   │
   ├── localStorage (web) / in-memory + SharedPreferences (Flutter)
   ├── hitung harga/stok/total/voucher di helper
   └── delay(200–400ms) untuk simulasi loading
```

Aturan:

- UI dilarang import `mocks/` langsung.
- API client adalah satu-satunya pintu data.
- `mock-auth` adalah satu-satunya pemilik sesi.
- Bentuk field snake_case sama dengan kontrak API.

## 3.3 Target backend

```text
Web (Axios+Bearer) ─┐
                    ├→ Express API → Drizzle → Postgres
Android (Dio+Bearer)┘   ├→ Supabase Auth (validasi token)
                        └→ Supabase Storage
Scheduled job → DB (hapus messages >7 hari)
```

Saat backend siap:

1. Ganti transport `api-client` ke Axios/Dio real `/api/v1`.
2. Tambah Bearer token dan error mapping.
3. Pertahankan signature fungsi dan bentuk data agar UI tidak berubah.
4. Hapus fallback mock setelah endpoint stabil.

## 3.4 Aturan wajib

1. Satu project Supabase untuk web+android+backend.
2. Operasi bisnis lewat Express API (`/api/v1`).
3. Auth SDK langsung di klien hanya untuk login/OAuth/sesi/recovery.
4. `Authorization: Bearer <access_token>` tiap request login.
5. Jangan percaya `user_id/role/harga/total/diskon/status` kiriman klien.
6. Service-role key, `DATABASE_URL`, OAuth secret hanya di backend/secret manager.
7. Dilarang `VITE_*` secret, secret di source Flutter, atau commit `.env`.
8. Role admin via seed/migrasi terproteksi, bukan pilihan register.
9. Transaksi DB untuk checkout, stok, voucher, penyelesaian order.
10. Ownership check di backend tiap request (merchant hanya tokonya, buyer hanya
    order/cart sendiri).

## 3.5 Auth & otorisasi (ringkas)

Supabase membuktikan identitas → API otorisasi (profil aktif, admin role,
kepemilikan toko/order). Default user = pembeli; merchant = punya toko aktif.
Google OAuth + recovery via Supabase dengan redirect/deep-link valid. Email
confirmation mengikuti env.

Mock saat ini: login email apa saja, akun preset/pembeli baru, guard sinkron.
Google/recovery/delete account belum ada.

## 3.6 Keamanan & DB (untuk nanti)

- Drizzle via `DATABASE_URL`, pooling sesuai deploy.
- Rate limit auth/chat/search/checkout/voucher/admin.
- CORS hanya origin web benar.
- Audit log admin. Validasi input + parameterized query.
- Batas upload MIME/size. Cegah IDOR.
- Jangan log password/token/service-role.
