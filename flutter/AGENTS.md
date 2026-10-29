# flutter/AGENTS.md

## Stack
Flutter Android + Dio (terpasang, interceptor mock dulu, `USE_MOCK=true`).

## Perintah (setelah SDK ada)
```
flutter pub get
flutter run
flutter analyze
```

## Aturan
- Struktur: `lib/app/`, `lib/core/api|auth|config|errors|utils/`, `lib/features/*/screens|widgets|providers`, `lib/shared/`, `lib/mocks/`.
- Parity dengan `frontend/src/mocks/`: id/slug/nama/harga/stok/status sama persis.
- Bottom nav 5 tab: Beranda, Kategori, Keranjang, Pesanan, Akun. Merchant via menu akun. Admin opsional.
- Data lewat `core/api/api_client.dart` saja, return `Future` + delay. Dilarang akses mock langsung dari widget.
- IDR: `NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0)`. Tanggal WIB (+7).
- Gambar `Image.network` + `errorBuilder` fallback icon.
- Tanpa secret server di `--dart-define` / config klien.
