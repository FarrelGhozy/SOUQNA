import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../lib/mock-auth.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { Badge } from '../components/ui/Badge.js';

export function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErr('Email wajib diisi.');
      return;
    }
    try {
      setLoading(true);
      setErr(null);
      register(name.trim(), email.trim());
      nav('/', { replace: true });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Gagal melakukan pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Badge variant="info">PENDAFTARAN</Badge>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Civitas UNIDA</span>
        </div>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Buat Akun Baru</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Daftar sekarang untuk mulai berbelanja di Pasar SOUQNA.
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Input
          label="Nama Lengkap"
          placeholder="Cth: Ahmad Fauzi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Alamat Email Kampus"
          type="email"
          placeholder="nama@kampus.ac.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText="Akun baru otomatis memiliki peran Pembeli"
          required
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
          Daftar Akun
        </Button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)', marginTop: 'var(--space-2)' }}>
        Sudah memiliki akun?{' '}
        <Link to="/login" style={{ fontWeight: 600 }}>
          Masuk di sini
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
        <Link to="/" style={{ fontSize: '13px', color: 'var(--muted)' }}>
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
