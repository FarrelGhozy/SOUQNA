# Design System — SOUQNA

Acuan visual dan komponen untuk web (`frontend/`) dan Android (`flutter/`).
Dokumen ini berlaku untuk fase **UI maturity** setelah baseline mock M0–M8.
Backend/DB/Auth real tetap di luar scope sampai fase backend dimulai.

Prinsip: **rapi, terpercaya, hangat, dan kontekstual kampus/UMKM** — bukan sekadar
template marketplace. Identitas warna mengacu ke Biru UNIDA Gontor yang diberikan
pemilik proyek. Jangan memakai logo/crest UNIDA tanpa izin; palette warna bukan
klaim afiliasi resmi.

---

## 1. Prinsip desain

1. **Jelas sebelum dekoratif.** Status pesanan, harga, stok, dan aksi berikutnya
   harus terbaca dalam sekali pandang.
2. **Satu aksi utama per layar.** Tombol biru = aksi utama; gold hanya aksen.
3. **Jujur terhadap state.** Loading, kosong, error, sukses, dan state terlarang
   harus punya tampilan sendiri, bukan teks polos yang tercampur konten.
4. **Mobile-first, desktop efisien.** Alur inti harus nyaman di 390 px, tetapi
   dashboard merchant/admin memanfaatkan layar lebar.
5. **Tenang dan konsisten.** Tidak ada warna acak, shadow berlebihan, emoji
   sebagai ikon, atau animasi yang mengganggu.
6. **Aksesibel.** Target WCAG 2.2 AA; fokus keyboard terlihat; target sentuh
   minimal 44×44 px.
7. **Tidak memperluas scope.** Design system tidak menambah fitur bisnis baru.

---

## 2. Token warna

### 2.1 Palette inti

Sumber: config pemilik proyek. Hex ini adalah **satu-satunya sumber warna brand**.

| Token | Hex | Peran |
|---|---|---|
| `unida-navy` | `#0B2A4A` | Header, sidebar, heading, surface brand, teks di atas gold |
| `unida-navy-dark` | `#071D34` | Hover/active di navy, overlay, footer |
| `unida-blue` | `#1E6091` | CTA utama, link, active nav, focus ring |
| `unida-blue-hover` | `#164E77` | Hover/pressed CTA biru |
| `unida-gold` | `#D4AF37` | Aksen, underline aktif, badge, border tipis |
| `unida-bg` | `#F1F5F9` | Background halaman |
| `unida-text` | `#0F172A` | Teks utama |

### 2.2 Token semantik turunan

| Token | Hex | Peran |
|---|---|---|
| `surface` | `#FFFFFF` | Card, modal, form, navbar terang |
| `surface-muted` | `#F8FAFC` | Baris tabel hover, panel sekunder |
| `border` | `#E2E8F0` | Border card/input/tabel |
| `border-strong` | `#CBD5E1` | Border input aktif/divider kuat |
| `muted` | `#64748B` | Teks sekunder, placeholder, metadata |
| `success` | `#15803D` | Lunas, selesai, stok tersedia |
| `success-soft` | `#DCFCE7` | Background badge sukses |
| `warning` | `#B45309` | Menunggu konfirmasi, stok menipis |
| `warning-soft` | `#FEF3C7` | Background badge peringatan |
| `danger` | `#B91C1C` | Error, tolak, batal, stok habis |
| `danger-soft` | `#FEE2E2` | Background badge bahaya |
| `info` | `#0369A1` | Informasi netral |
| `info-soft` | `#E0F2FE` | Background badge info |
| `gold-soft` | `#FBF3D9` | Background badge aksen emas |

Warna status **tidak boleh** memakai gold sebagai pengganti warning/success.

### 2.3 Kontras (WCAG)

| Kombinasi | Rasio | Penggunaan |
|---|---:|---|
| Putih `#FFFFFF` di navy `#0B2A4A` | 14.54:1 | Teks header/sidebar |
| Putih di blue `#1E6091` | 6.69:1 | Teks tombol utama |
| Putih di blue-hover `#164E77` | 8.79:1 | Teks tombol hover |
| Navy di gold `#D4AF37` | 6.91:1 | Teks di atas badge emas |
| Putih di gold | 2.10:1 | **Dilarang untuk teks** |
| Text `#0F172A` di bg `#F1F5F9` | 16.30:1 | Teks body |

Aturan gold:

- Gold boleh untuk garis, border, ikon, underline, dan badge dengan teks navy.
- Gold **tidak boleh** menjadi warna teks di atas putih.
- Gold **tidak boleh** menjadi background tombol utama dengan teks putih.
- Jika ragu, gold dipakai sebagai aksen 1–2 px, bukan blok besar.

