import type { Product } from '../types/index.js';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;
let n = 0;
const v = (product_id: string, label: string, options: Record<string, string>, price: number, stock_quantity: number) =>
  ({ id: `${product_id}-v${++n % 100}`, product_id, label, options, price, stock_quantity, is_active: true });

export const products: Product[] = [
  {
    id: 'prod-01', store_id: 'store-01', category_id: 'cat-01', name: 'Ayam Geprek Sambal Bawang', slug: 'ayam-geprek',
    description: 'Ayam geprek + nasi + es teh. Level 1-5.', status: 'published', image_url: img('geprek'),
    variants: [
      { id: 'var-01a', product_id: 'prod-01', label: 'Level 1 + Es Teh', options: { level: '1' }, price: 12000, stock_quantity: 20, is_active: true },
      { id: 'var-01b', product_id: 'prod-01', label: 'Level 5 + Es Teh', options: { level: '5' }, price: 13000, stock_quantity: 0, is_active: true },
    ],
  },
  {
    id: 'prod-02', store_id: 'store-01', category_id: 'cat-01', name: 'Kopi Susu Gula Aren 500ml', slug: 'kopi-susu-aren',
    description: 'Kopi susu kekinian kampus.', status: 'published', image_url: img('kopi'),
    variants: [
      { id: 'var-02a', product_id: 'prod-02', label: 'Less Sugar', options: { gula: 'sedikit' }, price: 10000, stock_quantity: 30, is_active: true },
      { id: 'var-02b', product_id: 'prod-02', label: 'Normal', options: { gula: 'normal' }, price: 10000, stock_quantity: 25, is_active: true },
    ],
  },
  {
    id: 'prod-03', store_id: 'store-01', category_id: 'cat-01', name: 'Rice Bowl Telur Balado', slug: 'rice-bowl-telur',
    description: 'Rice bowl hemat anak kos.', status: 'published', image_url: img('ricebowl'),
    variants: [{ id: 'var-03a', product_id: 'prod-03', label: 'Reguler', options: { porsi: 'reguler' }, price: 8000, stock_quantity: 15, is_active: true }],
  },
  {
    id: 'prod-04', store_id: 'store-02', category_id: 'cat-02', name: 'Hijab Voal Premium', slug: 'hijab-voal',
    description: 'Voal anti gerah, banyak warna.', status: 'published', image_url: img('hijab'),
    variants: [
      { id: 'var-04a', product_id: 'prod-04', label: 'Hitam', options: { warna: 'Hitam' }, price: 35000, stock_quantity: 12, is_active: true },
      { id: 'var-04b', product_id: 'prod-04', label: 'Cream', options: { warna: 'Cream' }, price: 35000, stock_quantity: 8, is_active: true },
    ],
  },
  {
    id: 'prod-05', store_id: 'store-02', category_id: 'cat-02', name: 'Kemeja Flanel Kotak', slug: 'kemeja-flanel',
    description: 'Flanel tebal, size M-XL.', status: 'published', image_url: img('flanel'),
    variants: [
      { id: 'var-05a', product_id: 'prod-05', label: 'M', options: { size: 'M' }, price: 75000, stock_quantity: 5, is_active: true },
      { id: 'var-05b', product_id: 'prod-05', label: 'XL', options: { size: 'XL' }, price: 80000, stock_quantity: 3, is_active: true },
    ],
  },
  {
    id: 'prod-06', store_id: 'store-02', category_id: 'cat-02', name: 'Tote Bag Kanvas Sablon', slug: 'tote-bag',
    description: 'Tote bag sablon komunitas.', status: 'published', image_url: img('tote'),
    variants: [{ id: 'var-06a', product_id: 'prod-06', label: 'Natural', options: { warna: 'Natural' }, price: 25000, stock_quantity: 40, is_active: true }],
  },
  {
    id: 'prod-07', store_id: 'store-03', category_id: 'cat-04', name: 'Print A4 Hitam Putih (per lbr)', slug: 'print-a4',
    description: 'Print cepat, min 5 lembar.', status: 'published', image_url: img('print'),
    variants: [{ id: 'var-07a', product_id: 'prod-07', label: 'HVS 70gr', options: { kertas: 'HVS' }, price: 500, stock_quantity: 1000, is_active: true }],
  },
  {
    id: 'prod-08', store_id: 'store-03', category_id: 'cat-04', name: 'Jilid Softcover Skripsi', slug: 'jilid-skripsi',
    description: 'Jilid + cover’ elegan.', status: 'published', image_url: img('jilid'),
    variants: [{ id: 'var-08a', product_id: 'prod-08', label: 'Standar', options: { tipe: 'standar' }, price: 25000, stock_quantity: 50, is_active: true }],
  },
  {
    id: 'prod-09', store_id: 'store-03', category_id: 'cat-03', name: 'Kabel Data Type-C 1m', slug: 'kabel-typec',
    description: 'Fast charging 3A.', status: 'published', image_url: img('kabel'),
    variants: [{ id: 'var-09a', product_id: 'prod-09', label: 'Putih', options: { warna: 'Putih' }, price: 15000, stock_quantity: 0, is_active: true }],
  },
  {
    id: 'prod-10', store_id: 'store-01', category_id: 'cat-01', name: 'Pisang Coklat Lumer', slug: 'pisang-coklat',
    description: 'Jajanan sore favorit.', status: 'hidden', image_url: img('piscok'),
    variants: [{ id: 'var-10a', product_id: 'prod-10', label: 'Isi 5', options: { isi: '5' }, price: 10000, stock_quantity: 10, is_active: true }],
  },
];

// Ekspor helper stok agar api-client bisa simulasi pengurangan (dummy).
export const variantMap = new Map(products.flatMap((p) => p.variants.map((x) => [x.id, x])));
void v;
