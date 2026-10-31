import 'package:dio/dio.dart';
import '../../mocks/categories_mock.dart';
import '../../mocks/products_mock.dart';
import '../../mocks/stores_mock.dart';
import '../../mocks/vouchers_mock.dart';

// Model dipakai UI lewat api_client (bukan import mocks langsung).
export '../../mocks/products_mock.dart' show ProductMock, VariantMock;
export '../../mocks/stores_mock.dart' show StoreMock;
export '../../mocks/users_mock.dart' show UserMock;

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

class CartLine {
  final String id;
  final String variantId;
  int quantity;
  CartLine({required this.id, required this.variantId, required this.quantity});
}

class CartDetailed {
  final String id;
  final String variantId;
  final int quantity;
  final String productId;
  final String productName;
  final String storeId;
  final String storeName;
  final String variantLabel;
  final int unitPrice;
  final int stock;
  final String? blockReason;
  CartDetailed({
    required this.id, required this.variantId, required this.quantity,
    required this.productId, required this.productName, required this.storeId,
    required this.storeName, required this.variantLabel, required this.unitPrice,
    required this.stock, this.blockReason,
  });
  int get lineTotal => unitPrice * quantity;
  bool get purchasable => blockReason == null;
}

enum FulfillmentMethod { pickup, merchantDelivery }

class StoreBreakdown {
  final String storeId;
  final String storeName;
  final int subtotal;
  final int discount;
  final int deliveryFee;
  final FulfillmentMethod method;
  StoreBreakdown({required this.storeId, required this.storeName, required this.subtotal, required this.discount, required this.deliveryFee, required this.method});
  int get total => subtotal - discount + deliveryFee;
}

class CheckoutPreview {
  final List<StoreBreakdown> perStore;
  final int subtotal;
  final int discountTotal;
  final int grandTotal;
  CheckoutPreview({required this.perStore, required this.subtotal, required this.discountTotal})
      : grandTotal = perStore.fold(0, (s, p) => s + p.total);
  int get deliveryTotal => perStore.fold(0, (s, p) => s + p.deliveryFee);
}

class PlacedOrder {
  final String id;
  final String storeId;
  final String storeName;
  final int grandTotal;
  final FulfillmentMethod method;
  PlacedOrder({required this.id, required this.storeId, required this.storeName, required this.grandTotal, required this.method});
}

class CheckoutResult {
  final String code;
  final List<PlacedOrder> orders;
  CheckoutResult({required this.code, required this.orders});
}

// --- Order + transisi COD dummy (aturan sama dengan web) ---
class OrderItemMock {
  final String name;
  final String variant;
  final int qty;
  final int total;
  final String id;
  final String productId;
  const OrderItemMock(this.name, this.variant, this.qty, this.total,
      {this.id = '', this.productId = ''});
}

class HistoryMock {
  final String from;
  final String to;
  final String? note;
  const HistoryMock(this.from, this.to, [this.note]);
}

class OrderMock {
  final String id;
  final String storeId;
  final String storeName;
  final String buyerId;
  String status;
  String paymentStatus;
  final FulfillmentMethod method;
  final int deliveryFee;
  final int subtotal;
  final int discount;
  final List<OrderItemMock> items;
  final List<HistoryMock> history;
  final String? handoverLocation;
  bool stockReturned = false;
  OrderMock({
    required this.id, required this.storeId, required this.storeName,
    required this.buyerId, required this.status, required this.paymentStatus,
    required this.method, required this.deliveryFee, required this.subtotal,
    required this.discount, required this.items, required this.history,
    this.handoverLocation,
  });
  int get grandTotal => subtotal - discount + deliveryFee;
}

// --- Wishlist/review/chat dummy (aturan sama dengan web) ---
class ReviewMock {
  final String id;
  final String orderItemId;
  final String productId;
  final String buyerId;
  final int rating;
  final String text;
  final String createdAt;
  const ReviewMock({
    required this.id, required this.orderItemId, required this.productId,
    required this.buyerId, required this.rating, required this.text,
    required this.createdAt,
  });
}

class ConversationMock {
  final String id;
  final String buyerId;
  final String storeId;
  final String createdAt;
  const ConversationMock({
    required this.id, required this.buyerId,
    required this.storeId, required this.createdAt,
  });
}

class MessageMock {
  final String id;
  final String conversationId;
  final String senderId;
  final String body;
  final String createdAt;
  const MessageMock({
    required this.id, required this.conversationId, required this.senderId,
    required this.body, required this.createdAt,
  });
}

class ApiClient {
  final Dio dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/v1'));

  // --- Merchant dummy: toko/produk milik sendiri (in-memory + override) ---
  static final List<StoreMock> _extraStores = [];
  static final Map<String, StoreMock> _storeOv = {};
  static final List<ProductMock> _extraProducts = [];
  static final Map<String, Map<String, String?>> _prodOv = {};
  static final Map<String, VariantMock> _varOv = {};
  static final Map<String, List<VariantMock>> _addedVars = {};
  static final Set<String> _deletedProd = {};
  static int _mseq = 0;

