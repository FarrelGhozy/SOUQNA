import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Voucher } from '../types/index.js';

// Voucher CRUD. Voucher baru langsung bisa dipakai di checkout dummy.
export function AdminVouchersPage() {
  const [list, setList] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10000');
  const [min, setMin] = useState('50000');
  const [type, setType] = useState<'fixed_amount' | 'percentage'>('fixed_amount');

  const load = async () => setList(await api.getAdminVouchers());

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat voucher.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat voucher...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  const day = 86400000;
  return (
    <>
      <Link to="/admin">← Dashboard</Link>
      <h1>Voucher ({list.length})</h1>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="KODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="fixed_amount">Rp tetap</option>
          <option value="percentage">Persen</option>
        </select>
        <input type="number" min={1} placeholder="Nilai" style={{ width: 100 }} value={value} onChange={(e) => setValue(e.target.value)} />
        <input type="number" min={0} placeholder="Min belanja" style={{ width: 120 }} value={min} onChange={(e) => setMin(e.target.value)} />
        <button onClick={async () => {
          try {
            const v = await api.createVoucher({
              code, discount_type: type, discount_value: Number(value),
              minimum_subtotal: Number(min),
              starts_at: new Date(Date.now() - day).toISOString(),
              ends_at: new Date(Date.now() + day * 30).toISOString(),
            });
            setMsg(`Voucher ${v.code} dibuat — langsung bisa dipakai di checkout.`);
            setCode('');
            await load();
          } catch (e) {
            setMsg(e instanceof Error ? e.message : 'Gagal buat.');
          }
        }}>+ Buat</button>
      </div>
      {list.map((v) => (
        <div key={v.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <b>{v.code}</b> <small>· {v.discount_type === 'percentage' ? `${v.discount_value}%` : formatIDR(v.discount_value)} · min {formatIDR(v.minimum_subtotal)} · {v.is_active ? 'aktif' : 'nonaktif'}</small>
          <div><small>{v.description}</small></div>
          <button onClick={async () => {
            await api.updateVoucher(v.id, { is_active: !v.is_active });
            setMsg(`${v.code} ${v.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
            await load();
          }}>{v.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
        </div>
      ))}
    </>
  );
}
