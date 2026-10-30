import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { currentSession, logout } from '../lib/mock-auth.js';
import { api } from '../lib/api-client.js';
import { Badge } from '../components/ui/Badge.js';
import { Footer } from '../components/Footer.js';
import {
  HomeIcon,
  SearchIcon,
  CartIcon,
  OrdersIcon,
  UserIcon,
  StoreIcon,
  DashboardIcon,
  CategoryIcon,
  VoucherIcon,
  FileTextIcon,
  PlusIcon,
  SettingsIcon,
} from '../components/ui/Icons.js';

function Header() {
  const s = currentSession();
  const nav = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    api.getCart().then((c) => {
      if (mounted) setCartCount(c.reduce((sum, i) => sum + i.quantity, 0));
    }).catch(() => {});
    return () => { mounted = false; };
  }, [location.pathname]);

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'var(--unida-gold)' : 'var(--surface)',
    fontWeight: isActive ? 700 : 500,
    textDecoration: 'none',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    transition: 'color var(--transition-fast), background var(--transition-fast)',
    background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
  });

  return (
    <header
      style={{
        background: 'var(--unida-navy)',
        color: 'var(--surface)',
        borderBottom: '2px solid var(--unida-gold)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'baseline',
              gap: 4,
            }}
            aria-label="SOUQNA Beranda"
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: 'var(--surface)',
              }}
            >
              SOUQNA
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--unida-gold)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginLeft: 4 }}>
              UNIDA Gontor
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="desktop-nav"
          aria-label="Navigasi Utama"
        >
          <NavLink to="/" style={navLinkStyle}>Beranda</NavLink>
          <NavLink to="/search" style={navLinkStyle}>Cari</NavLink>
          <NavLink to="/categories" style={navLinkStyle}>Kategori</NavLink>
          <NavLink to="/cart" style={navLinkStyle} aria-label={`Keranjang ${cartCount} item`}>
            Keranjang
            {cartCount > 0 && (
              <span
                style={{
                  background: 'var(--unida-gold)',
                  color: 'var(--unida-navy)',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {cartCount}
              </span>
            )}
          </NavLink>
          {s && <NavLink to="/orders" style={navLinkStyle}>Pesanan</NavLink>}
          {s && <NavLink to="/wishlist" style={navLinkStyle}>Wishlist</NavLink>}
          {s && <NavLink to="/chat" style={navLinkStyle}>Chat</NavLink>}
          {s?.hasStore && (
            <NavLink
              to="/merchant"
              style={({ isActive }) => ({
                ...navLinkStyle({ isActive }),
                background: 'rgba(255,255,255,0.1)',
              })}
            >
              Toko Saya
            </NavLink>
          )}
          {s?.role === 'admin' && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                ...navLinkStyle({ isActive }),
                background: 'rgba(212, 175, 55, 0.2)',
                color: 'var(--unida-gold)',
              })}
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* User Account / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {s ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link
                to="/me"
                style={{
                  color: 'var(--surface)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                aria-label={`Profil ${s.full_name}`}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--unida-blue)',
                    color: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: '1px solid var(--unida-gold)',
                  }}
                >
                  {s.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-text">{s.full_name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  nav('/');
                }}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '12px', minHeight: 32 }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to="/login" className="btn btn-sm btn-ghost" style={{ color: 'var(--surface)' }}>
                Masuk
              </Link>
              <Link to="/register" className="btn btn-sm btn-gold">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const s = currentSession();
  const [cartCount, setCartCount] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    api.getCart().then((c) => {
      if (mounted) setCartCount(c.reduce((sum, i) => sum + i.quantity, 0));
    }).catch(() => {});
    return () => { mounted = false; };
  }, [location.pathname]);

  const navItemStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    fontSize: '11px',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--unida-gold)' : 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    position: 'relative' as const,
    flex: 1,
    height: '100%',
    minHeight: 48,
    transition: 'color var(--transition-fast)',
  });

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Navigasi Bawah Mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,
        background: 'var(--unida-navy)',
        borderTop: '2px solid var(--unida-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
      }}
    >
      <NavLink to="/" style={navItemStyle}>
        <HomeIcon size={20} />
        <span>Beranda</span>
      </NavLink>
      <NavLink to="/search" style={navItemStyle}>
        <SearchIcon size={20} />
        <span>Cari</span>
      </NavLink>
      <NavLink to="/cart" style={navItemStyle}>
        <CartIcon size={20} />
        <span>Keranjang</span>
        {cartCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: '25%',
              background: 'var(--unida-gold)',
              color: 'var(--unida-navy)',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {cartCount}
          </span>
        )}
      </NavLink>
      <NavLink to="/orders" style={navItemStyle}>
        <OrdersIcon size={20} />
        <span>Pesanan</span>
      </NavLink>
      <NavLink to={s ? '/me' : '/login'} style={navItemStyle}>
        <UserIcon size={20} />
        <span>{s ? 'Akun' : 'Masuk'}</span>
      </NavLink>
    </nav>
  );
}

