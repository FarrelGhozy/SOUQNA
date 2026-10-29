import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type CartDetailed } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import { Button } from '../components/ui/Button.js';
import { Alert } from '../components/ui/Alert.js';
import { Badge } from '../components/ui/Badge.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';

export function CartPage() {
  const [lines, setLines] = useState<CartDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const toast = useToast();

  const loadCart = async () => {
    try {
      setLoading(true);
      setLines(await api.getCartDetailed());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat keranjang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const mutate = async (id: string, fn: () => Promise<unknown>, successMsg?: string) => {
    try {
      setUpdatingId(id);
      setErr(null);
      await fn();
      const next = await api.getCartDetailed();
      setLines(next);
      if (successMsg) toast.info(successMsg);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal mengubah item keranjang.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const groups = useMemo(() => {
    const m = new Map<string, { name: string; lines: CartDetailed[] }>();
    for (const l of lines) {
      const g = m.get(l.store_id) ?? { name: l.store_name, lines: [] };
      g.lines.push(l);
      m.set(l.store_id, g);
    }
    return [...m.entries()];
  }, [lines]);

  const total = lines.reduce((s, l) => s + l.line_total, 0);
  const blocked = lines.filter((l) => !l.purchasable);
  const canCheckout = lines.length > 0 && blocked.length === 0;

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Skeleton height={140} borderRadius="var(--radius-md)" />
          <Skeleton height={140} borderRadius="var(--radius-md)" />
        </div>
        <Skeleton height={240} borderRadius="var(--radius-md)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Keranjang Belanja</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Keranjang Belanja</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          {lines.length} item dari {groups.length} toko merchant
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {lines.length === 0 ? (
        <EmptyState
          title="Keranjang Masih Kosong"
          description="Yuk telusuri katalog produk pilihan di kampus UNIDA Gontor dan tambahkan kebutuhanmu!"
          actionLabel="Mulai Belanja"
          onAction={() => nav('/search')}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-6)',
            alignItems: 'start',
          }}
          className="cart-grid-desktop"
        >
          <style>{`
            @media (min-width: 900px) {
              .cart-grid-desktop {
                grid-template-columns: 2fr 1fr !important;
              }
            }
          `}</style>

          {/* Left Column: Stores & Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {blocked.length > 0 && (
              <Alert variant="warning">
                <strong>Ada {blocked.length} produk yang tidak dapat diproses</strong> karena stok habis, produk disembunyikan, atau toko nonaktif. Silakan hapus item tersebut untuk melanjutkan checkout.
              </Alert>
            )}

            {groups.map(([sid, g]) => {
              const storeSubtotal = g.lines.reduce((s, l) => s + l.line_total, 0);
              return (
                <div key={sid} className="card">
                  {/* Store Card Header */}
                  <div className="card-header" style={{ background: 'var(--surface-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '18px' }}>🏬</span>
                      <strong style={{ color: 'var(--unida-navy)', fontSize: '15px' }}>
                        {g.name || '(Toko tidak dikenal)'}
                      </strong>
                    </div>
                    <Badge variant="info">COD Kampus</Badge>
                  </div>

                  {/* Store Item Rows */}
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {g.lines.map((l, idx) => {
                      const isUpdating = updatingId === l.id;
                      return (
                        <div
                          key={l.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            paddingBottom: idx === g.lines.length - 1 ? 0 : 'var(--space-4)',
                            borderBottom: idx === g.lines.length - 1 ? 'none' : '1px solid var(--border)',
                            opacity: isUpdating ? 0.6 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div>
                              <Link
                                to={`/products/${l.product_id}`}
                                style={{ fontWeight: 600, color: 'var(--unida-text)', fontSize: '15px' }}
                              >
                                {l.product_name}
                              </Link>
                              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 2 }}>
                                Varian: <strong>{l.variant_label}</strong> · {formatIDR(l.unit_price)} / item
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--unida-navy)', fontSize: '15px', whiteSpace: 'nowrap' }}>
                              {formatIDR(l.line_total)}
                            </div>
                          </div>

                          {!l.purchasable && (
                            <div style={{ marginTop: 2 }}>
                              <Badge variant="danger">{l.block_reason || 'Tidak dapat dibeli'}</Badge>
                            </div>
                          )}

                          {/* Stepper & Delete Action */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--surface)',
                              }}
                            >
                              <button
                                type="button"
                                disabled={l.quantity <= 1 || isUpdating}
                                onClick={() => mutate(l.id, () => api.updateCartItemQty(l.id, l.quantity - 1))}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  padding: '4px 10px',
                                  fontSize: '14px',
                                  cursor: l.quantity <= 1 ? 'not-allowed' : 'pointer',
                                  color: 'var(--unida-navy)',
                                }}
                                aria-label="Kurangi jumlah"
                              >
                                −
                              </button>
                              <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                                {l.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={l.quantity >= l.stock_quantity || isUpdating}
                                onClick={() => mutate(l.id, () => api.updateCartItemQty(l.id, l.quantity + 1))}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  padding: '4px 10px',
                                  fontSize: '14px',
                                  cursor: l.quantity >= l.stock_quantity ? 'not-allowed' : 'pointer',
                                  color: 'var(--unida-navy)',
                                }}
                                aria-label="Tambah jumlah"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => mutate(l.id, () => api.removeCartItem(l.id), 'Item dihapus dari keranjang.')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--danger)',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Store Subtotal Footer */}
                  <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Subtotal Toko:</span>
                    <strong style={{ fontSize: '14px', color: 'var(--unida-navy)' }}>{formatIDR(storeSubtotal)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Summary Card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-4)' }}>Ringkasan Pesanan</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Total Harga ({lines.length} item)</span>
                  <span>{formatIDR(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Biaya Pengiriman</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Dihitung saat checkout</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  margin: 'var(--space-4) 0',
                  paddingTop: 'var(--space-3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '15px' }}>Total Belanja</span>
                <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--unida-navy)' }}>
                  {formatIDR(total)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={!canCheckout}
                onClick={() => nav('/checkout')}
                style={{ width: '100%', marginBottom: 'var(--space-3)' }}
              >
                Lanjut ke Pembayaran →
              </Button>

              <Link to="/search" style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: 'var(--unida-blue)' }}>
                ← Lanjut Cari Produk Lain
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
