import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, productMinPrice } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Product } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { useToast } from '../components/ui/ToastContext.js';

export function AdminProductsPage() {
  const [prods, setProds] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [changingId, setChangingId] = useState<string | null>(null);
  const toast = useToast();

  const load = async (query: string) => {
    try {
      setLoading(true);
      setProds(await api.getAdminProducts(query || undefined));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const handleStatusChange = async (p: Product, nextStatus: 'published' | 'hidden' | 'suspended') => {
    setChangingId(p.id);
    try {
      await api.setProductStatusAdmin(p.id, nextStatus);
      toast.success(`Status "${p.name}" diubah menjadi ${nextStatus}.`);
      load(q);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengubah status moderasi.');
    } finally {
      setChangingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/admin">Dashboard Admin</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Moderasi Produk</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Moderasi Produk Kampus ({prods.length})</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Tinjau kepatuhan produk, tayangkan, sembunyikan, atau tangguhkan produk bermasalah
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {/* Search Input Bar */}
      <div className="card" style={{ padding: 'var(--space-3)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(q);
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            placeholder="Cari berdasarkan nama atau slug produk..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="form-input"
            style={{ minHeight: 40 }}
          />
          <Button type="submit" variant="primary" size="md">
            Cari
          </Button>
          {q && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                setQ('');
                load('');
              }}
            >
              Reset
            </Button>
          )}
        </form>
      </div>

      {/* Products Moderation Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={64} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Toko Penjual</th>
                <th>Harga Mulai</th>
                <th>Status Moderasi</th>
                <th style={{ textAlign: 'right' }}>Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody>
              {prods.map((p) => {
                const isChanging = changingId === p.id;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            background: 'var(--surface-muted)',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div>
                          <Link to={`/products/${p.id}`} style={{ fontWeight: 600, color: 'var(--unida-navy)' }}>
                            {p.name}
                          </Link>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {p.variants.length} varian terdaftar
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{p.store_id}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--unida-navy)' }}>
                        {formatIDR(productMinPrice(p))}
                      </strong>
                    </td>
                    <td>
                      <Badge
                        variant={
                          p.status === 'published'
                            ? 'success'
                            : p.status === 'suspended'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {p.status === 'published' ? 'Tayang' : p.status === 'suspended' ? 'Ditangguhkan' : 'Draf/Hidden'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={p.status === 'published' || isChanging}
                          onClick={() => handleStatusChange(p, 'published')}
                        >
                          Publish
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={p.status === 'hidden' || isChanging}
                          onClick={() => handleStatusChange(p, 'hidden')}
                        >
                          Hide
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={p.status === 'suspended' || isChanging}
                          onClick={() => handleStatusChange(p, 'suspended')}
                        >
                          Suspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
