import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';

// Dashboard admin: statistik hitung dari mock.
export function AdminDashboardPage() {
  const [s, setS] = useState<Awaited<ReturnType<typeof api.getAdminStats>> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setS(await api.getAdminStats());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat statistik.');
      }
    })();
  }, []);

  if (err) return <p style={{ color: 'red' }}>{err}</p>;
  if (!s) return <p>Memuat statistik...</p>;

  const cards: [string, string, string][] = [
    ['Pengguna', String(s.users), '/admin/users'],
    ['Toko', `${s.activeStores}/${s.stores} aktif`, '/admin/orders'],
    ['Produk', `${s.publishedProducts}/${s.products} tayang`, '/admin/products'],
    ['Order', String(s.orders), '/admin/orders'],
    ['Pendapatan COD (completed)', formatIDR(s.revenue), '/admin/orders'],
    ['Voucher aktif', String(s.activeVouchers), '/admin/vouchers'],
    ['Ulasan', String(s.reviews), '/admin/products'],
    ['Thread chat', String(s.conversations), '/admin/audit-logs'],
  ];

  return (
    <>
      <h1>Dashboard Admin</h1>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {cards.map(([label, val, to]) => (
          <div key={label} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, minWidth: 180 }}>
            <div><small>{label}</small></div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{val}</div>
            <Link to={to}><small>Lihat →</small></Link>
          </div>
        ))}
      </div>
      <h3>Order per status</h3>
      {Object.keys(s.ordersByStatus).length === 0 ? <p><small>Belum ada order.</small></p> : (
        <ul>
          {Object.entries(s.ordersByStatus).map(([st, n]) => <li key={st}>{st}: <b>{n}</b></li>)}
        </ul>
      )}
    </>
  );
}
