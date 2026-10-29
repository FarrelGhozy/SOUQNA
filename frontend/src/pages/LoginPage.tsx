import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAs } from '../lib/mock-auth.js';

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('budi@kampus.ac.id');
  return (
    <>
      <h1>Masuk (dummy)</h1>
      <p>Mock auth — email apa saja bisa, pilih peran:</p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" style={{ width: '100%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {(['buyer', 'merchant', 'admin'] as const).map((r) => (
          <button key={r} onClick={() => { loginAs(r); nav('/'); }}>{r}</button>
        ))}
      </div>
      <p><Link to="/">← Beranda tanpa login</Link></p>
    </>
  );
}