  StoreMock _effStore(StoreMock s) => _storeOv[s.id] ?? s;
  List<StoreMock> _allStores() =>
      [...storesMock, ..._extraStores].map(_effStore).toList();

  ProductMock _eff(ProductMock p) {
    final ov = _prodOv[p.id];
    final vars = <VariantMock>[
      for (final v in p.variants)
        VariantMock(_varOv[v.id]?.id ?? v.id, _varOv[v.id]?.label ?? v.label,
            _varOv[v.id]?.price ?? v.price, _stockOf(v.id, _varOv[v.id]?.stock ?? v.stock)),
      ...(_addedVars[p.id] ?? const []).map((v) =>
          VariantMock(v.id, v.label, v.price, _stockOf(v.id, v.stock))),
    ];
    final deleted = _deletedProd.contains(p.id);
    return ProductMock(
      id: p.id, storeId: p.storeId, categoryId: ov?['categoryId'] ?? p.categoryId,
      name: ov?['name'] ?? p.name, description: ov?['description'] ?? p.description,
      status: deleted ? 'hidden' : (ov?['status'] ?? p.status),
      imageUrl: ov?['imageUrl'] ?? p.imageUrl, createdAt: p.createdAt, variants: vars,
    );
  }

  List<ProductMock> _allProducts() =>
      [...productsMock, ..._extraProducts].map(_eff).toList();

  ProductMock? _raw(String productId) {
    for (final p in [...productsMock, ..._extraProducts]) {
      if (p.id == productId) return p;
    }
    return null;
  }

  /// Cari id produk pemilik varian (termasuk varian tambahan/override).
  String? _ownerProductOf(String variantId) {
    for (final p in [...productsMock, ..._extraProducts]) {
      if (p.variants.any((v) => v.id == variantId)) return p.id;
      if ((_addedVars[p.id] ?? const []).any((v) => v.id == variantId)) {
        return p.id;
      }
    }
    if (_varOv.containsKey(variantId)) {
      for (final p in _allProducts()) {
        if (p.variants.any((v) => v.id == variantId)) return p.id;
      }
    }
    return null;
  }

  StoreMock? _myStore(String ownerId) {
    try {
      return _allStores().firstWhere((s) => s.ownerId == ownerId);
    } catch (_) {
      return null;
    }
  }

  Future<StoreMock?> getMyStore(String ownerId) async {
    await Future.delayed(const Duration(milliseconds: 150));
    return _myStore(ownerId);
  }

  Future<StoreMock> createMyStore({
    required String ownerId,
    required String name,
    String description = '',
    String logoUrl = '',
    required String pickupLocation,
    required bool deliveryAvailable,
    required int deliveryFee,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (_myStore(ownerId) != null) {
      throw Exception('Akun ini sudah memiliki toko — 1 akun hanya 1 toko.');
    }
    if (name.trim().length < 3) throw Exception('Nama toko minimal 3 karakter.');
    if (pickupLocation.trim().isEmpty) throw Exception('Lokasi pickup wajib diisi.');
    if (deliveryFee < 0) throw Exception('Biaya antar tidak valid.');
    final s = StoreMock(
      id: 'store-${DateTime.now().millisecondsSinceEpoch}',
      name: name.trim(), description: description.trim().isEmpty ? 'Toko merchant SOUQNA.' : description.trim(),
      pickupLocation: pickupLocation.trim(), deliveryAvailable: deliveryAvailable,
      deliveryFee: deliveryAvailable ? deliveryFee : 0, status: 'active', ownerId: ownerId,
    );
    _extraStores.add(s);
    return s;
  }

  Future<StoreMock> updateMyStore({
    required String ownerId,
    String? name,
    String? description,
    String? pickupLocation,
    bool? deliveryAvailable,
    int? deliveryFee,
  }) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final cur = _myStore(ownerId);
    if (cur == null) throw Exception('Belum punya toko.');
    if (name != null && name.trim().length < 3) {
      throw Exception('Nama toko minimal 3 karakter.');
    }
    if (pickupLocation != null && pickupLocation.trim().isEmpty) {
      throw Exception('Lokasi pickup wajib diisi.');
    }
    if (deliveryFee != null && deliveryFee < 0) throw Exception('Biaya antar tidak valid.');
    final upd = StoreMock(
      id: cur.id, name: (name ?? cur.name).trim(),
      description: (description ?? cur.description).trim(),
      pickupLocation: (pickupLocation ?? cur.pickupLocation).trim(),
      deliveryAvailable: deliveryAvailable ?? cur.deliveryAvailable,
      deliveryFee: (deliveryAvailable ?? cur.deliveryAvailable)
          ? (deliveryFee ?? cur.deliveryFee) : 0,
      status: cur.status, ownerId: cur.ownerId,
    );
    final i = _extraStores.indexWhere((e) => e.id == cur.id);
    if (i >= 0) {
      _extraStores[i] = upd;
    } else {
      _storeOv[cur.id] = upd;
    }
    return upd;
  }

