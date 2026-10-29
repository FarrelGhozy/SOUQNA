import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Order } from '../types/index.js';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { api.getOrders().then(setOrders); }, []);
  return (
    <>
      <h1>Pesanan saya</h1>
      {orders.map((o) => (
        <div key={o.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <Link to={`/orders/${o.id}`}><b>{o.id}</b></Link> · {o.status} · {o.payment_status} · {o.delivery_method}
          <div>Total COD: {formatIDR(o.grand_total)}</div>
        </div>
      ))}
    </>
  );
}
