import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';

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
      appBar: AppBar(title: const Text('Detail Pesanan')),
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
      padding: const EdgeInsets.all(12),
      children: [
        Text(order.id, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        Text('Status: ${order.status} · Bayar: ${order.paymentStatus} (COD)'),
        Text('Toko: ${order.storeName}'),
        Text('Total COD: ${formatIDR(order.grandTotal)}', style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('Aksi', style: TextStyle(fontWeight: FontWeight.bold)),
        Wrap(spacing: 8, children: buttons.isEmpty ? [const Text('Tidak ada aksi untuk peran/status ini.')] : buttons),
        const SizedBox(height: 8),
        const Text('Items', style: TextStyle(fontWeight: FontWeight.bold)),
        if (order.items.isEmpty) const Text('Tanpa snapshot item (order seed).', style: TextStyle(color: Colors.grey)),
        for (final it in order.items) Text('${it.name} (${it.variant}) × ${it.qty} — ${formatIDR(it.total)}'),
        const SizedBox(height: 8),
        const Text('Histori status', style: TextStyle(fontWeight: FontWeight.bold)),
        for (final h in order.history) Text('${h.from} → ${h.to}${h.note != null ? ' · ${h.note}' : ''}'),
      ],
    );
  }
}
