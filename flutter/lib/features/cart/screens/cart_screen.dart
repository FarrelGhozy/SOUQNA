import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import 'checkout_screen.dart';

/// Keranjang belanja multi-toko SOUQNA — Acuan Biru UNIDA Gontor.
class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _api = ApiClient();
  bool loading = true;
  String? err;
  List<CartDetailed> lines = [];

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    setState(() {
      loading = true;
      err = null;
    });
    try {
      lines = await _api.getCartDetailed();
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _mutate(Future<void> Function() fn) async {
    setState(() => err = null);
    try {
      await fn();
      lines = await _api.getCartDetailed();
      setState(() {});
    } catch (e) {
      setState(() => err = e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (lines.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.remove_shopping_cart_outlined, size: 56, color: AppTheme.muted),
              SizedBox(height: 14),
              Text(
                'Keranjang Belanja Kosong',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.unidaNavy),
              ),
              SizedBox(height: 6),
              Text(
                'Silakan jelajahi katalog dan pilih produk yang ingin kamu pesan.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppTheme.muted),
              ),
            ],
          ),
        ),
      );
    }

    final groups = <String, List<CartDetailed>>{};
    for (final l in lines) {
      (groups[l.storeId] ??= []).add(l);
    }
    final total = lines.fold(0, (s, l) => s + l.lineTotal);
    final blocked = lines.where((l) => !l.purchasable).length;

    return Column(
      children: [
        if (err != null)
          Container(
            margin: const EdgeInsets.all(12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.dangerSoft,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(err!, style: const TextStyle(color: AppTheme.danger, fontSize: 13, fontWeight: FontWeight.w600)),
          ),
        if (blocked > 0)
          Container(
            margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.warningSoft,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: AppTheme.warning, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '$blocked item tidak dapat dicheckout (stok habis/toko nonaktif). Hapus item terlebih dahulu.',
                    style: const TextStyle(color: AppTheme.warning, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(12),
            children: [
              for (final e in groups.entries)
                Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppTheme.border),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header Toko
                        Row(
                          children: [
                            const Icon(Icons.storefront, size: 18, color: AppTheme.unidaBlue),
                            const SizedBox(width: 8),
                            Text(
                              e.value.first.storeName.isEmpty ? '(Toko telah dihapus)' : e.value.first.storeName,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.unidaNavy),
                            ),
                          ],
                        ),
                        const Divider(height: 20),

                        // List Item Toko Ini
                        for (final l in e.value)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${l.productName} — ${l.variantLabel}',
                                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.unidaText),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${formatIDR(l.unitPrice)} · Sisa stok: ${l.stock}',
                                        style: const TextStyle(fontSize: 12, color: AppTheme.muted),
                                      ),
                                      if (l.blockReason != null)
                                        Padding(
                                          padding: const EdgeInsets.only(top: 2),
                                          child: Text(
                                            l.blockReason!,
                                            style: const TextStyle(color: AppTheme.danger, fontSize: 11, fontWeight: FontWeight.w600),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                // Stepper Qty & Delete
                                Row(
                                  children: [
                                    Container(
                                      decoration: BoxDecoration(
                                        border: Border.all(color: AppTheme.border),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        children: [
                                          IconButton(
                                            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                            padding: EdgeInsets.zero,
                                            icon: const Icon(Icons.remove, size: 16),
                                            onPressed: () => _mutate(() => _api.updateCartItemQty(l.id, l.quantity - 1)),
                                          ),
                                          Text('${l.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                          IconButton(
                                            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                            padding: EdgeInsets.zero,
                                            icon: const Icon(Icons.add, size: 16),
                                            onPressed: () => _mutate(() => _api.updateCartItemQty(l.id, l.quantity + 1)),
                                          ),
                                        ],
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 20),
                                      onPressed: () => _mutate(() => _api.removeCartItem(l.id)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Subtotal Toko', style: TextStyle(fontSize: 12, color: AppTheme.muted)),
                            Text(
                              formatIDR(e.value.fold(0, (s, l) => s + l.lineTotal)),
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppTheme.unidaNavy),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),

        // Bottom Bar Checkout
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            border: const Border(top: BorderSide(color: AppTheme.border)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, -3),
              ),
            ],
          ),
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Total Pembayaran', style: TextStyle(fontSize: 12, color: AppTheme.muted)),
                    const SizedBox(height: 2),
                    Text(
                      formatIDR(total),
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppTheme.unidaNavy),
                    ),
                  ],
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.unidaBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  onPressed: blocked > 0
                      ? null
                      : () => Navigator.of(context)
                          .push(MaterialPageRoute(builder: (_) => const CheckoutScreen()))
                          .then((_) => _reload()),
                  child: const Text('Checkout (COD) →', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
