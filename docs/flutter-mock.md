# Strategi Mock Android (Fokus Saat Ini)

Flutter mirror web 1:1 — data, status, dan aturan sama. Tanpa backend, tanpa Supabase real.

## Lokasi

```
flutter/lib/
├── main.dart
├── app/app.dart, app/router.dart, app/bottom_nav.dart
├── core/
│   ├── api/api_client.dart   # mirror frontend api-client, baca mocks + delay
│   ├── auth/mock_auth.dart   # login dummy + switch peran
│   ├── config/app_config.dart
│   ├── errors/failures.dart
│   └── utils/money.dart, utils/date_id.dart
├── mocks/
│   ├── categories_mock.dart  # 6 kategori (sama dengan web)
│   ├── stores_mock.dart      # 4 toko
│   ├── products_mock.dart    # ~20 produk + varian
│   ├── users_mock.dart
│   ├── cart_mock.dart
│   ├── orders_mock.dart
│   ├── wishlist_mock.dart
│   ├── chat_mock.dart
│   └── vouchers_mock.dart
├── features/<fitur>/data, providers, screens, widgets
└── shared/widgets, theme
```

## Aturan parity

- ID/slug/nama/harga/stok/status sama persis dengan `frontend/src/mocks/`. Ubah di satu sisi → ubah di sisi lain.
- Bottom nav 5 tab: Beranda, Kategori, Keranjang, Pesanan, Akun (lihat `docs/pages-ux.md`).
- Merchant screens hanya jika `mockUser.hasStore`; admin screens disembunyikan (prioritas web).
- Dio dipasang dari awal tapi interceptor mengarah ke mock (flag `USE_MOCK=true`); saat backend siap tinggal flip flag + base URL.
- Format IDR: `NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0)`. Tanggal Asia/Jakarta manual (`+7`).
- Gambar: `Image.network` + `errorBuilder` placeholder icon.
- State: `ChangeNotifier`/`Riverpod`-ringan cukup (tanpa arsitektur berat dulu); persist minimal via `shared_preferences` bila sempat, else in-memory.

## Flutter SDK belum terinstal di mesin ini

Struktur `flutter/` dibuat manual (tanpa `flutter create`) agar tetap bisa dikerjakan: `pubspec.yaml` + `lib/` lengkap. Jalankan `flutter pub get && flutter run` setelah SDK terinstal.
