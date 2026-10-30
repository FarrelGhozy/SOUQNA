import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Product, WishlistItem } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { ProductCardSkeleton } from '../components/ui/Skeleton.js';
import { Button } from '../components/ui/Button.js';
import { Alert } from '../components/ui/Alert.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { useToast } from '../components/ui/ToastContext.js';
import { TrashIcon } from '../components/ui/Icons.js';

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [prods, setProds] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const w = await api.getWishlist();
      setItems(w);
      const pList: Product[] = [];
      for (const it of w) {
        const p = await api.getProduct(it.product_id);
        if (p) pList.push(p);
      }
      setProds(pList);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await api.removeFromWishlist(productId);
      toast.info('Item dihapus dari wishlist.');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus item.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Wishlist Saya</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Daftar Keinginan (Wishlist)</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          {items.length} produk favorit yang Anda simpan
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {loading ? (
        <div className="grid-products">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : prods.length === 0 ? (
        <EmptyState
          title="Wishlist Masih Kosong"
          description="Simpan produk incaran Anda agar mudah ditemukan kembali dan dibeli kapan saja."
          actionLabel="Telusuri Katalog"
          onAction={() => nav('/search')}
        />
      ) : (
        <div className="grid-products">
          {prods.map((p) => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <ProductCard p={p} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(p.id)}
                style={{ marginTop: 6, color: 'var(--danger)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <TrashIcon size={14} />
                <span>Hapus dari Wishlist</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
