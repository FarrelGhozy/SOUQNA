import { describe, expect, it } from 'bun:test';
import { previewCheckout } from '../lib/api-client.js';

describe('Stock Management & Reversion Rules', () => {
  it('throws error when item quantity exceeds available stock', () => {
    // prod-01 var-01a has stock 20
    expect(() =>
      previewCheckout({
        items: [{ variant_id: 'var-01a', quantity: 9999 }],
        fulfillment: { 'store-01': { method: 'pickup' } },
      })
    ).toThrow('sisa 20');
  });

  it('throws error when attempting to checkout zero stock variants', () => {
    // var-01b has stock 0
    expect(() =>
      previewCheckout({
        items: [{ variant_id: 'var-01b', quantity: 1 }],
        fulfillment: { 'store-01': { method: 'pickup' } },
      })
    ).toThrow('Stok habis');
  });

  it('calculates totals accurately when stock is sufficient', () => {
    const preview = previewCheckout({
      items: [{ variant_id: 'var-01a', quantity: 2 }],
      fulfillment: { 'store-01': { method: 'pickup' } },
    });
    expect(preview.subtotal).toBe(24000);
    expect(preview.delivery_total).toBe(0);
    expect(preview.grand_total).toBe(24000);
  });
});
