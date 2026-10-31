import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
import 'order_detail_screen.dart';

/// Daftar pesanan masuk untuk toko merchant yang sedang login.
class MerchantOrdersScreen extends StatefulWidget {
  final String ownerId;
  final bool isEmbedded;

  const MerchantOrdersScreen({
    super.key,
    required this.ownerId,
    this.isEmbedded = false,
  });

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
    if (orders.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.receipt_long_outlined, size: 48, color: AppTheme.muted),
              SizedBox(height: 12),
              Text(
                'Belum Ada Pesanan Masuk',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.unidaNavy),
              ),
              SizedBox(height: 6),
              Text(
                'Pesanan COD dari pembeli akan muncul di sini untuk dikonfirmasi.',
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
                MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: o.id, isMerchant: true)),
              ).then((_) => _load()),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Baris: ID Pesanan & Tanggal
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'ID: ${o.id.toUpperCase()}',
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.unidaNavy),
                        ),
                        Text(
                          '${o.items.length} Barang',
                          style: const TextStyle(fontSize: 12, color: AppTheme.muted, fontWeight: FontWeight.w600),
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
                    // Total & Aksi
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Total Tagihan COD', style: TextStyle(fontSize: 11, color: AppTheme.muted)),
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

  @override
  Widget build(BuildContext context) {
    final body = _buildBody(context);

    if (widget.isEmbedded) {
      return body;
    }

    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Pesanan Masuk (Merchant)'),
      ),
      body: body,
    );
  }
}
