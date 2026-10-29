import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type ProductSort } from '../lib/api-client.js';
import type { Category, Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

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

  useEffect(() => { api.getCategories().then(setCats).catch(() => {}); }, []);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await api.getProducts({ q, categoryId, sort, page, limit: LIMIT, minPrice, maxPrice });
        setProds(r.data);
        setTotal(r.total);
      } catch {
        setError('Gagal memuat hasil. Coba lagi.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryId, sort, page, sp.get('minPrice'), sp.get('maxPrice')]);

  const maxPage = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <h1>Pencarian</h1>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="cth: geprek, hijab, print" value={q} onChange={(e) => set({ q: e.target.value })} />
        <select value={categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
          <option value="">Semua kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" placeholder="Min Rp" value={sp.get('minPrice') ?? ''} min={0}
          onChange={(e) => set({ minPrice: e.target.value })} style={{ width: 110 }} />
        <input type="number" placeholder="Max Rp" value={sp.get('maxPrice') ?? ''} min={0}
          onChange={(e) => set({ maxPrice: e.target.value })} style={{ width: 110 }} />
        <select value={sort} onChange={(e) => set({ sort: e.target.value })}>
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Termurah</option>
          <option value="termahal">Termahal</option>
          <option value="nama">Nama</option>
        </select>
      </form>
      <p><small>{total} hasil{q && <> untuk “{q}”</>}</small></p>
      {loading ? <p>Memuat hasil...</p>
        : error ? <p style={{ color: 'red' }}>{error}</p>
        : prods.length === 0 ? <p>Tidak ada produk. Coba kata kunci / filter lain.</p> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginTop: 12 }}>
              {prods.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
              <button disabled={page <= 1} onClick={() => set({ page: String(page - 1) })}>← Prev</button>
              <span>Halaman {page} / {maxPage}</span>
              <button disabled={page >= maxPage} onClick={() => set({ page: String(page + 1) })}>Next →</button>
            </div>
          </>
        )}
    </>
  );
}
