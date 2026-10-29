# Implementation Audit — Dokumen vs Code

Tanggal: 2026-10-30
Status: audit awal fase M9. **Tidak ada perubahan code pada fase ini.**

> Catatan status: temuan **D1–D12** pada bagian 2 sudah diperbaiki di fase M9.
> Temuan **C1–C13** pada bagian 3 adalah gap code yang masih terbuka dan
> dilacak lewat issue #11–#21. Baris bukti di bawah sengaja mempertahankan
> nomor baris saat audit dilakukan.

Tujuan: memastikan dokumentasi tidak menjanjikan perilaku yang belum ada, dan
setiap penyimpangan code punya issue perbaikan yang jelas. Baseline
`SOUQNA_MVP.md` tetap acuan dan tidak diubah.

## 1. Ringkasan

- Baseline demo mock M0–M8 sudah berjalan: `bun run build`, `tsc --noEmit`, dan
  `./scripts/demo-e2e.sh` lolos.
- Flutter SDK belum terpasang di mesin ini; `flutter analyze`/`flutter test`
  belum diverifikasi.
- Masalah utama bukan crash, tetapi **overclaim dokumentasi** dan beberapa
  perilaku mock yang belum sesuai aturan bisnis:
  - order pembeli belum difilter per user,
  - cart belum per user,
  - detail order/checkout belum memeriksa kepemilikan,
  - beberapa klaim parity/acceptance belum terbukti.
- Tema UNIDA belum diterapkan: web belum punya token warna; Flutter masih
  memakai `colorSchemeSeed: Colors.green`.

## 2. Dokumentasi basi / tidak akurat

| # | Temuan | Bukti | Dampak | Tindakan |
|---|---|---|---|---|
| D1 | Daftar file mock web tidak sesuai kenyataan | `docs/frontend-mock.md:7-23` menyebut `users.mock.ts`, `cart.mock.ts`, `orders.mock.ts`, `wishlist.mock.ts`, `chat.mock.ts`, `reviews.mock.ts`, `vouchers.mock.ts`; aktual hanya `categories.mock.ts`, `stores.mock.ts`, `products.mock.ts`, `extras.mock.ts` | Kontributor bingung, dokumentasi tidak bisa dipercaya | Tulis ulang `frontend-mock.md` |
| D2 | Struktur frontend didokumentasikan sebagai aktual padahal target | `docs/repo-structure.md:27-35` menyebut `app/providers.tsx`, `routes/public.tsx`, `features/*`, `hooks`, `supabase.ts`; aktual `routes/router.tsx`, `routes/guards.tsx`, `layouts/layouts.tsx`, page flat | Salah paham arsitektur | Pisahkan “aktual” dan “target refactor” |
| D3 | ERD ditulis belum ada | `docs/repo-structure.md:14`, `docs/data-model.md:44` | Dokumen saling bertentangan | Tautkan `docs/ERD.md` dan hapus TODO |
| D4 | Struktur Flutter tidak sesuai kenyataan | `docs/flutter-mock.md:10-26` menyebut `app/router.dart`, `core/config`, `core/errors`, `shared/theme`; aktual `app/app.dart`, `app/bottom_nav.dart`, `core/api`, `core/auth`, `core/utils`, `shared/widgets` | Kontributor membuat file duplikat | Tulis ulang `flutter-mock.md` |
| D5 | Guard diklaim membaca `/me` | `frontend/AGENTS.md:17` vs `frontend/src/routes/guards.tsx:8` yang memakai `currentSession()` sinkron | Migrasi backend bisa salah asumsi | Dokumentasikan perilaku aktual; jadikan async `/me` target backend |
| D6 | Dio diklaim memakai interceptor mock | `flutter/AGENTS.md` dan `docs/flutter-mock.md:35` vs `flutter/lib/core/api/api_client.dart:9` yang hanya memakai `const useMock = true` | Klaim arsitektur tidak benar | Koreksi dokumen atau buat interceptor di fase backend |
| D7 | Parity diklaim penuh | `docs/parity-audit.md:7-16` vs `scripts/demo-e2e.sh:12-22` yang hanya membandingkan ID | Kualitas parity tidak terukur | Turunkan klaim menjadi parity ID; tambah audit manual/script nilai |
| D8 | Acceptance mencampur target backend dan status mock | `docs/acceptance-roadmap.md:5-15`; `TODO.md` semua `[x]` | Pembaca mengira Google auth, delete account, backend sudah ada | Buat matriks status per kapabilitas |
| D9 | OpenAPI belum lengkap dibanding kontrak | `docs/api-contract.md:39` vs path `docs/openapi.yaml` | Kontrak backend tidak konsisten | Lengkapi stub atau tandai eksplisit |
| D10 | README menyebut Axios sebagai transport aktif | `README.md:19`, `frontend/AGENTS.md:4`; `frontend/src/lib/api-client.ts` masih mock murni | Ekspektasi implementasi keliru | Jelaskan Axios = transport cadangan sampai backend |
| D11 | TODO tidak punya fase maturity | `TODO.md` seluruh M0–M8 `[x]`, tidak ada item desain/quality | Pekerjaan berikutnya tidak terlihat | Reset TODO ke baseline + M9–M12 |
| D12 | Typo dan aturan agen tidak lengkap | `AGENTS.md:3` (“Jawab炖”) | Kualitas dokumen rendah | Perbaiki dan tambah aturan docs-first |

