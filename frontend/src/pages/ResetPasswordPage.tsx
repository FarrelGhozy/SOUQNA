import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { Badge } from '../components/ui/Badge.js';
import { useToast } from '../components/ui/ToastContext.js';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();
  const nav = useNavigate();

  const handleRequestLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErr('Masukkan alamat email kampus yang valid.');
      return;
    }
    setLoading(true);
    setErr(null);
    setTimeout(() => {
      setLoading(false);
      setStep('reset');
      toast.success('Tautan pemulihan kata sandi telah dikirimkan (Simulasi).');
    }, 500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErr('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setLoading(true);
    setErr(null);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success('Kata sandi berhasil diatur ulang (Simulasi Mock).');
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Badge variant="gold">SIMULASI MOCK</Badge>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Auth backend ditunda</span>
        </div>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Atur Ulang Kata Sandi</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          {step === 'request'
            ? 'Masukkan email akun kampus Anda untuk menerima tautan pemulihan'
            : 'Buat kata sandi baru untuk akun Anda'}
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Alert variant="success">
            <strong>Kata sandi berhasil diperbarui!</strong>
            <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
              Ini merupakan alur simulasi UI reset password. Silakan kembali ke halaman masuk.
            </p>
          </Alert>
          <Button variant="primary" size="lg" onClick={() => nav('/login')}>
            Kembali ke Halaman Masuk
          </Button>
        </div>
      ) : step === 'request' ? (
        <form onSubmit={handleRequestLink} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input
            label="Alamat Email Kampus"
            type="email"
            placeholder="budi@kampus.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="Gunakan email dummy yang terdaftar"
            required
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            Kirim Tautan Pemulihan
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input
            label="Kata Sandi Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            placeholder="Ulangi kata sandi baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            Simpan Kata Sandi Baru
          </Button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
        <Link to="/login" style={{ fontSize: '13px', color: 'var(--unida-blue)', fontWeight: 600 }}>
          ← Ingat kata sandi? Masuk di sini
        </Link>
      </div>
    </div>
  );
}
