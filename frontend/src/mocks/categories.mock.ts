import type { Category } from '../types/index.js';

export const categories: Category[] = [
  { id: 'cat-01', name: 'Makanan & Minuman', slug: 'makanan-minuman', description: 'Jajanan kampus dan katering UMKM', is_active: true },
  { id: 'cat-02', name: 'Fashion', slug: 'fashion', description: 'Pakaian, hijab, aksesoris', is_active: true },
  { id: 'cat-03', name: 'Elektronik & Aksesoris', slug: 'elektronik', description: 'Aksesoris HP, laptop, lampu', is_active: true },
  { id: 'cat-04', name: 'Alat Tulis & Buku', slug: 'atk-buku', description: 'Fotokopi, print, buku kuliah', is_active: true },
  { id: 'cat-05', name: 'Kesehatan & Kecantikan', slug: 'kesehatan', description: 'Skincare, herbal, vitamin', is_active: true },
  { id: 'cat-06', name: 'Jasa & Lainnya', slug: 'jasa', description: 'Laundry, servis, desain', is_active: true },
];
