import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Product, WishlistItem } from '../types/index.js';

// Wishlist milik user yang login (unique per produk).
export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [prods, setProds] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const w = await api.getWishlist();
    setItems(w);
    const map: Record<string, Product> = {};
    for (const it of w) {
      const p = await api.getProduct(it.product_id);
      if (p) map[it.product_id] = p;
    }
    setProds(map);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat wishlist.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat wishlist...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <h1>Wishlist saya ({items.length})</h1>
      {items.length === 0 ? <p>Belum ada favorit. <Link to="/search">Cari produk →</Link></p> : items.map((w) => {
        const p = prods[w.product_id];
        return (
          <div key={w.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
            {p ? <><Link to={`/products/${p.id}`}><b>{p.name}</b></Link> <small>· {p.status}</small></>
              : <b>{w.product_id}</b>}
            <div>
              <button onClick={async () => { await api.removeFromWishlist(w.product_id); await load(); }}>
                Hapus
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
