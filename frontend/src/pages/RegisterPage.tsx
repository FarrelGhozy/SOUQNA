import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../lib/mock-auth.js';

export function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      <h1>Daftar (dummy)</h1>
      <p>Terbuka untuk siapa saja. Akun baru selalu pembeli.</p>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            setErr(null);
            register(name, email);
            nav('/', { replace: true });
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : 'Gagal daftar.');
          }
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" style={{ width: '100%', marginBottom: 8 }} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@kampus.ac.id" style={{ width: '100%' }} />
        <button type="submit" style={{ marginTop: 8 }}>Daftar</button>
      </form>
      <p>Sudah punya akun? <Link to="/login">Masuk</Link></p>
    </>
  );
}