  Future<List<ProductMock>> getMyProducts(String storeId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final list = _allProducts().where((p) => p.storeId == storeId).toList();
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<ProductMock> createMyProduct({
    required String storeId,
    required String ownerId,
    required String name,
    required String categoryId,
    String description = '',
    String status = 'draft',
    String imageUrl = '',
    required List<VariantMock> variants,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final st = _myStore(ownerId);
    if (st == null || st.id != storeId) throw Exception('Belum punya toko.');
    if (name.trim().length < 3) throw Exception('Nama produk minimal 3 karakter.');
    if (!['draft', 'published', 'hidden'].contains(status)) {
      throw Exception('Status tidak valid (draft/published/hidden).');
    }
    if (variants.isEmpty) throw Exception('Produk minimal punya 1 varian.');
    for (final v in variants) {
      if (v.label.trim().isEmpty) throw Exception('Label varian wajib diisi.');
      if (v.price < 0 || v.stock < 0) throw Exception('Harga/stok varian tidak valid.');
    }
    final id = 'prod-${DateTime.now().millisecondsSinceEpoch}';
    final p = ProductMock(
      id: id, storeId: storeId, categoryId: categoryId,
      name: name.trim(), description: description.trim().isEmpty ? '-' : description.trim(),
      status: status, imageUrl: imageUrl.trim().isEmpty ? 'https://picsum.photos/seed/$id/600/600' : imageUrl.trim(),
      createdAt: DateTime.now().toUtc().toIso8601String(),
      variants: [
        for (var i = 0; i < variants.length; i++)
          VariantMock('var-${DateTime.now().millisecondsSinceEpoch}-$i',
              variants[i].label.trim(), variants[i].price, variants[i].stock),
      ],
    );
    _extraProducts.add(p);
    return _eff(p);
  }

  Future<ProductMock> updateMyProduct({
    required String ownerId,
    required String productId,
    String? name,
    String? categoryId,
    String? description,
    String? status,
    String? imageUrl,
  }) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final st = _myStore(ownerId);
    if (st == null) throw Exception('Belum punya toko.');
    final live = _raw(productId);
    if (live == null) throw Exception('Produk tidak ditemukan.');
    if (live.storeId != st.id) throw Exception('Bukan produk tokomu.');
    if (name != null && name.trim().length < 3) {
      throw Exception('Nama produk minimal 3 karakter.');
    }
    if (status != null && !['draft', 'published', 'hidden'].contains(status)) {
      throw Exception('Status tidak valid (draft/published/hidden).');
    }
    final ov = Map<String, String?>.from(_prodOv[productId] ?? {});
    if (name != null) ov['name'] = name.trim();
    if (categoryId != null) ov['categoryId'] = categoryId;
    if (description != null) ov['description'] = description.trim();
    if (status != null) ov['status'] = status;
    if (imageUrl != null && imageUrl.trim().isNotEmpty) ov['imageUrl'] = imageUrl.trim();
    _prodOv[productId] = ov;
    return _eff(live);
  }

  Future<void> deleteMyProduct({required String ownerId, required String productId}) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final st = _myStore(ownerId);
    if (st == null) throw Exception('Belum punya toko.');
    final live = _raw(productId);
    if (live == null) throw Exception('Produk tidak ditemukan.');
    if (live.storeId != st.id) throw Exception('Bukan produk tokomu.');
    final i = _extraProducts.indexWhere((p) => p.id == productId);
    if (i >= 0) {
      _extraProducts.removeAt(i);
      _prodOv.remove(productId);
      _addedVars.remove(productId);
    } else {
      _deletedProd.add(productId); // arsip aman: hidden
    }
  }

