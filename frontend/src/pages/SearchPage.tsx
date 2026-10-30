import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type ProductSort } from '../lib/api-client.js';
import type { Category, Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { ProductCardSkeleton } from '../components/ui/Skeleton.js';
import { Button } from '../components/ui/Button.js';
import { Alert } from '../components/ui/Alert.js';
import { EmptyState } from '../components/ui/EmptyState.js';

const LIMIT = 12;

function num(v: string | null): number | undefined {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState<Category[]>([]);
  const [prods, setProds] = useState<Product[]>([]);
  const [storeMap, setStoreMap] = useState<Record<string, string>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = sp.get('q') ?? '';
  const categoryId = sp.get('categoryId') ?? '';
  const sort = (sp.get('sort') as ProductSort) || 'terbaru';
  const page = Number(sp.get('page') ?? '1') || 1;
  const minPrice = num(sp.get('minPrice'));
  const maxPrice = num(sp.get('maxPrice'));

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    if (!('page' in patch)) next.delete('page');
    setSp(next);
  };

  const resetFilters = () => {
    setSp(new URLSearchParams());
  };

  useEffect(() => {
    api.getCategories().then(setCats).catch(() => {});
    api.getStores().then((st) => setStoreMap(Object.fromEntries(st.map((s) => [s.id, s.name])))).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await api.getProducts({ q, categoryId, sort, page, limit: LIMIT, minPrice, maxPrice });
        setProds(r.data);
        setTotal(r.total);
      } catch {
        setError('Gagal memuat hasil pencarian. Coba muat ulang.');
      } finally {
        setLoading(false);
      }
    })();
  }, [q, categoryId, sort, page, sp.get('minPrice'), sp.get('maxPrice')]);

  const maxPage = Math.max(1, Math.ceil(total / LIMIT));
  const hasActiveFilters = Boolean(q || categoryId || minPrice || maxPrice || (sort && sort !== 'terbaru'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: 'var(--space-1)' }}>Pencarian Produk</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
          Menemukan {total} produk {q && <>untuk “<strong>{q}</strong>”</>}
        </p>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-3)',
            alignItems: 'end',
          }}
        >
          <div>
            <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Kata Kunci</label>
            <input
              placeholder="Cth: geprek, buku, jaket..."
              value={q}
              onChange={(e) => set({ q: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => set({ categoryId: e.target.value })}
              className="form-select"
            >
              <option value="">Semua Kategori</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Urutan</label>
            <select
              value={sort}
              onChange={(e) => set({ sort: e.target.value })}
              className="form-select"
            >
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Harga Termurah</option>
              <option value="termahal">Harga Termahal</option>
              <option value="nama">Nama (A-Z)</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Harga Minimum</label>
            <input
              type="number"
              placeholder="Rp Min"
              value={sp.get('minPrice') ?? ''}
              min={0}
              onChange={(e) => set({ minPrice: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Harga Maksimum</label>
            <input
              type="number"
              placeholder="Rp Max"
              value={sp.get('maxPrice') ?? ''}
              min={0}
              onChange={(e) => set({ maxPrice: e.target.value })}
              className="form-input"
            />
          </div>

          {hasActiveFilters && (
            <div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={resetFilters}
                style={{ width: '100%' }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </form>
      </div>

      {error && (
        <Alert variant="danger">
          <span>{error}</span>
        </Alert>
      )}

      {/* Result Grid */}
      {loading ? (
        <div className="grid-products">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : prods.length === 0 ? (
        <EmptyState
          title="Tidak Ada Produk Ditemukan"
          description="Coba gunakan kata kunci pencarian yang lebih umum atau sesuaikan filter harga dan kategori."
          actionLabel={hasActiveFilters ? "Bersihkan Semua Filter" : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <>
          <div className="grid-products">
            {prods.map((p) => (
              <ProductCard key={p.id} p={p} storeName={storeMap[p.store_id]} />
            ))}
          </div>

          {/* Pagination */}
          {maxPage > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)',
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => set({ page: String(page - 1) })}
              >
                ← Sebelumnya
              </Button>
              <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>
                Halaman {page} dari {maxPage}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= maxPage}
                onClick={() => set({ page: String(page + 1) })}
              >
                Berikutnya →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
