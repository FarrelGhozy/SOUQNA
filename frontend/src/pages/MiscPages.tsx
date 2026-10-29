import { useEffect, useState } from 'react';
import { api } from '../lib/api-client.js';

export function MiscPages() { return null; }

export function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api.getWishlist().then(setItems); }, []);
  return (<><h1>Wishlist</h1>{items.map((w) => <div key={w.id}>{w.product_id}</div>)}</>);
}
export function ChatPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  useEffect(() => { api.getConversations().then((t) => { setThreads(t); if (t[0]) api.getMessages(t[0].id).then(setMsgs); }); }, []);
  return (<><h1>Chat (teks, purge 7 hari disimulasikan)</h1>
    {threads.map((t) => <div key={t.id}>Thread {t.id} → toko {t.store_id}</div>)}
    {msgs.map((m) => <div key={m.id} style={{ borderBottom: '1px solid #eee', padding: 4 }}><small>{m.created_at}</small> — {m.body}</div>)}
  </>);
}
export function BecomeMerchantPage() { return (<><h1>Jadi Merchant</h1><p>Form dummy: nama toko, deskripsi, lokasi pickup, delivery fee. 1 akun 1 toko.</p><button onClick={() => alert('Toko dummy dibuat')}>Buat toko</button></>); }
export function MerchantDashboard() { return (<><h1>Dashboard Merchant</h1><p>Ringkasan order + produk dummy milik toko.</p></>); }
export function AdminDashboard() {
  const [v, setV] = useState<any[]>([]);
  useEffect(() => { api.getVouchers().then(setV); }, []);
  return (<><h1>Admin</h1><p>Voucher dummy:</p>{v.map((x) => <div key={x.id}>{x.code} — {x.description}</div>)}</>);
}
