import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Category, Product } from '../types/index.js';

export function HomePage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [prods, setProds] = useState<Product[]>([]);
  useEffect(() => { api.getCategories().then(setCats); api.getProducts().then(setProds); }, []);
  return (
    <>
      <h1>Pasar Kita — SOUQNA</h1>
      <p>Marketplace kampus. COD saja. {cats.length} kategori, {prods.length} produk dummy.</p>
      <h3>Kategori</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {cats.map((c) => <Link key={c.id} to={`/search?categoryId=${c.id}`} style={{ border: '1px solid #ccc', padding: '6px 10px', borderRadius: 8 }}>{c.name}</Link>)}
      </div>
      <h3>Produk terbaru</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
        {prods.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
            <img src={p.image_url} alt={p.name} width="100%" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
            <b>{p.name}</b>
            <div>{formatIDR(Math.min(...p.variants.map((v) => v.price)))}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
