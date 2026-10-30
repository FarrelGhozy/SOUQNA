# Strategi Mock Android (Flutter)

Flutter memantulkan web 1:1 untuk data, status, dan aturan. Tanpa backend dan
tanpa Supabase real. Dokumen ini menjelaskan **kondisi aktual**, bukan target.

## 1. Lokasi dan tanggung jawab

```text
flutter/lib/
├── main.dart
├── app/
│   ├── app.dart           # MaterialApp
│   └── bottom_nav.dart    # 5 tab + guard login
├── core/
│   ├── api/api_client.dart # mock-first; Dio belum dipakai HTTP
│   ├── auth/mock_auth.dart # sesi + SharedPreferences
│   └── utils/money.dart, date_id.dart
├── features/
│   ├── auth/screens/
│   ├── catalog/screens/   # home, search, category, product, store
│   ├── cart/screens/      # cart, checkout, success
│   ├── orders/screens/    # buyer + merchant order
│   ├── merchant/screens/  # dashboard, produk, form, toko
│   ├── wishlist/screens/
│   └── chat/screens/
├── mocks/
│   ├── categories_mock.dart
│   ├── stores_mock.dart
│   ├── products_mock.dart
│   ├── users_mock.dart
│   └── vouchers_mock.dart
└── shared/widgets/product_card.dart
```

Tidak ada `app/router.dart`, `core/config/app_config.dart`,
`core/errors/failures.dart`, atau `shared/theme` saat ini. Navigasi memakai
`BottomNav` + `Navigator.push`; theme target M11.

## 2. Aturan parity

- ID/slug/nama/harga/stok/status sama persis dengan `frontend/src/mocks/`.
  Ubah di satu sisi → ubah di sisi lain.
- Bottom nav 5 tab pembeli: Beranda, Kategori, Keranjang, Pesanan, Akun.
  Tab Kategori = `CategoryListScreen` → search terfilter.
- Mode penjual (`sellerMode` + `hasStore`): 5 tab ganti jadi Ringkasan, Produk,
  Pesanan, Toko, Pasar. AppBar `SOUQNA Seller — Mode Toko` + tombol
  `Ke Pembeli`. Masuk dashboard/profil toko via menu Akun mengaktifkan mode.
- `ProductCard` terima `storeName`; parent ambil `getStores()` sekali lalu map.
- Merchant via menu Akun bila `hasStore`; admin disembunyikan (prioritas web).
- Data lewat `core/api/api_client.dart` saja. Dilarang import mock langsung dari
  widget/screen.
- Format IDR: `NumberFormat.currency(locale: 'id_ID', symbol: 'Rp',
  decimalDigits: 0)`. Tanggal Asia/Jakarta mengikuti `date_id.dart`.
- Gambar: `Image.network` + `errorBuilder` fallback icon.
- `ApiClient` saat ini mengembalikan `Future` dari data in-memory/SharedPreferences
  dengan delay simulasi. `Dio` baru dideklarasikan, belum dipakai untuk request.

## 3. Persistensi

`MockAuth` memakai `SharedPreferences` untuk menyimpan ID sesi dan sebagian
override. Kondisi aktual:

| Data | Persist? | Catatan |
|---|---|---|
| ID sesi preset | Ya | Direkonstruksi dari `usersMock` |
| User baru (email asing) | Tidak penuh | `_extras` in-memory; hanya email yang disimpan |
| Override nama/telepon/lokasi | Terbatas | Disimpan per user, pemulihan belum lengkap |
| `hasStore`/`store_id` setelah buat toko | Tidak | Hilang setelah restart |
| `sellerMode` per-user | Ya | `souqna:seller-mode:<userId>`, default false |
| Cart/order/wishlist/chat | In-memory | Belum selaras dengan persistensi web |

Perbaikan persistensi dan scoping ada di issue #11 dan #16. Jangan mengklaim
Flutter “sudah persisten penuh” sampai diperbaiki dan diuji.

## 4. Batasan SDK

Flutter SDK belum terpasang di mesin dev ini. Struktur `flutter/` dibuat manual
(tanpa `flutter create`). Jalankan setelah SDK tersedia:

```bash
flutter pub get
flutter run
flutter analyze
flutter test
```

Catat hasil nyata di issue/PR. Jangan menulis “lolos” tanpa output.

## 5. Tema target M11

- `lib/shared/theme/app_theme.dart` dengan `ColorScheme` eksplisit.
- Palette: navy `#0B2A4A`, blue `#1E6091`, blue-hover `#164E77`, gold `#D4AF37`,
  bg `#F1F5F9`, text `#0F172A`.
- Jangan memakai `colorSchemeSeed: Colors.green`.
- Detail mapping: `docs/design-system.md`.

## 6. Verifikasi

```bash
./scripts/demo-e2e.sh
# setelah SDK tersedia:
cd flutter && flutter analyze && flutter test
```
