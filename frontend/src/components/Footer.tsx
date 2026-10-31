import { Link } from 'react-router-dom';
import { SouqnaLogo } from './ui/SouqnaLogo.js';

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--unida-navy-dark)',
        color: '#FFFFFF',
        borderTop: '3px solid var(--unida-gold)',
        paddingTop: 'var(--space-10)',
        paddingBottom: 'var(--space-10)',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <SouqnaLogo
                variant="horizontal"
                theme="dark"
                size="md"
                subtext="UNIDA Gontor"
              />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              Pasar Digital Civitas Akademika Universitas Darussalam Gontor. Belanja mudah, transparan, dan pembayaran COD langsung di area kampus.
            </p>
            <div style={{ color: 'var(--unida-gold)', fontSize: '12px', fontWeight: 600 }}>
              Jl. Raya Siman Km. 6, Ponorogo, Jawa Timur 63471
            </div>
          </div>

          {/* Navigasi Utama */}
          <div>
            <h4 style={{ color: 'var(--unida-gold)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
              Jelajahi Pasar
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
              <li>
                <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/search" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Pencarian Produk
                </Link>
              </li>
              <li>
                <Link to="/categories" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Semua Kategori
                </Link>
              </li>
              <li>
                <Link to="/cart" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Lacak Pesanan (COD)
                </Link>
              </li>
            </ul>
          </div>

          {/* Untuk Merchant */}
          <div>
            <h4 style={{ color: 'var(--unida-gold)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
              Untuk Penjual
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
              <li>
                <Link to="/become-merchant" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Buka Toko Kampus
                </Link>
              </li>
              <li>
                <Link to="/merchant" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Dashboard Merchant
                </Link>
              </li>
              <li>
                <Link to="/merchant/products" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Kelola Stok & Varian
                </Link>
              </li>
              <li>
                <Link to="/merchant/orders" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  Pesanan Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* Status & Kebijakan */}
          <div>
            <h4 style={{ color: 'var(--unida-gold)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
              Informasi Prototype
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: 1.5, marginBottom: 'var(--space-2)' }}>
              SOUQNA saat ini berada dalam tahap mock baseline demo (M0–M12). Data barang, transaksi COD, dan toko merupakan simulasi civitas akademika UNIDA Gontor.
            </p>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid var(--unida-gold)',
                color: 'var(--unida-gold)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Versi v1.0.0-demo
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 'var(--space-4)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <div>
            © {new Date().getFullYear()} SOUQNA — Universitas Darussalam Gontor. Hak cipta dilindungi.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Transparan</span>
            <span>•</span>
            <span>Aman</span>
            <span>•</span>
            <span>COD Kampus</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
