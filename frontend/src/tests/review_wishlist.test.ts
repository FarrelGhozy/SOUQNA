import { describe, expect, it } from 'bun:test';
import { api } from '../lib/api-client.js';
import { loginAs, logout } from '../lib/mock-auth.js';

describe('Review & Wishlist Business Rules', () => {
  it('requires authentication to add to wishlist', async () => {
    logout();
    expect(api.addToWishlist('prod-01')).rejects.toThrow('Wajib login');
  });

  it('allows logged in buyer to add and remove from wishlist', async () => {
    loginAs('buyer');
    await api.addToWishlist('prod-01');
    const isWished = await api.isWishlisted('prod-01');
    expect(isWished).toBe(true);

    await api.removeFromWishlist('prod-01');
    const isStillWished = await api.isWishlisted('prod-01');
    expect(isStillWished).toBe(false);
  });

  it('requires authentication to submit review', async () => {
    logout();
    expect(api.createReview('oi-01', 5, 'Bagus')).rejects.toThrow('Wajib login');
  });

  it('enforces one review per order item rule', async () => {
    loginAs('buyer');
    // oi-01 already has a review in seed data
    expect(api.createReview('oi-01', 5, 'Bagus')).rejects.toThrow('Sudah memberi ulasan');
  });
});
