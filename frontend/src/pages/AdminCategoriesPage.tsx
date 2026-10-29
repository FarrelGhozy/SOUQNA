import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Category } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { useToast } from '../components/ui/ToastContext.js';

export function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      setCats(await api.getAdminCategories());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await api.createCategory({ name: name.trim(), description: desc.trim() || undefined });
      setName('');
      setDesc('');
      toast.success('Kategori baru berhasil ditambahkan!');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menambahkan kategori.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (c: Category) => {
    try {
      await api.updateCategory(c.id, { is_active: !c.is_active });
      toast.info(`Kategori "${c.name}" ${!c.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengubah status kategori.');
    }
  };

  const handleRename = async (c: Category) => {
    const nextName = prompt('Ubah nama kategori:', c.name);
    if (!nextName || nextName === c.name) return;
    try {
      await api.updateCategory(c.id, { name: nextName.trim() });
      toast.success('Nama kategori diperbarui.');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengubah nama kategori.');
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Hapus/nonaktifkan kategori "${c.name}"?`)) return;
    try {
      await api.deleteCategory(c.id);
      toast.info(`Kategori "${c.name}" dinonaktifkan.`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus kategori.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/admin">Dashboard Admin</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Manajemen Kategori</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Kelola Kategori ({cats.length})</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Kategori produk yang tersedia di katalog publik SOUQNA
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {/* Add Category Form Card */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>+ Tambah Kategori Baru</h2>
        </div>
        <form onSubmit={handleAddCategory} className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <Input
              label="Nama Kategori *"
              placeholder="Cth: Percetakan & Fotokopi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="Deskripsi Kategori"
              placeholder="Deskripsi singkat jenis produk..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div style={{ paddingBottom: 'var(--space-4)' }}>
            <Button type="submit" variant="primary" size="md" loading={adding} disabled={!name.trim()}>
              Simpan
            </Button>
          </div>
        </form>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={60} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th>Slug URL</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ color: 'var(--unida-navy)' }}>{c.name}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px', background: 'var(--surface-muted)', padding: '2px 6px', borderRadius: 4 }}>
                      {c.slug}
                    </code>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                    {c.description || '—'}
                  </td>
                  <td>
                    <Badge variant={c.is_active ? 'success' : 'muted'}>
                      {c.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Button variant="secondary" size="sm" onClick={() => handleRename(c)}>
                        Ubah Nama
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleToggleActive(c)}>
                        {c.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c)} style={{ color: 'var(--danger)' }}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
