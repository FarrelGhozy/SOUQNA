import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type OrderAction } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { MockUser, Order, OrderItem, OrderStatusHistory, Review, Store } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { OrderStatusBadge, PaymentBadge, DeliveryBadge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { useToast } from '../components/ui/ToastContext.js';
import { CheckIcon } from '../components/ui/Icons.js';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [hist, setHist] = useState<OrderStatusHistory[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [me, setMe] = useState<MockUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async (id: string) => {
    try {
      setLoading(true);
      const [d, h, m] = await Promise.all([api.getOrder(id), api.getOrderHistory(id), api.getMe()]);
      if (!d.order) {
        setErr('Pesanan tidak ditemukan.');
        return;
      }
      setOrder(d.order);
      setItems(d.items);
      setHist(h);
      setMe(m);
      setStore(await api.getStore(d.order.store_id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    load(orderId);
  }, [orderId]);

  const act = async (a: OrderAction, label: string) => {
    if (!orderId) return;
    setBusy(true);
    try {
      const o = await api.transitionOrder(orderId, a);
      setOrder(o);
      setHist(await api.getOrderHistory(orderId));
      toast.success(`${label} berhasil diperbarui.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Aksi gagal dilakukan.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Skeleton height={140} borderRadius="var(--radius-lg)" />
        <Skeleton height={200} borderRadius="var(--radius-md)" />
      </div>
    );
  }

  if (err || !order) {
    return (
      <div style={{ maxWidth: 840, margin: 'var(--space-6) auto' }}>
        <Alert variant="danger">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{err || 'Pesanan tidak ditemukan.'}</span>
            <Link to="/orders">
              <Button variant="secondary" size="sm">Kembali ke Daftar Pesanan</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  const isBuyer = me?.id === order.buyer_id;
  const isMerchant = Boolean(store && store.owner_id === me?.id);
  const pending = order.status === 'pending_merchant_confirmation';
  const accepted = order.status === 'accepted';
  const handed = order.status === 'ready_for_pickup' || order.status === 'out_for_delivery';
  const terminal = ['completed', 'rejected', 'cancelled'].includes(order.status);

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8 }}>
        <Link to="/orders">Daftar Pesanan</Link>
        <span>/</span>
        <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Rincian {order.id}</span>
      </nav>

      {/* Order Main Header Card */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: 2 }}>Nomor Pesanan</div>
            <h1 style={{ fontSize: '24px', margin: 0, color: 'var(--unida-navy)' }}>{order.id}</h1>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 4 }}>
              Dibuat pada {formatDateWIB(order.created_at)} WIB
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <OrderStatusBadge status={order.status} />
            <PaymentBadge status={order.payment_status} />
          </div>
        </div>

        {/* Store & Handover Logistics Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border)',
            fontSize: '14px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Toko Penjual:</div>
            {store ? (
              <Link to={`/stores/${store.id}`} style={{ fontWeight: 700, color: 'var(--unida-navy)' }}>
                {store.name}
              </Link>
            ) : (
              <strong>{order.store_id}</strong>
            )}
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Metode Penyerahan:</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
              <DeliveryBadge method={order.delivery_method} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Lokasi / Titik Temu:</div>
            <strong>
              {order.handover_location_snapshot || (order.delivery_method === 'pickup' && store?.pickup_location) || 'Gerai toko'}
            </strong>
          </div>
        </div>

        {order.buyer_note && (
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)', fontSize: '13px' }}>
            <span style={{ color: 'var(--muted)' }}>Catatan Pembeli: </span>
            <span style={{ fontStyle: 'italic' }}>"{order.buyer_note}"</span>
          </div>
        )}
      </div>

      {/* Contextual Action Buttons */}
      {(isBuyer || isMerchant) && !terminal && (
        <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--gold-soft)', border: '1px solid var(--unida-gold)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--unida-navy)', marginBottom: 'var(--space-2)' }}>
            Aksi Berikutnya:
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Buyer actions */}
            {isBuyer && pending && (
              <Button variant="danger" size="md" disabled={busy} onClick={() => act('cancel', 'Pembatalan Pesanan')}>
                Batalkan Pesanan
              </Button>
            )}
            {isBuyer && handed && (
              <Button variant="primary" size="md" disabled={busy} onClick={() => act('confirm-received', 'Konfirmasi Penerimaan')}>
                <CheckIcon size={16} />
                <span>Saya Sudah Menerima Barang</span>
              </Button>
            )}

            {/* Merchant actions */}
            {isMerchant && pending && (
              <>
                <Button variant="primary" size="md" disabled={busy} onClick={() => act('accept', 'Terima Pesanan')}>
                  Terima Pesanan
                </Button>
                <Button variant="danger" size="md" disabled={busy} onClick={() => act('reject', 'Tolak Pesanan')}>
                  Tolak Pesanan
                </Button>
              </>
            )}
            {isMerchant && accepted && order.delivery_method === 'pickup' && (
              <Button variant="primary" size="md" disabled={busy} onClick={() => act('ready-for-pickup', 'Siap Diambil')}>
                Tandai Siap Diambil
              </Button>
            )}
            {isMerchant && accepted && order.delivery_method === 'merchant_delivery' && (
              <Button variant="primary" size="md" disabled={busy} onClick={() => act('out-for-delivery', 'Pengantaran Pesanan')}>
                Kirim Pesanan Sekarang
              </Button>
            )}
            {isMerchant && order.payment_status === 'unpaid' && (
              <Button variant="gold" size="md" disabled={busy} onClick={() => act('mark-paid', 'Tandai Lunas COD')}>
                <CheckIcon size={16} />
                <span>Konfirmasi Pembayaran Tunai (Lunas)</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Items Section */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>Rincian Barang yang Dipesan</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
              (Snapshot item tidak tersedia untuk data pesanan ini).
            </p>
          ) : (
            items.map((i) => (
              <div
                key={i.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  paddingBottom: 'var(--space-3)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <strong style={{ fontSize: '15px' }}>{i.product_name_snapshot}</strong>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 2 }}>
                      Varian: {i.variant_options_snapshot} · {formatIDR(i.unit_price_snapshot)} × {i.quantity}
                    </div>
                  </div>
                  <strong style={{ color: 'var(--unida-navy)', fontSize: '15px' }}>
                    {formatIDR(i.line_total)}
                  </strong>
                </div>

                {/* Review capability if completed */}
                {isBuyer && order.status === 'completed' && <ReviewBox itemId={i.id} />}
              </div>
            ))
          )}

          {/* Payment Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '14px', paddingTop: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal Produk</span>
              <span>{formatIDR(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Diskon</span>
                <span>−{formatIDR(order.discount_amount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Biaya Pengiriman</span>
              <span>{order.delivery_fee === 0 ? 'Gratis' : formatIDR(order.delivery_fee)}</span>
            </div>
            <hr style={{ borderColor: 'var(--border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '15px' }}>Total Tagihan COD</strong>
              <strong style={{ fontSize: '20px', color: 'var(--unida-navy)' }}>
                {formatIDR(order.grand_total)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>Riwayat Status Pesanan</h2>
        </div>
        <div className="card-body">
          {hist.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Belum ada catatan riwayat status.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {hist.map((h) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--unida-blue)',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      Transisi ke status: <OrderStatusBadge status={h.to_status} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 2 }}>
                      {formatDateWIB(h.created_at)} WIB {h.note ? `— ${h.note}` : ''}
                    </div>
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

// Ulasan Komponen per Item
function ReviewBox({ itemId }: { itemId: string }) {
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState('5');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.getReviewForItem(itemId).then(setReview);
  }, [itemId]);

  if (review) {
    return (
      <div style={{ background: 'var(--surface-muted)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginTop: 4 }}>
        <div style={{ color: 'var(--warning)', fontSize: '14px', letterSpacing: 1 }}>
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--unida-text)', marginTop: 2 }}>
          {review.review_text || '(Ulasan bintang saja)'}
        </div>
      </div>
    );
  }

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      const r = await api.createReview(itemId, Number(rating), text.trim() || undefined);
      setReview(r);
      toast.success('Ulasan Anda berhasil dikirim!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengirim ulasan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--surface-muted)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginTop: 6 }}>
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 6 }}>Beri Ulasan Produk:</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minHeight: 36, padding: '4px 10px' }}
        >
          <option value="5">★★★★★ (5 Bintang)</option>
          <option value="4">★★★★☆ (4 Bintang)</option>
          <option value="3">★★★☆☆ (3 Bintang)</option>
          <option value="2">★★☆☆☆ (2 Bintang)</option>
          <option value="1">★☆☆☆☆ (1 Bintang)</option>
        </select>
        <input
          placeholder="Tulis ulasan produk..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="form-input"
          style={{ flex: 1, minWidth: 180, minHeight: 36, padding: '4px 10px' }}
        />
        <Button variant="primary" size="sm" loading={submitting} onClick={handleSubmitReview}>
          Kirim Ulasan
        </Button>
      </div>
    </div>
  );
}
