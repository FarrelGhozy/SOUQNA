import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Store } from '../types/index.js';

// Profil toko milik sendiri: nama/deskripsi/logo/pickup/antar + fee.
export function StoreProfilePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [logo, setLogo] = useState('');
  const [pickup, setPickup] = useState('');
  const [deliv, setDeliv] = useState(false);
  const [fee, setFee] = useState('0');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getMyStore();
        setStore(s);
        if (s) {
          setName(s.name);
          setDesc(s.description);
          setLogo(s.logo_url ?? '');
          setPickup(s.pickup_location);
          setDeliv(s.delivery_available);
          setFee(String(s.delivery_fee));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat...</p>;
  if (!store) return <><p>Belum punya toko.</p><Link to="/become-merchant">Jadi merchant →</Link></>;

  return (
    <>
      <Link to="/merchant">← Dashboard</Link>
      <h1>Profil toko</h1>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <div style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>Nama toko<br /><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Deskripsi<br /><input value={desc} onChange={(e) => setDesc(e.target.value)} /></label>
        <label>Logo URL<br /><input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." /></label>
        {logo.trim() && <img src={logo} alt="logo" width={120} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />}
        <label>Lokasi pickup<br /><input value={pickup} onChange={(e) => setPickup(e.target.value)} /></label>
        <label><input type="checkbox" checked={deliv} onChange={(e) => setDeliv(e.target.checked)} /> Melayani pengantaran</label>
        {deliv && <label>Biaya antar (Rp)<br /><input type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} /></label>}
        <button disabled={busy} onClick={async () => {
          setBusy(true);
          setMsg(null);
          setErr(null);
          try {
            const s = await api.updateMyStore({
              name, description: desc, logo_url: logo, pickup_location: pickup,
              delivery_available: deliv, delivery_fee: Number(fee) || 0,
            });
            setStore(s);
            setMsg('Profil toko tersimpan.');
          } catch (e) {
            setErr(e instanceof Error ? e.message : 'Gagal menyimpan.');
          } finally {
            setBusy(false);
          }
        }}>{busy ? 'Menyimpan...' : 'Simpan'}</button>
      </div>
    </>
  );
}