---

## 3. Tipografi

Rekomendasi: **Plus Jakarta Sans** (OFL) untuk web dan Flutter.
Fallback web: `system-ui, -apple-system, "Segoe UI", sans-serif`.
Fallback Flutter: font default platform bila aset belum tersedia.

| Level | Ukuran | Weight | Line-height | Penggunaan |
|---|---:|---:|---:|---|
| Display | 36 px | 700 | 1.15 | Hero beranda |
| H1 | 30 px | 700 | 1.2 | Judul halaman |
| H2 | 24 px | 700 | 1.25 | Section |
| H3 | 20 px | 600 | 1.3 | Subsection/card besar |
| Body | 16 px | 400 | 1.5 | Teks utama |
| Body small | 14 px | 400 | 1.45 | Metadata, helper |
| Caption | 12 px | 500 | 1.35 | Badge, label kecil |
| Button | 14–16 px | 600 | 1.2 | Semua tombol |

Mobile: turunkan Display/H1 satu tingkat (30/26 px). Jangan memakai font size
di bawah 12 px untuk teks yang harus dibaca.

---

## 4. Spacing, radius, border, shadow

Skala spacing (px): `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
Gunakan kelipatan 4; hindari angka acak.

| Token | Nilai | Penggunaan |
|---|---|---|
| `radius-sm` | 8 px | Badge, input kecil |
| `radius-md` | 12 px | Card, button, input |
| `radius-lg` | 16 px | Panel, modal |
| `radius-full` | 999 px | Chip, avatar, pill |
| `shadow-sm` | `0 1px 2px rgba(15,23,42,.06)` | Card diam |
| `shadow-md` | `0 8px 24px rgba(15,23,42,.08)` | Dropdown/modal |
| `border` | 1 px solid `#E2E8F0` | Card dan divider |

Card default: surface putih, border 1 px, radius 12, shadow-sm.
Jangan memakai shadow besar pada daftar panjang; gunakan border.

---

## 5. Layout dan breakpoint

| Breakpoint | Lebar | Perilaku |
|---|---:|---|
| Mobile | < 640 px | 1 kolom, bottom nav, filter collapsible |
| Tablet | 640–1023 px | 2 kolom, nav ringkas |
| Desktop | ≥ 1024 px | Container 1200 px, sidebar merchant/admin |
| Wide | ≥ 1280 px | Container maksimal 1280 px |

Aturan:

- Container publik: max-width 1200 px, padding horizontal 16 px (mobile) / 24 px.
- Grid produk: 2 kolom (mobile), 3 (tablet), 4–5 (desktop).
- Auth: panel brand + form; mobile hanya form.
- Merchant/admin: sidebar 240 px di desktop, drawer/tab di mobile.
- Checkout/cart: konten + ringkasan sticky di desktop; stacked di mobile.
- Header publik: tinggi 64 px; mobile memakai bottom nav 5 tab.
- Tidak boleh ada horizontal scroll pada 320–390 px.

---

## 6. Komponen wajib

### 6.1 Button

| Varian | Default | Hover | Dipakai untuk |
|---|---|---|---|
| Primary | bg blue, teks putih | bg blue-hover | Aksi utama |
| Secondary | surface, border strong, teks navy | bg surface-muted | Aksi sekunder |
| Ghost | transparan, teks blue | bg info-soft | Link aksi ringan |
| Danger | bg danger, teks putih | gelap 8% | Tolak/hapus |
| Gold accent | bg gold, teks navy | gold-soft | Hanya aksen khusus |

Ukuran: `sm` 32 px, `md` 40 px, `lg` 48 px. Target sentuh minimal 44 px di mobile.
State: default, hover, focus-visible, pressed, disabled, loading.
Tombol loading menampilkan spinner + label tetap; jangan mengubah lebar mendadak.

### 6.2 Input dan form

- Label di atas, helper di bawah, error di bawah dengan warna danger.
- Tinggi minimal 44 px; radius 12; border `border`.
- Focus ring 2 px `blue` + offset 2 px.
- Wajib punya `id`/`htmlFor` (web) dan semantic label (Flutter).
- Placeholder bukan pengganti label.
- Validasi tampil dekat field; error form utama memakai alert.

### 6.3 Card

- Produk: gambar 1:1, judul maks 2 baris, harga navy, nama toko muted, badge stok.
- Statistik: label kecil muted, angka besar navy, delta/status opsional.
- Order: ID pendek, status badge, total, tanggal, aksi berikutnya.
- Card tidak boleh menjadi tautan penuh jika ada tombol di dalamnya; gunakan
  area gambar/judul sebagai tautan.

