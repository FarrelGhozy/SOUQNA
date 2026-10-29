import { Link, Outlet, useNavigate } from 'react-router-dom';
import { currentSession, logout } from '../lib/mock-auth.js';

function Nav() {
  const s = currentSession();
  const nav = useNavigate();
  return (
    <header style={{ borderBottom: '1px solid #ddd', padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
      <Link to="/" style={{ fontWeight: 800 }}>SOUQNA</Link>
      <Link to="/search">Cari</Link>
      <Link to="/cart">Keranjang</Link>
      <Link to="/orders">Pesanan</Link>
      <Link to="/wishlist">Wishlist</Link>
      <Link to="/chat">Chat</Link>
      {s?.hasStore && <Link to="/merchant">Merchant</Link>}
      {s?.role === 'admin' && <Link to="/admin">Admin</Link>}
      <span style={{ marginLeft: 'auto' }} />
      {s ? (
        <>
          <Link to="/me">{s.full_name}</Link>
          <button onClick={() => { logout(); nav('/'); }}>Keluar</button>
        </>
      ) : (
        <>
          <Link to="/login">Masuk</Link>
          <Link to="/register">Daftar</Link>
        </>
      )}
    </header>
  );
}

export function PublicLayout() { return (<><Nav /><main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}><Outlet /></main></>); }
export function AccountLayout() { return (<><Nav /><main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}><Outlet /></main></>); }
export function MerchantLayout() { return (<><Nav /><main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}><h2>Panel Merchant</h2><nav style={{ display: 'flex', gap: 12, marginBottom: 12 }}><Link to="/merchant">Dashboard</Link><Link to="/merchant/products">Produk</Link><Link to="/merchant/orders">Order</Link><Link to="/merchant/store">Toko</Link></nav><Outlet /></main></>); }
export function AdminLayout() { return (<><Nav /><main style={{ padding: 16, maxWidth: 960, margin: '0 auto' }}><h2>Panel Admin</h2><nav style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}><Link to="/admin">Dashboard</Link><Link to="/admin/users">Users</Link><Link to="/admin/categories">Kategori</Link><Link to="/admin/products">Produk</Link><Link to="/admin/orders">Orders</Link><Link to="/admin/vouchers">Voucher</Link><Link to="/admin/audit-logs">Audit</Link></nav><Outlet /></main></>); }
export function AuthLayout() { return (<main style={{ padding: 32, maxWidth: 480, margin: '0 auto' }}><Outlet /></main>); }
