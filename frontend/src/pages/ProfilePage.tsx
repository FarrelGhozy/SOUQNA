import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { logout } from '../lib/mock-auth.js';
import type { MockUser } from '../types/index.js';

export function ProfilePage() {
  const nav = useNavigate();
  const [me, setMe] = useState<MockUser | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loc, setLoc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await api.getMe();
        setMe(u);
        setName(u?.full_name ?? '');
        setPhone(u?.phone ?? '');
        setLoc(u?.default_location ?? '');
      } catch {
        setErr('Gagal memuat profil.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat profil...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;
  if (!me) return <p>Sesi berakhir. Silakan masuk lagi.</p>;

  return (
    <>
      <h1>Profil</h1>
      <p><small>{me.email} · peran: {me.role}{me.hasStore ? ` · toko: ${me.store_id}` : ''}</small></p>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setMsg(null);
          setErr(null);
          try {
            const u = await api.updateMe({ full_name: name, phone, default_location: loc });
            setMe(u);
            setMsg('Profil tersimpan (localStorage).');
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : 'Gagal menyimpan.');
          } finally {
            setSaving(false);
          }
        }}
      >
        <label>Nama<br /><input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} /></label>
        <br /><br />
        <label>Telepon<br /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx" style={{ width: '100%' }} /></label>
        <br /><br />
        <label>Lokasi default<br /><input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Asrama / kos ..." style={{ width: '100%' }} /></label>
        <br /><br />
        <button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
      </form>
      <hr />
      <button onClick={() => { logout(); nav('/'); }}>Keluar</button>
    </>
  );
}
