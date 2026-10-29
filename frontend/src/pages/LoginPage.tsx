import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { loginAs, loginWithEmail } from '../lib/mock-auth.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { Badge } from '../components/ui/Badge.js';

export function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('budi@kampus.ac.id');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const go = (fn: () => void) => {
    try {
      setLoading(true);
      setErr(null);
      fn();
      nav(from, { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal masuk akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Badge variant="gold">DEMO MODE</Badge>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Tanpa password</span>
        </div>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Masuk ke SOUQNA</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Masukkan email kampus Anda untuk masuk ke akun.
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(() => loginWithEmail(email));
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <Input
          label="Alamat Email Kampus"
          type="email"
          placeholder="nama@kampus.ac.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText="Gunakan email dummy apa saja atau pilih preset peran demo di bawah"
          required
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
          Masuk
        </Button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)', marginTop: 'var(--space-2)' }}>
        Belum punya akun?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>
          Daftar sekarang
        </Link>
      </div>

      {/* Demo Role Switcher */}
      <div
        style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--unida-navy)', marginBottom: 'var(--space-2)' }}>
          ⚡ 1-Klik Masuk sebagai Akun Uji:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => go(() => loginAs('buyer'))}
            title="Masuk sebagai Budi Pembeli"
          >
            Pembeli
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => go(() => loginAs('merchant'))}
            title="Masuk sebagai Siti Kantin"
          >
            Merchant
          </Button>
          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={() => go(() => loginAs('admin'))}
            title="Masuk sebagai Admin Souqna"
          >
            Admin
          </Button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
        <Link to="/" style={{ fontSize: '13px', color: 'var(--muted)' }}>
          ← Kembali ke beranda tanpa masuk
        </Link>
      </div>
    </div>
  );
}
