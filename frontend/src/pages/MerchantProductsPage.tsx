import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, productMinPrice } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Category, Product } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { useToast } from '../components/ui/ToastContext.js';

export function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([api.getMyProducts(), api.getCategories()]);
      setProducts(p);
      setCats(c);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? id;

  const handleToggleStatus = async (p: Product) => {
    const nextStatus = p.status === 'published' ? 'hidden' : 'published';
    try {
      await api.updateMyProduct(p.id, { status: nextStatus });
      toast.success(nextStatus === 'published' ? `${p.name} berhasil ditayangkan!` : `${p.name} disembunyikan.`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengubah status.');
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Hapus produk "${p.name}" dari katalog toko Anda?`)) return;
    try {
      await api.deleteMyProduct(p.id);
      toast.info(`Produk "${p.name}" telah dihapus.`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus produk.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
            <Link to="/merchant">Dashboard Merchant</Link>
            <span>/</span>
            <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Katalog Produk</span>
          </nav>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Kelola Produk Toko</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
            Total {products.length} produk terdaftar di toko Anda
          </p>
        </div>

        <Link to="/merchant/products/new">
          <Button variant="primary" size="md">
            + Tambah Produk Baru
          </Button>
        </Link>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Belum Ada Produk di Toko Anda"
          description="Tambahkan produk pertama untuk mulai berjualan dan menerima pesanan dari civitas UNIDA Gontor."
          actionLabel="+ Tambah Produk Pertama"
          onAction={() => window.location.assign('/merchant/products/new')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {products.map((p) => {
            const totalStock = p.variants.reduce((s, v) => s + v.stock_quantity, 0);
            return (
              <div
                key={p.id}
                className="card card-hover"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  flexWrap: 'wrap',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-md)',
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

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Link
                      to={`/products/${p.id}`}
                      style={{ fontWeight: 700, fontSize: '16px', color: 'var(--unida-navy)' }}
                    >
                      {p.name}
                    </Link>
                    <Badge variant={p.status === 'published' ? 'success' : 'muted'}>
                      {p.status === 'published' ? 'Tayang' : 'Disembunyikan'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>Kategori: <strong>{catName(p.category_id)}</strong></span>
                    <span>•</span>
                    <span>Mulai: <strong style={{ color: 'var(--unida-navy)' }}>{formatIDR(productMinPrice(p))}</strong></span>
                    <span>•</span>
                    <span>Stok Total: <strong>{totalStock}</strong> ({p.variants.length} varian)</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link to={`/merchant/products/${p.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant={p.status === 'published' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleStatus(p)}
                  >
                    {p.status === 'published' ? 'Sembunyikan' : 'Tayangkan'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p)}
                    style={{ color: 'var(--danger)' }}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
