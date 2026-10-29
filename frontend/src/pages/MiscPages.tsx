import { useEffect, useState } from 'react';
import { api } from '../lib/api-client.js';

export function MiscPages() { return null; }

export function AdminDashboard() {
  const [v, setV] = useState<any[]>([]);
  useEffect(() => { api.getVouchers().then(setV); }, []);
  return (<><h1>Admin</h1><p>Voucher dummy:</p>{v.map((x) => <div key={x.id}>{x.code} — {x.description}</div>)}</>);
}
