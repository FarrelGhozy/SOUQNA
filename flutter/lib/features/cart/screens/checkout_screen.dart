import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';
import '../../../shared/theme/app_theme.dart';
import 'checkout_success_screen.dart';

// Checkout: pilih pickup/diantar per toko + lokasi, kode voucher, preview total.
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});
  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _api = ApiClient();
  final _code = TextEditingController();
  final _note = TextEditingController();
  final _loc = <String, TextEditingController>{};
  bool loading = true;
  bool submitting = false;
  String? err;
  List<CartDetailed> lines = [];
  final methods = <String, FulfillmentMethod>{};
  CheckoutPreview? preview;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      lines = await _api.getCartDetailed();
      for (final l in lines) {
        methods.putIfAbsent(l.storeId, () => FulfillmentMethod.pickup);
        _loc.putIfAbsent(l.storeId, () => TextEditingController());
      }
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Map<String, String> get _locations =>
      {for (final e in _loc.entries) e.key: e.value.text};

  Future<void> _recheck() async {
    setState(() { err = null; });
    try {
      final p = _api.validateCheckout(items: lines.map((l) =>
        CartLine(id: l.id, variantId: l.variantId, quantity: l.quantity)).toList(),
        methods: methods, locations: _locations,
        voucherCode: _code.text.isEmpty ? null : _code.text);
      setState(() => preview = p);
    } catch (e) {
      setState(() {
        preview = null;
        err = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Checkout COD'),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : lines.isEmpty
              ? const Center(child: Text('Keranjang kosong.'))
              : ListView(
                  padding: const EdgeInsets.all(12),
                  children: [
                    for (final sid in methods.keys) Card(
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(lines.firstWhere((l) => l.storeId == sid).storeName,
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                          Row(children: [
                            ChoiceChip(label: const Text('Ambil sendiri'),
                              selected: methods[sid] == FulfillmentMethod.pickup,
                              onSelected: (_) => setState(() {
                                methods[sid] = FulfillmentMethod.pickup;
                                preview = null;
                              })),
                            const SizedBox(width: 8),
                            ChoiceChip(label: const Text('Diantar'),
                              selected: methods[sid] == FulfillmentMethod.merchantDelivery,
                              onSelected: (_) => setState(() {
                                methods[sid] = FulfillmentMethod.merchantDelivery;
                                preview = null;
                              })),
                          ]),
                          if (methods[sid] == FulfillmentMethod.merchantDelivery)
                            TextField(controller: _loc[sid],
                              decoration: const InputDecoration(labelText: 'Lokasi serah terima'),
                              onChanged: (_) => setState(() => preview = null)),
                        ]),
                      ),
                    ),
                    TextField(controller: _code,
                      decoration: const InputDecoration(labelText: 'Kode voucher (opsional)'),
                      onChanged: (_) => setState(() => preview = null)),
                    const SizedBox(height: 8),
                    Row(children: [
                      ElevatedButton(onPressed: _recheck, child: const Text('Hitung total')),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: submitting ? null : () async {
                          setState(() { submitting = true; err = null; });
                          try {
                            final r = await _api.checkout(methods: methods,
                              locations: _locations,
                              voucherCode: _code.text.isEmpty ? null : _code.text);
                            if (context.mounted) {
                              Navigator.of(context).pushReplacement(MaterialPageRoute(
                                builder: (_) => CheckoutSuccessScreen(result: r)));
                            }
                          } catch (e) {
                            setState(() {
                              err = e.toString().replaceFirst('Exception: ', '');
                              preview = null;
                            });
                          } finally {
                            if (mounted) setState(() => submitting = false);
                          }
                        },
                        child: Text(submitting ? 'Memproses...' : 'Buat pesanan COD'),
                      ),
                    ]),
                    if (err != null) Text(err!, style: const TextStyle(color: Colors.red)),
                    if (preview != null) Card(
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          const Text('Ringkasan', style: TextStyle(fontWeight: FontWeight.bold)),
                          for (final ps in preview!.perStore)
                            Text('${ps.storeName}: ${formatIDR(ps.subtotal)} − ${formatIDR(ps.discount)} + ${formatIDR(ps.deliveryFee)} = ${formatIDR(ps.total)}'),
                          Text('Total COD: ${formatIDR(preview!.grandTotal)}',
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                        ]),
                      ),
                    ),
                  ],
                ),
    );
  }
}
