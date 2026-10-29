import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { Store } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea } from '../components/ui/Input.js';
import { Alert } from '../components/ui/Alert.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';

export function StoreProfilePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [logo, setLogo] = useState('');
  const [pickup, setPickup] = useState('');
  const [deliv, setDeliv] = useState(false);
  const [fee, setFee] = useState('0');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const s = await api.getMyStore();
        setStore(s);
        if (s) {
          setName(s.name);
          setDesc(s.description);
          setLogo(s.logo_url ?? '');
          setPickup(s.pickup_location);
          setDeliv(s.delivery_available);
          setFee(String(s.delivery_fee));
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat profil toko.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
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
      const next = await api.updateMyStore({
        name: name.trim(),
        description: desc.trim(),
        logo_url: logo.trim() || undefined,
        pickup_location: pickup.trim(),
        delivery_available: deliv,
        delivery_fee: Number(fee) || 0,
      });
      setStore(next);
      toast.success('Pengaturan profil toko berhasil disimpan!');
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Gagal menyimpan pengaturan toko.';
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Skeleton height={280} borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--unida-navy)' }}>Belum Memiliki Toko</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 'var(--space-2) 0 var(--space-4) 0' }}>
          Anda belum mendaftarkan toko merchant Anda di SOUQNA.
        </p>
        <Link to="/become-merchant">
          <Button variant="primary">Buka Toko Sekarang →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/merchant">Dashboard Merchant</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Pengaturan Toko</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Profil & Logistik Toko</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Kelola informasi toko, titik temu pengambilan barang, dan ketentuan ongkos kirim kampus
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>Pengaturan Toko</h2>
        </div>
        <form onSubmit={handleSave} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Nama Toko *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Deskripsi Toko"
            placeholder="Jelaskan mengenai tokomu..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <Input
            label="URL Logo Toko (Opsional)"
            placeholder="https://images.unsplash.com/..."
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />

          {logo.trim() && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <img
                  src={logo}
                  alt="Logo toko"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Pratinjau logo toko</span>
            </div>
          )}

          <Input
            label="Lokasi Pengambilan Fisik (Pickup) *"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            helperText="Titik temu tetap tempat pembeli bisa mengambil pesanan langsung"
            required
          />

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
                  helperText="Biaya antar per pesanan COD (0 = gratis)"
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button type="submit" variant="primary" size="lg" loading={busy}>
              Simpan Pengaturan Toko
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
