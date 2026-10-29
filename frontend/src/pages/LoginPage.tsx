import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { loginAs, loginWithEmail } from '../lib/mock-auth.js';

export function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('budi@kampus.ac.id');
  const [err, setErr] = useState<string | null>(null);

  const go = (fn: () => void) => {
    try {
      setErr(null);
      fn();
      nav(from, { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal masuk.');
    }
  };

  return (
    <>
      <h1>Masuk (dummy)</h1>
      <p>Email apa saja bisa masuk sebagai pembeli. Tanpa password (nanti Supabase).</p>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <form onSubmit={(e) => { e.preventDefault(); go(() => loginWithEmail(email)); }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@kampus.ac.id" style={{ width: '100%' }} />
        <button type="submit" style={{ marginTop: 8 }}>Masuk</button>
      </form>
      <p>Belum punya akun? <Link to="/register">Daftar</Link></p>
      <hr />
      <p><small>Demo switch peran (akun preset, bukan dari input):</small></p>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['buyer', 'merchant', 'admin'] as const).map((r) => (
          <button key={r} onClick={() => go(() => loginAs(r))}>{r}</button>
        ))}
      </div>
      <p><Link to="/">← Beranda tanpa login</Link></p>
    </>
  );
}
