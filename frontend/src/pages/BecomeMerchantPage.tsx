import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Store } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';
import { StoreIcon } from '../components/ui/Icons.js';

export function BecomeMerchantPage() {
  const nav = useNavigate();
  const toast = useToast();

  const [existing, setExisting] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [logo, setLogo] = useState('');
  const [pickup, setPickup] = useState('');
  const [deliv, setDeliv] = useState(true);
  const [fee, setFee] = useState('5000');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setExisting(await api.getMyStore());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Skeleton height={280} borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (existing) {
    return (
      <div style={{ maxWidth: 640, margin: 'var(--space-6) auto' }}>
        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{ color: 'var(--unida-blue)', marginBottom: 'var(--space-2)' }}>
            <StoreIcon size={36} />
          </div>
          <h1 style={{ fontSize: '22px', color: 'var(--unida-navy)' }}>Anda Sudah Memiliki Toko</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 'var(--space-2) 0 var(--space-4) 0' }}>
            Akun Anda terhubung dengan toko <strong>{existing.name}</strong>. Sistem saat ini membatasi 1 toko per akun.
          </p>
          <Link to="/merchant">
            <Button variant="primary">Buka Dashboard Merchant →</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRegisterStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Nama toko wajib diisi.');
      return;
    }
    if (!pickup.trim()) {
      setErr('Lokasi pengambilan (pickup) wajib diisi.');
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      await api.createMyStore({
        name: name.trim(),
        description: desc.trim(),
        logo_url: logo.trim() || undefined,
        pickup_location: pickup.trim(),
        delivery_available: deliv,
        delivery_fee: Number(fee) || 0,
      });
      toast.success('Selamat! Toko merchant Anda berhasil didaftarkan.');
      nav('/merchant');
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Gagal membuat toko.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Pendaftaran Merchant</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Buka Toko di SOUQNA</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Mulai jual produk makanan, jasa fotokopi, alat tulis, atau cinderamata di kampus UNIDA Gontor
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>Formulir Pendaftaran Toko</h2>
        </div>
        <form onSubmit={handleRegisterStore} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Nama Toko *"
            placeholder="Cth: Kantin Berkah Asrama, Percetakan Mahasiswa..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Deskripsi Toko Singkat"
            placeholder="Jelaskan produk apa yang Anda jual..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <Input
            label="URL Logo Toko (Opsional)"
            placeholder="https://images.unsplash.com/..."
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            helperText="Masukkan tautan gambar langsung untuk logo toko Anda"
          />

          <Input
            label="Lokasi Pengambilan Fisik (Pickup) *"
            placeholder="Cth: Kantin Gedung Terpadu Lt. 1 Meja No. 4"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            helperText="Titik tetap tempat pembeli bisa mengambil pesanan langsung"
            required
          />

          {/* Delivery Configuration */}
          <div style={{ background: 'var(--surface-muted)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={deliv}
                onChange={(e) => setDeliv(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--unida-blue)' }}
              />
              Sedia Layanan Antar ke Titik Kampus (Merchant Delivery)
            </label>

            {deliv && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <Input
                  label="Tarif Ongkos Kirim Antar (Rp)"
                  type="number"
                  min={0}
                  step={500}
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  helperText="Biaya antar per pesanan (masukkan 0 untuk gratis ongkir)"
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button type="submit" variant="primary" size="lg" loading={busy}>
              Daftarkan Toko Sekarang
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
