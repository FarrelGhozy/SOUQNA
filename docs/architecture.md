# 3. Arsitektur

> Disarikan dari §6. Backend belum dibangun; bagian ini jadi acuan interface mock.

## Komponen

| Komponen | Teknologi |
|---|---|
| Web | React + Vite + React Router (Bun) |
| HTTP web | Axios |
| Android | Flutter |
| HTTP Android | Dio |
| Auth SDK | Supabase JS / Supabase Flutter |
| Backend (nanti) | Bun + Express |
| ORM (nanti) | Drizzle |
| DB | Supabase PostgreSQL |
| File | Supabase Storage |
| Scheduler | Managed job (purge pesan 7 hari) |

## Aliran

```
Web (Axios+Bearer) ─┐
                    ├→ Express API → Drizzle → Postgres
Android (Dio+Bearer)┘   ├→ Supabase Auth (validasi token)
                        └→ Supabase Storage
Scheduled job → DB (hapus messages >7 hari)
```

## Aturan wajib

1. Satu project Supabase untuk web+android+backend.
2. Operasi bisnis lewat Express API (`/api/v1`).
3. Auth SDK langsung di klien hanya untuk login/OAuth/sesi/recovery.
4. `Authorization: Bearer <access_token>` tiap request login.
5. Jangan percaya `user_id/role/harga/total/diskon/status` kiriman klien.
6. Service-role key, DATABASE_URL, OAuth secret hanya di backend/secret manager.
7. Dilarang `VITE_*` secret, secret di source Flutter, atau commit `.env`.
8. Role admin via seed/migrasi terproteksi, bukan pilihan register.
9. Transaksi DB untuk checkout, stok, voucher, penyelesaian order.
10. Ownership check di backend tiap request (merchant hanya tokonya).

## Auth & otorisasi (ringkas)

Supabase buktikan identitas → API otorisasi (profil aktif, admin role, kepemilikan toko/order). Default user = pembeli; merchant = punya toko aktif. Google OAuth + recovery via Supabase dengan redirect/deep-link valid. Email confirmation mengikuti env.

## Keamanan & DB (untuk nanti, mock harus konsisten)

- Drizzle via `DATABASE_URL`, pooling sesuai deploy.
- Rate limit auth/chat/search/checkout/voucher/admin. CORS hanya origin web benar. Audit log admin. Validasi input + parameterized query. Batas upload MIME/size. Cegah IDOR.
