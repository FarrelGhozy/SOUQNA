# 9. Acceptance & Roadmap

> Disarikan dari §13, §14, §18, §19. `TODO.md` adalah status kerja aktif.
> Dokumen ini membedakan **acceptance MVP**, **status demo mock**, dan
> **target backend** agar tidak ada klaim berlebihan.

## 9.1 Acceptance MVP (target)

- Auth: register/login email+Google, katalog tanpa login, privat tolak token
  invalid, edit profil, recovery tanpa lihat password, admin tidak dari register.
- Merchant/katalog: 1 toko/akun, tolak toko kedua, CRUD produk+variasi milik
  sendiri, produk hidden/nonaktif tidak bisa dibeli.
- Cart/checkout: multi-merchant, validasi server, 1 checkout→N orders, total
  server-side, gagal atomik, keranjang dibersihkan, tolak 1 order tidak
  batalkan lain.
- COD: pending→accept/reject, cancel hanya saat pending, pickup/delivery sesuai
  toko, mark-paid tunai, confirm-received, completed = terima + lunas.
- Pendukung: wishlist per user, review hanya completed, chat teks, purge 7 hari
  tanpa hapus thread, voucher admin+validasi server, admin kelola
  kategori/produk/users/voucher/orders, hapus akun aman + daftar ulang tanpa
  pulihkan toko.

## 9.2 Status saat ini

| Kapabilitas | Web mock | Flutter mock | Backend target |
|---|---|---|---|
| Katalog/search/detail/toko | Ada | Ada | Perlu |
| Auth email/password | Mock | Mock | Supabase |
| Google login | Belum | Belum | Target |
| Reset password | Belum | Belum | Target |
| Profil | Mock | Mock | Perlu |
| Cart multi-toko | Ada (global) | Ada (in-memory) | Perlu per user |
| Checkout multi-merchant | Ada | Ada | Perlu atomik |
| Voucher | Ada | Ada | Perlu validasi server |
| COD/status order | Ada | Ada | Perlu transaksi DB |
| Wishlist/review/chat | Ada | Ada | Perlu |
| Merchant CRUD | Ada | Ada | Perlu ownership |
| Admin web | Ada | Tidak ada | Perlu |
| Delete account/anonimisasi | Belum | Belum | Target |
| Mode penjual + tombol kembali | Ada | Ada | Mock UI state |
| Nama toko di card produk | Ada | Ada | Mock via getStores |
| Upsell/notif/payment digital | Tidak | Tidak | Out of scope |

Detail gap: `docs/implementation-audit.md`. Jangan menandai target backend
sebagai selesai hanya karena mock sudah ada.

## 9.3 Definition of Done demo akhir (M12)

- Web + Flutter memakai data/perilaku parity.
- Semua alur inti bisa didemokan tanpa error.
- Tema UNIDA konsisten; tidak ada hex liar di halaman.
- Loading/empty/error/success state tersedia.
- Build web, typecheck, test, dan Flutter check tercatat.
- Tidak ada secret di klien/repo.
- Dokumentasi tidak mengklaim backend/Auth/DB yang belum ada.

## 9.4 Tahap implementasi

| Fase | Fokus | Output |
|---|---|---|
| M9 | Dokumentasi & design system | docs sinkron, token, audit, issue |
| M10 | Correctness + web UI | scoping data, fondasi UI, halaman web |
| M11 | Flutter parity & UX | tema, komponen, persistensi, state |
| M12 | Quality & release | a11y, test, CI, performa, UAT |
| Backend | Express/Drizzle/Supabase | setelah M12 stabil |

## 9.5 Prioritas

- **P0 (wajib):** scoping order/cart/ownership; auth/profil; katalog/search/
  detail; 1 toko/akun; variasi; cart multi-merchant; COD; delivery fee; admin
  dasar; keamanan/migrasi/logging.
- **P1 (setelah P0 stabil):** wishlist, review completed, chat+purge, recovery,
  hapus akun+anonim, audit log, aksesibilitas, testing.
- **P2 (tunda):** push notif, realtime lanjut, analitik kompleks, kupon
  lapis/loyalty/iklan, payment digital/kurir, AI.
