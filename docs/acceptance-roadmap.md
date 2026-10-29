# 9. Acceptance & Roadmap

> Disarikan dari §13, §14, §18, §19. `TODO.md` root adalah versi kerja aktif (frontend+flutter dummy).

## Acceptance MVP (ringkas — full di SOUQNA_MVP.md §13)

- Auth: register/login email+Google, katalog tanpa login, privat tolak token invalid, edit profil, recovery tanpa lihat password, admin tidak dari register.
- Merchant/katalog: 1 toko/akun, tolak toko kedua, CRUD produk+variasi milik sendiri, produk hidden/nonaktif tidak bisa dibeli.
- Cart/checkout: multi-merchant, validasi server, 1 checkout→N orders, total server-side, gagal atomik, keranjang dibersihkan, tolak 1 order tidak batalkan lain.
- COD: pending→accept/reject, cancel hanya saat pending, pickup/delivery sesuai toko, mark-paid tunai, confirm-received, completed = terima + lunas, tanpa payment digital.
- Pendukung: wishlist per user, review hanya completed, chat teks, purge 7 hari tanpa hapus thread, voucher admin+validasi server, admin kelola kategori/produk/users/voucher/orders, hapus akun aman + daftar ulang tanpa pulihkan toko.

## Definition of Done keseluruhan

Web + Android ke 1 API; Drizzle + 1 Postgres; Auth email+Google; katalog publik + aksi personal login; 1 toko + variasi; multi-order konsisten; COD pencatatan; completed 2 syarat; wishlist/review/chat/voucher/admin sesuai batas; purge chat; hapus akun anonim; auth backend; migrasi/seed/env terdokumentasi; teruji web+Android untuk demo.

## Tahap implementasi (adaptasi fokus dummy)

1. Fondasi: struktur repo, Bun, env, Drizzle, Express health, Vite+Router, Flutter env. DoD: API↔DB, migrasi ulang, tanpa secret di klien.
2. Auth+profil. 3. Toko/kategori/katalog. 4. Cart/voucher/checkout. 5. Order+COD. 6. Wishlist/review/chat. 7. Admin+hapus akun. 8. Integrasi/demo/seed.

**Fokus sekarang:** Tahap 1 (sisi klien) → 2–6 versi **UI dummy** → 7–8 versi UI → backend/DB nanti mengikuti kontrak.

## Prioritas

- P0 (wajib): auth, profil+admin aman, katalog/search/detail/toko, 1 toko/akun, variasi, cart multi-merchant, COD, delivery fee, admin dasar, keamanan/migrasi/logging.
- P1 (setelah P0 stabil): wishlist, review completed, chat+purge, recovery, hapus akun+anonim, audit log.
- P2 (tunda): push notif, realtime lanjut, analitik kompleks, kupon lapis/loyalty/iklan, payment digital/kurir.
