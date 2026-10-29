import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/date_id.dart';
import '../../../mocks/categories_mock.dart';
import '../../../mocks/products_mock.dart';
import '../../../shared/widgets/product_card.dart';
import 'product_detail_screen.dart';

// Beranda: kategori + produk terbaru + tersedia, loading/empty/error.
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

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; error = null; });
    try {
      final c = await _api.getCategories();
      final lat = await _api.getProducts(sort: ProductSort.terbaru, limit: 8);
      final av = await _api.getProducts(sort: ProductSort.termurah, limit: 8);
      setState(() {
        cats = c;
        latest = lat.data;
        available = av.data.where((p) => !p.outOfStock).take(8).toList();
      });
    } catch (_) {
      setState(() => error = 'Gagal memuat katalog. Coba lagi.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _open(ProductMock p) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: p.id)));
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(error!, style: const TextStyle(color: Colors.red)),
        TextButton(onPressed: _load, child: const Text('Muat ulang')),
      ]));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          const Text('Pasar Kita — SOUQNA', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          Text('${cats.length} kategori · COD saja'),
          const SizedBox(height: 8),
          const Text('Kategori', style: TextStyle(fontWeight: FontWeight.bold)),
          Wrap(
            spacing: 8,
            children: cats.map((c) => Chip(label: Text(c.name))).toList(),
          ),
          const SizedBox(height: 8),
          const Text('Produk terbaru', style: TextStyle(fontWeight: FontWeight.bold)),
          if (latest.isEmpty) const Text('Belum ada produk.')
          else GridView.count(
            crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 0.72,
            children: latest.map((p) => ProductCard(p: p, onTap: () => _open(p))).toList(),
          ),
          const Text('Tersedia', style: TextStyle(fontWeight: FontWeight.bold)),
          if (available.isEmpty) const Text('Semua produk habis.')
          else GridView.count(
            crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 0.72,
            children: available.map((p) => ProductCard(p: p, onTap: () => _open(p))).toList(),
          ),
          Text('Diperbarui ${formatDateWIB(DateTime.now().toUtc().toIso8601String())} WIB',
              style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }
}
