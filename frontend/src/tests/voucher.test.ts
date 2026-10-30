import { describe, expect, it } from 'bun:test';
import { api } from '../lib/api-client.js';

describe('Voucher Validation & Discount Logic', () => {
  it('applies fixed discount voucher when subtotal satisfies minimum requirement', async () => {
    const res = await api.validateVoucher('HEMAT5K', 35000);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.amount).toBe(5000);
    }
  });

  it('rejects voucher if subtotal is below minimum spend', async () => {
    const res = await api.validateVoucher('HEMAT5K', 20000);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toContain('Min. belanja');
    }
  });

  it('rejects expired vouchers', async () => {
    const res = await api.validateVoucher('KADALUARSA', 50000);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toContain('kedaluwarsa');
    }
  });

  it('rejects non-existent voucher codes', async () => {
    const res = await api.validateVoucher('KODEACAK999', 50000);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toContain('tidak ditemukan');
    }
  });
});