### 6.4 Badge status

| Status order | Label | Warna |
|---|---|---|
| `pending_merchant_confirmation` | Menunggu konfirmasi | warning |
| `accepted` | Diterima merchant | info |
| `ready_for_pickup` | Siap diambil | info |
| `out_for_delivery` | Sedang diantar | info |
| `received_by_buyer` | Diterima, menunggu pelunasan | warning |
| `completed` | Selesai | success |
| `rejected` | Ditolak | danger |
| `cancelled` | Dibatalkan | muted/danger-soft |

| Payment | Label |
|---|---|
| `unpaid` | Belum dibayar |
| `paid` | Lunas (COD) |

| Delivery | Label |
|---|---|
| `pickup` | Ambil sendiri |
| `merchant_delivery` | Diantar merchant |

Jangan menampilkan enum mentah ke pengguna.

### 6.5 Alert, toast, empty, loading

- **Alert inline:** untuk error form/validasi yang perlu dibaca ulang.
- **Toast:** sukses/gagal aksi singkat; desktop kanan atas, mobile bawah;
  hilang otomatis 4 detik; `aria-live="polite"` di web.
- **Empty state:** ikon/ilustrasi sederhana + satu kalimat + CTA bila relevan.
- **Loading:** skeleton untuk daftar/card; spinner untuk aksi submit.
- **Error state:** pesan manusiawi + tombol “Coba lagi”; jangan hanya `alert`.

### 6.6 Navigasi

- Web publik desktop: header navy, wordmark putih, link putih, active gold.
- Web publik mobile: bottom nav 5 tab: Beranda, Cari, Keranjang, Pesanan, Akun.
- Merchant/admin desktop: sidebar navy; item aktif memakai background biru gelap
  dan indikator gold di kiri.
- Flutter: `NavigationBar`/`BottomNavigationBar` 5 tab; AppBar navy.
- Fokus keyboard harus terlihat; skip link “Lewati ke konten” di web.

### 6.7 Tabel dan dashboard

- Gunakan tabel hanya di desktop; mobile menjadi card list.
- Header tabel muted, baris hover surface-muted, angka rata kanan.
- Statistik: maksimal 4 kartu per baris; angka penting lebih besar.
- Aksi destruktif memakai konfirmasi modal.

---

## 7. Pola halaman

### 7.1 Publik

- **Beranda:** hero singkat + CTA, kategori, produk terbaru, produk tersedia.
- **Pencarian:** search, filter chip, sort, grid, pagination; filter sticky di desktop.
- **Kategori:** grid card kategori dengan deskripsi singkat.
- **Detail produk:** 2 kolom desktop (gambar + info), 1 kolom mobile; varian,
  stok, harga, toko, wishlist, chat, ulasan.
- **Detail toko:** header toko, status, metode pemenuhan, produk toko.

### 7.2 Auth

- Split screen: panel navy berisi brand + value proposition; form putih.
- Login demo: jelaskan bahwa ini mode demo; switch peran dipisah visual.
- Error email/validasi dekat field.
- Link daftar/masuk konsisten.

### 7.3 Akun dan transaksi

- **Keranjang:** grup per toko, qty stepper, hapus, status blokir jelas.
- **Checkout:** pemenuhan per toko, lokasi, voucher, ringkasan sticky.
- **Sukses checkout:** kode checkout, daftar order per toko, CTA ke pesanan.
- **Pesanan:** filter status, card, badge; detail dengan timeline.
- **Wishlist:** grid produk + aksi hapus.
- **Chat:** daftar thread + panel pesan; purge banner; input 2000 char.
- **Profil:** data akun, edit, logout, jadi merchant.

### 7.4 Merchant

- Dashboard: toko, pending order, produk tayang, pendapatan **terverifikasi**.
- Produk: tabel/card, status, stok, aksi edit/hapus.
- Form produk: validasi, preview gambar, varian minimal 1.
- Order: aksi kontekstual sesuai status dan metode pemenuhan.
- Profil toko: pickup, delivery, fee, status.

### 7.5 Admin

- Dashboard: statistik + order per status.
- Users: recovery, status, aksi aman.
- Kategori/voucher: CRUD dengan konfirmasi.
- Produk: moderasi hide/publish.
- Orders: read-only, filter status.
- Audit log: waktu, admin, aksi, target.

---

## 8. Aksesibilitas

Target WCAG 2.2 AA.

