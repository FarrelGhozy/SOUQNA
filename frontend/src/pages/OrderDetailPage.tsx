import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [data, setData] = useState<{ order: any; items: any[] } | null>(null);
  useEffect(() => { if (orderId) api.getOrder(orderId).then(setData); }, [orderId]);
  if (!data?.order) return <p>Memuat...</p>;
  const o = data.order;
  return (
    <>
      <h1>Order {o.id}</h1>
      <p>Status: {o.status} · Bayar: {o.payment_status} (COD) · Kirim: {o.delivery_method} · Fee {formatIDR(o.delivery_fee)}</p>
      <p>Total: {formatIDR(o.grand_total)}</p>
      <h3>Aksi dummy (transisi legal saja)</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['cancel', 'confirm-received', 'accept', 'reject', 'ready-for-pickup', 'out-for-delivery', 'mark-paid'].map((a) => (
          <button key={a} onClick={() => alert(`Simulasi ${a} — aturan: cancel hanya saat pending; completed = terima + lunas.`)}>{a}</button>
        ))}
      </div>
      <h3>Items</h3>
      {data.items.map((i: any) => <div key={i.id}>{i.product_name_snapshot} × {i.quantity} — {formatIDR(i.line_total)}</div>)}
    </>
  );
}
