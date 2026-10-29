import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { Product, Review, Store } from '../types/index.js';

export function ProductDetailPage() {
  const { productId } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sel, setSel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const prod = await api.getProduct(productId);
        if (!prod) { setError('Produk tidak ditemukan.'); setP(null); return; }
        setP(prod);
        setSel(0);
        const [s, r] = await Promise.all([api.getStore(prod.store_id), api.getReviews(prod.id)]);
        setStore(s);
        setReviews(r);
      } catch {
        setError('Gagal memuat produk. Coba lagi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  if (loading) return <p>Memuat...</p>;
  if (error) return <><Link to="/search">← Kembali</Link><p style={{ color: 'red' }}>{error}</p></>;
  if (!p) return <><Link to="/search">← Kembali</Link><p>Produk tidak ada.</p></>;

  const v = p.variants[sel];
  const habis = p.variants.every((x) => x.stock_quantity === 0);
  const hidden = p.status !== 'published';
  const storeOff = !store || store.status !== 'active';
  const blocked = habis || hidden || storeOff;

  return (
    <>
      <Link to="/search">← Kembali</Link>
      <h1>{p.name}</h1>
      <img src={p.image_url} alt={p.name} width={320} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
      <p>{p.description}</p>
      <p><small>Dibuat {formatDateWIB(p.created_at)} WIB</small></p>
      {store && <p>Toko: <Link to={`/stores/${store.id}`}>{store.name}</Link>{storeOff && ' (nonaktif)'}</p>}
      {hidden && <p style={{ color: 'red' }}>Produk ini disembunyikan — tidak bisa checkout.</p>}
      {storeOff && <p style={{ color: 'red' }}>Toko nonaktif — tidak bisa checkout.</p>}
      {habis && !hidden && !storeOff && <p style={{ color: 'red' }}>Stok habis — tidak bisa checkout.</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {p.variants.map((x, i) => (
          <button key={x.id} disabled={x.stock_quantity === 0} onClick={() => setSel(i)} style={{ fontWeight: i === sel ? 800 : 400 }}>
            {x.label} — {formatIDR(x.price)} ({x.stock_quantity})
          </button>
        ))}
      </div>
      {v && <p><b>{formatIDR(v.price)}</b> · stok {v.stock_quantity}</p>}
      <button disabled={blocked || !v || v.stock_quantity === 0} onClick={async () => {
        try {
          await api.addToCart(v.id, 1);
          alert('Masuk keranjang (dummy)');
        } catch (e) {
          alert(e instanceof Error ? e.message : 'Gagal tambah keranjang.');
        }
      }}>+ Keranjang</button>
      <h3>Ulasan ({reviews.length})</h3>
      {reviews.length === 0 ? <p>Belum ada ulasan.</p> : reviews.map((r) => (
        <div key={r.id} style={{ borderTop: '1px solid #eee', padding: '6px 0' }}>
          <b>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</b>
          <div>{r.review_text ?? '-'}</div>
          <small>{formatDateWIB(r.created_at)} WIB</small>
        </div>
      ))}
    </>
  );
}
