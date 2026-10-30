import type { Product } from '../types/index.js';

const img = (slug: string) => `/images/products/${slug}.jpg`;
// created_at statis agar sort "terbaru" deterministik.
const d = (day: number) => new Date(Date.UTC(2026, 9, day, 3, 0, 0)).toISOString();

export const products: Product[] = [
  {
    id: 'prod-01', store_id: 'store-01', category_id: 'cat-01', name: 'Ayam Geprek Sambal Bawang', slug: 'ayam-geprek',
    description: 'Ayam geprek + nasi + es teh. Level 1-5.', status: 'published', image_url: img('ayam-geprek'),
    created_at: d(20),
    variants: [
      { id: 'var-01a', product_id: 'prod-01', label: 'Level 1 + Es Teh', options: { level: '1' }, price: 12000, stock_quantity: 20, is_active: true },
      { id: 'var-01b', product_id: 'prod-01', label: 'Level 5 + Es Teh', options: { level: '5' }, price: 13000, stock_quantity: 0, is_active: true },
    ],
  },
  {
    id: 'prod-02', store_id: 'store-01', category_id: 'cat-01', name: 'Kopi Susu Gula Aren 500ml', slug: 'kopi-susu-aren',
    description: 'Kopi susu kekinian kampus.', status: 'published', image_url: img('kopi-susu-aren'),
    created_at: d(18),
    variants: [
      { id: 'var-02a', product_id: 'prod-02', label: 'Less Sugar', options: { gula: 'sedikit' }, price: 10000, stock_quantity: 30, is_active: true },
      { id: 'var-02b', product_id: 'prod-02', label: 'Normal', options: { gula: 'normal' }, price: 10000, stock_quantity: 25, is_active: true },
    ],
  },
  {
    id: 'prod-03', store_id: 'store-01', category_id: 'cat-01', name: 'Rice Bowl Telur Balado', slug: 'rice-bowl-telur',
    description: 'Rice bowl hemat anak kos.', status: 'published', image_url: img('rice-bowl-telur'),
    created_at: d(15),
    variants: [{ id: 'var-03a', product_id: 'prod-03', label: 'Reguler', options: { porsi: 'reguler' }, price: 8000, stock_quantity: 15, is_active: true }],
  },
  {
    id: 'prod-04', store_id: 'store-02', category_id: 'cat-02', name: 'Hijab Voal Premium', slug: 'hijab-voal',
    description: 'Voal anti gerah, banyak warna.', status: 'published', image_url: img('hijab-voal'),
    created_at: d(22),
    variants: [
      { id: 'var-04a', product_id: 'prod-04', label: 'Hitam', options: { warna: 'Hitam' }, price: 35000, stock_quantity: 12, is_active: true },
      { id: 'var-04b', product_id: 'prod-04', label: 'Cream', options: { warna: 'Cream' }, price: 35000, stock_quantity: 8, is_active: true },
    ],
  },
  {
    id: 'prod-05', store_id: 'store-02', category_id: 'cat-02', name: 'Kemeja Flanel Kotak', slug: 'kemeja-flanel',
    description: 'Flanel tebal, size M-XL.', status: 'published', image_url: img('kemeja-flanel'),
    created_at: d(12),
    variants: [
      { id: 'var-05a', product_id: 'prod-05', label: 'M', options: { size: 'M' }, price: 75000, stock_quantity: 5, is_active: true },
      { id: 'var-05b', product_id: 'prod-05', label: 'XL', options: { size: 'XL' }, price: 80000, stock_quantity: 3, is_active: true },
    ],
  },
  {
    id: 'prod-06', store_id: 'store-02', category_id: 'cat-02', name: 'Tote Bag Kanvas Sablon', slug: 'tote-bag',
    description: 'Tote bag sablon komunitas.', status: 'published', image_url: img('tote-bag'),
    created_at: d(10),
    variants: [{ id: 'var-06a', product_id: 'prod-06', label: 'Natural', options: { warna: 'Natural' }, price: 25000, stock_quantity: 40, is_active: true }],
  },
  {
    id: 'prod-07', store_id: 'store-03', category_id: 'cat-04', name: 'Print A4 Hitam Putih (per lbr)', slug: 'print-a4',
    description: 'Print cepat, min 5 lembar.', status: 'published', image_url: img('print-a4'),
    created_at: d(25),
    variants: [{ id: 'var-07a', product_id: 'prod-07', label: 'HVS 70gr', options: { kertas: 'HVS' }, price: 500, stock_quantity: 1000, is_active: true }],
  },
  {
    id: 'prod-08', store_id: 'store-03', category_id: 'cat-04', name: 'Jilid Softcover Skripsi', slug: 'jilid-skripsi',
    description: 'Jilid + cover elegan.', status: 'published', image_url: img('jilid-skripsi'),
    created_at: d(8),
    variants: [{ id: 'var-08a', product_id: 'prod-08', label: 'Standar', options: { tipe: 'standar' }, price: 25000, stock_quantity: 50, is_active: true }],
  },
  {
    id: 'prod-09', store_id: 'store-03', category_id: 'cat-03', name: 'Kabel Data Type-C 1m', slug: 'kabel-typec',
    description: 'Fast charging 3A.', status: 'published', image_url: img('kabel-typec'),
    created_at: d(5),
    variants: [{ id: 'var-09a', product_id: 'prod-09', label: 'Putih', options: { warna: 'Putih' }, price: 15000, stock_quantity: 0, is_active: true }],
  },
  {
    id: 'prod-10', store_id: 'store-01', category_id: 'cat-01', name: 'Pisang Coklat Lumer', slug: 'pisang-coklat',
    description: 'Jajanan sore favorit.', status: 'hidden', image_url: img('pisang-coklat'),
    created_at: d(3),
    variants: [{ id: 'var-10a', product_id: 'prod-10', label: 'Isi 5', options: { isi: '5' }, price: 10000, stock_quantity: 10, is_active: true }],
  },
  {
    id: 'prod-11', store_id: 'store-01', category_id: 'cat-01', name: 'Es Teh Manis Jumbo', slug: 'es-teh-jumbo',
    description: 'Es teh gula batu, gelas jumbo.', status: 'published', image_url: img('es-teh-jumbo'),
    created_at: d(27),
    variants: [
      { id: 'var-11a', product_id: 'prod-11', label: 'Manis', options: { rasa: 'manis' }, price: 3500, stock_quantity: 100, is_active: true },
      { id: 'var-11b', product_id: 'prod-11', label: 'Tawar', options: { rasa: 'tawar' }, price: 3000, stock_quantity: 80, is_active: true },
    ],
  },
  {
    id: 'prod-12', store_id: 'store-02', category_id: 'cat-05', name: 'Sunscreen Tone Up SPF50', slug: 'sunscreen-spf50',
    description: 'Sunscreen ringan untuk aktivitas kampus.', status: 'published', image_url: img('sunscreen-spf50'),
    created_at: d(26),
    variants: [{ id: 'var-12a', product_id: 'prod-12', label: '30ml', options: { ukuran: '30ml' }, price: 45000, stock_quantity: 20, is_active: true }],
  },
  {
    id: 'prod-13', store_id: 'store-02', category_id: 'cat-05', name: 'Lip Tint Mini', slug: 'lip-tint-mini',
    description: 'Lip tint travel size, 2 shade.', status: 'published', image_url: img('lip-tint-mini'),
    created_at: d(24),
    variants: [
      { id: 'var-13a', product_id: 'prod-13', label: 'Cherry', options: { shade: 'cherry' }, price: 28000, stock_quantity: 14, is_active: true },
      { id: 'var-13b', product_id: 'prod-13', label: 'Peach', options: { shade: 'peach' }, price: 28000, stock_quantity: 0, is_active: true },
    ],
  },
  {
    id: 'prod-14', store_id: 'store-03', category_id: 'cat-06', name: 'Jasa Cuci Sepatu Express', slug: 'cuci-sepatu',
    description: 'Cuci sepatu 1 hari jadi, area kampus.', status: 'published', image_url: img('cuci-sepatu'),
    created_at: d(28),
    variants: [{ id: 'var-14a', product_id: 'prod-14', label: 'Reguler', options: { paket: 'reguler' }, price: 20000, stock_quantity: 30, is_active: true }],
  },
  {
    id: 'prod-15', store_id: 'store-03', category_id: 'cat-06', name: 'Jasa Desain Poster', slug: 'desain-poster',
    description: 'Desain poster acara/organisasi, revisi 2x.', status: 'published', image_url: img('desain-poster'),
    created_at: d(29),
    variants: [{ id: 'var-15a', product_id: 'prod-15', label: '1 Desain', options: { paket: '1-desain' }, price: 50000, stock_quantity: 10, is_active: true }],
  },
  {
    id: 'prod-16', store_id: 'store-01', category_id: 'cat-01', name: 'Nasi Goreng Mawut', slug: 'nasgor-mawut',
    description: 'Nasgor + mi, porsi jumbo. Stok contoh habis.', status: 'published', image_url: img('nasgor-mawut'),
    created_at: d(6),
    variants: [
      { id: 'var-16a', product_id: 'prod-16', label: 'Original', options: { level: 'ori' }, price: 13000, stock_quantity: 0, is_active: true },
      { id: 'var-16b', product_id: 'prod-16', label: 'Pedas', options: { level: 'pedas' }, price: 14000, stock_quantity: 0, is_active: true },
    ],
  },
  {
    id: 'prod-17', store_id: 'store-02', category_id: 'cat-02', name: 'Celana Kulot Linen', slug: 'kulot-linen',
    description: 'Kulot linen adem, all size.', status: 'published', image_url: img('kulot-linen'),
    created_at: d(21),
    variants: [{ id: 'var-17a', product_id: 'prod-17', label: 'All Size', options: { size: 'all' }, price: 65000, stock_quantity: 7, is_active: true }],
  },
  {
    id: 'prod-18', store_id: 'store-04', category_id: 'cat-03', name: 'Powerbank 10000mAh', slug: 'powerbank-10k',
    description: 'Contoh produk toko nonaktif — tidak tampil di katalog.', status: 'published', image_url: img('powerbank-10k'),
    created_at: d(19),
    variants: [{ id: 'var-18a', product_id: 'prod-18', label: 'Hitam', options: { warna: 'hitam' }, price: 120000, stock_quantity: 5, is_active: true }],
  },
  {
    id: 'prod-19', store_id: 'store-03', category_id: 'cat-03', name: 'Mouse Wireless Silent', slug: 'mouse-silent',
    description: 'Mouse silent untuk ruang baca.', status: 'published', image_url: img('mouse-silent'),
    created_at: d(23),
    variants: [{ id: 'var-19a', product_id: 'prod-19', label: 'Hitam', options: { warna: 'hitam' }, price: 85000, stock_quantity: 9, is_active: true }],
  },
  {
    id: 'prod-20', store_id: 'store-02', category_id: 'cat-02', name: 'Inner Hijab Ciput Rajut', slug: 'inner-ciput',
    description: 'Contoh produk suspended — tidak tampil publik.', status: 'suspended', image_url: img('ciput-rajut'),
    created_at: d(2),
    variants: [{ id: 'var-20a', product_id: 'prod-20', label: 'Hitam', options: { warna: 'hitam' }, price: 15000, stock_quantity: 25, is_active: true }],
  },
];

// Helper stok agar api-client bisa simulasi pengurangan (dummy).
export const variantMap = new Map(products.flatMap((p) => p.variants.map((x) => [x.id, x])));
