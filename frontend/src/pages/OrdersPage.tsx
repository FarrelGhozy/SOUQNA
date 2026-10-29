import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { Order } from '../types/index.js';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await api.getOrders());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat pesanan.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat pesanan...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <h1>Pesanan saya</h1>
      {orders.length === 0 ? <p>Belum ada pesanan. <Link to="/search">Belanja</Link></p> : orders.map((o) => (
        <div key={o.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <Link to={`/orders/${o.id}`}><b>{o.id}</b></Link> · {o.status} · {o.payment_status} · {o.delivery_method}
          <div>Total COD: {formatIDR(o.grand_total)} · <small>{formatDateWIB(o.created_at)} WIB</small></div>
        </div>
      ))}
    </>
  );
}
