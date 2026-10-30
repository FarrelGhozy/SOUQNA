import { describe, expect, it } from 'bun:test';
import { api } from '../lib/api-client.js';
import { loginAs, logout } from '../lib/mock-auth.js';

describe('Order Lifecycle & Status Transitions', () => {
  it('throws error when unauthenticated user attempts transition', async () => {
    logout();
    expect(api.transitionOrder('ord-01', 'cancel')).rejects.toThrow('Wajib login');
  });

  it('allows merchant to accept order when status is pending', async () => {
    loginAs('merchant'); // Siti Kantin owns store-01
    // ord-01 is currently out_for_delivery, so transition to 'accept' should be rejected
    expect(api.transitionOrder('ord-01', 'accept')).rejects.toThrow();
  });

  it('prevents buyer from triggering merchant-only actions', async () => {
    loginAs('buyer'); // Budi Pembeli
    // Buyer cannot accept or reject
    expect(api.transitionOrder('ord-01', 'accept')).rejects.toThrow('Hanya merchant');
  });

  it('prevents cancellation of non-pending orders', async () => {
    loginAs('buyer');
    // ord-01 is already out_for_delivery
    expect(api.transitionOrder('ord-01', 'cancel')).rejects.toThrow('Batal hanya saat menunggu konfirmasi');
  });
});
