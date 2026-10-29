// Mirror frontend/src/mocks/{stores,products,extras}.mock.ts (ringkas).
// Parity ID: store-01..04, prod-01..10, var-01a.., ord-01..03.

class StoreMock {
  final String id, name;
  final bool deliveryAvailable;
  final int deliveryFee;
  final String status;
  const StoreMock(this.id, this.name, this.deliveryAvailable, this.deliveryFee, this.status);
}

const storesMock = [
  StoreMock('store-01', 'Kantin Berkah Jaya', true, 5000, 'active'),
  StoreMock('store-02', 'Hijab Nusa', true, 7000, 'active'),
  StoreMock('store-03', 'PrintQu Cepat', false, 0, 'active'),
  StoreMock('store-04', 'Gadget Corner (Nonaktif)', false, 0, 'inactive'),
];

class ProductMock {
  final String id, storeId, categoryId, name;
  final int minPrice;
  final bool outOfStock;
  const ProductMock(this.id, this.storeId, this.categoryId, this.name, this.minPrice, this.outOfStock);
}

const productsMock = [
  ProductMock('prod-01', 'store-01', 'cat-01', 'Ayam Geprek Sambal Bawang', 12000, false),
  ProductMock('prod-02', 'store-01', 'cat-01', 'Kopi Susu Gula Aren 500ml', 10000, false),
  ProductMock('prod-03', 'store-01', 'cat-01', 'Rice Bowl Telur Balado', 8000, false),
  ProductMock('prod-04', 'store-02', 'cat-02', 'Hijab Voal Premium', 35000, false),
  ProductMock('prod-05', 'store-02', 'cat-02', 'Kemeja Flanel Kotak', 75000, false),
  ProductMock('prod-06', 'store-02', 'cat-02', 'Tote Bag Kanvas Sablon', 25000, false),
  ProductMock('prod-07', 'store-03', 'cat-04', 'Print A4 Hitam Putih (per lbr)', 500, false),
  ProductMock('prod-08', 'store-03', 'cat-04', 'Jilid Softcover Skripsi', 25000, false),
  ProductMock('prod-09', 'store-03', 'cat-03', 'Kabel Data Type-C 1m', 15000, true),
  ProductMock('prod-10', 'store-01', 'cat-01', 'Pisang Coklat Lumer', 10000, false),
];

const ordersMock = ['ord-01: out_for_delivery/unpaid', 'ord-02: accepted/unpaid', 'ord-03: completed/paid'];
const vouchersMock = ['HEMAT5K: valid min 30rb', 'KADALUARSA: expired'];
