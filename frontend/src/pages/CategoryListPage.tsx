import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Category } from '../types/index.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { EmptyState } from '../components/ui/EmptyState.js';

export function CategoryListPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setCats(await api.getCategories());
      } catch {
        setError('Gagal memuat daftar kategori.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Semua Kategori</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Kategori Produk & Jasa</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Jelajahi berbagai kebutuhan kampus UNIDA Gontor berdasarkan kategori
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ padding: 'var(--space-5)' }}>
              <Skeleton height={24} width="60%" style={{ marginBottom: 12 }} />
              <Skeleton height={16} width="90%" />
            </div>
          ))}
        </div>
      ) : cats.length === 0 ? (
        <EmptyState
          title="Belum Ada Kategori"
          description="Kategori produk belum ditambahkan oleh administrator."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {cats.map((c) => (
            <Link
              key={c.id}
              to={`/search?categoryId=${c.id}`}
              className="card card-hover"
              style={{
                padding: 'var(--space-5)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '18px', color: 'var(--unida-navy)', margin: 0 }}>{c.name}</h2>
                <span style={{ color: 'var(--unida-blue)', fontSize: '16px' }}>→</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                {c.description || 'Lihat semua penawaran di kategori ini.'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
