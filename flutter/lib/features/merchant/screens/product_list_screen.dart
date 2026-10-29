import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import 'product_form_screen.dart';

// Daftar produk milik toko sendiri + tayang/sembunyi/hapus.
class ProductListScreen extends StatefulWidget {
  final String ownerId;
  final String storeId;
  const ProductListScreen(
      {super.key, required this.ownerId, required this.storeId});
  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final _api = ApiClient();
  bool loading = true;
  String? err;
  String? toast;
  List<ProductMock> products = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      err = null;
    });
    try {
      products = await _api.getMyProducts(widget.storeId);
    } catch (e) {
      err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Produk saya (${products.length})')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.of(context)
            .push(MaterialPageRoute(
                builder: (_) => ProductFormScreen(
                    ownerId: widget.ownerId, storeId: widget.storeId)))
            .then((_) => _load()),
        child: const Icon(Icons.add),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : err != null
              ? Center(child: Text(err!, style: const TextStyle(color: Colors.red)))
              : products.isEmpty
                  ? const Center(child: Text('Belum ada produk.'))
                  : ListView(
                      padding: const EdgeInsets.all(12),
                      children: [
                        if (toast != null)
                          Text(toast!,
                              style: const TextStyle(color: Colors.green)),
                        for (final p in products)
                          Card(
                            child: ListTile(
                              leading: Image.network(p.imageUrl,
                                  width: 48, height: 48, fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) =>
                                      const Icon(Icons.image)),
                              title: Text(p.name,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold)),
                              subtitle: Text(
                                  '${p.status}${p.status != 'published' ? ' (tidak tampil publik)' : ''}\nMulai ${formatIDR(p.minPrice)} · stok ${p.variants.fold(0, (a, v) => a + v.stock)}'),
                              isThreeLine: true,
                              trailing: PopupMenuButton<String>(
                                onSelected: (v) async {
                                  try {
                                    if (v == 'toggle') {
                                      await _api.updateMyProduct(
                                        ownerId: widget.ownerId,
                                        productId: p.id,
                                        status: p.status == 'published'
                                            ? 'hidden'
                                            : 'published',
                                      );
                                      toast = p.status == 'published'
                                          ? 'Disembunyikan.'
                                          : 'Ditayangkan.';
                                    } else if (v == 'delete') {
                                      await _api.deleteMyProduct(
                                          ownerId: widget.ownerId,
                                          productId: p.id);
                                      toast = 'Dihapus/diarsipkan.';
                                    }
                                    await _load();
                                  } catch (e) {
                                    if (mounted) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(SnackBar(
                                              content: Text(e
                                                  .toString()
                                                  .replaceFirst(
                                                      'Exception: ', ''))));
                                    }
                                  }
                                },
                                itemBuilder: (_) => [
                                  PopupMenuItem(
                                      value: 'toggle',
                                      child: Text(p.status == 'published'
                                          ? 'Sembunyikan'
                                          : 'Tayangkan')),
                                  const PopupMenuItem(
                                      value: 'delete',
                                      child: Text('Hapus')),
                                ],
                              ),
                              onTap: () => Navigator.of(context)
                                  .push(MaterialPageRoute(
                                      builder: (_) => ProductFormScreen(
                                          ownerId: widget.ownerId,
                                          storeId: widget.storeId,
                                          productId: p.id)))
                                  .then((_) => _load()),
                            ),
                          ),
                      ],
                    ),
    );
  }
}
