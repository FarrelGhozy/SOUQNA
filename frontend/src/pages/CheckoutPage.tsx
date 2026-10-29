import { useEffect, useState } from 'react';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import { products } from '../mocks/products.mock.js';

export function CheckoutPage() {
  const [cart, setCart] = useState<{ variant_id: string; quantity: number }[]>([]);
  const [code, setCode] = useState('HEMAT5K');
  const [msg, setMsg] = useState('');
  useEffect(() => { api.getCart().then(setCart); }, []);
  const subtotal = cart.reduce((s, c) => {
    const v = products.flatMap((p) => p.variants).find((x) => x.id === c.variant_id);
    return s + (v ? v.price * c.quantity : 0);
  }, 0);
  return (
    <>
      <h1>Checkout COD (dummy)</h1>
      <p>Subtotal: {formatIDR(subtotal)}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Kode voucher" />
        <button onClick={async () => {
          const r = await api.validateVoucher(code, subtotal);
          setMsg(r.ok ? `Voucher OK, potongan ${formatIDR(r.amount)}` : `Gagal: ${r.reason}`);
        }}>Cek voucher</button>
      </div>
      <p>{msg}</p>
      <p>Pemenuhan per toko: ambil sendiri / diantar merchant (simulasi di ringkasan order).</p>
      <button onClick={() => {
        localStorage.removeItem('souqna:cart');
        setCart([]);
        setMsg('Checkout dummy berhasil: 1 checkout → N orders (lihat Pesanan). Stok dikurangi di simulasi, cart dikosongkan.');
      }}>Buat pesanan COD</button>
    </>
  );
}
