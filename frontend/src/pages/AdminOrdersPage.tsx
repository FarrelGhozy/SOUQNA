import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { Order } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { OrderStatusBadge, PaymentBadge, DeliveryBadge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setOrders(await api.getAdminOrders());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat orders admin.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = orders.filter((o) => {
    if (!q.trim()) return true;
    const term = q.toLowerCase();
    return o.id.toLowerCase().includes(term) || o.store_id.toLowerCase().includes(term) || o.buyer_id.toLowerCase().includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/admin">Dashboard Admin</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Monitoring Pesanan</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Semua Pesanan Kampus ({orders.length})</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Pemantauan transaksi COD, kepatuhan toko, dan bantuan sengketa pesanan civitas
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {/* Filter Bar */}
      <div className="card" style={{ padding: 'var(--space-3)' }}>
        <input
          placeholder="Cari berdasarkan ID pesanan, ID toko, atau ID pembeli..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="form-input"
          style={{ minHeight: 40 }}
        />
      </div>

      {/* Orders Monitoring Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={60} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Toko</th>
                <th>Tanggal Dibuat</th>
                <th>Pengiriman</th>
                <th>Status Bayar</th>
                <th>Total COD</th>
                <th>Status Pesanan</th>
                <th style={{ textAlign: 'right' }}>Rincian</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong style={{ color: 'var(--unida-navy)' }}>{o.id}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px' }}>{o.store_id}</code>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {formatDateWIB(o.created_at)} WIB
                  </td>
                  <td>
                    <DeliveryBadge method={o.delivery_method} />
                  </td>
                  <td>
                    <PaymentBadge status={o.payment_status} />
                  </td>
                  <td>
                    <strong style={{ color: 'var(--unida-navy)' }}>{formatIDR(o.grand_total)}</strong>
                  </td>
                  <td>
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/orders/${o.id}`}>
                      <Button variant="secondary" size="sm">
                        Detail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
