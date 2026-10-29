import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { Order } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { OrderStatusBadge, PaymentBadge, DeliveryBadge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { EmptyState } from '../components/ui/EmptyState.js';

type MerchantOrderTab = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

export function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<MerchantOrderTab>('all');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setOrders(await api.getMerchantOrders());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat pesanan toko.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = orders.filter((o) => {
    if (tab === 'all') return true;
    if (tab === 'pending') return o.status === 'pending_merchant_confirmation';
    if (tab === 'active') return ['accepted', 'ready_for_pickup', 'out_for_delivery', 'received_by_buyer'].includes(o.status);
    if (tab === 'completed') return o.status === 'completed';
    if (tab === 'cancelled') return ['rejected', 'cancelled'].includes(o.status);
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/merchant">Dashboard Merchant</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Kelola Pesanan</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Pesanan Masuk Toko</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Konfirmasi pesanan baru, perbarui status pengantaran, dan catat pelunasan pembayaran COD
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        {[
          { key: 'all', label: `Semua (${orders.length})` },
          { key: 'pending', label: `Menunggu Konfirmasi (${orders.filter((o) => o.status === 'pending_merchant_confirmation').length})` },
          { key: 'active', label: 'Sedang Diproses' },
          { key: 'completed', label: 'Selesai' },
          { key: 'cancelled', label: 'Batal / Ditolak' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as MerchantOrderTab)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: tab === t.key ? 'var(--unida-navy)' : 'var(--surface)',
              color: tab === t.key ? 'var(--surface)' : 'var(--muted)',
              fontSize: '13px',
              fontWeight: tab === t.key ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesanan"
          description="Belum ada pesanan yang masuk dengan kategori filter ini."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((o) => (
            <div key={o.id} className="card card-hover" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: '15px', color: 'var(--unida-navy)' }}>{o.id}</strong>
                  <span style={{ color: 'var(--border-strong)' }}>•</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {formatDateWIB(o.created_at)} WIB
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <OrderStatusBadge status={o.status} />
                  <PaymentBadge status={o.payment_status} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                <DeliveryBadge method={o.delivery_method} />
                {o.handover_location_snapshot && (
                  <span style={{ fontSize: '13px', color: 'var(--unida-text)' }}>
                    📍 Titik Antar: <strong>{o.handover_location_snapshot}</strong>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Total Tagihan COD: </span>
                  <strong style={{ fontSize: '16px', color: 'var(--unida-navy)' }}>
                    {formatIDR(o.grand_total)}
                  </strong>
                </div>

                <Link to={`/merchant/orders/${o.id}`}>
                  <Button variant="primary" size="sm">
                    Proses & Perbarui Status →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
