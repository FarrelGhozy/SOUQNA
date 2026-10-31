import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import 'product_list_screen.dart';
import 'store_profile_screen.dart';
import '../../orders/screens/merchant_orders_screen.dart';

/// Dashboard merchant profesional: ringkasan metrik toko, pesanan COD, & pintasan cepat.
class MerchantDashboardScreen extends StatefulWidget {
  final bool isEmbedded;
  const MerchantDashboardScreen({super.key, this.isEmbedded = false});

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

  Widget _buildBody(BuildContext context, UserMock? s) {
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
    if (store == null) {
      return const Center(child: Text('Belum memiliki toko aktif di SOUQNA.'));
    }

    final pendingCount = orders.where((o) => o.status == 'pending_merchant_confirmation').length;
    final totalCOD = orders
        .where((o) => o.status != 'rejected' && o.status != 'cancelled')
        .fold(0, (a, o) => a + o.grandTotal);

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner Info Toko
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.unidaNavy, AppTheme.unidaBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.unidaNavy.withOpacity(0.12),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.storefront, color: AppTheme.unidaGold, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            store!.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Lokasi: ${store!.pickupLocation}',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.85),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: store!.deliveryAvailable ? AppTheme.unidaGold : Colors.white24,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    store!.deliveryAvailable
                        ? 'Pengantaran Aktif (+${formatIDR(store!.deliveryFee)})'
                        : 'Khusus Ambil di Tempat (Pickup)',
                    style: TextStyle(
                      color: store!.deliveryAvailable ? AppTheme.unidaNavy : Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Metrik / KPI Ringkasan
          const Text(
            'Ringkasan Performa Toko',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.unidaNavy),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.inventory_2_outlined,
                  color: AppTheme.unidaBlue,
                  label: 'Produk Aktif',
                  value: '${products.length}',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.notifications_active_outlined,
                  color: pendingCount > 0 ? AppTheme.warning : AppTheme.muted,
                  label: 'Perlu Konfirmasi',
                  value: '$pendingCount',
                  highlight: pendingCount > 0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildMetricCard(
            icon: Icons.payments_outlined,
            color: AppTheme.success,
            label: 'Total Estimasi Omzet COD',
            value: formatIDR(totalCOD),
          ),
          const SizedBox(height: 24),

          // Pintasan Navigasi Toko
          const Text(
            'Kelola Operasional',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.unidaNavy),
          ),
          const SizedBox(height: 12),
          _buildActionTile(
            context,
            icon: Icons.inventory,
            title: 'Katalog Produk Toko',
            subtitle: 'Tambah, edit harga varian, ubah stok, & kelola tayang',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => ProductListScreen(ownerId: s!.id, storeId: store!.id)),
            ).then((_) => _load()),
          ),
          const SizedBox(height: 8),
          _buildActionTile(
            context,
            icon: Icons.receipt_long,
            title: 'Pesanan Masuk COD',
            subtitle: 'Konfirmasi pesanan baru, proses pengantaran & terima pelunasan',
            trailingBadge: pendingCount > 0 ? '$pendingCount Baru' : null,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => MerchantOrdersScreen(ownerId: s!.id)),
            ).then((_) => _load()),
          ),
          const SizedBox(height: 8),
          _buildActionTile(
            context,
            icon: Icons.settings,
            title: 'Pengaturan & Profil Toko',
            subtitle: 'Ubah jam operasional, lokasi pickup, dan ongkos kirim',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => StoreProfileScreen(ownerId: s!.id)),
            ).then((_) => _load()),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required IconData icon,
    required Color color,
    required String label,
    required String value,
    bool highlight = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: highlight ? AppTheme.warning : AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.muted)),
              Icon(icon, size: 18, color: color),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: highlight ? AppTheme.warning : AppTheme.unidaNavy,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    String? trailingBadge,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppTheme.border),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.infoSoft,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppTheme.unidaBlue, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppTheme.muted)),
        trailing: trailingBadge != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.warningSoft,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  trailingBadge,
                  style: const TextStyle(color: AppTheme.warning, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              )
            : const Icon(Icons.chevron_right, color: AppTheme.muted),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = _auth.session.value;
    final body = _buildBody(context, s);

    if (widget.isEmbedded) {
      return body;
    }

    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Dashboard Merchant'),
        actions: [
          TextButton.icon(
            onPressed: () async {
              await _auth.setSellerMode(false);
              if (context.mounted) Navigator.of(context).popUntil((r) => r.isFirst);
            },
            icon: const Icon(Icons.storefront, color: Colors.white, size: 16),
            label: const Text('Ke Pembeli', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: body,
    );
  }
}
