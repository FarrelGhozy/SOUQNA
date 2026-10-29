import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  api, type CartDetailed, type CheckoutPreview, type FulfillmentMethod,
} from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';

export function CheckoutPage() {
  const nav = useNavigate();
  const [lines, setLines] = useState<CartDetailed[]>([]);
  const [fulfill, setFulfill] = useState<Record<string, { method: FulfillmentMethod; location: string }>>({});
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat checkout.');
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
    try {
      setPreview(await api.validateCheckout(buildInput()));
    } catch (e) {
      setPreview(null);
      setErr(e instanceof Error ? e.message : 'Validasi gagal.');
    }
  };

  if (loading) return <p>Memuat checkout...</p>;

  return (
    <>
      <h1>Checkout COD</h1>
      {lines.length === 0 ? <p>Keranjang kosong. <Link to="/search">Belanja</Link></p> : (
        <>
          {lines.filter((l) => !l.purchasable).length > 0 && (
            <p style={{ color: 'red' }}>Ada item tidak bisa checkout. <Link to="/cart">Perbaiki di keranjang</Link>.</p>
          )}
          {Object.entries(fulfill).map(([sid, f]) => (
            <section key={sid} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 12 }}>
              <b>{lines.find((l) => l.store_id === sid)?.store_name}</b>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <label><input type="radio" checked={f.method === 'pickup'}
                  onChange={() => { setFulfill({ ...fulfill, [sid]: { ...f, method: 'pickup' } }); setPreview(null); }} /> Ambil sendiri</label>
                <label><input type="radio" checked={f.method === 'merchant_delivery'}
                  onChange={() => { setFulfill({ ...fulfill, [sid]: { ...f, method: 'merchant_delivery' } }); setPreview(null); }} /> Diantar merchant</label>
              </div>
              {f.method === 'merchant_delivery' && (
                <input value={f.location} placeholder="Lokasi / titik serah terima"
                  onChange={(e) => { setFulfill({ ...fulfill, [sid]: { ...f, location: e.target.value } }); setPreview(null); }}
                  style={{ width: '100%', marginTop: 6 }} />
              )}
            </section>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setPreview(null); }} placeholder="Kode voucher (opsional)" />
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (opsional)" />
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={recheck}>Hitung total</button>{' '}
            <button disabled={submitting} onClick={async () => {
              setSubmitting(true);
              setErr(null);
              try {
                const r = await api.checkout(buildInput());
                nav(`/checkout/success/${r.checkout.id}`);
              } catch (e) {
                setErr(e instanceof Error ? e.message : 'Checkout gagal.');
                setPreview(null);
              } finally {
                setSubmitting(false);
              }
            }}>{submitting ? 'Memproses...' : 'Buat pesanan COD'}</button>
          </div>
          {err && <p style={{ color: 'red' }}>{err}</p>}
          {preview && (
            <section style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, marginTop: 12 }}>
              <h3>Ringkasan (dihitung server dummy)</h3>
              {preview.perStore.map((ps) => (
                <div key={ps.store_id} style={{ borderTop: '1px solid #eee', padding: '4px 0' }}>
                  <b>{ps.store_name}</b> · {ps.delivery_method === 'pickup' ? 'Ambil sendiri' : 'Diantar'}
                  <div><small>Subtotal {formatIDR(ps.subtotal)} − diskon {formatIDR(ps.discount_amount)} + ongkir {formatIDR(ps.delivery_fee)} = <b>{formatIDR(ps.grand_total)}</b></small></div>
                </div>
              ))}
              <p>Subtotal {formatIDR(preview.subtotal)} · Diskon {formatIDR(preview.discount_total)} · Ongkir {formatIDR(preview.delivery_total)}</p>
              <p><b>Total COD: {formatIDR(preview.grand_total)}</b></p>
            </section>
          )}
        </>
      )}
    </>
  );
}