- Semua gambar punya `alt`/semantic label; gambar dekoratif `alt=""`.
- Form punya label permanen; error dihubungkan ke field.
- Fokus keyboard terlihat; urutan tab logis; tidak ada focus trap liar.
- Target sentuh minimal 44×44 px.
- Kontras teks minimal 4.5:1; teks besar 3:1.
- Jangan mengandalkan warna saja untuk status; sertakan teks/ikon.
- `prefers-reduced-motion` dihormati; animasi maksimal 200 ms.
- Toast/alert penting diumumkan lewat `aria-live`.
- Bahasa halaman: `lang="id"`.
- Uji dengan keyboard, zoom 200%, dan screen reader dasar.

---

## 9. Mapping implementasi

### 9.1 Web

Token kanonik di `frontend/src/styles/tokens.css`:

```css
:root {
  --unida-navy: #0B2A4A;
  --unida-navy-dark: #071D34;
  --unida-blue: #1E6091;
  --unida-blue-hover: #164E77;
  --unida-gold: #D4AF37;
  --unida-bg: #F1F5F9;
  --unida-text: #0F172A;

  --surface: #FFFFFF;
  --surface-muted: #F8FAFC;
  --border: #E2E8F0;
  --border-strong: #CBD5E1;
  --muted: #64748B;
  --success: #15803D;
  --warning: #B45309;
  --danger: #B91C1C;
  --info: #0369A1;
  --gold-soft: #FBF3D9;
}
```

Aturan:

- Tidak ada hex langsung di page/component di luar file token.
- Class semantik (`.btn-primary`, `.card`, `.badge-warning`) lebih diutamakan
  daripada inline style.
- Jika Tailwind dipakai, config berikut adalah adapter token, bukan sumber baru:

```js
colors: {
  unida: {
    navy: { DEFAULT: '#0B2A4A', dark: '#071D34' },
    blue: { DEFAULT: '#1E6091', hover: '#164E77' },
    gold: '#D4AF37',
    bg: '#F1F5F9',
    text: '#0F172A',
  },
  surface: '#FFFFFF',
  border: '#E2E8F0',
  muted: '#64748B',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
}
```

Rekomendasi saat ini: **CSS variables + komponen reusable**, tanpa menambah
dependensi Tailwind. Keputusan final dicatat di issue fondasi UI.

### 9.2 Flutter

Gunakan `ColorScheme` eksplisit, bukan `colorSchemeSeed` hijau:

```dart
const scheme = ColorScheme.light(
  primary: Color(0xFF1E6091),
  onPrimary: Colors.white,
  secondary: Color(0xFFD4AF37),
  onSecondary: Color(0xFF0B2A4A),
  surface: Colors.white,
  onSurface: Color(0xFF0F172A),
  error: Color(0xFFB91C1C),
);
```

`ThemeData` wajib menetapkan:

- `scaffoldBackgroundColor: Color(0xFFF1F5F9)`
- `appBarTheme` navy + teks putih
- `navigationBarTheme`/`bottomNavigationBarTheme` active blue, indicator gold-soft
- `inputDecorationTheme` border, focus blue, radius 12
- `cardTheme` surface, radius 12, border
- `textTheme` mengikuti skala tipografi

Shade/tint boleh dibuat dengan `Color.withValues(alpha: ...)`, tetapi warna
utama harus tetap token di atas.

---

## 10. Do / Don't

**Do**

- Gunakan navy untuk struktur, blue untuk aksi, gold untuk aksen.
- Tampilkan label status bahasa Indonesia.
- Tampilkan skeleton saat memuat daftar.
- Beri umpan balik sukses/gagal yang jelas.
- Uji 390 px, 768 px, 1280 px.
- Pertahankan kontrak `api-client` dan field snake_case.

**Don't**

- Jangan memakai gold untuk teks di atas putih.
- Jangan memakai putih di atas gold.
- Jangan memakai `alert()` untuk feedback utama.
- Jangan menampilkan enum/ID mentah tanpa label.
- Jangan menambah warna brand baru tanpa memperbarui dokumen ini.
- Jangan mengubah alur bisnis hanya demi tampilan.
- Jangan menambah dark mode, animasi kompleks, atau library UI berat di MVP.

---

## 11. Checklist adopsi

- [ ] Token web tersedia dan tidak ada hex liar di page/component.
- [ ] Komponen dasar web tersedia dan dipakai ulang.
- [ ] Header/sidebar/bottom nav responsif.
- [ ] Flutter `ThemeData` memakai palette UNIDA.
- [ ] Semua status memakai label dan badge.
- [ ] Loading, empty, error, success state ada di halaman utama.
- [ ] Kontras dan fokus keyboard lolos audit.
- [ ] Uji viewport 390/768/1280 dan emulator Android.
- [ ] Screenshot before/after dilampirkan di issue/PR.
