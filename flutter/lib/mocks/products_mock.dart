// Mirror frontend/src/mocks/products.mock.ts — ID/harga/stok/status sama persis.
class VariantMock {
  final String id;
  final String label;
  final int price;
  final int stock;
  const VariantMock(this.id, this.label, this.price, this.stock);
}

class ProductMock {
  final String id;
  final String storeId;
  final String categoryId;
  final String name;
  final String description;
  final String status;
  final String imageUrl;
  final String createdAt;
  final List<VariantMock> variants;
  const ProductMock({
    required this.id,
    required this.storeId,
    required this.categoryId,
    required this.name,
    required this.description,
    required this.status,
    required this.imageUrl,
    required this.createdAt,
    required this.variants,
  });

  int get minPrice => variants.map((v) => v.price).reduce((a, b) => a < b ? a : b);
  bool get outOfStock => variants.every((v) => v.stock == 0);
}

String _img(String slug) => '/images/products/$slug.jpg';
String _d(int day) => DateTime.utc(2026, 10, day, 3).toIso8601String();

final productsMock = [
  ProductMock(id: 'prod-01', storeId: 'store-01', categoryId: 'cat-01', name: 'Ayam Geprek Sambal Bawang', description: 'Ayam geprek + nasi + es teh. Level 1-5.', status: 'published', imageUrl: _img('ayam-geprek'), createdAt: _d(20), variants: const [VariantMock('var-01a', 'Level 1 + Es Teh', 12000, 20), VariantMock('var-01b', 'Level 5 + Es Teh', 13000, 0)]),
  ProductMock(id: 'prod-02', storeId: 'store-01', categoryId: 'cat-01', name: 'Kopi Susu Gula Aren 500ml', description: 'Kopi susu kekinian kampus.', status: 'published', imageUrl: _img('kopi-susu-aren'), createdAt: _d(18), variants: const [VariantMock('var-02a', 'Less Sugar', 10000, 30), VariantMock('var-02b', 'Normal', 10000, 25)]),
  ProductMock(id: 'prod-03', storeId: 'store-01', categoryId: 'cat-01', name: 'Rice Bowl Telur Balado', description: 'Rice bowl hemat anak kos.', status: 'published', imageUrl: _img('rice-bowl-telur'), createdAt: _d(15), variants: const [VariantMock('var-03a', 'Reguler', 8000, 15)]),
  ProductMock(id: 'prod-04', storeId: 'store-02', categoryId: 'cat-02', name: 'Hijab Voal Premium', description: 'Voal anti gerah, banyak warna.', status: 'published', imageUrl: _img('hijab-voal'), createdAt: _d(22), variants: const [VariantMock('var-04a', 'Hitam', 35000, 12), VariantMock('var-04b', 'Cream', 35000, 8)]),
  ProductMock(id: 'prod-05', storeId: 'store-02', categoryId: 'cat-02', name: 'Kemeja Flanel Kotak', description: 'Flanel tebal, size M-XL.', status: 'published', imageUrl: _img('kemeja-flanel'), createdAt: _d(12), variants: const [VariantMock('var-05a', 'M', 75000, 5), VariantMock('var-05b', 'XL', 80000, 3)]),
  ProductMock(id: 'prod-06', storeId: 'store-02', categoryId: 'cat-02', name: 'Tote Bag Kanvas Sablon', description: 'Tote bag sablon komunitas.', status: 'published', imageUrl: _img('tote-bag'), createdAt: _d(10), variants: const [VariantMock('var-06a', 'Natural', 25000, 40)]),
  ProductMock(id: 'prod-07', storeId: 'store-03', categoryId: 'cat-04', name: 'Print A4 Hitam Putih (per lbr)', description: 'Print cepat, min 5 lembar.', status: 'published', imageUrl: _img('print-a4'), createdAt: _d(25), variants: const [VariantMock('var-07a', 'HVS 70gr', 500, 1000)]),
  ProductMock(id: 'prod-08', storeId: 'store-03', categoryId: 'cat-04', name: 'Jilid Softcover Skripsi', description: 'Jilid + cover elegan.', status: 'published', imageUrl: _img('jilid-skripsi'), createdAt: _d(8), variants: const [VariantMock('var-08a', 'Standar', 25000, 50)]),
  ProductMock(id: 'prod-09', storeId: 'store-03', categoryId: 'cat-03', name: 'Kabel Data Type-C 1m', description: 'Fast charging 3A.', status: 'published', imageUrl: _img('kabel-typec'), createdAt: _d(5), variants: const [VariantMock('var-09a', 'Putih', 15000, 0)]),
  ProductMock(id: 'prod-10', storeId: 'store-01', categoryId: 'cat-01', name: 'Pisang Coklat Lumer', description: 'Jajanan sore favorit.', status: 'hidden', imageUrl: _img('pisang-coklat'), createdAt: _d(3), variants: const [VariantMock('var-10a', 'Isi 5', 10000, 10)]),
  ProductMock(id: 'prod-11', storeId: 'store-01', categoryId: 'cat-01', name: 'Es Teh Manis Jumbo', description: 'Es teh gula batu, gelas jumbo.', status: 'published', imageUrl: _img('es-teh-jumbo'), createdAt: _d(27), variants: const [VariantMock('var-11a', 'Manis', 3500, 100), VariantMock('var-11b', 'Tawar', 3000, 80)]),
  ProductMock(id: 'prod-12', storeId: 'store-02', categoryId: 'cat-05', name: 'Sunscreen Tone Up SPF50', description: 'Sunscreen ringan untuk aktivitas kampus.', status: 'published', imageUrl: _img('sunscreen-spf50'), createdAt: _d(26), variants: const [VariantMock('var-12a', '30ml', 45000, 20)]),
  ProductMock(id: 'prod-13', storeId: 'store-02', categoryId: 'cat-05', name: 'Lip Tint Mini', description: 'Lip tint travel size, 2 shade.', status: 'published', imageUrl: _img('lip-tint-mini'), createdAt: _d(24), variants: const [VariantMock('var-13a', 'Cherry', 28000, 14), VariantMock('var-13b', 'Peach', 28000, 0)]),
  ProductMock(id: 'prod-14', storeId: 'store-03', categoryId: 'cat-06', name: 'Jasa Cuci Sepatu Express', description: 'Cuci sepatu 1 hari jadi, area kampus.', status: 'published', imageUrl: _img('cuci-sepatu'), createdAt: _d(28), variants: const [VariantMock('var-14a', 'Reguler', 20000, 30)]),
  ProductMock(id: 'prod-15', storeId: 'store-03', categoryId: 'cat-06', name: 'Jasa Desain Poster', description: 'Desain poster acara/organisasi, revisi 2x.', status: 'published', imageUrl: _img('desain-poster'), createdAt: _d(29), variants: const [VariantMock('var-15a', '1 Desain', 50000, 10)]),
  ProductMock(id: 'prod-16', storeId: 'store-01', categoryId: 'cat-01', name: 'Nasi Goreng Mawut', description: 'Nasgor + mi, porsi jumbo. Stok contoh habis.', status: 'published', imageUrl: _img('nasgor-mawut'), createdAt: _d(6), variants: const [VariantMock('var-16a', 'Original', 13000, 0), VariantMock('var-16b', 'Pedas', 14000, 0)]),
  ProductMock(id: 'prod-17', storeId: 'store-02', categoryId: 'cat-02', name: 'Celana Kulot Linen', description: 'Kulot linen adem, all size.', status: 'published', imageUrl: _img('kulot-linen'), createdAt: _d(21), variants: const [VariantMock('var-17a', 'All Size', 65000, 7)]),
  ProductMock(id: 'prod-18', storeId: 'store-04', categoryId: 'cat-03', name: 'Powerbank 10000mAh', description: 'Contoh produk toko nonaktif — tidak tampil di katalog.', status: 'published', imageUrl: _img('powerbank-10k'), createdAt: _d(19), variants: const [VariantMock('var-18a', 'Hitam', 120000, 5)]),
  ProductMock(id: 'prod-19', storeId: 'store-03', categoryId: 'cat-03', name: 'Mouse Wireless Silent', description: 'Mouse silent untuk ruang baca.', status: 'published', imageUrl: _img('mouse-silent'), createdAt: _d(23), variants: const [VariantMock('var-19a', 'Hitam', 85000, 9)]),
  ProductMock(id: 'prod-20', storeId: 'store-02', categoryId: 'cat-02', name: 'Inner Hijab Ciput Rajut', description: 'Contoh produk suspended — tidak tampil publik.', status: 'suspended', imageUrl: _img('ciput-rajut'), createdAt: _d(2), variants: const [VariantMock('var-20a', 'Hitam', 15000, 25)]),
];
