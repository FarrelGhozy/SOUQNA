# Parity Audit — Web ↔ Flutter

Tanggal audit: 2026-10-30. Admin (M7) web prioritas; Android opsional — tidak
wajib parity.

## Status klaim

| Klaim | Status | Bukti |
|---|---|---|
| ID kategori/toko/produk/varian sama | Terverifikasi | `scripts/demo-e2e.sh:12-22` |
| Nama/harga/stok/status sama | **Belum terverifikasi otomatis** | Perlu audit manual/script nilai |
| Perilaku cart/checkout/order sama | Parsial | Ada fungsi mirror, tetapi scoping user belum sama-sama benar |
| Tampilan/komponen sama | Belum | Flutter masih hijau; web belum bertema |
| Admin parity | Tidak wajib | Web-only by design |

Jangan mengklaim “parity penuh” sampai nilai dan interaksi diuji. Script saat
ini hanya membandingkan ID.

## Data (wajib sama)

| Aspek | Web | Flutter | Status |
|---|---|---|---|
| Kategori | 6 (`cat-01..06`) | 6 | ID sama |
| Toko | 4 (`store-01..04`; 2 delivery, 1 pickup, 1 inactive) | 4 | ID sama; nilai perlu dicek |
| Produk+varian | 20 produk, ID `prod-01..20` / `var-01a..` | 20 | ID sama; harga/stok perlu dicek |
| Users | buyer/merchant/admin | buyer/merchant/admin | Perlu cek email/nama |
| Cart awal | `var-01a×2` + `var-04a×1` | sama | Perlu cek setelah scoping user |
| Orders seed | `ord-01` out_for_delivery/unpaid, `ord-02` accepted, `ord-03` completed/paid | sama | Perlu cek status setelah fix |
| Wishlist/chat/review/voucher | 1 wishlist, conv-01 + 3 pesan (1 >7 hari), 1 review, HEMAT5K + KADALUARSA | sama | ID sama; aturan perlu diuji |

## Layar M1–M6

| Milestone | Web | Flutter | Status |
|---|---|---|---|
| M1 katalog | Home, Search, Category, Product, Store | Home, Search, Category, Product, Store | Ada; perlu polish |
| M2 auth | Login/Register/Profile + guards | Login/Register/Profile + guard tab | Ada; persistensi Flutter terbatas |
| M3 cart/checkout | Cart, Checkout, Success | Cart, Checkout, Success | Ada; cart belum per user |
| M4 orders/COD | Orders, OrderDetail, MerchantOrders | Orders, OrderDetail, MerchantOrders | Ada; buyer filter belum benar |
| M5 merchant | Become, Dashboard, Products, Form, Store | Become, Dashboard, Products, Form, Store | Ada; perlu uji ownership |
| M6 pendukung | Wishlist, Chat, Review, Voucher | Wishlist, Chat, Review, Voucher | Ada; perlu uji aturan |
| M7 admin | 7 halaman | Tidak ada | By design |

## Gap yang sudah diketahui

1. Cart web global, belum per user — issue #11.
2. `getOrders` pembeli belum difilter; detail order/checkout belum cek
   kepemilikan — issue #11.
3. Persistensi auth/profil/toko Flutter terbatas — issue #16.
4. Status order masih enum mentah, feedback belum konsisten — issue #17.
5. Tema belum sama: web belum punya token; Flutter masih hijau — #12/#16.
6. Script parity baru memeriksa ID — issue #19.

## Verifikasi ulang

```bash
./scripts/demo-e2e.sh
cd frontend && bun run build
cd frontend && bunx tsc --noEmit
# setelah SDK tersedia:
cd flutter && flutter analyze && flutter test
```

Checklist manual minimum:

- [ ] Harga, stok, nama, slug, status tiap produk/varian sama.
- [ ] Alur cart 2 toko → checkout → 1 checkout N order sama.
- [ ] Transisi COD legal/ilegal sama.
- [ ] Review/wishlist/chat/voucher berperilaku sama.
- [ ] Label status dan format IDR/WIB sama.
- [ ] Tidak ada import mock langsung dari UI.
- [ ] Tidak ada secret di klien.
