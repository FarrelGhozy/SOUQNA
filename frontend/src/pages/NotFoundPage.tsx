import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';

export function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '60vh',
        padding: 'var(--space-8) var(--space-4)',
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: 800,
          color: 'var(--unida-gold)',
          lineHeight: 1,
          marginBottom: 'var(--space-2)',
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>Halaman Tidak Ditemukan</h1>
      <p style={{ color: 'var(--muted)', maxWidth: 440, marginBottom: 'var(--space-6)' }}>
        Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat yang dimasukkan salah.
      </p>
      <Link to="/">
        <Button variant="primary">Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
