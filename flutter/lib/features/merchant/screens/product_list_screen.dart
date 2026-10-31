import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/product_image.dart';
import '../../../shared/widgets/status_badge.dart';
import 'product_form_screen.dart';

/// Daftar produk milik toko sendiri + kelola varian, harga, stok, dan status tayang.
class ProductListScreen extends StatefulWidget {
  final String ownerId;
  final String storeId;
  final bool isEmbedded;

  const ProductListScreen({
    super.key,
    required this.ownerId,
    required this.storeId,
    this.isEmbedded = false,
  });

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

  Widget _buildBody(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (err != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: AppTheme.danger, size: 40),
              const SizedBox(height: 12),
              Text(err!, style: const TextStyle(color: AppTheme.danger), textAlign: TextAlign.center),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _load, child: const Text('Coba Lagi')),
            ],
          ),
        ),
      );
    }
    if (products.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.inventory_2_outlined, size: 48, color: AppTheme.muted),
              const SizedBox(height: 12),
              const Text(
                'Belum Ada Produk di Toko',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.unidaNavy),
              ),
              const SizedBox(height: 6),
              const Text(
                'Tambahkan produk makanan, buku, atau jasa untuk mulai berjualan di SOUQNA.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppTheme.muted),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => Navigator.of(context)
                    .push(MaterialPageRoute(
                        builder: (_) => ProductFormScreen(ownerId: widget.ownerId, storeId: widget.storeId)))
                    .then((_) => _load()),
                icon: const Icon(Icons.add),
                label: const Text('Tambah Produk Pertama'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          if (toast != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.successSoft,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.success.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppTheme.success, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      toast!,
                      style: const TextStyle(color: AppTheme.success, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          for (final p in products)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppTheme.border),
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () => Navigator.of(context)
                    .push(MaterialPageRoute(
                        builder: (_) => ProductFormScreen(
                            ownerId: widget.ownerId, storeId: widget.storeId, productId: p.id)))
                    .then((_) => _load()),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Thumbnail
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: ProductImage(
                          p.imageUrl,
                          width: 68,
                          height: 68,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.name,
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppTheme.unidaText),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${formatIDR(p.minPrice)} · Total Stok: ${p.variants.fold(0, (a, v) => a + v.stock)}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.unidaNavy),
                            ),
                            const SizedBox(height: 6),
                            StatusBadge.productStatus(p.status),
                          ],
                        ),
                      ),
                      // Actions Menu
                      PopupMenuButton<String>(
                        icon: const Icon(Icons.more_vert, color: AppTheme.muted),
                        onSelected: (v) async {
                          try {
                            if (v == 'toggle') {
                              await _api.updateMyProduct(
                                ownerId: widget.ownerId,
                                productId: p.id,
                                status: p.status == 'published' ? 'hidden' : 'published',
                              );
                              toast = p.status == 'published'
                                  ? 'Produk berhasil disembunyikan.'
                                  : 'Produk berhasil ditayangkan ke katalog.';
                            } else if (v == 'delete') {
                              await _api.deleteMyProduct(
                                ownerId: widget.ownerId,
                                productId: p.id,
                              );
                              toast = 'Produk berhasil dihapus/diarsipkan.';
                            }
                            await _load();
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
                              );
                            }
                          }
                        },
                        itemBuilder: (_) => [
                          PopupMenuItem(
                            value: 'toggle',
                            child: Row(
                              children: [
                                Icon(
                                  p.status == 'published' ? Icons.visibility_off : Icons.visibility,
                                  size: 18,
                                  color: AppTheme.unidaNavy,
                                ),
                                const SizedBox(width: 8),
                                Text(p.status == 'published' ? 'Sembunyikan' : 'Tayangkan'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(Icons.delete_outline, size: 18, color: AppTheme.danger),
                                SizedBox(width: 8),
                                Text('Hapus Produk', style: TextStyle(color: AppTheme.danger)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final body = _buildBody(context);

    if (widget.isEmbedded) {
      return Scaffold(
        backgroundColor: Colors.transparent,
        floatingActionButton: FloatingActionButton.extended(
          backgroundColor: AppTheme.unidaBlue,
          foregroundColor: Colors.white,
          onPressed: () => Navigator.of(context)
              .push(MaterialPageRoute(
                  builder: (_) => ProductFormScreen(ownerId: widget.ownerId, storeId: widget.storeId)))
              .then((_) => _load()),
          icon: const Icon(Icons.add),
          label: const Text('Tambah Produk'),
        ),
        body: body,
      );
    }

    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: Text('Produk Saya (${products.length})'),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.unidaBlue,
        foregroundColor: Colors.white,
        onPressed: () => Navigator.of(context)
            .push(MaterialPageRoute(
                builder: (_) => ProductFormScreen(ownerId: widget.ownerId, storeId: widget.storeId)))
            .then((_) => _load()),
        child: const Icon(Icons.add),
      ),
      body: body,
    );
  }
}
