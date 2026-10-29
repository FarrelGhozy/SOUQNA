import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type CartDetailed } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';

export function CartPage() {
  const [lines, setLines] = useState<CartDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const mutate = async (fn: () => Promise<unknown>) => {
    try {
      setErr(null);
      await fn();
      setLines(await api.getCartDetailed());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal ubah keranjang.');
    }
  };
  useEffect(() => {
    (async () => {
      try {
        setLines(await api.getCartDetailed());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat keranjang.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  if (loading) return <p>Memuat keranjang...</p>;

  return (
    <>
      <h1>Keranjang (multi-toko)</h1>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {lines.length === 0 ? <p>Keranjang kosong. <Link to="/search">Belanja</Link></p> : (
        <>
          {blocked.length > 0 && (
            <p style={{ color: 'red' }}>
              {blocked.length} item tidak bisa checkout (habis/disembunyikan/toko nonaktif). Hapus item tersebut dulu.
            </p>
          )}
          {groups.map(([sid, g]) => (
            <section key={sid} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 12 }}>
              <b>{g.name || '(toko dihapus)'}</b>
              {g.lines.map((l) => (
                <div key={l.id} style={{ borderTop: '1px solid #eee', padding: '6px 0' }}>
                  <div>{l.product_name} — {l.variant_label}</div>
                  <div><small>{formatIDR(l.unit_price)} × </small>
                    <button onClick={() => mutate(() => api.updateCartItemQty(l.id, l.quantity - 1))}>−</button>
                    {' '}{l.quantity}{' '}
                    <button onClick={() => mutate(() => api.updateCartItemQty(l.id, l.quantity + 1))}>+</button>
                    <small> (sisa {l.stock_quantity})</small>
                    {' '} = <b>{formatIDR(l.line_total)}</b>
                    <button onClick={() => mutate(() => api.removeCartItem(l.id))} style={{ marginLeft: 8 }}>Hapus</button>
                  </div>
                  {!l.purchasable && <div style={{ color: 'red' }}><small>{l.block_reason}</small></div>}
                </div>
              ))}
              <div>Subtotal toko: <b>{formatIDR(g.lines.reduce((s, l) => s + l.line_total, 0))}</b></div>
            </section>
          ))}
          <p><b>Total: {formatIDR(total)}</b></p>
          <Link to="/checkout">Lanjut checkout →</Link>
        </>
      )}
    </>
  );
}
