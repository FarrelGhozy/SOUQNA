import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/product_image.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../catalog/screens/product_detail_screen.dart';

// Wishlist milik user yang login (dibuka dari menu Akun → guard login).
class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});
  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  final _api = ApiClient();
  final _auth = MockAuth.instance;
  bool loading = true;
  String? err;
  List<ProductMock> items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final uid = _auth.session.value?.id ?? '';
    if (uid.isEmpty) {
      setState(() => loading = false);
      return;
    }
    try {
      items = await _api.getWishlist(uid);
    } catch (e) {
      err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final uid = _auth.session.value?.id ?? '';
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: Text('Wishlist (${items.length})'),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : uid.isEmpty
              ? const Center(child: Text('Masuk dulu untuk membuka wishlist.'))
              : err != null
                  ? Center(child: Text(err!, style: const TextStyle(color: Colors.red)))
                  : items.isEmpty
                      ? const Center(child: Text('Belum ada favorit.'))
                      : ListView(
                          padding: const EdgeInsets.all(12),
                          children: [
                            for (final p in items)
                              Card(
                                elevation: 0,
                                margin: const EdgeInsets.only(bottom: 10),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  side: const BorderSide(color: AppTheme.border),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(10),
                                  leading: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: ProductImage(
                                      p.imageUrl,
                                      width: 56,
                                      height: 56,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  title: Text(
                                    p.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  subtitle: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const SizedBox(height: 4),
                                      Text(
                                        formatIDR(p.minPrice),
                                        style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.unidaNavy, fontSize: 13),
                                      ),
                                      const SizedBox(height: 6),
                                      StatusBadge.productStatus(p.status),
                                    ],
                                  ),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.delete_outline, color: AppTheme.danger),
                                    tooltip: 'Hapus dari Wishlist',
                                    onPressed: () async {
                                      await _api.removeFromWishlist(uid, p.id);
                                      await _load();
                                    },
                                  ),
                                  onTap: () => Navigator.of(context)
                                      .push(MaterialPageRoute(
                                          builder: (_) => ProductDetailScreen(productId: p.id)))
                                      .then((_) => _load()),
                                ),
                              ),
                          ],
                        ),
    );
  }
}
