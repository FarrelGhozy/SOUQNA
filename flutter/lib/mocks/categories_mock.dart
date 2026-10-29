// Mirror frontend/src/mocks/categories.mock.ts — ID/slug sama persis.
class Category {
  final String id, name, slug;
  const Category(this.id, this.name, this.slug);
}

const categoriesMock = [
  Category('cat-01', 'Makanan & Minuman', 'makanan-minuman'),
  Category('cat-02', 'Fashion', 'fashion'),
  Category('cat-03', 'Elektronik & Aksesoris', 'elektronik'),
  Category('cat-04', 'Alat Tulis & Buku', 'atk-buku'),
  Category('cat-05', 'Kesehatan & Kecantikan', 'kesehatan'),
  Category('cat-06', 'Jasa & Lainnya', 'jasa'),
];
