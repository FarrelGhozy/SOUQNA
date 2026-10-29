import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { Order, Product, Store } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { OrderStatusBadge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';

export function MerchantDashboardPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, p, o] = await Promise.all([api.getMyStore(), api.getMyProducts(), api.getMerchantOrders()]);
        setStore(s);
        setProducts(p);
        setOrders(o);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat dashboard merchant.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Skeleton height={100} borderRadius="var(--radius-lg)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={110} borderRadius="var(--radius-md)" />
          ))}
        </div>
      </div>
    );
  }

  if (err) return <Alert variant="danger">{err}</Alert>;

  if (!store) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--unida-navy)' }}>Anda Belum Memiliki Toko</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 'var(--space-2) 0 var(--space-4) 0' }}>
          Daftarkan toko Anda sekarang untuk mulai menjual produk di kampus UNIDA Gontor.
        </p>
        <Link to="/become-merchant">
          <Button variant="primary">Buka Toko Sekarang →</Button>
        </Link>
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === 'pending_merchant_confirmation').length;
  // Pendapatan terverifikasi: hanya pesanan yang completed dan berstatus paid (COD)
  const verifiedRevenue = orders
    .filter((o) => o.status === 'completed' && o.payment_status === 'paid')
    .reduce((s, o) => s + o.grand_total, 0);

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Store Banner */}
      <div
        className="card"
        style={{
          padding: 'var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Toko Merchant Aktif
          </span>
          <h1 style={{ fontSize: '24px', margin: '2px 0 6px 0', color: 'var(--unida-navy)' }}>
            {store.name}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
            {store.pickup_location} · {store.delivery_available ? `Antar: ${store.delivery_fee === 0 ? 'Gratis' : formatIDR(store.delivery_fee)}` : 'Ambil di tempat'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/stores/${store.id}`}>
            <Button variant="secondary" size="sm">
              Lihat Tampilan Toko Publik ↗
            </Button>
          </Link>
          <Link to="/merchant/products/new">
            <Button variant="primary" size="sm">
              + Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Menunggu Konfirmasi</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--unida-navy)', marginTop: 4 }}>
            {pending}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>
            Pesanan baru perlu diproses
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--unida-blue)' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Produk Tayang</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--unida-navy)', marginTop: 4 }}>
            {publishedCount} <span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--muted)' }}>/ {products.length}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>
            Katalog aktif di pasar
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Pendapatan Terverifikasi</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
            {formatIDR(verifiedRevenue)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>
            Pesanan COD berstatus selesai & lunas
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--unida-gold)' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Pesanan</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--unida-navy)', marginTop: 4 }}>
            {orders.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>
            Sepanjang waktu
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>Pesanan Masuk Terbaru</h2>
          <Link to="/merchant/orders" style={{ fontSize: '13px', fontWeight: 600 }}>
            Semua Pesanan ({orders.length}) →
          </Link>
        </div>
        <div className="card-body">
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0, textAlign: 'center', padding: 'var(--space-4)' }}>
              Belum ada pesanan yang masuk untuk toko Anda.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: 'var(--unida-navy)' }}>{o.id}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {formatDateWIB(o.created_at)} WIB
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 2 }}>
                      Metode: {o.delivery_method === 'pickup' ? 'Ambil Sendiri' : 'Diantar Merchant'} · Total: <strong>{formatIDR(o.grand_total)}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <OrderStatusBadge status={o.status} />
                    <Link to={`/merchant/orders/${o.id}`}>
                      <Button variant="secondary" size="sm">
                        Kelola
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
