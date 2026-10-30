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
import { TruckIcon } from '../components/ui/Icons.js';

type TabFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<TabFilter>('all');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setOrders(await api.getOrders());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat daftar pesanan.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (tab === 'all') return true;
    if (tab === 'pending') return o.status === 'pending_merchant_confirmation';
    if (tab === 'in_progress') return ['accepted', 'ready_for_pickup', 'out_for_delivery', 'received_by_buyer'].includes(o.status);
    if (tab === 'completed') return o.status === 'completed';
    if (tab === 'cancelled') return ['cancelled', 'rejected'].includes(o.status);
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Pesanan Saya</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Daftar Pesanan Saya</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Pantau status pesanan dan konfirmasi penerimaan barang belanjaan Anda
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        {[
          { key: 'all', label: 'Semua Pesanan' },
          { key: 'pending', label: 'Menunggu' },
          { key: 'in_progress', label: 'Diproses' },
          { key: 'completed', label: 'Selesai' },
          { key: 'cancelled', label: 'Batal / Ditolak' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as TabFilter)}
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

      {/* Orders List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
              <Skeleton height={20} width="40%" style={{ marginBottom: 12 }} />
              <Skeleton height={16} width="60%" style={{ marginBottom: 12 }} />
              <Skeleton height={24} width="30%" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesanan"
          description={
            tab === 'all'
              ? 'Anda belum pernah membuat pesanan di SOUQNA.'
              : 'Tidak ada pesanan dengan filter status ini.'
          }
          actionLabel={tab === 'all' ? 'Mulai Belanja Sekarang' : undefined}
          onAction={tab === 'all' ? () => window.location.assign('/search') : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredOrders.map((o) => (
            <div key={o.id} className="card card-hover" style={{ padding: 'var(--space-5)' }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>No. Pesanan:</span>
                  <strong style={{ color: 'var(--unida-navy)', fontSize: '15px' }}>{o.id}</strong>
                  <span style={{ color: 'var(--border-strong)' }}>•</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {formatDateWIB(o.created_at)} WIB
                  </span>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              {/* Badges row */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                <DeliveryBadge method={o.delivery_method} />
                <PaymentBadge status={o.payment_status} />
                {o.handover_location_snapshot && (
                  <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <TruckIcon size={14} />
                    <span>{o.handover_location_snapshot}</span>
                  </span>
                )}
              </div>

              {/* Footer row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Total Pembayaran COD: </span>
                  <strong style={{ fontSize: '16px', color: 'var(--unida-navy)' }}>
                    {formatIDR(o.grand_total)}
                  </strong>
                </div>

                <Link to={`/orders/${o.id}`}>
                  <Button variant="primary" size="sm">
                    Lihat Rincian Pesanan →
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