export function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <Header />
      <main id="main-content" className="container" style={{ padding: 'var(--space-6) var(--space-4)', flex: 1, paddingBottom: 80 }}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export function AccountLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <Header />
      <main id="main-content" className="container" style={{ padding: 'var(--space-6) var(--space-4)', flex: 1, paddingBottom: 80 }}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

const varSpace2 = 'var(--space-2)';

export function MerchantLayout() {
  const s = currentSession();
  const navItem = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--surface)' : 'rgba(255,255,255,0.75)',
    background: isActive ? 'var(--unida-navy-dark)' : 'transparent',
    borderLeft: isActive ? '4px solid var(--unida-gold)' : '4px solid transparent',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <Header />
      <div className="container" style={{ display: 'flex', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-4)', flex: 1, paddingBottom: 80 }}>
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            background: 'var(--unida-navy)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            color: 'var(--surface)',
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
          className="desktop-sidebar"
          aria-label="Sidebar Merchant"
        >
          <div style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: varSpace2 }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--unida-gold)', fontWeight: 700 }}>
              Panel Merchant
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--surface)', marginTop: 2 }}>
              {s?.full_name}
            </div>
          </div>
          <NavLink to="/merchant" end style={navItem}>
            <DashboardIcon size={18} />
            <span>Ringkasan</span>
          </NavLink>
          <NavLink to="/merchant/products" style={navItem}>
            <StoreIcon size={18} />
            <span>Produk Toko</span>
          </NavLink>
          <NavLink to="/merchant/products/new" style={navItem}>
            <PlusIcon size={18} />
            <span>Tambah Produk</span>
          </NavLink>
          <NavLink to="/merchant/orders" style={navItem}>
            <OrdersIcon size={18} />
            <span>Pesanan Masuk</span>
          </NavLink>
          <NavLink to="/merchant/store" style={navItem}>
            <SettingsIcon size={18} />
            <span>Pengaturan Toko</span>
          </NavLink>
          <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '8px 14px', textDecoration: 'none' }}>
            ← Kembali ke Pasar
          </Link>
        </aside>

        <main id="main-content" style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export function AdminLayout() {
  const navItem = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--surface)' : 'rgba(255,255,255,0.75)',
    background: isActive ? 'var(--unida-navy-dark)' : 'transparent',
    borderLeft: isActive ? '4px solid var(--unida-gold)' : '4px solid transparent',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <Header />
      <div className="container" style={{ display: 'flex', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-4)', flex: 1, paddingBottom: 80 }}>
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            background: 'var(--unida-navy)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            color: 'var(--surface)',
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
          className="desktop-sidebar"
          aria-label="Sidebar Admin"
        >
          <div style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: varSpace2 }}>
            <Badge variant="gold">ADMIN PANEL</Badge>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--surface)', marginTop: 6 }}>
              SOUQNA Kampus
            </div>
          </div>
          <NavLink to="/admin" end style={navItem}>
            <DashboardIcon size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" style={navItem}>
            <UserIcon size={18} />
            <span>Manajemen User</span>
          </NavLink>
          <NavLink to="/admin/categories" style={navItem}>
            <CategoryIcon size={18} />
            <span>Kategori</span>
          </NavLink>
          <NavLink to="/admin/products" style={navItem}>
            <StoreIcon size={18} />
            <span>Moderasi Produk</span>
          </NavLink>
          <NavLink to="/admin/orders" style={navItem}>
            <OrdersIcon size={18} />
            <span>Semua Pesanan</span>
          </NavLink>
          <NavLink to="/admin/vouchers" style={navItem}>
            <VoucherIcon size={18} />
            <span>Voucher Promo</span>
          </NavLink>
          <NavLink to="/admin/audit-logs" style={navItem}>
            <FileTextIcon size={18} />
            <span>Log Audit</span>
          </NavLink>
          <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '8px 14px', textDecoration: 'none' }}>
            ← Kembali ke Beranda
          </Link>
        </aside>

        <main id="main-content" style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--unida-bg)',
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 920,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            background: 'var(--unida-navy)',
            color: 'var(--surface)',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.05em' }}>SOUQNA</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--unida-gold)', display: 'inline-block' }} />
            </div>
            <h2 style={{ color: 'var(--surface)', fontSize: '24px', marginBottom: 'var(--space-3)' }}>
              Pasar Digital Kampus UNIDA Gontor
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.6 }}>
              Platform jual-beli civitas akademika UNIDA Gontor. Belanja mudah, bayar di tempat (COD) aman dan transparan langsung di lingkungan kampus.
            </p>
          </div>
          <div style={{ marginTop: 'var(--space-8)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--unida-gold)', fontSize: '13px', fontWeight: 600 }}>
              <span>✓ Sistem COD Kampus</span>
              <span>•</span>
              <span>✓ UMKM Mahasiswa</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 'var(--space-8)', background: 'var(--surface)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
