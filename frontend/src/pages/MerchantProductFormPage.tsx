import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Category, Product } from '../types/index.js';

interface VarRow { id?: string; label: string; price: string; stock: string }

// Form tambah/edit produk milik sendiri + kelola varian (harga/stok).
// Produk toko lain tidak bisa dibuka (API menolak + UI tampilkan pesan).
export function MerchantProductFormPage() {
  const { productId } = useParams();
  const nav = useNavigate();
  const isNew = !productId;
  const [cats, setCats] = useState<Category[]>([]);
  const [orig, setOrig] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'hidden'>('draft');
  const [img, setImg] = useState('');
  const [vars, setVars] = useState<VarRow[]>([{ label: '', price: '', stock: '' }]);
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
          if (!p) { setErr('Produk tidak ditemukan atau bukan milik tokomu.'); return; }
          setOrig(p);
          setName(p.name);
          setCat(p.category_id);
          setDesc(p.description);
          setStatus(p.status === 'suspended' ? 'hidden' : p.status);
          setImg(p.image_url);
          setVars(p.variants.map((v) => ({ id: v.id, label: v.label, price: String(v.price), stock: String(v.stock_quantity) })));
        } catch (e) {
          setErr(e instanceof Error ? e.message : 'Gagal memuat produk.');
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [isNew, productId]);

  if (loading) return <p>Memuat...</p>;
  if (err) return <><Link to="/merchant/products">← Produk</Link><p style={{ color: 'red' }}>{err}</p></>;

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const variants = vars.map((v) => ({
        label: v.label, price: Number(v.price), stock_quantity: Number(v.stock),
      }));
      if (isNew) {
        const p = await api.createMyProduct({
          name, category_id: cat, description: desc, status, image_url: img, variants,
        });
        nav(`/merchant/products/${p.id}/edit`);
      } else {
        await api.updateMyProduct(productId!, { name, category_id: cat, description: desc, status, image_url: img });
        // Sinkronkan varian: update yang ada, tambah yang baru.
        const current = await api.getMyProducts();
        const p = current.find((x) => x.id === productId)!;
        for (const row of vars) {
          if (row.id) {
            const cur = p.variants.find((v) => v.id === row.id)!;
            if (cur.label !== row.label || String(cur.price) !== row.price || String(cur.stock_quantity) !== row.stock) {
              await api.updateMyVariant(row.id, { label: row.label, price: Number(row.price), stock_quantity: Number(row.stock) });
            }
          } else {
            await api.createMyVariant(productId!, { label: row.label, price: Number(row.price), stock_quantity: Number(row.stock) });
          }
        }
        setErr(null);
        alert('Produk tersimpan.');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal menyimpan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to="/merchant/products">← Produk</Link>
      <h1>{isNew ? 'Tambah produk' : `Edit: ${orig?.name}`}</h1>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <label>Nama*<br /><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Kategori<br />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Deskripsi<br /><input value={desc} onChange={(e) => setDesc(e.target.value)} /></label>
        <label>Status<br />
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="draft">draft (belum tayang)</option>
            <option value="published">published (tampil publik)</option>
            <option value="hidden">hidden (arsip)</option>
          </select>
        </label>
        <label>Gambar URL<br /><input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://... (kosong = picsum)" /></label>
        {img.trim() && <img src={img} alt="preview" width={160} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />}
        <h3>Varian (min 1)</h3>
        {vars.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input placeholder="Label" value={v.label} onChange={(e) => setVars((a) => a.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
            <input placeholder="Harga" type="number" min={0} style={{ width: 100 }} value={v.price} onChange={(e) => setVars((a) => a.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} />
            <input placeholder="Stok" type="number" min={0} style={{ width: 80 }} value={v.stock} onChange={(e) => setVars((a) => a.map((x, j) => j === i ? { ...x, stock: e.target.value } : x))} />
            {v.id && <small>{formatIDR(Number(v.price) || 0)}</small>}
            {vars.length > 1 && <button onClick={() => setVars((a) => a.filter((_, j) => j !== i))}>×</button>}
          </div>
        ))}
        <div><button onClick={() => setVars((a) => [...a, { label: '', price: '', stock: '' }])}>+ Varian</button></div>
        <button disabled={busy} onClick={save}>{busy ? 'Menyimpan...' : 'Simpan produk'}</button>
      </div>
    </>
  );
}