## 3. Perilaku code yang belum sesuai aturan/dokumen

| # | Prioritas | Temuan | Bukti | Dampak | Issue |
|---|---|---|---|---|---|
| C1 | P0 | `/orders` pembeli menampilkan semua order, bukan hanya milik user | `frontend/src/lib/api-client.ts:751-753`; `frontend/src/pages/OrdersPage.tsx:24`; Flutter `flutter/lib/core/api/api_client.dart:796-801` | Data user lain terlihat; demo multi-akun salah | #11 |
| C2 | P0 | Cart memakai satu key global `souqna:cart`, bukan per user | `frontend/src/lib/api-client.ts:285-296`; Flutter `_cart` statis | Ganti akun tetap melihat cart yang sama | #11 |
| C3 | P0 | `getOrder`/`getCheckout` tidak memeriksa pemilik | `frontend/src/lib/api-client.ts:742-759` | ID order/checkout bisa dibaca user login lain; melanggar aturan IDOR di baseline | #11 |
| C4 | P1 | Tipe `Order` mock belum punya `handover_location_snapshot` dan snapshot pembeli | `frontend/src/types/index.ts` vs `docs/ERD.md:46` | Mock tidak setara kontrak backend | #9/#11 |
| C5 | P1 | Persistensi Flutter hanya menyimpan ID sesi; user baru/override/`hasStore` tidak pulih | `flutter/lib/core/auth/mock_auth.dart:22-30`, `:124-137` | Reload aplikasi kehilangan identitas toko/profil | #16 |
| C6 | P1 | Metrik “Pendapatan” merchant menghitung order belum lunas; admin hanya `completed` | `MerchantDashboardPage.tsx:33-35` vs `api-client.ts:1168-1170` | Angka dashboard menyesatkan | #17 |
| C7 | P1 | Status order ditampilkan sebagai enum mentah | `OrdersPage.tsx:31`; `OrderDetailPage.tsx:77` | UI tidak ramah pengguna | #17 |
| C8 | P2 | Tambah keranjang memakai `alert()` | `ProductDetailPage.tsx:72` | Feedback tidak konsisten dengan design system | #17 |
| C9 | P2 | Tidak ada route 404/error boundary | `frontend/src/routes/router.tsx` | URL salah menampilkan layar kosong | #17 |
| C10 | P2 | Admin users belum punya mock delete account; reset password belum punya route | `AdminUsersPage.tsx:6`, `router.tsx` | Tidak sesuai daftar halaman/acceptance | Backlog |
| C11 | P2 | Web belum punya design token; link default hijau | `frontend/src/index.css:1-2` | Tidak sesuai brand | #12 |
| C12 | P2 | Flutter masih hijau | `flutter/lib/app/app.dart:10` | Tidak sesuai brand | #16 |
| C13 | P2 | Tidak ada unit/component test, lint, typecheck script, CI | Tidak ada file test/config di repo | Regresi tidak terdeteksi | #19 |

