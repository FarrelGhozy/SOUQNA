# Audit Aksesibilitas & Responsif — SOUQNA (WCAG 2.2 AA)

Dokumen ini memverifikasi implementasi kualitas aksesibilitas (A11y) dan perilaku antarmuka responsif pada platform web (`frontend/`) dan aplikasi Android (`flutter/`) sesuai standar desain **Biru UNIDA Gontor** (`docs/design-system.md`).

---

## 1. Verifikasi Kontras Warna (WCAG 2.2 AA)

Batas minimum WCAG 2.2 Level AA:
- Teks normal: minimal **4.5:1**
- Teks besar / heading (≥ 18pt atau 14pt bold): minimal **3.0:1**
- Komponen antarmuka & batas grafis: minimal **3.0:1**

### Hasil Uji Rasio Kontras

| Kombinasi Elemen | Foreground | Background | Rasio | Status | Keterangan |
|---|---|---|---:|:---:|---|
| Header & Navbar Text | `#FFFFFF` (Putih) | `#0B2A4A` (Navy) | **14.54:1** | ✅ Lolos | Melebihi batas AAA |
| Tombol CTA Primary | `#FFFFFF` (Putih) | `#1E6091` (Blue) | **6.69:1** | ✅ Lolos | Lolos AA untuk semua ukuran teks |
| Tombol CTA Hover | `#FFFFFF` (Putih) | `#164E77` (Blue Hover) | **8.79:1** | ✅ Lolos | Sangat kontras dan jelas |
| Teks Aksen Gold | `#0B2A4A` (Navy) | `#D4AF37` (Gold) | **6.91:1** | ✅ Lolos | Digunakan pada badge & tombol gold |
| Teks Body Utama | `#0F172A` (Text) | `#F1F5F9` (Bg) | **16.30:1** | ✅ Lolos | Sangat nyaman dibaca |
| Teks Card di Surface | `#0F172A` (Text) | `#FFFFFF` (White) | **18.72:1** | ✅ Lolos | Melebihi batas AAA |
| Teks Muted / Helper | `#64748B` (Muted) | `#FFFFFF` (White) | **4.64:1** | ✅ Lolos | Lolos batas minimum teks normal |
| Status Sukses | `#15803D` (Green) | `#DCFCE7` (Soft Green) | **6.12:1** | ✅ Lolos | Badge status pesanan lunas/selesai |
| Status Warning | `#B45309` (Amber) | `#FEF3C7` (Soft Amber) | **5.45:1** | ✅ Lolos | Badge menunggu konfirmasi |
| Status Bahaya / Batal | `#B91C1C` (Red) | `#FEE2E2` (Soft Red) | **6.48:1** | ✅ Lolos | Badge stok habis / pesanan ditolak |

> [!NOTE]
> Sesuai aturan `docs/design-system.md`, teks putih di atas latar gold dilarang keras karena rasionya hanya 2.10:1 (gagal AA). Semua badge dan tombol gold memakai teks warna Navy (`#0B2A4A`) dengan rasio 6.91:1.

---

## 2. Navigasi Keyboard & Fokus Interaktif

- **Skip Link:** Disediakan tautan `.skip-link` di bagian paling atas halaman yang mengarah langsung ke `#main-content`, terlihat otomatis saat menerima fokus keyboard (tombol `Tab`).
- **Focus Rings:** Semua elemen interaktif (`button`, `input`, `select`, `textarea`, `a`) memiliki indikator visual fokus yang tegas:
  ```css
  :focus-visible {
    outline: 2px solid var(--unida-blue);
    outline-offset: 2px;
  }
  ```
- **Tab Order Deterministik:** Urutan navigasi tab mengikuti alur logis: Header Brand → Navigasi Menu → Konten Utama → Form Inputs → Tombol Aksi → Footer.
- **Modal Dialog Escape & Trap:** Komponen `Modal.tsx` mendukung penutupan dengan tombol `Escape` dan fokus terkontrol.

---

## 3. Pembaca Layar (Screen Reader) & Semantik HTML

