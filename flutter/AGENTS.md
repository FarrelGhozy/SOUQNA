# flutter/AGENTS.md

## Stack

Flutter Android + Dio. `api_client.dart` masih mock-first (`const useMock = true`);
Dio belum benar-benar dipakai untuk HTTP. Supabase/Dio real menyusul setelah
backend siap.

## Perintah (setelah SDK ada)

```sh
flutter pub get
flutter run
flutter analyze
flutter test
```

Flutter SDK belum terpasang di mesin dev saat ini. Jangan mengklaim
`analyze`/`test` lolos tanpa output nyata.

## Struktur aktual

```text
lib/
├── main.dart
├── app/
│   ├── app.dart          # MaterialApp + theme
│   └── bottom_nav.dart   # navigasi 5 tab
├── core/
│   ├── api/api_client.dart
│   ├── auth/mock_auth.dart
│   └── utils/money.dart, date_id.dart
├── features/
│   ├── auth, catalog, cart, orders, merchant, wishlist, chat
│   └── <fitur>/screens/*.dart
├── mocks/
│   ├── categories_mock.dart
│   ├── stores_mock.dart
│   ├── products_mock.dart
│   ├── users_mock.dart
│   └── vouchers_mock.dart
└── shared/widgets/product_card.dart
```

Tidak ada router deklaratif, `core/config`, `core/errors`, atau `shared/theme`
saat ini. Theme target akan ditambahkan di M11.

## Aturan

- Parity dengan `frontend/src/mocks/`: id/slug/nama/harga/stok/status sama persis.
- Bottom nav 5 tab: Beranda, Kategori, Keranjang, Pesanan, Akun. Merchant via
  menu akun. Admin disembunyikan (prioritas web).
- Data lewat `core/api/api_client.dart` saja, return `Future` + delay. Dilarang
  akses mock langsung dari widget.
- Auth lewat `core/auth/mock_auth.dart`. Persistensi saat ini hanya ID sesi;
  user baru/override/hasStore belum pulih sempurna (issue #16).
- IDR: `NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0)`.
  Tanggal WIB mengikuti helper `date_id.dart`.
- Gambar `Image.network` + `errorBuilder` fallback icon.
- Tanpa secret server di `--dart-define` / config klien.

## Tema & UI

- Token warna/tipografi/komponen: `../docs/design-system.md`.
- Target: `lib/shared/theme/app_theme.dart` dengan `ColorScheme` eksplisit.
- Palette: navy `#0B2A4A`, blue `#1E6091`, blue-hover `#164E77`, gold `#D4AF37`,
  bg `#F1F5F9`, text `#0F172A`.
- Jangan memakai `colorSchemeSeed: Colors.green`; jangan memakai gold untuk teks
  di atas putih atau teks putih di atas gold.
- Status order/pembayaran/pemenuhan memakai label Indonesia, bukan enum mentah.
- Semua layar data wajib punya loading/empty/error/success state.
- Jangan ubah perilaku mock hanya demi tampilan; perbaiki lewat issue terkait.
