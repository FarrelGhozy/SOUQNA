import type { Store } from '../types/index.js';

export const stores: Store[] = [
  {
    id: 'store-01', owner_id: 'user-merchant-1', name: 'Kantin Berkah Jaya', slug: 'kantin-berkah-jaya',
    description: 'Jajanan dan katering harian kampus.', pickup_location: 'Kantin Lt.1 Blok A',
    delivery_available: true, delivery_fee: 5000, status: 'active',
  },
  {
    id: 'store-02', owner_id: 'user-merchant-2', name: 'Hijab Nusa', slug: 'hijab-nusa',
    description: 'Hijab dan fashion muslimah.', pickup_location: 'Ruko Kampus No.3',
    delivery_available: true, delivery_fee: 7000, status: 'active',
  },
  {
    id: 'store-03', owner_id: 'user-merchant-3', name: 'PrintQu Cepat', slug: 'printqu-cepat',
    description: 'Print, jilid, dan ATK.', pickup_location: 'Perpustakaan Lt.1',
    delivery_available: false, delivery_fee: 0, status: 'active',
  },
  {
    id: 'store-04', owner_id: 'user-merchant-4', name: 'Gadget Corner (Nonaktif)', slug: 'gadget-corner',
    description: 'Contoh toko nonaktif — tidak bisa checkout.', pickup_location: '-',
    delivery_available: false, delivery_fee: 0, status: 'inactive',
  },
];
