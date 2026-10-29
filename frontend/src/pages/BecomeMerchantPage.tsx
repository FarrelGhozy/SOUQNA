import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Store } from '../types/index.js';

// Form Jadi Merchant: 1 akun 1 toko. Toko kedua ditolak (API + UI).
export function BecomeMerchantPage() {
  const nav = useNavigate();
  const [existing, setExisting] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [logo, setLogo] = useState('');
  const [pickup, setPickup] = useState('');
  const [deliv, setDeliv] = useState(true);
  const [fee, setFee] = useState('5000');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setExisting(await api.getMyStore());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat...</p>;
  if (existing) {
    return (
      <>
        <h1>Jadi Merchant</h1>
        <p>Akun ini sudah memiliki toko <b>{existing.name}</b> — 1 akun hanya 1 toko.</p>
        <Link to="/merchant">Buka dashboard merchant →</Link>
      </>
    );
  }

  return (
    <>
      <h1>Jadi Merchant</h1>
      <p><small>Isi data toko sekali saja. Akun yang sudah bertoko tidak bisa buat toko kedua.</small></p>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <div style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>Nama toko*<br /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="cth: Kantin Berkah" /></label>
        <label>Deskripsi<br /><input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Jualan apa?" /></label>
        <label>Logo URL (opsional)<br /><input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." /></label>
        <label>Lokasi pickup*<br /><input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="cth: Kantin Lt.1 Blok A" /></label>
        <label><input type="checkbox" checked={deliv} onChange={(e) => setDeliv(e.target.checked)} /> Melayani pengantaran</label>
        {deliv && <label>Biaya antar (Rp, per order)<br /><input type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} /></label>}
        <button disabled={busy} onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            await api.createMyStore({
              name, description: desc, logo_url: logo,
              pickup_location: pickup, delivery_available: deliv,
              delivery_fee: Number(fee) || 0,
            });
            nav('/merchant');
          } catch (e) {
            setErr(e instanceof Error ? e.message : 'Gagal membuat toko.');
          } finally {
            setBusy(false);
          }
        }}>{busy ? 'Menyimpan...' : 'Buat toko'}</button>
      </div>
    </>
  );
}
