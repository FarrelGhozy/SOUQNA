import 'package:dio/dio.dart';
import '../../mocks/categories_mock.dart';
import '../../mocks/products_mock.dart';
import '../../mocks/stores_mock.dart';

// Mock-first: Dio terpasang, tapi USE_MOCK=true → kembalikan dummy lokal.
// Saat backend siap: flip ke false + set baseUrl ke /api/v1.
const useMock = true;

enum ProductSort { terbaru, termurah, termahal, nama }

class Paged<T> {
  final List<T> data;
  final int total;
  final int page;
  final int limit;
  const Paged(this.data, this.total, this.page, this.limit);
}

class ApiClient {
  final Dio dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/v1'));

  Future<List<Category>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return categoriesMock;
  }

  Future<List<StoreMock>> getStores() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return storesMock.where((s) => s.status == 'active').toList();
  }

  Future<Paged<ProductMock>> getProducts({
    String? q,
    String? categoryId,
    String? storeId,
    int? minPrice,
    int? maxPrice,
    ProductSort sort = ProductSort.terbaru,
    int page = 1,
    int limit = 12,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final active = storesMock.where((s) => s.status == 'active').map((s) => s.id).toSet();
    var list = productsMock.where((p) {
      if (p.status != 'published') return false;
      if (!active.contains(p.storeId)) return false;
      if (categoryId != null && categoryId.isNotEmpty && p.categoryId != categoryId) return false;
      if (storeId != null && storeId.isNotEmpty && p.storeId != storeId) return false;
      if (q != null && q.isNotEmpty) {
        final hay = '${p.name} ${p.description}'.toLowerCase();
        if (!hay.contains(q.toLowerCase())) return false;
      }
      if (minPrice != null && p.minPrice < minPrice) return false;
      if (maxPrice != null && p.minPrice > maxPrice) return false;
      return true;
    }).toList();

    list.sort((a, b) {
      switch (sort) {
        case ProductSort.termurah:
          return a.minPrice.compareTo(b.minPrice);
        case ProductSort.termahal:
          return b.minPrice.compareTo(a.minPrice);
        case ProductSort.nama:
          return a.name.compareTo(b.name);
        case ProductSort.terbaru:
          return DateTime.parse(b.createdAt).compareTo(DateTime.parse(a.createdAt));
      }
    });

    final lim = limit.clamp(1, 50);
    final pg = page < 1 ? 1 : page;
    final total = list.length;
    final start = (pg - 1) * lim;
    final data = start >= total ? <ProductMock>[] : list.skip(start).take(lim).toList();
    return Paged(data, total, pg, lim);
  }

  Future<ProductMock?> getProduct(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    try {
      return productsMock.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<StoreMock?> getStore(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    try {
      return storesMock.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<List<ProductMock>> getStoreProducts(String storeId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return productsMock.where((p) => p.storeId == storeId && p.status == 'published').toList();
  }
}
