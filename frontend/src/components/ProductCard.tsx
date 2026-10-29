import { Link } from 'react-router-dom';
import { formatIDR } from '../lib/format.js';
import { isProductOutOfStock, productMinPrice } from '../lib/api-client.js';
import type { Product } from '../types/index.js';

// Kartu produk reusable — harga dari helper, gambar wajib fallback.
export function ProductCard({ p }: { p: Product }) {
  const habis = isProductOutOfStock(p);
  return (
    <Link to={`/products/${p.id}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, opacity: habis ? 0.75 : 1 }}>
      <img
        src={p.image_url} alt={p.name} width="100%" loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
      />
      <b>{p.name}</b>
      <div>{formatIDR(productMinPrice(p))}</div>
      {habis && <div style={{ color: 'red', fontSize: 12 }}>Stok habis</div>}
    </Link>
  );
}
