import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../mocks/products_mock.dart';
import '../../../mocks/stores_mock.dart';
import '../../../shared/widgets/product_card.dart';
import 'product_detail_screen.dart';

// Detail toko + produk toko; inactive diberi banner.
class StoreDetailScreen extends StatefulWidget {
  final String storeId;
  const StoreDetailScreen({super.key, required this.storeId});
  @override
  State<StoreDetailScreen> createState() => _StoreDetailScreenState();
}

class _StoreDetailScreenState extends State<StoreDetailScreen> {
  final _api = ApiClient();
  bool loading = true;
  String? error;
  StoreMock? store;
  List<ProductMock> prods = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; error = null; });
    try {
      final s = await _api.getStore(widget.storeId);
      if (s == null) { setState(() => error = 'Toko tidak ditemukan.'); return; }
      final ps = await _api.getStoreProducts(s.id);
      setState(() { store = s; prods = ps; });
    } catch (_) {
      setState(() => error = 'Gagal memuat toko. Coba lagi.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Toko')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
              : store == null
                  ? const Center(child: Text('Toko tidak ada.'))
                  : _body(),
    );
  }

  Widget _body() {
    final s = store!;
    final off = s.status != 'active';
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Text(s.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        Text(s.description),
        Text('Pickup: ${s.pickupLocation} · ${s.deliveryAvailable ? 'Antar' : 'Pickup saja'}',
            style: const TextStyle(color: Colors.grey)),
        if (off) Text('Toko ${s.status} — produk tidak bisa checkout.', style: const TextStyle(color: Colors.red)),
        const SizedBox(height: 8),
        Text('Produk toko (${prods.length})', style: const TextStyle(fontWeight: FontWeight.bold)),
        if (prods.isEmpty) const Text('Toko ini belum punya produk aktif.')
        else GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 0.72,
          children: prods.map((p) => ProductCard(
            p: p,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: p.id))),
          )).toList(),
        ),
      ],
    );
  }
}
