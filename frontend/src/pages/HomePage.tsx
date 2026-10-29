import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, isProductOutOfStock } from '../lib/api-client.js';
import type { Category, Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { ProductCardSkeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { Button } from '../components/ui/Button.js';

export function HomePage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [available, setAvailable] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, lat, avail] = await Promise.all([
        api.getCategories(),
        api.getProducts({ sort: 'terbaru', limit: 8 }),
        api.getProducts({ sort: 'termurah', limit: 8 }),
      ]);
      setCats(c);
      setLatest(lat.data);
      setAvailable(avail.data.filter((p) => !isProductOutOfStock(p)).slice(0, 8));
    } catch {
      setError('Gagal memuat katalog. Pastikan koneksi aman dan coba muat ulang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Hero Banner UNIDA Gontor */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--unida-navy) 0%, var(--unida-blue) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8) var(--space-6)',
          color: 'var(--surface)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(212, 175, 55, 0.2)',
              border: '1px solid var(--unida-gold)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--unida-gold)',
              marginBottom: 'var(--space-3)',
            }}
          >
            PASAR KITA KAMPUS UNIDA GONTOR
          </div>
          <h1 style={{ color: 'var(--surface)', fontSize: '32px', marginBottom: 'var(--space-2)' }}>
            Belanja Kebutuhan Kampus, Bayar di Tempat (COD)
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.5, marginBottom: 'var(--space-6)' }}>
            Platform jual-beli produk makanan, percetakan, merchandise, dan jasa antar civitas akademika UNIDA Gontor. Aman, mudah, dan transparan.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, maxWidth: 500 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari makanan, jilid skripsi, baju..."
              className="form-input"
              style={{ background: 'var(--surface)', color: 'var(--unida-text)' }}
            />
            <Button type="submit" variant="gold" size="md">
              Cari
            </Button>
          </form>
        </div>
      </section>

      {error && (
        <Alert variant="danger">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={loadData}>
              Coba Lagi
            </Button>
          </div>
        </Alert>
      )}

      {/* Kategori Quick Access */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h2 style={{ fontSize: '20px' }}>Kategori Pilihan</h2>
          <Link to="/categories" style={{ fontSize: '14px', fontWeight: 600 }}>
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ width: 120, height: 40, borderRadius: 'var(--radius-full)' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {cats.map((c) => (
              <Link
                key={c.id}
                to={`/search?categoryId=${c.id}`}
                className="btn btn-secondary btn-sm"
                style={{
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Produk Terbaru */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontSize: '20px' }}>Produk Terbaru</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Penawaran terbaru dari merchant terpercaya kampus</p>
          </div>
          <Link to="/search?sort=terbaru" style={{ fontSize: '14px', fontWeight: 600 }}>
            Semua Produk →
          </Link>
        </div>

        {loading ? (
          <div className="grid-products">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            Belum ada produk yang dipublikasikan.
          </p>
        ) : (
          <div className="grid-products">
            {latest.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Produk Tersedia (Ready Stock) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontSize: '20px' }}>Siap Dipesan (Stok Tersedia)</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Bisa langsung diorder hari ini via COD</p>
          </div>
        </div>

        {loading ? (
          <div className="grid-products">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : available.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            Semua produk saat ini sedang habis.
          </p>
        ) : (
          <div className="grid-products">
            {available.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Value Propositions / Keunggulan */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>🤝</div>
          <h3 style={{ fontSize: '16px', marginBottom: 'var(--space-1)' }}>Sistem COD Kampus</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
            Transaksi tanpa resiko transfer. Bayar tunai langsung saat pesanan diserahkan di titik temu kampus.
          </p>
        </div>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>📍</div>
          <h3 style={{ fontSize: '16px', marginBottom: 'var(--space-1)' }}>Ambil Sendiri / Antar</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
            Fleksibel! Ambil langsung ke gerai kantin/asrama atau pilih layanan antar merchant ke fakultas Anda.
          </p>
        </div>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>🎓</div>
          <h3 style={{ fontSize: '16px', marginBottom: 'var(--space-1)' }}>Ekonomi Civitas Mandiri</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
            Mendukung unit usaha mandiri mahasiswa, staf, dan pengusaha lokal sekitar Universitas Darussalam Gontor.
          </p>
        </div>
      </section>
    </div>
  );
}
