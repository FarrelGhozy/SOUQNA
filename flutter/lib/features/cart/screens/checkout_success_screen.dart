import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/money.dart';

// Ringkasan multi-merchant: 1 checkout → N orders independen.
class CheckoutSuccessScreen extends StatelessWidget {
  final CheckoutResult result;
  const CheckoutSuccessScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout berhasil')),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Text('Kode: ${result.code}', style: const TextStyle(fontWeight: FontWeight.bold)),
          Text('1 checkout → ${result.orders.length} pesanan (satu per toko).'),
          for (final o in result.orders) Card(
            child: ListTile(
              title: Text('${o.storeName} (${o.storeId})'),
              subtitle: Text(o.method == FulfillmentMethod.pickup ? 'Ambil sendiri' : 'Diantar merchant'),
              trailing: Text(formatIDR(o.grandTotal)),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).popUntil((r) => r.isFirst),
            child: const Text('Kembali ke Beranda'),
          ),
        ],
      ),
    );
  }
}
