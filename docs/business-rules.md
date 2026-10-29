# 6. Aturan Bisnis

> Disarikan dari §9. Backend adalah sumber kebenaran; mock harus meniru hasil
> akhirnya. Gap mock dicatat di `docs/implementation-audit.md`.

## 6.1 Harga & stok

- Harga dari DB (nanti); mock: harga dari `mocks/products.ts`, bukan input user.
- Stok ≥0. Checkout validasi semua varian dulu, lalu buat order dalam 1 transaksi.
- Strategi: kurangi saat checkout sukses; kembalikan saat reject/cancel
  (atomik, sekali saja).
- Tolakan 1 toko → stok toko itu kembali, order lain jalan terus.
- Gagal → tanpa order setengah jadi / stok terpotong sebagian.

## 6.2 Total order

```text
item_subtotal = SUM(unit_price_snapshot * qty)
order_total   = item_subtotal - allocated_discount + delivery_fee
```

- `delivery_fee = 0` untuk pickup; selain itu ikut config toko saat checkout lalu
  di-snapshot.
- Voucher dialokasikan proporsional per order agar jumlah klop dengan total
  checkout; pembulatan di toko terakhir.
- Pembulatan konsisten IDR, dihitung backend (mock: helper `lib/format.ts` /
  `utils/money.dart`).

## 6.3 Voucher

- Code case-insensitive (normalisasi upper). Cek aktif, masa berlaku, min
  subtotal, limit, max discount — di backend.
- 1 voucher per checkout, tanpa gabung. User tidak bisa bikin voucher.
- Increment `used_count` dalam transaksi (cegah race).
- Voucher tidak boleh menurunkan total di bawah 0.

## 6.4 Kepemilikan & scoping data

| Data | Aturan |
|---|---|
| Cart | Per user; user A tidak melihat cart user B |
| Order pembeli | Hanya `buyer_id` = user aktif |
| Order merchant | Hanya order untuk toko miliknya |
| Detail order/checkout | Pembeli pemilik, merchant terkait, atau admin |
| Mutasi produk/varian/stok | Hanya pemilik toko |
| Review | Hanya order-item completed milik sendiri |
| Wishlist | Per user, unik `(user_id, product_id)` |
| Chat | Hanya peserta thread |

Mock saat ini belum menerapkan sebagian aturan di atas; lihat issue #11.

## 6.5 Status order & COD

- `pending_merchant_confirmation` → `accepted` → `ready_for_pickup` /
  `out_for_delivery` → `received_by_buyer` → `completed`.
- `rejected`/`cancelled` adalah akhir lain. Cancel hanya saat pending.
- `completed` = `received_by_buyer` + `payment_status=paid`.
- `payment_status`: `unpaid` / `paid`; `payment_method` selalu `cod`.
- Merchant hanya menandai `paid` setelah menerima tunai.
- Stok kembali saat reject/cancel, sekali saja (idempotent).

## 6.6 Metrik dashboard

Agar angka tidak menyesatkan:

- **Pendapatan terverifikasi** = total order `paid`/`completed`.
- **Pending** = order belum lunas, ditampilkan terpisah.
- **GMV** (opsional) = total order non-cancelled, diberi label jelas.
- Jangan mencampur pending ke “pendapatan”.

Mock merchant saat ini menghitung semua order non-cancelled sebagai pendapatan;
perbaikan ada di issue #17.

## 6.7 Hapus akun & anonimisasi (backend)

- Jangan cascade hapus order/order-item selesai.
- Urutan: tangani order aktif → nonaktifkan toko/produk → lepas identitas →
  anonimisasi snapshot PII → hapus Auth via service-role → tolak token lama
  tanpa profil aktif.
- Tanpa blacklist email; daftar ulang = identitas baru.
- UI mock reset/hapus akun belum ada; backlog issue #21.