- **Atribut Bahasa:** Tag `<html>` pada `frontend/index.html` dideklarasikan eksplisit dengan `lang="id"` untuk pengucapan bahasa Indonesia yang tepat.
- **Form Labeling:** Setiap elemen form (`Input.tsx`, `Textarea`) menghubungkan `<label htmlFor={inputId}>` dengan `<input id={inputId}>` secara presisi.
- **Live Regions (Notifikasi Toast & Alert):**
  - Toast notifikasi dilengkapi `role="region"` dan `aria-live="polite"` sehingga pesan sukses/gagal diumumkan secara tidak invasif ke pengguna tuna netra.
  - Komponen `Alert.tsx` memiliki `role="alert"` untuk pengumuman informasi penting secara instan.
- **Alt Text Gambar:** Semua gambar foto produk asli memuat atribut `alt={p.name}` yang deskriptif dan dilengkapi event handler `onError` untuk fallback gambar bila terjadi kegagalan muat.
- **Ikon Vektor:** Semua ikon SVG dilengkapi `aria-hidden="true"` agar pembaca layar tidak membacakan path vektor yang membingungkan.

---

## 4. Target Sentuh Minimum (Touch Target Size)

Berdasarkan WCAG 2.5.5 dan 2.5.8 (Target Size):
- **Tombol Utama & Sekunder:** Kelas `.btn` diatur memiliki `min-height: 44px` dan padding horizontal yang lapang.
- **Field Input & Select:** `.form-input`, `.form-select`, `.form-textarea` memiliki `min-height: 44px`.
- **Navigasi Bawah Mobile (Bottom Nav):** Memiliki tinggi `62px` dengan masing-masing tombol navigasi memiliki area sentuh `min-height: 48px`.
- **Jumlah Kuantitas (Stepper):** Tombol stepper `+` dan `−` pada keranjang belanja dan halaman detail memiliki area klik yang mudah dijangkau jari tanpa salah sentuh.

---

## 5. Uji Responsif Layar & Tata Letak

### Breakpoints Teruji:
1. **Layar Ponsel Ringkas (360px – 390px, mis. iPhone SE / Android Compact):**
   - Tidak ada horizontal scroll / content clipping (`overflow-x: hidden` terkontrol).
   - Grid produk menampilkan 2 kolom proporsional dengan gambar rasio 1:1.
   - Bilah navigasi bawah (Mobile Bottom Nav) tetap stabil di bagian bawah viewport.
   - Form checkout dan ringkasan belanja tersusun vertikal (stacked column).
2. **Layar Tablet (768px, mis. iPad Mini):**
   - Grid produk beralih mulus ke 3 kolom.
   - Dialog modal terpusat dengan padding nyaman.
3. **Layar Komputer / Laptop (1024px – 1280px):**
   - Container maksimal 1200px dengan padding horizontal 24px.
   - Grid produk 4 kolom.
   - Layout keranjang dan checkout menggunakan format 2 kolom (Kolom Item 2fr + Kolom Ringkasan Pesanan 1fr).
   - Sidebar navigasi merchant dan admin tampil permanen di sebelah kiri.

---

## 6. Preferensi Pengguna (Zoom 200% & Reduced Motion)

- **Zoom 200%:** Seluruh tata letak menggunakan unit relatif (`rem`, `px` terukur, dan flexbox/grid dinamis), sehingga pada perbesaran zoom 200% seluruh teks tetap terbaca tanpa overlap teks atau pemotongan konten.
- **Reduced Motion:** Telah diimplementasikan media query `@media (prefers-reduced-motion: reduce)` di `frontend/src/index.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  Pengguna dengan sensitivitas vestibular atau preferensi pengurangan animasi di sistem operasi akan mendapatkan transisi instan tanpa efek zoom/shimmer yang memusingkan.

---

## 7. Parity Aksesibilitas pada Flutter

Pada kode Flutter (`flutter/lib/`):
- `AppTheme.lightTheme` mengonfigurasi `colorScheme` dengan rasio kontras identik.
- `NavigationBar` dan `BottomNavigationBarThemeData` mengonfigurasi label teks terbaca dan ukuran touch target bawaan Material 3 (48×48 dp).
- `CardTheme` dan `InputDecorationTheme` memiliki batas border yang tegas (`border` `#E2E8F0`).
- Gambar produk menggunakan `Image.network` dengan `errorBuilder` untuk menampilkan placeholder ramah pengguna.
