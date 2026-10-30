import { describe, expect, it } from 'bun:test';
import { api } from '../lib/api-client.js';
import { loginAs, logout } from '../lib/mock-auth.js';

describe('Admin User Deletion & Anonymization Rules', () => {
  it('rejects deletion when unauthenticated', async () => {
    logout();
    expect(api.deleteAdminUser('user-buyer-1')).rejects.toThrow('Hanya admin');
  });

  it('rejects deletion when called by non-admin role', async () => {
    loginAs('buyer');
    expect(api.deleteAdminUser('user-merchant-1')).rejects.toThrow('Hanya admin');
  });

  it('rejects deletion of admin accounts', async () => {
    loginAs('admin');
    expect(api.deleteAdminUser('user-admin-1')).rejects.toThrow('Akun admin tidak dapat dihapus');
  });

  it('rejects deletion if user has active running orders', async () => {
    loginAs('admin');
    // user-buyer-1 has ord-01 which is out_for_delivery
    expect(api.deleteAdminUser('user-buyer-1')).rejects.toThrow('pesanan COD aktif');
  });
});
