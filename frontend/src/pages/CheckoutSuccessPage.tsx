import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Checkout, Order } from '../types/index.js';

// Ringkasan multi-merchant: 1 checkout → N orders. Penolakan 1 order
// tidak membatalkan order toko lain (independen, lihat Pesanan).
export function CheckoutSuccessPage() {
  const { checkoutId } = useParams();
  const [co, setCo] = useState<Checkout | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutId) return;
    api.getCheckout(checkoutId)
      .then((r) => {
        if (!r.checkout) setErr('Ringkasan tidak ditemukan.');
        else { setCo(r.checkout); setOrders(r.orders); }
      })
      .catch(() => setErr('Gagal memuat ringkasan.'));
  }, [checkoutId]);

  if (err) return <><p style={{ color: 'red' }}>{err}</p><Link to="/orders">Lihat pesanan</Link></>;
  if (!co) return <p>Memuat ringkasan...</p>;

  return (
    <>
      <h1>Checkout berhasil (COD)</h1>
      <p>Kode: <b>{co.checkout_code}</b> · Total: <b>{formatIDR(co.grand_total)}</b></p>
      <p><small>1 checkout → {orders.length} pesanan (satu per toko). Setiap pesanan diproses independen.</small></p>
      {orders.map((o) => (
        <div key={o.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <Link to={`/orders/${o.id}`}><b>{o.id}</b></Link> · {o.status}
          <div>{o.delivery_method === 'pickup' ? 'Ambil sendiri' : 'Diantar merchant (+' + formatIDR(o.delivery_fee) + ')'}</div>
          <div>Total COD: <b>{formatIDR(o.grand_total)}</b></div>
        </div>
      ))}
      <Link to="/orders">Lihat semua pesanan →</Link>
    </>
  );
}
