import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../shared/theme/app_theme.dart';

// Form Jadi Merchant: 1 akun 1 toko, tolak toko kedua.
class BecomeMerchantScreen extends StatefulWidget {
  const BecomeMerchantScreen({super.key});
  @override
  State<BecomeMerchantScreen> createState() => _BecomeMerchantScreenState();
}

class _BecomeMerchantScreenState extends State<BecomeMerchantScreen> {
  final _api = ApiClient();
  final _auth = MockAuth.instance;
  bool loading = true;
  bool busy = false;
  String? err;
  StoreMock? existing;
  final _name = TextEditingController();
  final _desc = TextEditingController();
  final _logo = TextEditingController();
  final _pickup = TextEditingController();
  bool _deliv = true;
  final _fee = TextEditingController(text: '5000');

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
      existing = await _api.getMyStore(s.id);
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Jadi Merchant'),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : existing != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                        'Akun ini sudah memiliki toko ${existing!.name} — 1 akun hanya 1 toko.'),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    if (err != null)
                      Text(err!, style: const TextStyle(color: Colors.red)),
                    TextField(controller: _name,
                        decoration: const InputDecoration(
                            labelText: 'Nama toko* (min 3 karakter)')),
                    TextField(controller: _desc,
                        decoration: const InputDecoration(labelText: 'Deskripsi')),
                    TextField(controller: _logo,
                        decoration: const InputDecoration(
                            labelText: 'Logo URL (opsional)')),
                    TextField(controller: _pickup,
                        decoration: const InputDecoration(
                            labelText: 'Lokasi pickup*')),
                    SwitchListTile(
                      title: const Text('Melayani pengantaran'),
                      value: _deliv,
                      onChanged: (v) => setState(() => _deliv = v),
                    ),
                    if (_deliv)
                      TextField(controller: _fee, keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                              labelText: 'Biaya antar (Rp)')),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: busy
                          ? null
                          : () async {
                              setState(() {
                                busy = true;
                                err = null;
                              });
                              try {
                                final s = _auth.session.value!;
                                final st = await _api.createMyStore(
                                  ownerId: s.id,
                                  name: _name.text,
                                  description: _desc.text,
                                  logoUrl: _logo.text,
                                  pickupLocation: _pickup.text,
                                  deliveryAvailable: _deliv,
                                  deliveryFee: int.tryParse(_fee.text) ?? 0,
                                );
                                await _auth.attachStore(st.id);
                                await _auth.setSellerMode(true);
                                if (context.mounted) Navigator.of(context).pop(true);
                              } catch (e) {
                                setState(() => err = e
                                    .toString()
                                    .replaceFirst('Exception: ', ''));
                              } finally {
                                if (mounted) setState(() => busy = false);
                              }
                            },
                      child: Text(busy ? 'Menyimpan...' : 'Buat toko'),
                    ),
                  ],
                ),
    );
  }
}