## 4. Matriks status kapabilitas

Legenda: **Mock** = ada di UI/data dummy, **Parsial** = ada sebagian,
**Target** = hanya kontrak/rencana backend, **Belum** = belum ada.

| Kapabilitas | Web | Flutter | Status dokumen | Catatan |
|---|---|---|---|---|
| Katalog/search/filter/pagination | Mock | Mock | Sesuai | Perlu polish UI |
| Detail produk + varian + stok | Mock | Mock | Sesuai | Perlu polish UI |
| Detail toko | Mock | Mock | Sesuai | Perlu polish UI |
| Login/register dummy | Mock | Mock | Sesuai | Bukan Supabase real |
| Google login | Belum | Belum | Target | Deferred backend |
| Reset password | Belum | Belum | Target | Belum ada route |
| Profil edit | Mock | Mock | Sesuai | Persistensi Flutter terbatas |
| Cart multi-toko | Mock | Mock | Sebagian | Belum per user |
| Checkout multi-merchant | Mock | Mock | Sesuai | Perlu uji ownership |
| Voucher | Mock | Mock | Sesuai | Admin web |
| COD/status order | Mock | Mock | Sesuai | Label UI perlu diperbaiki |
| Wishlist | Mock | Mock | Sesuai | Perlu uji multi-user |
| Review | Mock | Mock | Sesuai | Perlu uji completed/1 item |
| Chat + purge 7 hari | Mock | Mock | Sesuai | UI perlu polish |
| Merchant CRUD | Mock | Mock | Sesuai | Perlu uji ownership |
| Admin panel | Mock | Tidak ada | Sesuai by design | Admin Android opsional |
| Delete account + anonimisasi | Belum | Belum | Target | Deferred backend |
| Upload Storage | Belum | Belum | Target | Saat ini URL manual |
| Backend/DB/Auth real | Belum | Belum | Target | Jangan dikerjakan di M9–M12 |

## 5. Keputusan yang diambil

1. **Dokumentasi mengikuti code saat ini**, bukan sebaliknya, untuk hal yang
   memang keputusan mock (guard sinkron, transport mock, admin web-only).
2. **Penyimpangan aturan bisnis tetap diperbaiki di code** dan dicatat sebagai
   issue P0/P1; dokumen tidak boleh menormalkan bug (mis. order lintas user).
3. **Parity tidak diklaim penuh** sampai ada verifikasi nilai (harga/stok/status)
   dan uji interaksi web↔Flutter.
4. **Tema UNIDA** menjadi acuan baru di `docs/design-system.md`; semua halaman
   web/Flutter mengikuti token tersebut.
5. **Backend tetap deferred.** Issue M9–M12 hanya menyentuh klien/mock,
   dokumentasi, kualitas, dan rilis demo.
6. **Setiap pekerjaan code** harus merujuk issue dan memperbarui dokumen bila
   perilaku berubah.

## 6. Cara verifikasi audit ini

```bash
# Baseline tetap hijau tanpa perubahan code
cd frontend && bun run build
cd frontend && bunx tsc --noEmit
./scripts/demo-e2e.sh

# Cek tidak ada file code yang berubah di fase M9
git diff --stat -- frontend flutter backend db

# Cek referensi file mock yang sudah tidak ada
rg "users\.mock|cart\.mock|orders\.mock|wishlist\.mock|chat\.mock|reviews\.mock|vouchers\.mock" docs README.md AGENTS.md frontend flutter
```

Hasil yang diharapkan untuk fase M9:

- Perintah build/tsc/demo tetap lolos.
- `git diff` hanya menyentuh dokumentasi dan metadata.
- Tidak ada referensi file mock hantu.
- Setiap temuan punya issue atau catatan backlog.
