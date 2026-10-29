import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import 'order_detail_screen.dart';

// List order pembeli (tab Pesanan).
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _api = ApiClient();
  bool loading = true;
  String? err;
  List<OrderMock> orders = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; err = null; });
    try {
      orders = await _api.getOrders();
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (err != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(err!, style: const TextStyle(color: Colors.red)),
        TextButton(onPressed: _load, child: const Text('Muat ulang')),
      ]));
    }
    if (orders.isEmpty) return const Center(child: Text('Belum ada pesanan.'));
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          for (final o in orders) Card(
            child: ListTile(
              title: Text(o.id, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('${o.storeName} · ${o.status} · ${o.paymentStatus}\nTotal COD: ${formatIDR(o.grandTotal)}'),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: o.id, isMerchant: false)),
              ).then((_) => _load()),
            ),
          ),
        ],
      ),
    );
  }
}
