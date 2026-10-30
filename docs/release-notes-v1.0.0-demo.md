# Release Notes — SOUQNA v1.0.0-demo

Versi rilis demo mock-first aplikasi **SOUQNA — Pasar Kita UNIDA Gontor**.

Rilis ini menyelesaikan seluruh milestone baseline produk (M0 s/d M12) dengan integrasi data mock realistis, sistem desain Biru UNIDA Gontor, alur transaksi COD multi-toko, suite pengujian unit otomatis, dan kualitas antarmuka WCAG 2.2 AA.

---

## Sorotan Fitur Utama (Highlights)

### 1. Desain Visual & Identitas Kampus UNIDA Gontor
- Mengusung tema resmi **Biru UNIDA Gontor** (`#0B2A4A`, `#1E6091`, `#D4AF37`) dengan sistem token CSS dan Material 3 theme.
- Mengganti seluruh placeholder foto produk lama dengan **20 foto produk nyata dan berkualitas tinggi** berformat JPEG representatif produk kuliner, merchandise, dan jasa kampus.
- Tata letak responsif penuh dari layar ponsel ringkas (360px), tablet, hingga layar desktop lebar dengan navigasi bottom-nav mobile dan footer kampus terpadu.

### 2. Alur Transaksi COD (Cash on Delivery) Kampus Terintegrasi
- **Multi-Store Checkout:** Pembeli dapat membeli barang dari beberapa toko merchant sekaligus dalam satu keranjang, yang otomatis dipecah menjadi pesanan terpisah per merchant (1 Checkout → N Orders).
- **Metode Serah Terima:** Pilihan fleksibel antara Ambil Sendiri (Pickup di stan/asrama) atau Diantar Merchant ke titik temu kampus (Fakultas/Gedung).
- **Sistem Voucher:** Dukungan diskon potongan tetap (nominal) dan potongan persentase dengan ambang batas minimal belanja.
- **Siklus Hidup Pesanan COD:** Transisi status pesanan yang realistis dari penerimaan merchant, pengantaran, konfirmasi penerimaan pembeli, hingga pelunasan tunai di tempat.
- **Pengembalian Stok Otomatis:** Pembatalan atau penolakan pesanan mengembalikan kuantitas stok varian secara aman dan idempoten.

### 3. Panel Khusus Multi-Peran (Multi-Role Support)
- **Pembeli (Buyer):** Jelajah katalog, pencarian kata kunci, keranjang belanja, histori pesanan COD, ulasan bintang 1–5, wishlist produk, dan obrolan chat langsung dengan merchant.
- **Penjual (Merchant):** Dashboard omzet COD, manajemen katalog produk & varian harga, pemrosesan pesanan masuk, dan pengaturan profil toko.
- **Administrator (Admin):** Dashboard statistik civitas, moderasi produk & toko, manajemen kategori, pembuatan voucher promo, dan audit log kronologis.
- **1-Klik Akun Demo:** Memudahkan presentasi dan pengujian cepat tanpa ribet mengetik kredensial login.

### 4. Kualitas Kode & Pengujian Otomatis (Quality Gate)
- **Bun Runtime:** Menggunakan Bun v1.4+ untuk manajemen paket cepat dan eksekusi test runner bawaan.
- **Test Suite Otomatis (18 Unit Tests):** Menguji perhitungan harga, voucher, aturan transisi pesanan, mitigasi stok, dan validasi ulasan.
- **Skrip Verifikasi Lengkap:** `bun run verify` menggabungkan TypeScript typecheck (`tsc --noEmit`), unit test (`bun test`), dan Vite production build.
- **Parity Check Antar-Platform:** Skrip `./scripts/demo-e2e.sh` memverifikasi keselarasan ID, nama, status, dan harga antara web frontend dan Flutter mock.
- **Aksesibilitas WCAG 2.2 AA:** Navigasi keyboard penuh dengan focus ring, skip link, kontras warna teruji (rasio hingga 18.7:1), target sentuh ≥ 44px, dan live region reader.
- **GitHub Actions CI:** Pipeline integrasi berkelanjutan otomatis pada branch `main`.

---

## Catatan Arsitektur & Lingkup (Scope Note)
- SOUQNA versi `v1.0.0-demo` beroperasi menggunakan **arsitektur mock-first** (data dummy tersimpan di memori dan localStorage browser) tanpa dependensi backend database live.
- Seluruh kontrak antarmuka API klien dirancang menggunakan snake_case dan endpoint standar `/api/v1` sesuai kontrak OpenAPI (`docs/openapi.yaml`), sehingga transisi ke backend database nyata di masa mendatang dapat dilakukan dengan mengganti transport API tanpa merombak antarmuka komponen UI.
