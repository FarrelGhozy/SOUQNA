import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import 'order_detail_screen.dart';

// List order milik toko merchant yang login.
class MerchantOrdersScreen extends StatefulWidget {
  final String ownerId;
  const MerchantOrdersScreen({super.key, required this.ownerId});
  @override
  State<MerchantOrdersScreen> createState() => _MerchantOrdersScreenState();
}

class _MerchantOrdersScreenState extends State<MerchantOrdersScreen> {
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
    try {
      orders = await _api.getMerchantOrders(widget.ownerId);
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order toko saya')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : err != null
              ? Center(child: Text(err!, style: const TextStyle(color: Colors.red)))
              : orders.isEmpty
                  ? const Center(child: Text('Belum ada order untuk tokomu.'))
                  : ListView(
                      padding: const EdgeInsets.all(12),
                      children: [
                        for (final o in orders) Card(
                          child: ListTile(
                            title: Text(o.id, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${o.status} · ${o.paymentStatus}\nTotal COD: ${formatIDR(o.grandTotal)}'),
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) =>
                                OrderDetailScreen(orderId: o.id, isMerchant: true)),
                            ).then((_) => _load()),
                          ),
                        ),
                      ],
                    ),
    );
  }
}
