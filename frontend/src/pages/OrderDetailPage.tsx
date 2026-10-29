import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type OrderAction } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { MockUser, Order, OrderItem, OrderStatusHistory, Store } from '../types/index.js';

// Detail order: aksi kontekstual sesuai peran + histori status.
// Toast sukses/gagal tampil jelas dan hilang otomatis.
export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [hist, setHist] = useState<OrderStatusHistory[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [me, setMe] = useState<MockUser | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async (id: string) => {
    const [d, h, m] = await Promise.all([api.getOrder(id), api.getOrderHistory(id), api.getMe()]);
    if (!d.order) { setErr('Pesanan tidak ditemukan.'); return; }
    setOrder(d.order);
    setItems(d.items);
    setHist(h);
    setMe(m);
    setStore(await api.getStore(d.order.store_id));
  };

  useEffect(() => {
    if (!orderId) return;
    load(orderId).catch(() => setErr('Gagal memuat pesanan.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const act = async (a: OrderAction, label: string) => {
    if (!orderId) return;
    setBusy(true);
    try {
      const o = await api.transitionOrder(orderId, a);
      setOrder(o);
      setHist(await api.getOrderHistory(orderId));
      setToast({ ok: true, msg: `${label} berhasil.` });
    } catch (e) {
      setToast({ ok: false, msg: e instanceof Error ? e.message : 'Aksi gagal.' });
    } finally {
      setBusy(false);
    }
  };

  if (err) return <><Link to="/orders">← Pesanan</Link><p style={{ color: 'red' }}>{err}</p></>;
  if (!order) return <p>Memuat...</p>;

  const isBuyer = me?.id === order.buyer_id;
  const isMerchant = !!store && store.owner_id === me?.id;
  const pending = order.status === 'pending_merchant_confirmation';
  const accepted = order.status === 'accepted';
  const handed = order.status === 'ready_for_pickup' || order.status === 'out_for_delivery';
  const terminal = ['completed', 'rejected', 'cancelled'].includes(order.status);

  return (
    <>
      <Link to="/orders">← Pesanan</Link>
      <h1>Order {order.id}</h1>
      {toast && (
        <p style={{
          color: toast.ok ? 'green' : 'red', border: `1px solid ${toast.ok ? 'green' : 'red'}`,
          borderRadius: 8, padding: 8,
        }}>{toast.msg}</p>
      )}
      <p>Status: <b>{order.status}</b> · Bayar: <b>{order.payment_status}</b> (COD) · {order.delivery_method === 'pickup' ? 'Ambil sendiri' : `Diantar (+${formatIDR(order.delivery_fee)})`}</p>
      <p>Toko: {store ? <Link to={`/stores/${store.id}`}>{store.name}</Link> : order.store_id} · <small>{formatDateWIB(order.created_at)} WIB</small></p>
      <p>Subtotal {formatIDR(order.subtotal)} − diskon {formatIDR(order.discount_amount)} + ongkir {formatIDR(order.delivery_fee)} = <b>{formatIDR(order.grand_total)}</b></p>
      {order.buyer_note && <p><small>Catatan: {order.buyer_note}</small></p>}

      <h3>Aksi</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {isBuyer && pending && <button disabled={busy} onClick={() => act('cancel', 'Pembatalan')}>Batalkan</button>}
        {isBuyer && handed && <button disabled={busy} onClick={() => act('confirm-received', 'Konfirmasi terima')}>Saya sudah terima</button>}
        {isMerchant && pending && <button disabled={busy} onClick={() => act('accept', 'Penerimaan')}>Terima</button>}
        {isMerchant && pending && <button disabled={busy} onClick={() => act('reject', 'Penolakan')}>Tolak</button>}
        {isMerchant && accepted && order.delivery_method === 'pickup' && (
          <button disabled={busy} onClick={() => act('ready-for-pickup', 'Siap diambil')}>Siap diambil</button>)}
        {isMerchant && accepted && order.delivery_method === 'merchant_delivery' && (
          <button disabled={busy} onClick={() => act('out-for-delivery', 'Pengantaran')}>Antar sekarang</button>)}
        {isMerchant && order.payment_status === 'unpaid' && !terminal && (
          <button disabled={busy} onClick={() => act('mark-paid', 'Tandai lunas')}>Tandai lunas (tunai diterima)</button>)}
        {!isBuyer && !isMerchant && <small>Bukan pemilik pesanan/toko ini.</small>}
      </div>

      <h3>Items</h3>
      {items.length === 0 ? <p><small>Tanpa snapshot item (order seed).</small></p>
        : items.map((i) => <div key={i.id}>{i.product_name_snapshot} ({i.variant_options_snapshot}) × {i.quantity} — {formatIDR(i.line_total)}</div>)}

      <h3>Histori status</h3>
      {hist.length === 0 ? <p><small>Belum ada histori.</small></p> : hist.map((h) => (
        <div key={h.id} style={{ borderTop: '1px solid #eee', padding: '4px 0' }}>
          <small>{formatDateWIB(h.created_at)} WIB</small> — {h.from_status} → <b>{h.to_status}</b>
          {h.note && <small> · {h.note}</small>}
        </div>
      ))}
    </>
  );
}