  Future<VariantMock> createMyVariant({
    required String ownerId,
    required String productId,
    required String label,
    required int price,
    required int stock,
  }) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final st = _myStore(ownerId);
    if (st == null) throw Exception('Belum punya toko.');
    final live = _raw(productId);
    if (live == null) throw Exception('Produk tidak ditemukan.');
    if (live.storeId != st.id) throw Exception('Bukan produk tokomu.');
    if (label.trim().isEmpty) throw Exception('Label varian wajib diisi.');
    if (price < 0 || stock < 0) throw Exception('Harga/stok tidak valid.');
    final v = VariantMock('var-${DateTime.now().millisecondsSinceEpoch}',
        label.trim(), price, stock);
    (_addedVars[productId] ??= []).add(v);
    _stockOv[v.id] = stock;
    return v;
  }

  Future<VariantMock> updateMyVariant({
    required String ownerId,
    required String variantId,
    String? label,
    int? price,
    int? stock,
  }) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final st = _myStore(ownerId);
    if (st == null) throw Exception('Belum punya toko.');
    final pid = _ownerProductOf(variantId);
    if (pid == null) throw Exception('Varian tidak ditemukan.');
    final owner = _raw(pid);
    if (owner == null) throw Exception('Varian tidak ditemukan.');
    if (owner.storeId != st.id) throw Exception('Bukan produk tokomu.');
    // Nilai kini dari view efektif (untuk fallback field tak diubah).
    VariantMock? cur;
    for (final v in _eff(owner).variants) {
      if (v.id == variantId) cur = v;
    }
    if (cur == null) throw Exception('Varian tidak ditemukan.');
    if (label != null && label.trim().isEmpty) {
      throw Exception('Label varian wajib diisi.');
    }
    if (price != null && price < 0) throw Exception('Harga tidak valid.');
    if (stock != null && stock < 0) throw Exception('Stok tidak valid.');
    final upd = VariantMock(variantId, (label ?? cur.label).trim(),
        price ?? cur.price, stock ?? cur.stock);
    _varOv[variantId] = upd;
    _stockOv[variantId] = upd.stock;
    return upd;
  }

  Future<List<Category>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return categoriesMock;
  }

  Future<List<StoreMock>> getStores() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _allStores().where((s) => s.status == 'active').toList();
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
    final active = _allStores().where((s) => s.status == 'active').map((s) => s.id).toSet();
    var list = _allProducts().where((p) {
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
      return _allProducts().firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<StoreMock?> getStore(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    try {
      return _allStores().firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<List<ProductMock>> getStoreProducts(String storeId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _allProducts().where((p) => p.storeId == storeId && p.status == 'published').toList();
  }

  // --- Cart multi-toko (in-memory dummy, shared antar layar) ---
  static final List<CartLine> _cart = [
    CartLine(id: 'cart-1', variantId: 'var-01a', quantity: 2),
    CartLine(id: 'cart-2', variantId: 'var-04a', quantity: 1),
  ];
  static final Map<String, int> _stockOv = {};
  static int _seq = 2;

  int _stockOf(String variantId, int base) => _stockOv[variantId] ?? base;

  ({ProductMock p, VariantMock v, StoreMock? s})? _resolve(String variantId) {
    for (final p in _allProducts()) {
      for (final v in p.variants) {
        if (v.id == variantId) {
          StoreMock? s;
          try {
            s = _allStores().firstWhere((x) => x.id == p.storeId);
          } catch (_) {}
          return (p: p, v: v, s: s);
        }
      }
    }
    return null;
  }

  CartDetailed _detail(CartLine c) {
    final r = _resolve(c.variantId);
    if (r == null) {
      return CartDetailed(id: c.id, variantId: c.variantId, quantity: c.quantity,
        productId: '', productName: '(varian dihapus)', storeId: '', storeName: '-',
        variantLabel: c.variantId, unitPrice: 0, stock: 0, blockReason: 'Varian tidak ditemukan.');
    }
    final stock = _stockOf(r.v.id, r.v.stock);
    String? blocked;
    if (r.p.status != 'published') {
      blocked = 'Produk disembunyikan.';
    } else if (r.s == null || r.s!.status != 'active') {
      blocked = 'Toko nonaktif.';
    } else if (stock <= 0) {
      blocked = 'Stok habis.';
    }
    return CartDetailed(id: c.id, variantId: c.variantId, quantity: c.quantity,
      productId: r.p.id, productName: r.p.name, storeId: r.p.storeId,
      storeName: r.s?.name ?? '-', variantLabel: r.v.label, unitPrice: r.v.price,
      stock: stock, blockReason: blocked);
  }

  Future<List<CartDetailed>> getCartDetailed() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _cart.map(_detail).toList();
  }

  Future<void> addToCart(String variantId, [int qty = 1]) async {
    await Future.delayed(const Duration(milliseconds: 150));
    final r = _resolve(variantId);
    if (r == null) throw Exception('Varian tidak ditemukan.');
    if (r.p.status != 'published') throw Exception('Produk disembunyikan.');
    if (r.s == null || r.s!.status != 'active') throw Exception('Toko nonaktif — tidak bisa checkout.');
    final stock = _stockOf(r.v.id, r.v.stock);
    if (stock <= 0) throw Exception('Stok habis.');
    CartLine? ex;
    try {
      ex = _cart.firstWhere((c) => c.variantId == variantId);
    } catch (_) {}
    final want = (ex?.quantity ?? 0) + qty;
    if (want > stock) throw Exception('Sisa stok $stock.');
    if (ex != null) {
      ex.quantity = want;
    } else {
      _cart.add(CartLine(id: 'cart-${DateTime.now().millisecondsSinceEpoch}', variantId: variantId, quantity: qty));
    }
  }

  Future<void> updateCartItemQty(String id, int qty) async {
    await Future.delayed(const Duration(milliseconds: 150));
    final i = _cart.indexWhere((c) => c.id == id);
    if (i < 0) throw Exception('Item tidak ada di keranjang.');
    if (qty <= 0) {
      _cart.removeAt(i);
      return;
    }
    final r = _resolve(_cart[i].variantId);
    if (r != null && qty > _stockOf(r.v.id, r.v.stock)) throw Exception('Sisa stok ${_stockOf(r.v.id, r.v.stock)}.');
    _cart[i].quantity = qty;
  }

  Future<void> removeCartItem(String id) async {
    await Future.delayed(const Duration(milliseconds: 150));
    _cart.removeWhere((c) => c.id == id);
  }

  // --- Voucher (aturan sama dengan web: aktif, expired, min-subtotal) ---
  Future<List<VoucherMock>> getVouchers() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return vouchersMock;
  }

  /// Kembalikan diskon atau lempar Exception dengan alasan jelas.
  int voucherAmount(String code, int subtotal) {
    VoucherMock? v;
    try {
      v = vouchersMock.firstWhere((x) => x.code == code.toUpperCase());
    } catch (_) {}
    if (v == null || !v.isActive) throw Exception('Voucher tidak ditemukan / nonaktif');
    final now = DateTime.now().toUtc();
    if (DateTime.parse(v.startsAt).isAfter(now) || DateTime.parse(v.endsAt).isBefore(now)) {
      throw Exception('Voucher kedaluwarsa');
    }
    if (subtotal < v.minimumSubtotal) throw Exception('Min. belanja ${v.minimumSubtotal}');
    return v.discountValue > subtotal ? subtotal : v.discountValue;
  }

  Future<int> validateVoucher(String code, int subtotal) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return voucherAmount(code, subtotal);
  }

  // --- Checkout dummy: hitung server-side, atomik ---
  CheckoutPreview validateCheckout({
    required List<CartLine> items,
    required Map<String, FulfillmentMethod> methods,
    required Map<String, String> locations,
    String? voucherCode,
  }) {
    final errors = <String>[];
    final lines = items.map(_detail).toList();
    for (final l in lines) {
      if (l.productId.isEmpty) {
        errors.add('Varian ${l.variantId} tidak ditemukan.');
      } else if (l.blockReason != null) {
        errors.add('${l.productName} (${l.variantLabel}): ${l.blockReason}');
      } else if (l.quantity > l.stock) {
        errors.add('${l.productName} (${l.variantLabel}): sisa ${l.stock}.');
      }
    }
    final byStore = <String, List<CartDetailed>>{};
    for (final l in lines) {
      if (l.storeId.isEmpty) continue;
      (byStore[l.storeId] ??= []).add(l);
    }
    if (byStore.isEmpty && errors.isEmpty) errors.add('Keranjang kosong.');
    for (final sid in byStore.keys) {
      final m = methods[sid];
      StoreMock? st;
      try {
        st = _allStores().firstWhere((x) => x.id == sid);
      } catch (_) {}
      if (m == null) {
        errors.add('Pilih pickup/diantar untuk toko ${st?.name ?? sid}.');
      } else if (m == FulfillmentMethod.merchantDelivery) {
        if (st == null || !st.deliveryAvailable) {
          errors.add('${st?.name ?? sid} tidak melayani pengantaran.');
        } else if ((locations[sid] ?? '').trim().isEmpty) {
          errors.add('Isi lokasi serah terima untuk ${st?.name ?? sid}.');
        }
      }
    }
    final subtotal = lines.fold(0, (s, l) => s + l.lineTotal);
    var discount = 0;
    final code = voucherCode?.trim().toUpperCase();
    if (code != null && code.isNotEmpty) {
      try {
        discount = voucherAmount(code, subtotal);
      } catch (e) {
        errors.add('Voucher: ${e.toString().replaceFirst('Exception: ', '')}');
      }
    }
    if (errors.isNotEmpty) throw Exception(errors.join(' '));

    final sids = byStore.keys.toList();
    var acc = 0;
    final perStore = <StoreBreakdown>[];
    for (var idx = 0; idx < sids.length; idx++) {
      final sid = sids[idx];
      final ls = byStore[sid]!;
      final st = _allStores().firstWhere((x) => x.id == sid);
      final sub = ls.fold(0, (s, l) => s + l.lineTotal);
      final d = idx < sids.length - 1 ? (discount * sub / subtotal).round() : discount - acc;
      acc += d;
      final fee = methods[sid] == FulfillmentMethod.pickup ? 0 : st.deliveryFee;
      perStore.add(StoreBreakdown(storeId: sid, storeName: st.name, subtotal: sub,
        discount: d, deliveryFee: fee, method: methods[sid]!));
    }
    return CheckoutPreview(perStore: perStore, subtotal: subtotal, discountTotal: discount);
  }

  Future<CheckoutResult> checkout({
    required Map<String, FulfillmentMethod> methods,
    required Map<String, String> locations,
    String? voucherCode,
  }) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final prev = validateCheckout(items: List.of(_cart), methods: methods,
      locations: locations, voucherCode: voucherCode);
    // Mutasi stok (atomik: hanya setelah validasi lolos).
    for (final ps in prev.perStore) {
      for (final l in _cart.where((c) {
        final r = _resolve(c.variantId);
        return r != null && r.p.storeId == ps.storeId;
      })) {
        final r = _resolve(l.variantId)!;
        _stockOv[r.v.id] = _stockOf(r.v.id, r.v.stock) - l.quantity;
      }
    }
    _seq++;
    final code = 'SQN-2026-${_seq.toString().padLeft(4, '0')}';
    final orders = prev.perStore.map((ps) => PlacedOrder(
      id: 'ord-${DateTime.now().millisecondsSinceEpoch}-${ps.storeId}',
      storeId: ps.storeId, storeName: ps.storeName,
      grandTotal: ps.total, method: ps.method)).toList();
    // Simpan order penuh untuk layar Pesanan (M4), termasuk item (untuk M6 review).
    final nowMs = DateTime.now().millisecondsSinceEpoch;
    for (final ps in prev.perStore) {
      final its = <OrderItemMock>[];
      for (final l in _cart.where((c) {
        final r = _resolve(c.variantId);
        return r != null && r.p.storeId == ps.storeId;
      })) {
        final r = _resolve(l.variantId)!;
        its.add(OrderItemMock(r.p.name, r.v.label, l.quantity,
            r.v.price * l.quantity,
            id: 'oi-$nowMs-${l.variantId}', productId: r.p.id));
      }
      _orders.add(OrderMock(
        id: 'ord-$nowMs-${ps.storeId}',
        storeId: ps.storeId, storeName: ps.storeName, buyerId: _buyer,
        status: 'pending_merchant_confirmation', paymentStatus: 'unpaid',
        method: ps.method, deliveryFee: ps.deliveryFee,
        subtotal: ps.subtotal, discount: ps.discount, items: its,
        history: const [HistoryMock('created', 'pending_merchant_confirmation', 'Checkout dibuat.')],
      ));
    }
    _cart.clear();
    return CheckoutResult(code: code, orders: orders);
  }

  // --- Orders M4: list/detail + transisi legal + histori ---
  static const _buyer = 'user-buyer-1';
  static final List<OrderMock> _orders = [
    OrderMock(id: 'ord-01', storeId: 'store-01', storeName: 'Kantin Berkah Jaya',
      buyerId: _buyer, status: 'out_for_delivery', paymentStatus: 'unpaid',
      method: FulfillmentMethod.merchantDelivery, deliveryFee: 5000,
      subtotal: 24000, discount: 2000, items: const [],
      history: const [HistoryMock('created', 'pending_merchant_confirmation'),
        HistoryMock('pending_merchant_confirmation', 'accepted'),
        HistoryMock('accepted', 'out_for_delivery')]),
    OrderMock(id: 'ord-02', storeId: 'store-02', storeName: 'Hijab Nusa',
      buyerId: _buyer, status: 'accepted', paymentStatus: 'unpaid',
      method: FulfillmentMethod.pickup, deliveryFee: 0,
      subtotal: 35000, discount: 3000, items: const [],
      history: const [HistoryMock('created', 'pending_merchant_confirmation'),
        HistoryMock('pending_merchant_confirmation', 'accepted')]),
    OrderMock(id: 'ord-03', storeId: 'store-03', storeName: 'PrintQu Cepat',
      buyerId: _buyer, status: 'completed', paymentStatus: 'paid',
      method: FulfillmentMethod.pickup, deliveryFee: 0,
      subtotal: 25000, discount: 0,
      items: const [OrderItemMock('Jilid Softcover Skripsi', 'Standar', 1, 25000, id: 'oi-01', productId: 'prod-08')],
      history: const [HistoryMock('created', 'pending_merchant_confirmation'),
        HistoryMock('pending_merchant_confirmation', 'accepted'),
        HistoryMock('accepted', 'ready_for_pickup'),
        HistoryMock('ready_for_pickup', 'completed', 'Diterima + lunas.')]),
  ];

  Future<List<OrderMock>> getOrders({String? buyerId}) async {
    await Future.delayed(const Duration(milliseconds: 300));
    var list = _orders.toList();
    if (buyerId != null && buyerId.isNotEmpty) {
      list = list.where((o) => o.buyerId == buyerId).toList();
    }
    list.sort((a, b) => b.id.compareTo(a.id));
    return list;
  }

  Future<List<OrderMock>> getMerchantOrders(String ownerId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final mine = _allStores().where((s) => s.ownerId == ownerId).map((s) => s.id).toSet();
    return _orders.where((o) => mine.contains(o.storeId)).toList();
  }

  Future<OrderMock?> getOrder(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    try {
      return _orders.firstWhere((o) => o.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Transisi legal saja; [isMerchant] = pemilik toko, else pembeli pemilik.
  Future<OrderMock> transitionOrder(String id, String action, {required bool isMerchant}) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final o = _orders.firstWhere((x) => x.id == id, orElse: () => throw Exception('Pesanan tidak ditemukan.'));
    final from = o.status;
    void needBuyer() {
      if (isMerchant) throw Exception('Hanya pembeli pemilik pesanan.');
    }

    void needMerchant() {
      if (!isMerchant) throw Exception('Hanya merchant pemilik toko.');
    }

    switch (action) {
      case 'cancel':
        needBuyer();
        if (from != 'pending_merchant_confirmation') throw Exception('Batal hanya saat menunggu konfirmasi merchant.');
        o.status = 'cancelled';
        break;
      case 'accept':
        needMerchant();
        if (from != 'pending_merchant_confirmation') throw Exception('Terima hanya saat menunggu konfirmasi.');
        o.status = 'accepted';
        break;
      case 'reject':
        needMerchant();
        if (from != 'pending_merchant_confirmation') throw Exception('Tolak hanya saat menunggu konfirmasi.');
        o.status = 'rejected';
        break;
      case 'ready':
        needMerchant();
        if (from != 'accepted') throw Exception('Siap-ambil hanya dari status accepted.');
        if (o.method != FulfillmentMethod.pickup) throw Exception('Pesanan antar pakai out-for-delivery.');
        o.status = 'ready_for_pickup';
        break;
      case 'out':
        needMerchant();
        if (from != 'accepted') throw Exception('Antar hanya dari status accepted.');
        if (o.method != FulfillmentMethod.merchantDelivery) throw Exception('Pesanan ambil-sendiri pakai ready-for-pickup.');
        o.status = 'out_for_delivery';
        break;
      case 'received':
        needBuyer();
        if (from != 'ready_for_pickup' && from != 'out_for_delivery') {
          throw Exception('Konfirmasi terima hanya setelah barang siap/diantar.');
        }
        o.status = o.paymentStatus == 'paid' ? 'completed' : 'received_by_buyer';
        break;
      case 'paid':
        needMerchant();
        if (o.paymentStatus == 'paid') throw Exception('Sudah lunas.');
        if (from == 'completed' || from == 'rejected' || from == 'cancelled') {
          throw Exception('Pesanan sudah final.');
        }
        o.paymentStatus = 'paid';
        if (from == 'received_by_buyer') o.status = 'completed';
        break;
      default:
        throw Exception('Aksi tidak dikenal.');
    }
    o.history.add(HistoryMock(from, o.status));
    return o;
  }

  // --- Wishlist per user (unique), wajib login (dijaga UI guard) ---
  static final Map<String, Set<String>> _wishlist = {
    'user-buyer-1': {'prod-04'},
  };

  Future<List<ProductMock>> getWishlist(String userId) async {
    await Future.delayed(const Duration(milliseconds: 150));
    final ids = _wishlist[userId] ?? const <String>{};
    return _allProducts().where((p) => ids.contains(p.id)).toList();
  }

  Future<bool> isWishlisted(String userId, String productId) async {
    await Future.delayed(const Duration(milliseconds: 100));
    return _wishlist[userId]?.contains(productId) ?? false;
  }

  Future<void> addToWishlist(String userId, String productId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (userId.isEmpty) throw Exception('Wajib login untuk menyimpan wishlist.');
    ProductMock? p;
    try {
      p = _allProducts().firstWhere((e) => e.id == productId);
    } catch (_) {}
    if (p == null) throw Exception('Produk tidak ditemukan.');
    StoreMock? st;
    try {
      st = _allStores().firstWhere((e) => e.id == p!.storeId);
    } catch (_) {}
    if (p.status != 'published' || st == null || st.status != 'active') {
      throw Exception('Produk tidak tersedia untuk wishlist.');
    }
    final set = _wishlist.putIfAbsent(userId, () => <String>{});
    if (!set.add(productId)) throw Exception('Sudah ada di wishlist.');
  }

  Future<void> removeFromWishlist(String userId, String productId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (userId.isEmpty) throw Exception('Wajib login.');
    _wishlist[userId]?.remove(productId);
  }

  // --- Ulasan: hanya order-item completed milik sendiri, 1 per item ---
  static final List<ReviewMock> _reviews = [
    ReviewMock(
        id: 'r-1',
        orderItemId: 'oi-01',
        productId: 'prod-08',
        buyerId: _buyer,
        rating: 5,
        text: 'Jilid rapi, cepat!',
        createdAt:
            DateTime.now().subtract(const Duration(hours: 5)).toIso8601String()),
  ];

  Future<List<ReviewMock>> getReviews(String productId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final list = _reviews.where((r) => r.productId == productId).toList();
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<ReviewMock?> getReviewForItem(String orderItemId) async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _reviews.firstWhere((r) => r.orderItemId == orderItemId);
    } catch (_) {
      return null;
    }
  }

  Future<ReviewMock> createReview({
    required String buyerId,
    required String orderItemId,
    required int rating,
    String text = '',
  }) async {
    await Future.delayed(const Duration(milliseconds: 250));
    if (buyerId.isEmpty) throw Exception('Wajib login untuk memberi ulasan.');
    OrderMock? owner;
    OrderItemMock? item;
    for (final o in _orders) {
      for (final it in o.items) {
        if (it.id == orderItemId) {
          owner = o;
          item = it;
        }
      }
    }
    if (owner == null || item == null) {
      throw Exception('Item pesanan tidak ditemukan.');
    }
    if (owner.buyerId != buyerId) {
      throw Exception('Hanya item milikmu yang bisa diulas.');
    }
    if (owner.status != 'completed') {
      throw Exception('Ulasan hanya untuk pesanan selesai (completed).');
    }
    if (_reviews.any((r) => r.orderItemId == orderItemId)) {
      throw Exception('Sudah memberi ulasan untuk item ini (1 ulasan per item).');
    }
    if (rating < 1 || rating > 5) throw Exception('Rating 1–5.');
    if (text.trim().length > 500) {
      throw Exception('Ulasan maksimal 500 karakter.');
    }
    final r = ReviewMock(
      id: 'r-${DateTime.now().millisecondsSinceEpoch}',
      orderItemId: orderItemId,
      productId: item.productId,
      buyerId: buyerId,
      rating: rating,
      text: text.trim(),
      createdAt: DateTime.now().toIso8601String(),
    );
    _reviews.add(r);
    return r;
  }

  // --- Chat teks per toko (pesan >7 hari disembunyikan, thread tetap ada) ---
  static final List<ConversationMock> _convs = [
    ConversationMock(
        id: 'conv-01',
        buyerId: _buyer,
        storeId: 'store-01',
        createdAt: DateTime.now()
            .subtract(const Duration(days: 2))
            .toIso8601String()),
  ];
  static final List<MessageMock> _msgs = [
    MessageMock(
        id: 'm-1',
        conversationId: 'conv-01',
        senderId: _buyer,
        body: 'Kak, geprek level 1 masih ada?',
        createdAt: DateTime.now()
            .subtract(const Duration(days: 1))
            .toIso8601String()),
    MessageMock(
        id: 'm-2',
        conversationId: 'conv-01',
        senderId: 'user-merchant-1',
        body: 'Ada kak, ready. Mau diantar atau ambil?',
        createdAt: DateTime.now()
            .subtract(const Duration(days: 1))
            .add(const Duration(minutes: 1))
            .toIso8601String()),
    MessageMock(
        id: 'm-3',
        conversationId: 'conv-01',
        senderId: _buyer,
        body: 'Pesan lama (simulasi >7 hari, harus disembunyikan UI)',
        createdAt: DateTime.now()
            .subtract(const Duration(days: 8))
            .toIso8601String()),
  ];

  bool _isParticipant(
      ConversationMock c, String userId, Set<String> storeIds) {
    return c.buyerId == userId || storeIds.contains(c.storeId);
  }

  Future<List<ConversationMock>> getConversations(
      String userId, Set<String> storeIds) async {
    await Future.delayed(const Duration(milliseconds: 150));
    if (userId.isEmpty) throw Exception('Wajib login untuk membuka chat.');
    return _convs
        .where((c) => _isParticipant(c, userId, storeIds))
        .toList();
  }

  Future<ConversationMock> getOrCreateConversation(
      String buyerId, String storeId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (buyerId.isEmpty) throw Exception('Wajib login untuk chat.');
    if (_allStores().every((s) => s.id != storeId)) {
      throw Exception('Toko tidak ditemukan.');
    }
    for (final c in _convs) {
      if (c.buyerId == buyerId && c.storeId == storeId) return c;
    }
    final c = ConversationMock(
      id: 'conv-${DateTime.now().millisecondsSinceEpoch}',
      buyerId: buyerId,
      storeId: storeId,
      createdAt: DateTime.now().toIso8601String(),
    );
    _convs.add(c);
    return c;
  }

  Future<({List<MessageMock> messages, int hidden})> getMessages(
      String convId, String userId, Set<String> storeIds) async {
    await Future.delayed(const Duration(milliseconds: 150));
    if (userId.isEmpty) throw Exception('Wajib login.');
    ConversationMock? conv;
    try {
      conv = _convs.firstWhere((c) => c.id == convId);
    } catch (_) {}
    if (conv == null) throw Exception('Thread tidak ditemukan.');
    if (!_isParticipant(conv, userId, storeIds)) {
      throw Exception('Bukan peserta thread ini.');
    }
    final cutoff = DateTime.now().subtract(const Duration(days: 7));
    final all = _msgs.where((m) => m.conversationId == convId).toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
    final visible = all
        .where((m) => DateTime.parse(m.createdAt).isAfter(cutoff))
        .toList();
    return (messages: visible, hidden: all.length - visible.length);
  }

  Future<MessageMock> sendMessage(String convId, String senderId,
      Set<String> storeIds, String body) async {
    await Future.delayed(const Duration(milliseconds: 200));
    if (senderId.isEmpty) throw Exception('Wajib login.');
    ConversationMock? conv;
    try {
      conv = _convs.firstWhere((c) => c.id == convId);
    } catch (_) {}
    if (conv == null) throw Exception('Thread tidak ditemukan.');
    if (!_isParticipant(conv, senderId, storeIds)) {
      throw Exception('Bukan peserta thread ini.');
    }
    final text = body.trim();
    if (text.isEmpty) throw Exception('Pesan tidak boleh kosong.');
    if (text.length > 2000) {
      throw Exception('Pesan maksimal 2000 karakter.');
    }
    final m = MessageMock(
      id: 'm-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: convId,
      senderId: senderId,
      body: text,
      createdAt: DateTime.now().toIso8601String(),
    );
    _msgs.add(m);
    return m;
  }
}
