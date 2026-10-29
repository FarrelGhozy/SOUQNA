import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Checkout, Order } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { OrderStatusBadge, DeliveryBadge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';

export function CheckoutSuccessPage() {
  const { checkoutId } = useParams();
  const [co, setCo] = useState<Checkout | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutId) return;
    api.getCheckout(checkoutId)
      .then((r) => {
        if (!r.checkout) {
          setErr('Rincian checkout tidak ditemukan.');
        } else {
          setCo(r.checkout);
          setOrders(r.orders);
        }
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Gagal memuat ringkasan checkout.'))
      .finally(() => setLoading(false));
  }, [checkoutId]);

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Skeleton height={180} borderRadius="var(--radius-lg)" />
        <Skeleton height={120} borderRadius="var(--radius-md)" />
      </div>
    );
  }

  if (err || !co) {
    return (
      <div style={{ maxWidth: 640, margin: 'var(--space-8) auto' }}>
        <Alert variant="danger">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{err || 'Checkout tidak ditemukan.'}</span>
            <Link to="/orders">
              <Button variant="secondary" size="sm">Daftar Pesanan</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Celebration Header Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-8) var(--space-6)',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-muted) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--success-soft)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: 'var(--space-3)',
          }}
        >
          ✓
        </div>

        <h1 style={{ fontSize: '26px', color: 'var(--unida-navy)', marginBottom: 'var(--space-1)' }}>
          Pesanan Berhasil Dibuat!
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: 460, margin: 0 }}>
          Terima kasih telah berbelanja di SOUQNA. Pesanan Anda telah diteruskan ke masing-masing merchant untuk segera disiapkan.
        </p>

        {/* Checkout Code Badge */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--gold-soft)',
            border: '1px solid var(--unida-gold)',
            color: 'var(--unida-navy)',
            fontWeight: 700,
            fontSize: '15px',
            letterSpacing: '0.05em',
          }}
        >
          KODE CHECKOUT: {co.checkout_code}
        </div>

        <div style={{ marginTop: 'var(--space-3)', fontSize: '13px', color: 'var(--muted)' }}>
          Total Tagihan COD: <strong style={{ color: 'var(--unida-navy)', fontSize: '16px' }}>{formatIDR(co.grand_total)}</strong>
        </div>
      </div>

      {/* Orders List per Store */}
      <div>
        <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-2)' }}>
          Daftar Pesanan ({orders.length} Toko)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: 'var(--space-3)' }}>
          Setiap toko memproses pesanan secara terpisah. Penyerahan dan pembayaran COD dilakukan per merchant.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {orders.map((o) => (
            <div key={o.id} className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', marginRight: 6 }}>ID Pesanan:</span>
                  <strong style={{ color: 'var(--unida-navy)' }}>{o.id}</strong>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <DeliveryBadge method={o.delivery_method} />
                {o.delivery_fee > 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    (+ Ongkir {formatIDR(o.delivery_fee)})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Total COD: </span>
                  <strong style={{ color: 'var(--unida-navy)', fontSize: '15px' }}>{formatIDR(o.grand_total)}</strong>
                </div>
                <Link to={`/orders/${o.id}`}>
                  <Button variant="secondary" size="sm">
                    Detail Pesanan →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
        <Link to="/orders">
          <Button variant="primary" size="md">
            Lihat Semua Pesanan Saya
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="md">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
