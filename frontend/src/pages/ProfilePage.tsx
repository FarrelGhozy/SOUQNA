import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { logout } from '../lib/mock-auth.js';
import type { MockUser } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';
import { StoreIcon } from '../components/ui/Icons.js';

export function ProfilePage() {
  const nav = useNavigate();
  const toast = useToast();

  const [me, setMe] = useState<MockUser | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loc, setLoc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await api.getMe();
        setMe(u);
        setName(u?.full_name ?? '');
        setPhone(u?.phone ?? '');
        setLoc(u?.default_location ?? '');
      } catch {
        setErr('Gagal memuat profil pengguna.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const u = await api.updateMe({ full_name: name.trim(), phone: phone.trim(), default_location: loc.trim() });
      setMe(u);
      toast.success('Profil berhasil diperbarui!');
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Gagal menyimpan profil.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Anda telah keluar.');
    nav('/');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Skeleton height={120} borderRadius="var(--radius-lg)" />
        <Skeleton height={280} borderRadius="var(--radius-md)" />
      </div>
    );
  }

  if (err || !me) {
    return (
      <div style={{ maxWidth: 640, margin: 'var(--space-6) auto' }}>
        <Alert variant="danger">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{err || 'Sesi akun tidak valid.'}</span>
            <Button variant="secondary" size="sm" onClick={() => nav('/login')}>
              Masuk Lagi
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const roleLabel = me.role === 'admin' ? 'Administrator' : me.role === 'merchant' ? 'Penjual (Merchant)' : 'Pembeli Civitas';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Pengaturan Akun</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Profil & Akun Saya</h1>
      </div>

      {/* User Header Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--unida-navy)',
            color: 'var(--surface)',
            border: '2px solid var(--unida-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {me.full_name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--unida-navy)' }}>{me.full_name}</h2>
            <Badge variant={me.role === 'admin' ? 'gold' : me.role === 'merchant' ? 'info' : 'muted'}>
              {roleLabel}
            </Badge>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
            {me.email}
          </div>
        </div>
      </div>

      {/* Merchant status shortcut */}
      {me.hasStore ? (
        <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--info-soft)', borderColor: 'rgba(3, 105, 161, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--info)' }}>
                <StoreIcon size={18} />
                <strong style={{ fontSize: '15px' }}>Anda Terdaftar sebagai Merchant</strong>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--unida-navy)', marginTop: 2 }}>
                Kelola produk, varian, dan pesanan masuk melalui panel merchant.
              </div>
            </div>
            <Link to="/merchant">
              <Button variant="primary" size="sm">
                Masuk ke Panel Merchant →
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--gold-soft)', borderColor: 'var(--unida-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong style={{ color: 'var(--unida-navy)', fontSize: '15px' }}>Ingin Berjualan di SOUQNA?</strong>
              <div style={{ fontSize: '13px', color: 'var(--unida-text)', marginTop: 2 }}>
                Buka toko kampus Anda gratis dan pasarkan produk ke seluruh civitas akademika UNIDA Gontor.
              </div>
            </div>
            <Link to="/become-merchant">
              <Button variant="gold" size="sm">
                Buka Toko Sekarang
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>Informasi Pribadi & Pengiriman</h2>
        </div>
        <form onSubmit={handleSave} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input
            label="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Nomor WhatsApp / Telepon"
            placeholder="08123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            helperText="Digunakan merchant untuk konfirmasi COD saat penyerahan barang"
          />

          <Input
            label="Lokasi Pengiriman Default"
            placeholder="Cth: Asrama Ibnu Rusyd Lt. 2 / Gedung Terpadu"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            helperText="Akan otomatis terisi sebagai titik temu pengiriman saat checkout"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>

      {/* Account Danger Zone / Logout */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--unida-navy)' }}>Sesi Akun</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Keluar dari akun ini pada perangkat yang sedang digunakan.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Keluar Akun
          </Button>
        </div>
      </div>
    </div>
  );
}
