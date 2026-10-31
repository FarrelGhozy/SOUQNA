import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
import 'order_detail_screen.dart';

/// Daftar pesanan pembeli (tab Pesanan) — Acuan Biru UNIDA Gontor.
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
    setState(() {
      loading = true;
      err = null;
    });
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
              ElevatedButton(onPressed: _load, child: const Text('Muat Ulang')),
            ],
          ),
        ),
      );
    }
    if (orders.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.shopping_bag_outlined, size: 48, color: AppTheme.muted),
              SizedBox(height: 12),
              Text(
                'Belum Ada Pesanan',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.unidaNavy),
              ),
              SizedBox(height: 6),
              Text(
                'Yuk jelajahi katalog dan pesan produk dari merchant kampus UNIDA.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppTheme.muted),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final o = orders[i];
          return Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: AppTheme.border),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: o.id, isMerchant: false)),
              ).then((_) => _load()),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Baris: Toko & ID
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.storefront, size: 16, color: AppTheme.unidaBlue),
                            const SizedBox(width: 6),
                            Text(
                              o.storeName,
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.unidaNavy),
                            ),
                          ],
                        ),
                        Text(
                          'ID: ${o.id.toUpperCase()}',
                          style: const TextStyle(fontSize: 11, color: AppTheme.muted, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const Divider(height: 16),
                    // Status Lencana
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        StatusBadge.orderStatus(o.status),
                        StatusBadge.paymentStatus(o.paymentStatus),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Ringkasan Total COD
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Total Tagihan (COD)', style: TextStyle(fontSize: 11, color: AppTheme.muted)),
                            const SizedBox(height: 2),
                            Text(
                              formatIDR(o.grandTotal),
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.unidaNavy),
                            ),
                          ],
                        ),
                        Row(
                          children: const [
                            Text('Detail', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.unidaBlue)),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.unidaBlue),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
