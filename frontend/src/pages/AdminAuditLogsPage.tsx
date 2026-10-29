import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB } from '../lib/format.js';
import type { AdminAuditLog } from '../types/index.js';

// Jejak tindakan administratif (dummy, persist lokal).
export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLogs(await api.getAuditLogs());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat log.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat audit log...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <Link to="/admin">← Dashboard</Link>
      <h1>Audit log ({logs.length})</h1>
      {logs.length === 0 ? <p><small>Belum ada tindakan admin tercatat. Recovery/kategori/moderasi/voucher akan muncul di sini.</small></p> : logs.map((l) => (
        <div key={l.id} style={{ borderTop: '1px solid #eee', padding: '4px 0' }}>
          <small>{formatDateWIB(l.created_at)} WIB</small> — <b>{l.action}</b>
          <small> · {l.target_type}/{l.target_id} · oleh {l.admin_user_id}</small>
          {l.metadata && <small> · {JSON.stringify(l.metadata)}</small>}
        </div>
      ))}
    </>
  );
}
