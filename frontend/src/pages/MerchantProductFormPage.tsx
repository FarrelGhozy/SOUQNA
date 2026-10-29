import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Category, Product } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea, Select } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';

interface VarRow { id?: string; label: string; price: string; stock: string }

export function MerchantProductFormPage() {
  const { productId } = useParams();
  const nav = useNavigate();
  const isNew = !productId;
  const toast = useToast();

  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'hidden'>('published');
  const [img, setImg] = useState('');
  const [vars, setVars] = useState<VarRow[]>([{ label: 'Standar', price: '10000', stock: '10' }]);
  const [loading, setLoading] = useState(!isNew);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const c = await api.getCategories();
      setCats(c);
      setCat((v) => v || c[0]?.id || '');

      if (!isNew) {
        try {
          const mine = await api.getMyProducts();
          const p = mine.find((x) => x.id === productId);
          if (!p) {
            setErr('Produk tidak ditemukan atau bukan milik tokomu.');
            return;
          }
          setName(p.name);
          setCat(p.category_id);
          setDesc(p.description);
          setStatus(p.status === 'suspended' ? 'hidden' : p.status);
          setImg(p.image_url);
          setVars(p.variants.map((v) => ({
            id: v.id,
            label: v.label,
            price: String(v.price),
            stock: String(v.stock_quantity),
          })));
        } catch (e) {
          setErr(e instanceof Error ? e.message : 'Gagal memuat produk.');
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [isNew, productId]);

  const addVariantRow = () => {
    setVars([...vars, { label: '', price: '', stock: '' }]);
  };

  const removeVariantRow = (index: number) => {
    if (vars.length <= 1) {
      toast.warning('Produk minimal harus memiliki 1 varian.');
      return;
    }
    setVars(vars.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Nama produk wajib diisi.');
      return;
    }
    if (vars.some((v) => !v.label.trim() || Number(v.price) < 0 || Number(v.stock) < 0)) {
      setErr('Pastikan semua varian memiliki label nama, harga valid (≥0), dan stok valid (≥0).');
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const variantPayload = vars.map((v) => ({
        id: v.id,
        label: v.label.trim(),
        price: Number(v.price) || 0,
        stock_quantity: Number(v.stock) || 0,
        is_active: true,
      }));

      if (isNew) {
        await api.createMyProduct({
          name: name.trim(),
          category_id: cat,
          description: desc.trim(),
          status,
          image_url: img.trim() || '/placeholder.svg',
          variants: variantPayload,
        });
        toast.success(`Produk "${name}" berhasil ditambahkan!`);
      } else {
        await api.updateMyProduct(productId!, {
          name: name.trim(),
          category_id: cat,
          description: desc.trim(),
          status,
          image_url: img.trim() || '/placeholder.svg',
        });
        for (const row of vars) {
          if (row.id) {
            await api.updateMyVariant(row.id, {
              label: row.label.trim(),
              price: Number(row.price) || 0,
              stock_quantity: Number(row.stock) || 0,
            });
          } else {
            await api.createMyVariant(productId!, {
              label: row.label.trim(),
              price: Number(row.price) || 0,
              stock_quantity: Number(row.stock) || 0,
            });
          }
        }
        toast.success(`Produk "${name}" berhasil diperbarui!`);
      }
      nav('/merchant/products');
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Gagal menyimpan produk.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Skeleton height={200} borderRadius="var(--radius-lg)" />
        <Skeleton height={200} borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (err && !isNew && !name) {
    return (
      <div style={{ maxWidth: 720, margin: 'var(--space-6) auto' }}>
        <Alert variant="danger">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{err}</span>
            <Link to="/merchant/products">
              <Button variant="secondary" size="sm">Kembali ke Daftar Produk</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/merchant">Dashboard Merchant</Link>
          <span>/</span>
          <Link to="/merchant/products">Produk Toko</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>
            {isNew ? 'Tambah Produk' : 'Edit Produk'}
          </span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>
          {isNew ? 'Tambah Produk Baru' : `Edit Produk: ${name}`}
        </h1>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Section 1: Basic Info */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '16px', margin: 0 }}>1. Informasi Dasar Produk</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Input
              label="Nama Produk *"
              placeholder="Cth: Nasi Ayam Geprek Level 2 / Jasa Cetak Banner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Select
              label="Kategori Produk *"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              options={cats.map((c) => ({ value: c.id, label: c.name }))}
            />

            <Textarea
              label="Deskripsi Lengkap"
              placeholder="Jelaskan spesifikasi, rasa, ukuran, atau ketentuan lainnya..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <Select
              label="Status Publikasi"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'hidden')}
              options={[
                { value: 'published', label: 'Tayang (Langsung tampil di katalog pembeli)' },
                { value: 'hidden', label: 'Disembunyikan (Hanya tersimpan di panel toko)' },
                { value: 'draft', label: 'Draf (Belum siap dijual)' },
              ]}
            />
          </div>
        </div>

        {/* Section 2: Image */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '16px', margin: 0 }}>2. Foto Produk</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Input
              label="Tautan Gambar (URL Foto Produk)"
              placeholder="https://images.unsplash.com/..."
              value={img}
              onChange={(e) => setImg(e.target.value)}
              helperText="Gunakan URL gambar online; gambar akan otomatis dioptimalkan rasio 1:1"
            />

            {img.trim() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <img
                    src={img}
                    alt="Pratinjau produk"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Pratinjau tampilan foto produk</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Variants, Price, Stock */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', margin: 0 }}>3. Manajemen Varian & Stok (COD)</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addVariantRow}>
              + Tambah Varian
            </Button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
              Setiap produk wajib memiliki setidaknya 1 varian dengan label, harga satuan, dan jumlah stok.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vars.map((v, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr auto',
                    gap: 8,
                    alignItems: 'center',
                    background: 'var(--surface-muted)',
                    padding: 8,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <input
                    placeholder="Nama Varian (Cth: Reguler, Pedas)"
                    value={v.label}
                    onChange={(e) => {
                      const next = [...vars];
                      next[idx].label = e.target.value;
                      setVars(next);
                    }}
                    className="form-input"
                    style={{ minHeight: 38, padding: '6px 10px' }}
                    required
                  />

                  <input
                    type="number"
                    placeholder="Harga (Rp)"
                    min={0}
                    step={500}
                    value={v.price}
                    onChange={(e) => {
                      const next = [...vars];
                      next[idx].price = e.target.value;
                      setVars(next);
                    }}
                    className="form-input"
                    style={{ minHeight: 38, padding: '6px 10px' }}
                    required
                  />

                  <input
                    type="number"
                    placeholder="Stok"
                    min={0}
                    value={v.stock}
                    onChange={(e) => {
                      const next = [...vars];
                      next[idx].stock = e.target.value;
                      setVars(next);
                    }}
                    className="form-input"
                    style={{ minHeight: 38, padding: '6px 10px' }}
                    required
                  />

                  <button
                    type="button"
                    disabled={vars.length <= 1}
                    onClick={() => removeVariantRow(idx)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: vars.length <= 1 ? 'var(--border)' : 'var(--danger)',
                      cursor: vars.length <= 1 ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      padding: 4,
                    }}
                    title="Hapus varian ini"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Link to="/merchant/products">
            <Button type="button" variant="secondary" size="lg">
              Batal
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" loading={busy}>
            {isNew ? 'Terbitkan Produk Baru' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
