import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/date_id.dart';
import '../../../core/utils/money.dart';
import '../../../mocks/products_mock.dart';
import '../../../mocks/stores_mock.dart';

// Detail produk: varian, harga/stok per varian, label habis, fallback gambar.
class ProductDetailScreen extends StatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});
  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final _api = ApiClient();
  bool loading = true;
  String? error;
  ProductMock? p;
  StoreMock? store;
  int sel = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; error = null; });
    try {
      final prod = await _api.getProduct(widget.productId);
      if (prod == null) { setState(() => error = 'Produk tidak ditemukan.'); return; }
      final s = await _api.getStore(prod.storeId);
      setState(() { p = prod; store = s; sel = 0; });
    } catch (_) {
      setState(() => error = 'Gagal memuat produk. Coba lagi.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Produk')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
              : p == null
                  ? const Center(child: Text('Produk tidak ada.'))
                  : _body(),
    );
  }

  Widget _body() {
    final prod = p!;
    final v = prod.variants[sel];
    final hidden = prod.status != 'published';
    final storeOff = store == null || store!.status != 'active';
    final blocked = prod.outOfStock || hidden || storeOff;
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Image.network(
          prod.imageUrl,
          height: 220,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => const SizedBox(
            height: 220, child: Center(child: Icon(Icons.image_not_supported, size: 48))),
        ),
        const SizedBox(height: 8),
        Text(prod.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        Text(prod.description),
        Text('Dibuat ${formatDateWIB(prod.createdAt)} WIB', style: const TextStyle(color: Colors.grey, fontSize: 12)),
        if (store != null) Text('Toko: ${store!.name}${storeOff ? ' (nonaktif)' : ''}'),
        if (hidden) const Text('Produk ini disembunyikan — tidak bisa checkout.', style: TextStyle(color: Colors.red)),
        if (storeOff) const Text('Toko nonaktif — tidak bisa checkout.', style: TextStyle(color: Colors.red)),
        if (prod.outOfStock && !hidden && !storeOff)
          const Text('Stok habis — tidak bisa checkout.', style: TextStyle(color: Colors.red)),
        Wrap(
          spacing: 8,
          children: prod.variants.asMap().entries.map((e) {
            final i = e.key;
            final x = e.value;
            return ChoiceChip(
              label: Text('${x.label} — ${formatIDR(x.price)} (${x.stock})'),
              selected: i == sel,
              onSelected: x.stock == 0 ? null : (_) => setState(() => sel = i),
            );
          }).toList(),
        ),
        const SizedBox(height: 8),
        Text('${formatIDR(v.price)} · stok ${v.stock}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ElevatedButton(
          onPressed: blocked || v.stock == 0 ? null : () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Masuk keranjang (dummy)')));
          },
          child: const Text('+ Keranjang'),
        ),
      ],
    );
  }
}
