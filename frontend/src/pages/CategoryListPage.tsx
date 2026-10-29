import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Category } from '../types/index.js';

export function CategoryListPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setCats(await api.getCategories());
      } catch {
        setError('Gagal memuat kategori.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat kategori...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <h1>Kategori</h1>
      {cats.length === 0 ? <p>Belum ada kategori.</p> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {cats.map((c) => (
            <Link key={c.id} to={`/search?categoryId=${c.id}`} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10 }}>
              <b>{c.name}</b>
              {c.description && <div><small>{c.description}</small></div>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
