# 6. Aturan Bisnis (Backend — Mock Harus Meniru)

> Disarikan dari §9. Mock tidak menegakkan secara nyata, tapi UI/logika dummy harus mensimulasikan hasil yang sama.

## Harga & stok

- Harga dari DB (nanti); mock: harga dari `mocks/products.ts`, bukan input user.
- Stok ≥0. Checkout validasi semua varian dulu, lalu buat order dalam 1 transaksi.
- Strategi: kurangi saat checkout sukses; kembalikan saat reject/cancel (atomik, sekali saja).
- Tolakan 1 toko → stok toko itu kembali, order lain jalan terus.
- Gagal → tanpa order setengah jadi / stok terpotong sebagian.

## Total order

```
item_subtotal = SUM(unit_price_snapshot * qty)
order_total   = item_subtotal - allocated_discount + delivery_fee
```

- `delivery_fee = 0` untuk pickup; selain itu ikut config toko saat checkout lalu di-snapshot.
- Voucher dialokasikan proporsional per order agar jumlah klop dengan total checkout.
- Pembulatan konsisten IDR, dihitung backend (mock: helper `lib/format.ts` / `utils/money.dart`).

## Voucher

- Code case-insensitive (normalisasi upper). Cek aktif, masa berlaku, min subtotal, limit, max discount — di backend.
- 1 voucher per checkout, tanpa gabung. User tidak bisa bikin voucher.
- Increment `used_count` dalam transaksi (cegah race).

## Otorisasi merchant

- Mutasi produk/varian/stok/gambar/order hanya pemilik toko (cocokkan token, bukan `store_id` kiriman klien).
- `mark-paid` hanya setelah terima tunai. Tidak bisa ubah order toko lain.

## Hapus akun & anonimisasi

- Jangan cascade hapus order/order-item selesai.
- Urutan: tangani order aktif → nonaktifkan toko/produk → lepas identitas → anonimisasi snapshot PII → hapus Auth via service-role → tolak token lama tanpa profil aktif.
- Tanpa blacklist email; daftar ulang = identitas baru.
