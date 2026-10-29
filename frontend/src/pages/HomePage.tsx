import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, isProductOutOfStock } from '../lib/api-client.js';
import { formatDateWIB } from '../lib/format.js';
import type { Category, Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

export function HomePage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [available, setAvailable] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [c, lat, avail] = await Promise.all([
          api.getCategories(),
          api.getProducts({ sort: 'terbaru', limit: 8 }),
          api.getProducts({ sort: 'termurah', limit: 8 }),
        ]);
        setCats(c);
        setLatest(lat.data);
        // "Tersedia": hanya yang masih ada stok.
        setAvailable(avail.data.filter((p) => !isProductOutOfStock(p)).slice(0, 8));
      } catch {
        setError('Gagal memuat katalog. Coba muat ulang.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat katalog...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <h1>Pasar Kita — SOUQNA</h1>
      <p>Marketplace kampus. COD saja. {cats.length} kategori.</p>
      <h3>Kategori</h3>
      {cats.length === 0 ? <p>Belum ada kategori.</p> : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {cats.map((c) => <Link key={c.id} to={`/search?categoryId=${c.id}`} style={{ border: '1px solid #ccc', padding: '6px 10px', borderRadius: 8 }}>{c.name}</Link>)}
          <Link to="/categories" style={{ border: '1px dashed #999', padding: '6px 10px', borderRadius: 8 }}>Semua →</Link>
        </div>
      )}
      <h3>Produk terbaru</h3>
      {latest.length === 0 ? <p>Belum ada produk.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {latest.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
      <h3>Tersedia</h3>
      {available.length === 0 ? <p>Semua produk habis.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {available.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
      <p><small>Diperbarui {formatDateWIB(new Date().toISOString())} WIB</small></p>
    </>
  );
}
