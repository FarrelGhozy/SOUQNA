import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Order, Product, Store } from '../types/index.js';

// Dashboard merchant ringkas: info toko + statistik produk/order/pendapatan.
export function MerchantDashboardPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, p, o] = await Promise.all([api.getMyStore(), api.getMyProducts(), api.getMerchantOrders()]);
        setStore(s);
        setProducts(p);
        setOrders(o);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat dashboard...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;
  if (!store) return <><p>Belum punya toko.</p><Link to="/become-merchant">Jadi merchant →</Link></>;

  const pending = orders.filter((o) => o.status === 'pending_merchant_confirmation').length;
  const revenue = orders
    .filter((o) => o.status !== 'rejected' && o.status !== 'cancelled')
    .reduce((s, o) => s + o.grand_total, 0);
  const published = products.filter((p) => p.status === 'published').length;

  return (
    <>
      <h1>{store.name}</h1>
      <p><small>{store.description} · Pickup: {store.pickup_location} · {store.delivery_available ? `Antar (+${formatIDR(store.delivery_fee)})` : 'Tanpa antar'}</small></p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>Produk: <b>{products.length}</b> <small>({published} tayang)</small></div>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>Order: <b>{orders.length}</b> <small>({pending} menunggu)</small></div>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>Pendapatan (COD): <b>{formatIDR(revenue)}</b></div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/merchant/products">Kelola produk</Link>
        <Link to="/merchant/orders">Order toko</Link>
        <Link to="/merchant/store">Profil toko</Link>
      </div>
    </>
  );
}
