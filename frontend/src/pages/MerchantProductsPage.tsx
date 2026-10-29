import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, productMinPrice } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Category, Product } from '../types/index.js';

// Daftar produk milik toko sendiri + aksi tayang/sembunyi/hapus + tambah/edit.
export function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const [p, c] = await Promise.all([api.getMyProducts(), api.getCategories()]);
    setProducts(p);
    setCats(c);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat produk.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat produk...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? id;

  return (
    <>
      <Link to="/merchant">← Dashboard</Link>
      <h1>Produk saya ({products.length})</h1>
      {toast && <p style={{ color: 'green' }}>{toast}</p>}
      <p><Link to="/merchant/products/new">+ Tambah produk</Link></p>
      {products.length === 0 ? <p>Belum ada produk. Tambah produk pertamamu.</p> : products.map((p) => {
        const stock = p.variants.reduce((s, v) => s + v.stock_quantity, 0);
        return (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
            <b>{p.name}</b> <small>· {catName(p.category_id)} · {p.status}{p.status !== 'published' && ' (tidak tampil di katalog publik)'}</small>
            <div>Mulai {formatIDR(productMinPrice(p))} · stok {stock} · {p.variants.length} varian</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <Link to={`/merchant/products/${p.id}/edit`}>Edit</Link>
              {p.status === 'published'
                ? <button onClick={async () => { await api.updateMyProduct(p.id, { status: 'hidden' }); setToast(`${p.name} disembunyikan.`); await load(); }}>Sembunyikan</button>
                : <button onClick={async () => { await api.updateMyProduct(p.id, { status: 'published' }); setToast(`${p.name} ditayangkan.`); await load(); }}>Tayangkan</button>}
              <button onClick={async () => {
                if (!confirm(`Hapus ${p.name}?`)) return;
                await api.deleteMyProduct(p.id);
                setToast(`${p.name} dihapus/diarsipkan.`);
                await load();
              }}>Hapus</button>
            </div>
          </div>
        );
      })}
    </>
  );
}
