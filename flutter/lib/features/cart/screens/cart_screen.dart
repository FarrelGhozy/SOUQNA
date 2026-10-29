import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import 'checkout_screen.dart';

// Keranjang multi-toko: grup per toko, ubah qty, hapus.
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
    setState(() { loading = true; err = null; });
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
    if (lines.isEmpty) return const Center(child: Text('Keranjang kosong.'));
    final groups = <String, List<CartDetailed>>{};
    for (final l in lines) {
      (groups[l.storeId] ??= []).add(l);
    }
    final total = lines.fold(0, (s, l) => s + l.lineTotal);
    final blocked = lines.where((l) => !l.purchasable).length;
    return Column(children: [
      if (err != null) Padding(padding: const EdgeInsets.all(8),
        child: Text(err!, style: const TextStyle(color: Colors.red))),
      if (blocked > 0) const Padding(padding: EdgeInsets.all(8),
        child: Text('Ada item tidak bisa checkout. Hapus dulu.', style: TextStyle(color: Colors.red))),
      Expanded(
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            for (final e in groups.entries) Card(
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(e.value.first.storeName.isEmpty ? '(toko dihapus)' : e.value.first.storeName,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  for (final l in e.value) ListTile(
                    title: Text('${l.productName} — ${l.variantLabel}'),
                    subtitle: Text('${formatIDR(l.unitPrice)} · sisa ${l.stock}'
                        '${l.blockReason != null ? ' · ${l.blockReason}' : ''}'),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(icon: const Icon(Icons.remove),
                        onPressed: () => _mutate(() => _api.updateCartItemQty(l.id, l.quantity - 1))),
                      Text('${l.quantity}'),
                      IconButton(icon: const Icon(Icons.add),
                        onPressed: () => _mutate(() => _api.updateCartItemQty(l.id, l.quantity + 1))),
                      IconButton(icon: const Icon(Icons.delete),
                        onPressed: () => _mutate(() => _api.removeCartItem(l.id))),
                    ]),
                  ),
                  Text('Subtotal toko: ${formatIDR(e.value.fold(0, (s, l) => s + l.lineTotal))}'),
                ]),
              ),
            ),
          ],
        ),
      ),
      Padding(
        padding: const EdgeInsets.all(12),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Total: ${formatIDR(total)}', style: const TextStyle(fontWeight: FontWeight.bold)),
          ElevatedButton(
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const CheckoutScreen())).then((_) => _reload()),
            child: const Text('Checkout →'),
          ),
        ]),
      ),
    ]);
  }
}
