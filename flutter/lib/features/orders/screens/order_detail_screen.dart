import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';

// Detail order: aksi kontekstual + histori. Toast jelas saat ilegal.
class OrderDetailScreen extends StatefulWidget {
  final String orderId;
  final bool isMerchant;
  const OrderDetailScreen({super.key, required this.orderId, this.isMerchant = false});
  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final _api = ApiClient();
  final _auth = MockAuth.instance;
  bool loading = true;
  bool busy = false;
  String? err;
  OrderMock? o;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; err = null; });
    try {
      o = await _api.getOrder(widget.orderId);
      if (o == null) err = 'Pesanan tidak ditemukan.';
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _act(String action, String label) async {
    setState(() => busy = true);
    try {
      final res = await _api.transitionOrder(widget.orderId, action, isMerchant: widget.isMerchant);
      setState(() => o = res);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$label berhasil.')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ));
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Detail Pesanan'),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : err != null
              ? Center(child: Text(err!, style: const TextStyle(color: Colors.red)))
              : _body(),
    );
  }

  Widget _body() {
    final order = o!;
    final pending = order.status == 'pending_merchant_confirmation';
    final accepted = order.status == 'accepted';
    final handed = order.status == 'ready_for_pickup' || order.status == 'out_for_delivery';
    final terminal = order.status == 'completed' || order.status == 'rejected' || order.status == 'cancelled';
    final buttons = <Widget>[];
    if (!widget.isMerchant && pending) {
      buttons.add(ElevatedButton(onPressed: busy ? null : () => _act('cancel', 'Pembatalan'), child: const Text('Batalkan')));
    }
    if (!widget.isMerchant && handed) {
      buttons.add(ElevatedButton(onPressed: busy ? null : () => _act('received', 'Konfirmasi terima'), child: const Text('Saya sudah terima')));
    }
    if (widget.isMerchant && pending) {
      buttons.add(ElevatedButton(onPressed: busy ? null : () => _act('accept', 'Penerimaan'), child: const Text('Terima')));
      buttons.add(OutlinedButton(onPressed: busy ? null : () => _act('reject', 'Penolakan'), child: const Text('Tolak')));
    }
    if (widget.isMerchant && accepted && order.method == FulfillmentMethod.pickup) {
      buttons.add(ElevatedButton(onPressed: busy ? null : () => _act('ready', 'Siap diambil'), child: const Text('Siap diambil')));
    }
    if (widget.isMerchant && accepted && order.method == FulfillmentMethod.merchantDelivery) {
      buttons.add(ElevatedButton(onPressed: busy ? null : () => _act('out', 'Pengantaran'), child: const Text('Antar sekarang')));
    }
    if (widget.isMerchant && order.paymentStatus == 'unpaid' && !terminal) {
      buttons.add(ElevatedButton(onPressed: busy ? null : () => _act('paid', 'Tandai lunas'), child: const Text('Tandai lunas')));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Kartu Ringkasan Status
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('ID: ${order.id.toUpperCase()}',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.unidaNavy)),
                  Text(order.storeName,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppTheme.unidaBlue)),
                ],
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  StatusBadge.orderStatus(order.status),
                  StatusBadge.paymentStatus(order.paymentStatus),
                ],
              ),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Tagihan (COD)', style: TextStyle(fontSize: 13, color: AppTheme.muted)),
                  Text(formatIDR(order.grandTotal),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Tombol Aksi Transisi
        if (buttons.isNotEmpty) ...[
          const Text('Aksi Pesanan',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy)),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 8, children: buttons),
          const SizedBox(height: 16),
        ],

        // Daftar Item Pesanan
        const Text('Daftar Item',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy)),
        const SizedBox(height: 8),
        if (order.items.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Text('Tanpa snapshot item (order seed).', style: TextStyle(color: AppTheme.muted, fontSize: 13)),
          ),
        for (final it in order.items)
          Card(
            margin: const EdgeInsets.only(bottom: 8),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: AppTheme.border),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          '${it.name} (${it.variant})',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                      ),
                      Text('× ${it.qty}', style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.muted)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(formatIDR(it.total),
                      style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.unidaNavy, fontSize: 13)),
                  if (!widget.isMerchant && order.status == 'completed' && it.id.isNotEmpty) ...[
                    const Divider(height: 16),
                    _ReviewBox(
                      api: _api,
                      buyerId: _auth.session.value?.id ?? '',
                      itemId: it.id,
                    ),
                  ],
                ],
              ),
            ),
          ),
        const SizedBox(height: 16),

        // Histori Status
        const Text('Riwayat Status Pesanan',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy)),
        const SizedBox(height: 8),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: const BorderSide(color: AppTheme.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                for (final h in order.history)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.circle, size: 8, color: AppTheme.unidaBlue),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${h.from} → ${h.to}${h.note != null ? ' (${h.note})' : ''}',
                            style: const TextStyle(fontSize: 12, color: AppTheme.unidaText),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// Ulasan per order-item: hanya bila order completed; 1 per item.
class _ReviewBox extends StatefulWidget {
  final ApiClient api;
  final String buyerId;
  final String itemId;
  const _ReviewBox(
      {required this.api, required this.buyerId, required this.itemId});
  @override
  State<_ReviewBox> createState() => _ReviewBoxState();
}

class _ReviewBoxState extends State<_ReviewBox> {
  ReviewMock? review;
  int rating = 5;
  final _text = TextEditingController();
  bool done = false;

  @override
  void initState() {
    super.initState();
    widget.api.getReviewForItem(widget.itemId).then((r) {
      if (mounted) setState(() => review = r);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (review != null) {
      return Text(
          'Ulasanmu: ${'★' * review!.rating}${'☆' * (5 - review!.rating)} ${review!.text}',
          style: const TextStyle(color: Colors.grey, fontSize: 12));
    }
    if (done) return const SizedBox.shrink();
    return Row(
      children: [
        DropdownButton<int>(
          value: rating,
          items: [for (var i = 5; i >= 1; i--) DropdownMenuItem(value: i, child: Text('$i ★'))],
          onChanged: (v) => setState(() => rating = v ?? 5),
        ),
        Expanded(
          child: TextField(
              controller: _text,
              maxLength: 500,
              decoration: const InputDecoration(
                  hintText: 'Ulasan (opsional)', counterText: '')),
        ),
        IconButton(
          icon: const Icon(Icons.send),
          onPressed: () async {
            try {
              final r = await widget.api.createReview(
                buyerId: widget.buyerId,
                orderItemId: widget.itemId,
                rating: rating,
                text: _text.text,
              );
              setState(() {
                review = r;
                done = true;
              });
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Ulasan tersimpan.')));
              }
            } catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content:
                        Text(e.toString().replaceFirst('Exception: ', ''))));
              }
            }
          },
        ),
      ],
    );
  }
}
