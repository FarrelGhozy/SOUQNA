import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import type { MockUser } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Alert } from '../components/ui/Alert.js';
import { Modal } from '../components/ui/Modal.js';
import { useToast } from '../components/ui/ToastContext.js';

export function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<MockUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      setUsers(await api.getAdminUsers());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal memuat pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSendRecovery = async (u: MockUser) => {
    setSendingId(u.id);
    try {
      const r = await api.sendPasswordRecovery(u.id);
      toast.success(r.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengirim link recovery.');
    } finally {
      setSendingId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await api.deleteAdminUser(userToDelete.id);
      toast.success(res.message);
      setUserToDelete(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus pengguna.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/admin">Dashboard Admin</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Manajemen Pengguna</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Pengguna Terdaftar ({users.length})</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Kelola akun pengguna, peran sistem, dan kirimkan tautan pemulihan sandi
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={64} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Alamat Email</th>
                <th>Peran</th>
                <th>Status Toko</th>
                <th style={{ textAlign: 'right' }}>Aksi Akun</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--unida-navy)',
                          color: 'var(--surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ color: 'var(--unida-navy)' }}>{u.full_name}</strong>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Badge variant={u.role === 'admin' ? 'gold' : u.role === 'merchant' ? 'info' : 'muted'}>
                      {u.role === 'admin' ? 'Admin' : u.role === 'merchant' ? 'Merchant' : 'Pembeli'}
                    </Badge>
                  </td>
                  <td>
                    {u.hasStore ? (
                      <span style={{ fontSize: '13px', color: 'var(--success)' }}>
                        ✓ Ada Toko ({u.store_id})
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Tanpa Toko</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={sendingId === u.id}
                        onClick={() => handleSendRecovery(u)}
                        title="Kirim link reset password ke email dummy"
                      >
                        Reset Password
                      </Button>
                      {u.role !== 'admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setUserToDelete(u)}
                          title="Hapus / Anonimisasi akun"
                        >
                          Hapus Akun
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Akun */}
      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title="Konfirmasi Penghapusan Akun"
      >
        <div>
          <Alert variant="warning">
            <strong>Perhatian: Simulasi Penghapusan Akun Mock</strong>
            <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
              Sesuai aturan keamanan bisnis SOUQNA, akun tidak dapat dihapus jika masih memiliki pesanan COD yang sedang berjalan.
              Jika disetujui, akun akan dinonaktifkan dan data pribadi dianonimisasi, namun riwayat transaksi selesai tetap tersimpan untuk audit.
            </p>
          </Alert>

          <p style={{ fontSize: '14px', margin: 'var(--space-3) 0' }}>
            Apakah Anda yakin ingin menonaktifkan akun <strong>{userToDelete?.full_name}</strong> ({userToDelete?.email})?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" size="md" onClick={() => setUserToDelete(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="danger" size="md" loading={deleting} onClick={confirmDeleteUser}>
              Ya, Hapus & Anonimkan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
