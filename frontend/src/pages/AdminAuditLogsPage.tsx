import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB } from '../lib/format.js';
import type { AdminAuditLog } from '../types/index.js';
import { Badge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLogs(await api.getAuditLogs());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat log audit.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/admin">Dashboard Admin</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Log Audit</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Catatan Aktivitas & Audit Log ({logs.length})</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Rekam jejak tindakan administratif, perubahan status produk, kategori, dan voucher
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={60} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Belum ada catatan aktivitas administratif yang terekam.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Waktu (WIB)</th>
                <th>Administrator</th>
                <th>Tindakan / Aksi</th>
                <th>Entitas Sasaran</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {formatDateWIB(l.created_at)} WIB
                  </td>
                  <td>
                    <Badge variant="muted">{l.admin_user_id}</Badge>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--unida-navy)' }}>{l.action}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px', background: 'var(--surface-muted)', padding: '2px 6px', borderRadius: 4 }}>
                      {l.target_type}/{l.target_id}
                    </code>
                  </td>
                  <td>
                    {l.metadata ? (
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '11px',
                          background: 'var(--surface-muted)',
                          padding: '4px 8px',
                          borderRadius: 4,
                          maxHeight: 60,
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(l.metadata)}
                      </pre>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
                    )}
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
