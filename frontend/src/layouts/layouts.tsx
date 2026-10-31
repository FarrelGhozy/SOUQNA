import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { currentSession, isSellerMode, logout, setSellerMode } from '../lib/mock-auth.js';
import { api } from '../lib/api-client.js';
import { Badge } from '../components/ui/Badge.js';
import { SouqnaLogo } from '../components/ui/SouqnaLogo.js';
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
  SettingsIcon,
} from '../components/ui/Icons.js';

function Header() {
  const s = currentSession();
  const sellerMode = Boolean(s?.hasStore && isSellerMode());
  const nav = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    if (sellerMode) {
      setCartCount(0);
      return;
    }
    let mounted = true;
    api.getCart().then((c) => {
      if (mounted) setCartCount(c.reduce((sum, i) => sum + i.quantity, 0));
    }).catch(() => {});
    return () => { mounted = false; };
  }, [location.pathname, sellerMode]);

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
        background: 'var(--topbar-bg, linear-gradient(90deg, var(--unida-blue) 0%, var(--unida-blue-hover) 40%, var(--unida-navy) 100%))',
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
            to={sellerMode ? '/merchant' : '/'}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={sellerMode ? 'SOUQNA Dashboard Toko' : 'SOUQNA Beranda'}
          >
            <SouqnaLogo
              variant="horizontal"
              theme="dark"
              size="md"
              subtext={sellerMode ? 'Seller Centre' : 'UNIDA Gontor'}
            />
          </Link>
          {sellerMode && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--unida-navy)',
                background: 'var(--unida-gold)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              MODE TOKO
            </span>
          )}
        </div>

        {/* Desktop Navigation Links: mode penjual sembunyikan navbar pembeli, ganti fokus jualan */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="desktop-nav"
          aria-label={sellerMode ? 'Navigasi Penjual' : 'Navigasi Utama'}
        >
          {sellerMode ? (
            <>
              <NavLink to="/merchant" end style={navLinkStyle}>
                <DashboardIcon size={16} />
                <span>Ringkasan</span>
              </NavLink>
              <NavLink to="/merchant/products" style={navLinkStyle}>
                <StoreIcon size={16} />
                <span>Produk</span>
              </NavLink>
              <NavLink to="/merchant/orders" style={navLinkStyle}>
                <OrdersIcon size={16} />
                <span>Pesanan Masuk</span>
              </NavLink>
              <NavLink to="/merchant/store" style={navLinkStyle}>
                <SettingsIcon size={16} />
                <span>Pengaturan Toko</span>
              </NavLink>
              <button
                onClick={() => {
                  setSellerMode(false);
                  nav('/');
                }}
                className="btn btn-sm btn-gold"
                style={{ fontSize: '12px', minHeight: 32, marginLeft: 8 }}
              >
                ← Kembali ke Pasar
              </button>
            </>
          ) : (
            <>
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
                  onClick={() => setSellerMode(true)}
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
            </>
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
  const sellerMode = Boolean(s?.hasStore && isSellerMode());
  const nav = useNavigate();
  const [cartCount, setCartCount] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    if (sellerMode) {
      setCartCount(0);
      return;
    }
    let mounted = true;
    api.getCart().then((c) => {
      if (mounted) setCartCount(c.reduce((sum, i) => sum + i.quantity, 0));
    }).catch(() => {});
    return () => { mounted = false; };
  }, [location.pathname, sellerMode]);

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

  if (sellerMode) {
    return (
      <nav
        className="mobile-bottom-nav"
        aria-label="Navigasi Bawah Penjual"
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
        <NavLink to="/merchant" end style={navItemStyle}>
          <HomeIcon size={20} />
          <span>Ringkasan</span>
        </NavLink>
        <NavLink to="/merchant/products" style={navItemStyle}>
          <StoreIcon size={20} />
          <span>Produk</span>
        </NavLink>
        <NavLink to="/merchant/orders" style={navItemStyle}>
          <OrdersIcon size={20} />
          <span>Pesanan</span>
        </NavLink>
        <NavLink to="/merchant/store" style={navItemStyle}>
          <UserIcon size={20} />
          <span>Toko</span>
        </NavLink>
        <button
          onClick={() => {
            setSellerMode(false);
            nav('/');
          }}
          aria-label="Kembali ke Mode Pembeli"
          style={{
            ...navItemStyle({ isActive: false }),
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <SearchIcon size={20} />
          <span>Pasar</span>
        </button>
      </nav>
    );
  }

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
  useEffect(() => {
    // Akses akun toko langsung fokus ke penjual.
    if (s?.hasStore && !isSellerMode()) setSellerMode(true);
  }, [s?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <Header />
      <div className="container" style={{ padding: 'var(--space-6) var(--space-4)', flex: 1, paddingBottom: 80 }}>
        <main id="main-content" style={{ width: '100%' }}>
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
            <SouqnaLogo
              variant="horizontal"
              theme="dark"
              size="sm"
              subtext="Admin Panel"
            />
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
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <SouqnaLogo
                variant="horizontal"
                theme="dark"
                size="lg"
                subtext="Pasar Digital UNIDA Gontor"
              />
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
