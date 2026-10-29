import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Voucher } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Input, Select } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { useToast } from '../components/ui/ToastContext.js';

export function AdminVouchersPage() {
  const [list, setList] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10000');
  const [min, setMin] = useState('50000');
  const [type, setType] = useState<'fixed_amount' | 'percentage'>('fixed_amount');
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      setList(await api.getAdminVouchers());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setCreating(true);
    const day = 86400000;
    try {
      const v = await api.createVoucher({
        code: code.trim().toUpperCase(),
        discount_type: type,
        discount_value: Number(value) || 0,
        minimum_subtotal: Number(min) || 0,
        starts_at: new Date(Date.now() - day).toISOString(),
        ends_at: new Date(Date.now() + day * 30).toISOString(),
      });
      toast.success(`Voucher "${v.code}" berhasil diterbitkan!`);
      setCode('');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal membuat voucher.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleVoucher = async (v: Voucher) => {
    try {
      await api.updateVoucher(v.id, { is_active: !v.is_active });
      toast.info(`Status voucher "${v.code}" diperbarui.`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengubah status voucher.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/admin">Dashboard Admin</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Manajemen Voucher</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Voucher Promo Kampus ({list.length})</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Terbitkan kupon potongan harga belanja untuk civitas akademika UNIDA Gontor
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {/* Create Voucher Form Card */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', margin: 0 }}>+ Buat Voucher Promo Baru</h2>
        </div>
        <form onSubmit={handleCreateVoucher} className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div>
            <Input
              label="Kode Voucher *"
              placeholder="Cth: UNIDABERKAH"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <Select
              label="Tipe Potongan"
              value={type}
              onChange={(e) => setType(e.target.value as 'fixed_amount' | 'percentage')}
              options={[
                { value: 'fixed_amount', label: 'Nominal Tetap (Rp)' },
                { value: 'percentage', label: 'Persentase (%)' },
              ]}
            />
          </div>

          <div>
            <Input
              label={type === 'fixed_amount' ? 'Nominal Diskon (Rp)' : 'Persen Diskon (%)'}
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Min. Belanja (Rp)"
              type="number"
              min={0}
              step={1000}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              required
            />
          </div>

          <div style={{ paddingBottom: 'var(--space-4)' }}>
            <Button type="submit" variant="primary" size="md" loading={creating} disabled={!code.trim()}>
              Terbitkan Voucher
            </Button>
          </div>
        </form>
      </div>

      {/* Vouchers Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={60} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Kode Voucher</th>
                <th>Tipe & Nilai Diskon</th>
                <th>Syarat Min. Belanja</th>
                <th>Status Kupon</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--gold-soft)',
                        border: '1px solid var(--unida-gold)',
                        fontWeight: 800,
                        color: 'var(--unida-navy)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {v.code}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--unida-navy)' }}>
                      {v.discount_type === 'percentage' ? `${v.discount_value}%` : formatIDR(v.discount_value)}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      {v.minimum_subtotal === 0 ? 'Tanpa syarat' : formatIDR(v.minimum_subtotal)}
                    </span>
                  </td>
                  <td>
                    <Badge variant={v.is_active ? 'success' : 'muted'}>
                      {v.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant={v.is_active ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleVoucher(v)}
                    >
                      {v.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
