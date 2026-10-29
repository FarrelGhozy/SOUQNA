import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { Order } from '../types/index.js';

// List order milik toko merchant yang login (tokonya saja).
export function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await api.getMerchantOrders());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat order toko.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat order toko...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <h1>Order toko saya</h1>
      {orders.length === 0 ? <p>Belum ada order untuk tokomu.</p> : orders.map((o) => (
        <div key={o.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <Link to={`/merchant/orders/${o.id}`}><b>{o.id}</b></Link> · {o.status} · {o.payment_status}
          <div>Total COD: {formatIDR(o.grand_total)} · <small>{formatDateWIB(o.created_at)} WIB</small></div>
        </div>
      ))}
    </>
  );
}
