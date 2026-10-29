import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Category } from '../types/index.js';

// Kategori CRUD (hapus = nonaktif agar produk historis aman).
export function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const load = async () => setCats(await api.getAdminCategories());

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat kategori.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat kategori...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <Link to="/admin">← Dashboard</Link>
      <h1>Kategori ({cats.length})</h1>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Nama baru" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Deskripsi" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button onClick={async () => {
          try {
            await api.createCategory({ name, description: desc });
            setName('');
            setDesc('');
            await load();
          } catch (e) {
            alert(e instanceof Error ? e.message : 'Gagal tambah.');
          }
        }}>+ Tambah</button>
      </div>
      {cats.map((c) => (
        <div key={c.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <b>{c.name}</b> <small>· {c.slug} · {c.is_active ? 'aktif' : 'nonaktif'}</small>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={async () => {
              await api.updateCategory(c.id, { is_active: !c.is_active });
              await load();
            }}>{c.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
            <button onClick={async () => {
              const n = prompt('Nama baru', c.name);
              if (n == null) return;
              try {
                await api.updateCategory(c.id, { name: n });
                await load();
              } catch (e) {
                alert(e instanceof Error ? e.message : 'Gagal ubah.');
              }
            }}>Rename</button>
            {c.is_active && <button onClick={async () => {
              if (!confirm(`Nonaktifkan ${c.name}?`)) return;
              await api.deleteCategory(c.id);
              await load();
            }}>Hapus</button>}
          </div>
        </div>
      ))}
    </>
  );
}
