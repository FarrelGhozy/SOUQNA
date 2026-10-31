import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/date_id.dart';
import '../../../mocks/categories_mock.dart';
import '../../../mocks/products_mock.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/product_card.dart';
import 'product_detail_screen.dart';
import 'search_screen.dart';

/// Beranda Utama SOUQNA — Acuan Biru UNIDA Gontor.
/// Katalog publik: banner kampus, search trigger, kategori unggulan, & produk pilihan.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiClient();
  bool loading = true;
  String? error;
  List<Category> cats = [];
  List<ProductMock> latest = [];
  List<ProductMock> available = [];
  Map<String, String> storeMap = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final c = await _api.getCategories();
      final lat = await _api.getProducts(sort: ProductSort.terbaru, limit: 8);
      final av = await _api.getProducts(sort: ProductSort.termurah, limit: 8);
      final sts = await _api.getStores();
      setState(() {
        cats = c;
        latest = lat.data;
        available = av.data.where((p) => !p.outOfStock).take(8).toList();
        storeMap = {for (final s in sts) s.id: s.name};
      });
    } catch (_) {
      setState(() => error = 'Gagal memuat katalog. Coba lagi.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _open(ProductMock p) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: p.id)),
    );
  }

  void _openSearch({String? categoryId, String? title}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => Scaffold(
          appBar: AppBar(
            flexibleSpace: AppTheme.topBarFlexibleSpace,
            title: Text(title ?? 'Pencarian SOUQNA'),
          ),
          body: SearchScreen(initialCategoryId: categoryId),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_outlined, size: 48, color: AppTheme.danger),
              const SizedBox(height: 12),
              Text(error!, style: const TextStyle(color: AppTheme.danger), textAlign: TextAlign.center),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _load, child: const Text('Muat Ulang')),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          // Hero Banner UNIDA Gontor
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.unidaNavy, AppTheme.unidaBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.unidaNavy.withOpacity(0.18),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.unidaGold.withOpacity(0.2),
                    border: Border.all(color: AppTheme.unidaGold),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'PASAR KITA CIVITAS UNIDA GONTOR',
                    style: TextStyle(
                      color: AppTheme.unidaGold,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Belanja Kebutuhan Kampus\nBayar di Tempat (COD)',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Makanan, jilid skripsi, perlengkapan santri & mahasiswa. Aman, praktis, dan transparan.',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.85),
                    fontSize: 12,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Search Trigger Bar
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => _openSearch(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: const [
                  Icon(Icons.search, color: AppTheme.unidaBlue, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Cari makanan, print skripsi, jaket...',
                      style: TextStyle(color: AppTheme.muted, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Kategori Pilihan
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Kategori Pilihan',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
              ),
              Text(
                '${cats.length} Kategori',
                style: const TextStyle(fontSize: 12, color: AppTheme.muted, fontWeight: FontWeight.w500),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: cats.map((c) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    backgroundColor: AppTheme.surface,
                    side: const BorderSide(color: AppTheme.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    avatar: const Icon(Icons.category_outlined, size: 16, color: AppTheme.unidaBlue),
                    label: Text(
                      c.name,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.unidaNavy),
                    ),
                    onPressed: () => _openSearch(categoryId: c.id, title: c.name),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 22),

          // Produk Terbaru
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Produk Terbaru',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Rilis terbaru dari merchant kampus',
                    style: TextStyle(fontSize: 12, color: AppTheme.muted),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => _openSearch(title: 'Semua Produk'),
                child: const Text('Semua >', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (latest.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(child: Text('Belum ada produk yang dirilis.')),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.65,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: latest.length,
              itemBuilder: (_, idx) {
                final p = latest[idx];
                return ProductCard(
                  p: p,
                  storeName: storeMap[p.storeId],
                  onTap: () => _open(p),
                );
              },
            ),
          const SizedBox(height: 22),

          // Produk Tersedia (Ready Stock)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Siap Dipesan (Stok Tersedia)',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Bisa langsung diantar atau diambil hari ini',
                    style: TextStyle(fontSize: 12, color: AppTheme.muted),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (available.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(child: Text('Semua produk saat ini sedang habis.')),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.65,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: available.length,
              itemBuilder: (_, idx) {
                final p = available[idx];
                return ProductCard(
                  p: p,
                  storeName: storeMap[p.storeId],
                  onTap: () => _open(p),
                );
              },
            ),

          const SizedBox(height: 20),
          Center(
            child: Text(
              'SOUQNA Pasar Kampus UNIDA Gontor · Diperbarui ${formatDateWIB(DateTime.now().toUtc().toIso8601String())} WIB',
              style: const TextStyle(fontSize: 11, color: AppTheme.muted),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
