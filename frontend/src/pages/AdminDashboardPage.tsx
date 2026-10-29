import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import { OrderStatusBadge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';

export function AdminDashboardPage() {
  const [s, setS] = useState<Awaited<ReturnType<typeof api.getAdminStats>> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setS(await api.getAdminStats());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat statistik admin.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Skeleton height={60} width="40%" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} height={110} borderRadius="var(--radius-md)" />
          ))}
        </div>
      </div>
    );
  }

  if (err || !s) return <Alert variant="danger">{err || 'Gagal memuat data.'}</Alert>;

  const statCards = [
    { label: 'Total Pengguna', value: String(s.users), sub: 'Civitas & Merchant', link: '/admin/users', border: 'var(--unida-blue)' },
    { label: 'Toko Merchant', value: `${s.activeStores} / ${s.stores}`, sub: 'Toko berstatus aktif', link: '/admin/orders', border: 'var(--unida-navy)' },
    { label: 'Katalog Produk', value: `${s.publishedProducts} / ${s.products}`, sub: 'Produk aktif tayang', link: '/admin/products', border: 'var(--success)' },
    { label: 'Total Pesanan', value: String(s.orders), sub: 'Semua transaksi COD', link: '/admin/orders', border: 'var(--unida-gold)' },
    { label: 'Omzet COD Terverifikasi', value: formatIDR(s.revenue), sub: 'Pesanan selesai & lunas', link: '/admin/orders', border: 'var(--success)' },
    { label: 'Voucher Promo', value: `${s.activeVouchers} Aktif`, sub: 'Kupon diskon berjalan', link: '/admin/vouchers', border: 'var(--warning)' },
    { label: 'Ulasan Produk', value: String(s.reviews), sub: 'Feedback pembeli', link: '/admin/products', border: 'var(--info)' },
    { label: 'Percakapan Chat', value: String(s.conversations), sub: 'Thread aktif', link: '/admin/audit-logs', border: 'var(--muted)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Dashboard Administrator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Ringkasan operasional pasar digital dan statistik transaksi kampus UNIDA Gontor
        </p>
      </div>

      {/* 8 Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {statCards.map((c) => (
          <div
            key={c.label}
            className="card card-hover"
            style={{
              padding: 'var(--space-4)',
              borderLeft: `4px solid ${c.border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--unida-navy)', margin: '6px 0 2px 0' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{c.sub}</div>
            </div>
            <Link to={c.link} style={{ fontSize: '12px', fontWeight: 600, marginTop: 'var(--space-3)' }}>
              Kelola data →
            </Link>
          </div>
        ))}
      </div>

      {/* Orders Distribution Breakdown */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>Distribusi Status Pesanan Kampus</h2>
          <Link to="/admin/orders" style={{ fontSize: '13px', fontWeight: 600 }}>
            Lihat Semua Pesanan →
          </Link>
        </div>
        <div className="card-body">
          {Object.keys(s.ordersByStatus).length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Belum ada pesanan.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
              {Object.entries(s.ordersByStatus).map(([st, count]) => (
                <div
                  key={st}
                  style={{
                    background: 'var(--surface-muted)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <OrderStatusBadge status={st} />
                  <strong style={{ fontSize: '16px', color: 'var(--unida-navy)' }}>{count} pesanan</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
