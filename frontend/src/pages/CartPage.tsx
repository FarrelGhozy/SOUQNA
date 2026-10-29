import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import { products } from '../mocks/products.mock.js';

export function CartPage() {
  const [cart, setCart] = useState<{ id: string; variant_id: string; quantity: number }[]>([]);
  useEffect(() => { api.getCart().then(setCart); }, []);
  const save = (c: typeof cart) => { setCart(c); localStorage.setItem('souqna:cart', JSON.stringify(c)); };
  const total = cart.reduce((s, c) => {
    const v = products.flatMap((p) => p.variants).find((x) => x.id === c.variant_id);
    return s + (v ? v.price * c.quantity : 0);
  }, 0);
  return (
    <>
      <h1>Keranjang (multi-toko dummy)</h1>
      {cart.length === 0 ? <p>Keranjang kosong. <Link to="/search">Belanja</Link></p> : (
        <>
          {cart.map((c) => {
            const v = products.flatMap((p) => p.variants).find((x) => x.id === c.variant_id);
            return (
              <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {v?.label} × {c.quantity} — {formatIDR((v?.price ?? 0) * c.quantity)}
                <button onClick={() => save(cart.filter((x) => x.id !== c.id))} style={{ marginLeft: 8 }}>Hapus</button>
              </div>
            );
          })}
          <p><b>Total: {formatIDR(total)}</b></p>
          <Link to="/checkout">Lanjut checkout →</Link>
        </>
      )}
    </>
  );
}
