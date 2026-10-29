import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Product, Store } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

export function StoreDetailPage() {
  const { storeId } = useParams();
  const nav = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [prods, setProds] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const s = await api.getStore(storeId);
        if (!s) { setError('Toko tidak ditemukan.'); return; }
        setStore(s);
        setProds(await api.getStoreProducts(s.id));
      } catch {
        setError('Gagal memuat toko. Coba lagi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  if (loading) return <p>Memuat toko...</p>;
  if (error) return <><Link to="/">← Beranda</Link><p style={{ color: 'red' }}>{error}</p></>;
  if (!store) return <><Link to="/">← Beranda</Link><p>Toko tidak ada.</p></>;

  const off = store.status !== 'active';
  return (
    <>
      <Link to="/">← Beranda</Link>
      <h1>{store.name}</h1>
      <p>{store.description}</p>
      <p><small>Pickup: {store.pickup_location} · {store.delivery_available ? `Antar ${store.delivery_fee === 0 ? 'gratis' : `Rp${store.delivery_fee}`}` : 'Pickup saja'}</small></p>
      {off && <p style={{ color: 'red' }}>Toko {store.status} — produk tidak bisa checkout.</p>}
      <button onClick={async () => {
        try {
          const c = await api.getOrCreateConversation(store.id);
          nav(`/chat?thread=${c.id}`);
        } catch (e) {
          alert(e instanceof Error ? e.message : 'Gagal buka chat.');
        }
      }}>Chat toko</button>
      <h3>Produk toko ({prods.length})</h3>
      {prods.length === 0 ? <p>Toko ini belum punya produk aktif.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {prods.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </>
  );
}
