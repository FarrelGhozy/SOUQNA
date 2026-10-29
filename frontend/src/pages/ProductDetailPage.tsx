import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Product } from '../types/index.js';

export function ProductDetailPage() {
  const { productId } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [sel, setSel] = useState(0);
  useEffect(() => { if (productId) api.getProduct(productId).then((x) => { setP(x); setSel(0); }); }, [productId]);
  if (!p) return <p>Memuat...</p>;
  const v = p.variants[sel];
  const habis = p.variants.every((x) => x.stock_quantity === 0);
  return (
    <>
      <Link to="/search">← Kembali</Link>
      <h1>{p.name}</h1>
      <img src={p.image_url} alt={p.name} width={320} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
      <p>{p.description}</p>
      {habis && <p style={{ color: 'red' }}>Stok habis — tidak bisa checkout.</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        {p.variants.map((x, i) => (
          <button key={x.id} disabled={x.stock_quantity === 0} onClick={() => setSel(i)} style={{ fontWeight: i === sel ? 800 : 400 }}>
            {x.label} — {formatIDR(x.price)} ({x.stock_quantity})
          </button>
        ))}
      </div>
      {v && <p><b>{formatIDR(v.price)}</b> · stok {v.stock_quantity}</p>}
      <button disabled={habis || !v || v.stock_quantity === 0} onClick={() => {
        const raw = localStorage.getItem('souqna:cart');
        const cart = raw ? JSON.parse(raw) : [];
        cart.push({ id: `cart-${Date.now()}`, variant_id: v.id, quantity: 1 });
        localStorage.setItem('souqna:cart', JSON.stringify(cart));
        alert('Masuk keranjang (dummy)');
      }}>+ Keranjang</button>
    </>
  );
}
