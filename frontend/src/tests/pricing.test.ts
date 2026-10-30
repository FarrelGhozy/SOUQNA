import { describe, expect, it } from 'bun:test';
import { productMinPrice, isProductOutOfStock } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Product } from '../types/index.js';

describe('Pricing & Currency Helpers', () => {
  it('formats Indonesian Rupiah correctly', () => {
    expect(formatIDR(0)).toContain('0');
    expect(formatIDR(12000)).toContain('12.000');
    expect(formatIDR(1250000)).toContain('1.250.000');
  });

  it('determines the lowest variant price accurately', () => {
    const dummyProduct: Product = {
      id: 'prod-test',
      store_id: 'store-01',
      category_id: 'cat-01',
      name: 'Produk Uji',
      slug: 'produk-uji',
      description: 'Deskripsi uji',
      status: 'published',
      image_url: '/test.jpg',
      created_at: new Date().toISOString(),
      variants: [
        { id: 'v1', product_id: 'prod-test', label: 'Varian A', options: {}, price: 25000, stock_quantity: 10, is_active: true },
        { id: 'v2', product_id: 'prod-test', label: 'Varian B', options: {}, price: 15000, stock_quantity: 5, is_active: true },
        { id: 'v3', product_id: 'prod-test', label: 'Varian C', options: {}, price: 30000, stock_quantity: 2, is_active: true },
      ],
    };

    expect(productMinPrice(dummyProduct)).toBe(15000);
  });

  it('checks out-of-stock condition properly', () => {
    const inStockProduct: Product = {
      id: 'prod-stock',
      store_id: 'store-01',
      category_id: 'cat-01',
      name: 'Stok Tersedia',
      slug: 'stok-tersedia',
      description: '',
      status: 'published',
      image_url: '',
      created_at: '',
      variants: [
        { id: 'v1', product_id: 'prod-stock', label: 'A', options: {}, price: 1000, stock_quantity: 0, is_active: true },
        { id: 'v2', product_id: 'prod-stock', label: 'B', options: {}, price: 1000, stock_quantity: 5, is_active: true },
      ],
    };

    const outOfStockProduct: Product = {
      ...inStockProduct,
      variants: [
        { id: 'v1', product_id: 'prod-stock', label: 'A', options: {}, price: 1000, stock_quantity: 0, is_active: true },
        { id: 'v2', product_id: 'prod-stock', label: 'B', options: {}, price: 1000, stock_quantity: 0, is_active: true },
      ],
    };

    expect(isProductOutOfStock(inStockProduct)).toBe(false);
    expect(isProductOutOfStock(outOfStockProduct)).toBe(true);
  });
});
