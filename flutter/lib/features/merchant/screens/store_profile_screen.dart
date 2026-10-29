import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';

// Profil toko milik sendiri: nama/deskripsi/pickup/antar + fee.
class StoreProfileScreen extends StatefulWidget {
  final String ownerId;
  const StoreProfileScreen({super.key, required this.ownerId});
  @override
  State<StoreProfileScreen> createState() => _StoreProfileScreenState();
}

class _StoreProfileScreenState extends State<StoreProfileScreen> {
  final _api = ApiClient();
  bool loading = true;
  bool busy = false;
  String? err;
  String? msg;
  final _name = TextEditingController();
  final _desc = TextEditingController();
  final _pickup = TextEditingController();
  final _fee = TextEditingController();
  bool _deliv = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final s = await _api.getMyStore(widget.ownerId);
      if (s != null) {
        _name.text = s.name;
        _desc.text = s.description;
        _pickup.text = s.pickupLocation;
        _fee.text = s.deliveryFee.toString();
        _deliv = s.deliveryAvailable;
      }
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profil toko')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (msg != null)
                  Text(msg!, style: const TextStyle(color: Colors.green)),
                if (err != null)
                  Text(err!, style: const TextStyle(color: Colors.red)),
                TextField(controller: _name,
                    decoration:
                        const InputDecoration(labelText: 'Nama toko*')),
                TextField(controller: _desc,
                    decoration:
                        const InputDecoration(labelText: 'Deskripsi')),
                TextField(controller: _pickup,
                    decoration:
                        const InputDecoration(labelText: 'Lokasi pickup*')),
                SwitchListTile(
                  title: const Text('Melayani pengantaran'),
                  value: _deliv,
                  onChanged: (v) => setState(() => _deliv = v),
                ),
                if (_deliv)
                  TextField(controller: _fee,
                      keyboardType: TextInputType.number,
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
                            msg = null;
                          });
                          try {
                            await _api.updateMyStore(
                              ownerId: widget.ownerId,
                              name: _name.text,
                              description: _desc.text,
                              pickupLocation: _pickup.text,
                              deliveryAvailable: _deliv,
                              deliveryFee: int.tryParse(_fee.text) ?? 0,
                            );
                            setState(() => msg = 'Profil toko tersimpan.');
                          } catch (e) {
                            setState(() => err = e
                                .toString()
                                .replaceFirst('Exception: ', ''));
                          } finally {
                            if (mounted) setState(() => busy = false);
                          }
                        },
                  child: Text(busy ? 'Menyimpan...' : 'Simpan'),
                ),
              ],
            ),
    );
  }
}
