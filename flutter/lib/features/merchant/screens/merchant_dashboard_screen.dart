import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../core/utils/money.dart';
import 'product_list_screen.dart';
import 'store_profile_screen.dart';
import '../../orders/screens/merchant_orders_screen.dart';

// Dashboard merchant ringkas: info toko + statistik.
class MerchantDashboardScreen extends StatefulWidget {
  const MerchantDashboardScreen({super.key});
  @override
  State<MerchantDashboardScreen> createState() => _MerchantDashboardScreenState();
}

class _MerchantDashboardScreenState extends State<MerchantDashboardScreen> {
  final _api = ApiClient();
  final _auth = MockAuth.instance;
  bool loading = true;
  String? err;
  StoreMock? store;
  List<ProductMock> products = [];
  List<OrderMock> orders = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final s = _auth.session.value;
    if (s == null) {
      setState(() => loading = false);
      return;
    }
    try {
      store = await _api.getMyStore(s.id);
      if (store != null) {
        products = await _api.getMyProducts(store!.id);
        orders = await _api.getMerchantOrders(s.id);
      }
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = _auth.session.value;
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard Merchant')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : err != null
              ? Center(child: Text(err!, style: const TextStyle(color: Colors.red)))
              : store == null
                  ? const Center(child: Text('Belum punya toko.'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          Text(store!.name,
                              style: const TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.bold)),
                          Text(
                              '${store!.pickupLocation} · ${store!.deliveryAvailable ? 'Antar (+${formatIDR(store!.deliveryFee)})' : 'Tanpa antar'}'),
                          const SizedBox(height: 12),
                          Wrap(spacing: 12, runSpacing: 12, children: [
                            Chip(label: Text('Produk: ${products.length}')),
                            Chip(label: Text(
                                'Order: ${orders.length} (${orders.where((o) => o.status == 'pending_merchant_confirmation').length} menunggu)')),
                            Chip(label: Text(
                                'COD: ${formatIDR(orders.where((o) => o.status != 'rejected' && o.status != 'cancelled').fold(0, (a, o) => a + o.grandTotal))}')),
                          ]),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => Navigator.of(context)
                                .push(MaterialPageRoute(
                                    builder: (_) => ProductListScreen(
                                        ownerId: s!.id, storeId: store!.id)))
                                .then((_) => _load()),
                            child: const Text('Kelola produk'),
                          ),
                          OutlinedButton(
                            onPressed: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                    builder: (_) => MerchantOrdersScreen(
                                        ownerId: s!.id))),
                            child: const Text('Order toko'),
                          ),
                          OutlinedButton(
                            onPressed: () => Navigator.of(context)
                                .push(MaterialPageRoute(
                                    builder: (_) => StoreProfileScreen(
                                        ownerId: s!.id)))
                                .then((_) => _load()),
                            child: const Text('Profil toko'),
                          ),
                        ],
                      ),
                    ),
    );
  }
}
