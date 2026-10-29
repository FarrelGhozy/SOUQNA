import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { MockUser } from '../types/index.js';

// Kelola users: lihat + trigger recovery dummy.
export function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setUsers(await api.getAdminUsers());
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat users.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Memuat users...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <Link to="/admin">← Dashboard</Link>
      <h1>Pengguna ({users.length})</h1>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {users.map((u) => (
        <div key={u.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <b>{u.full_name}</b> <small>· {u.email} · {u.role}{u.hasStore ? ` · toko ${u.store_id ?? ''}` : ''}</small>
          <div>
            <button onClick={async () => {
              try {
                const r = await api.sendPasswordRecovery(u.id);
                setMsg(r.message);
              } catch (e) {
                setMsg(e instanceof Error ? e.message : 'Gagal.');
              }
            }}>Kirim recovery</button>
          </div>
        </div>
      ))}
    </>
  );
}
