import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Category, Product } from '../types/index.js';

export function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState<Category[]>([]);
  const [prods, setProds] = useState<Product[]>([]);
  const q = sp.get('q') ?? '';
  const categoryId = sp.get('categoryId') ?? '';
  useEffect(() => { api.getCategories().then(setCats); }, []);
  useEffect(() => { api.getProducts({ q, categoryId }).then(setProds); }, [q, categoryId]);
  return (
    <>
      <h1>Pencarian</h1>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="cth: geprek, hijab, print" value={q} onChange={(e) => setSp({ q: e.target.value, categoryId })} />
        <select value={categoryId} onChange={(e) => setSp({ q, categoryId: e.target.value })}>
          <option value="">Semua kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </form>
      {prods.length === 0 ? <p>Tidak ada produk. Coba kata kunci lain.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginTop: 12 }}>
          {prods.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
              <img src={p.image_url} alt={p.name} width="100%" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              <b>{p.name}</b><div>{formatIDR(Math.min(...p.variants.map((v) => v.price)))}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
