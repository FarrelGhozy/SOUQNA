import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, productMinPrice } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Product } from '../types/index.js';

// Moderasi produk: hide/publish/suspend + cari.
export function AdminProductsPage() {
  const [prods, setProds] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async (query: string) => setProds(await api.getAdminProducts(query || undefined));

  useEffect(() => {
    (async () => {
      try {
        await load('');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat produk.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat produk...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <Link to="/admin">← Dashboard</Link>
      <h1>Moderasi produk ({prods.length})</h1>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <input placeholder="Cari nama/slug" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={() => load(q)}>Cari</button>
      </div>
      {prods.map((p) => (
        <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <Link to={`/products/${p.id}`}><b>{p.name}</b></Link>
          <small> · {p.status} · {p.store_id} · mulai {formatIDR(productMinPrice(p))}</small>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['published', 'hidden', 'suspended'] as const).map((st) => (
              <button key={st} disabled={p.status === st} onClick={async () => {
                await api.setProductStatusAdmin(p.id, st);
                setMsg(`${p.name} → ${st}.`);
                await load(q);
              }}>{st === 'published' ? 'Publish' : st === 'hidden' ? 'Hide' : 'Suspend'}</button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
