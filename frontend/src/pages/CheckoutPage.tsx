import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  api, type CartDetailed, type CheckoutPreview, type FulfillmentMethod,
} from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { Badge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';
import { StoreIcon, TruckIcon } from '../components/ui/Icons.js';

export function CheckoutPage() {
  const nav = useNavigate();
  const toast = useToast();

  const [lines, setLines] = useState<CartDetailed[]>([]);
  const [fulfill, setFulfill] = useState<Record<string, { method: FulfillmentMethod; location: string }>>({});
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const ls = await api.getCartDetailed();
        setLines(ls);
        const f: typeof fulfill = {};
        const seen = new Set<string>();
        for (const l of ls) {
          if (l.store_id && !seen.has(l.store_id)) {
            seen.add(l.store_id);
            f[l.store_id] = { method: 'pickup', location: '' };
          }
        }
        setFulfill(f);

        // Auto preview awal
        if (ls.length > 0) {
          try {
            const initPrev = await api.validateCheckout({
              items: ls.map((l) => ({ variant_id: l.variant_id, quantity: l.quantity })),
              fulfillment: f,
            });
            setPreview(initPrev);
          } catch {
            // Abaikan error preview awal
          }
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat data checkout.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const buildInput = () => ({
    items: lines.map((l) => ({ variant_id: l.variant_id, quantity: l.quantity })),
    fulfillment: Object.fromEntries(
      Object.entries(fulfill).map(([sid, f]) => [sid, { method: f.method, location: f.location }]),
    ),
    voucher_code: code.trim() || undefined,
    buyer_note: note.trim() || undefined,
  });

  const recheck = async () => {
    setErr(null);
    setCalculating(true);
    try {
      const prev = await api.validateCheckout(buildInput());
      setPreview(prev);
      toast.info('Total pesanan berhasil dihitung ulang.');
    } catch (e) {
      setPreview(null);
      const msg = e instanceof Error ? e.message : 'Perhitungan gagal.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setCalculating(false);
    }
  };

  const handleCreateOrder = async () => {
    // Validasi lokasi bila memilih merchant delivery
    for (const [sid, f] of Object.entries(fulfill)) {
      if (f.method === 'merchant_delivery' && !f.location.trim()) {
        const sName = lines.find((l) => l.store_id === sid)?.store_name || 'Toko';
        const msg = `Tentukan titik temu/lokasi antar untuk ${sName}.`;
        setErr(msg);
        toast.warning(msg);
        return;
      }
    }

    setSubmitting(true);
    setErr(null);
    try {
      const r = await api.checkout(buildInput());
      toast.success('Pesanan COD berhasil dibuat!');
      nav(`/checkout/success/${r.checkout.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal memproses checkout.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        <Skeleton height={260} borderRadius="var(--radius-md)" />
        <Skeleton height={260} borderRadius="var(--radius-md)" />
      </div>
    );
  }

  const blockedItems = lines.filter((l) => !l.purchasable);
  const storeIds = Object.keys(fulfill);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Breadcrumb */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <Link to="/cart">Keranjang</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Checkout COD</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Pengiriman & Checkout (COD)</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Selesaikan informasi penyerahan pesanan untuk {storeIds.length} toko merchant
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {lines.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Tidak ada item di keranjang yang siap dicheckout.{' '}
            <Link to="/search">Mulai belanja</Link>
          </p>
        </div>
      ) : blockedItems.length > 0 ? (
        <Alert variant="warning">
          Terdapat produk di keranjang yang tidak dapat diproses. Silakan{' '}
          <Link to="/cart" style={{ fontWeight: 700 }}>
            periksa keranjang Anda
          </Link>{' '}
          terlebih dahulu.
        </Alert>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-6)',
            alignItems: 'start',
          }}
          className="checkout-grid"
        >
          <style>{`
            @media (min-width: 900px) {
              .checkout-grid {
                grid-template-columns: 2fr 1.2fr !important;
              }
            }
          `}</style>

          {/* Left Column: Fulfillment & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Fulfillment per Store */}
            {storeIds.map((sid) => {
              const f = fulfill[sid];
              const sLines = lines.filter((l) => l.store_id === sid);
              const storeName = sLines[0]?.store_name || 'Toko Merchant';

              return (
                <div key={sid} className="card">
                  <div className="card-header" style={{ background: 'var(--surface-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--unida-blue)', display: 'inline-flex' }}>
                        <StoreIcon size={16} />
                      </span>
                      <strong style={{ color: 'var(--unida-navy)' }}>{storeName}</strong>
                    </div>
                    <Badge variant="muted">{sLines.length} produk</Badge>
                  </div>

                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>
                        Metode Penyerahan Pesanan:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setFulfill({ ...fulfill, [sid]: { ...f, method: 'pickup' } });
                            setPreview(null);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: f.method === 'pickup' ? '2px solid var(--unida-blue)' : '1px solid var(--border)',
                            background: f.method === 'pickup' ? 'var(--info-soft)' : 'var(--surface)',
                            color: f.method === 'pickup' ? 'var(--unida-blue)' : 'var(--unida-text)',
                            fontWeight: f.method === 'pickup' ? 700 : 500,
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <StoreIcon size={16} />
                            <span>Ambil Sendiri</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>Gratis di gerai merchant</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFulfill({ ...fulfill, [sid]: { ...f, method: 'merchant_delivery' } });
                            setPreview(null);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: f.method === 'merchant_delivery' ? '2px solid var(--unida-blue)' : '1px solid var(--border)',
                            background: f.method === 'merchant_delivery' ? 'var(--info-soft)' : 'var(--surface)',
                            color: f.method === 'merchant_delivery' ? 'var(--unida-blue)' : 'var(--unida-text)',
                            fontWeight: f.method === 'merchant_delivery' ? 700 : 500,
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TruckIcon size={16} />
                            <span>Diantar Merchant</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>Antar ke lokasi kampus</div>
                        </button>
                      </div>
                    </div>

                    {f.method === 'merchant_delivery' && (
                      <div style={{ marginTop: 4 }}>
                        <Input
                          label="Titik Temu / Lokasi Antar"
                          placeholder="Cth: Depan Asrama Abu Bakar, Lt. 2 FST..."
                          value={f.location}
                          onChange={(e) => {
                            setFulfill({ ...fulfill, [sid]: { ...f, location: e.target.value } });
                            setPreview(null);
                          }}
                          helperText="Pastikan detail lokasi jelas agar merchant dapat menemukan Anda"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Voucher & Note Card */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '16px', marginBottom: 'var(--space-3)' }}>Voucher & Catatan</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                <div>
                  <Input
                    label="Kode Voucher (Opsional)"
                    placeholder="Cth: MHS5K, UNIDA10"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setPreview(null);
                    }}
                    helperText="Kupon diskon resmi kampus UNIDA"
                  />
                </div>
                <div>
                  <Textarea
                    label="Catatan Tambahan (Opsional)"
                    placeholder="Cth: Sambal dipisah, dibungkus rapi..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ minHeight: 44, height: 44 }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Button variant="secondary" size="sm" loading={calculating} onClick={recheck}>
                  Hitung Ulang Total
                </Button>
              </div>
            </div>

            {/* COD Safety Notice */}
            <div className="alert alert-info">
              <div>
                <strong>Ketentuan Bayar di Tempat (COD):</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  Pesanan akan diproses oleh merchant. Anda membayar langsung dengan uang tunai saat serah terima barang di lokasi kampus yang disepakati.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Confirmation */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-3)' }}>Rincian Tagihan</h2>

              {/* Items List Snapshot */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', marginBottom: 'var(--space-3)' }}>
                {lines.map((l) => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--unida-text)' }}>
                      {l.product_name} <small style={{ color: 'var(--muted)' }}>({l.quantity}x)</small>
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatIDR(l.line_total)}</span>
                  </div>
                ))}
              </div>

              <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-3) 0' }} />

              {/* Price Breakdown */}
              {preview ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Subtotal Produk</span>
                    <span>{formatIDR(preview.subtotal)}</span>
                  </div>
                  {preview.discount_total > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                      <span>Diskon Voucher</span>
                      <span>−{formatIDR(preview.discount_total)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Biaya Pengiriman</span>
                    <span>{preview.delivery_total === 0 ? 'Gratis' : formatIDR(preview.delivery_total)}</span>
                  </div>

                  <hr style={{ borderColor: 'var(--border)', margin: 'var(--space-2) 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>Total COD</span>
                    <span style={{ fontWeight: 800, fontSize: '22px', color: 'var(--unida-navy)' }}>
                      {formatIDR(preview.grand_total)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-3) 0', color: 'var(--muted)', fontSize: '13px' }}>
                  Tekan "Hitung Ulang Total" atau langsung klik tombol di bawah untuk menyelesaikan pesanan.
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                loading={submitting}
                onClick={handleCreateOrder}
                style={{ width: '100%', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}
              >
                Konfirmasi Pesanan COD
              </Button>

              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
                Sistem pesanan resmi SOUQNA UNIDA Gontor
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
