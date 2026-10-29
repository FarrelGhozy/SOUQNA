# 8. Halaman & UX

> Disarikan dari §11–§12.

## Web (§11.1)

Publik: Beranda, Search, Kategori, Detail produk, Detail toko, Login/register, Reset password.
User: Profil, Keranjang, Checkout, Ringkasan multi-merchant, Orders, Wishlist, Chat, Ulasan, Jadi Merchant.
Merchant: Dashboard, Profil toko, Daftar produk, Form produk, Variasi/harga/stok/gambar, Orders, Chat.
Admin: Dashboard, Users, Kategori, Moderasi produk, Orders, Voucher, Audit log.

## Android (§11.2)

Bottom nav: Beranda, Kategori/Pencarian, Keranjang, Pesanan, Akun. Merchant via menu akun jika punya toko. Admin di Android opsional.

## Nonfungsional

- Indonesia, responsif (web desktop+mobile), Android multi-ukuran.
- Tiap halaman: loading, empty, success, error. Harga IDR. Status habis/hidden/voucher invalid/jelas.
- Pagination katalog/pesan/order/admin. Indeks FK + kolom filter. Jangan fetch tanpa batas. Kompres gambar. Query seperlunya.
- Keamanan (nanti backend): validasi, parameterized, rate limit, CORS ketat, tanpa secret di log, batas upload, cegah IDOR, audit, backup.
- Transaksi (nanti): checkout atomik, cegah oversell, cancel/reject idempotent + kembalikan stok sekali, catat `order_status_history`, total dari server.
