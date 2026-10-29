import 'package:flutter/material.dart';
import '../../../core/auth/mock_auth.dart';
import '../../orders/screens/merchant_orders_screen.dart';

// Profil: edit nama/telepon/lokasi, logout. Data sesi via MockAuth.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _auth = MockAuth.instance;
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _loc = TextEditingController();
  String? msg;
  String? err;
  bool saving = false;
  bool _init = false;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: _auth.session,
      builder: (_, s, __) {
        if (s == null) return const Center(child: Text('Sesi berakhir. Silakan masuk lagi.'));
        if (!_init) {
          _name.text = s.fullName;
          _phone.text = s.phone ?? '';
          _loc.text = s.defaultLocation ?? '';
          _init = true;
        }
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Profil', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text('${s.email} · ${s.role}${s.hasStore ? ' · ${s.storeId}' : ''}',
                style: const TextStyle(color: Colors.grey)),
            if (msg != null) Text(msg!, style: const TextStyle(color: Colors.green)),
            if (err != null) Text(err!, style: const TextStyle(color: Colors.red)),
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Nama')),
            TextField(controller: _phone, decoration: const InputDecoration(labelText: 'Telepon')),
            TextField(controller: _loc, decoration: const InputDecoration(labelText: 'Lokasi default')),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: saving ? null : () async {
                setState(() { saving = true; msg = null; err = null; });
                try {
                  await _auth.updateProfile(fullName: _name.text, phone: _phone.text, defaultLocation: _loc.text);
                  setState(() => msg = 'Profil tersimpan.');
                } catch (e) {
                  setState(() => err = e.toString().replaceFirst('Exception: ', ''));
                } finally {
                  if (mounted) setState(() => saving = false);
                }
              },
              child: Text(saving ? 'Menyimpan...' : 'Simpan'),
            ),
            const Divider(height: 32),
            OutlinedButton(onPressed: () => _auth.logout(), child: const Text('Keluar')),
            if (s.hasStore)
              ElevatedButton(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => MerchantOrdersScreen(ownerId: s.id))),
                child: const Text('Order toko saya'),
              ),
            if (!s.hasStore) const Text('Belum punya toko. Daftar via menu merchant (M5).',
                style: TextStyle(color: Colors.grey)),
          ],
        );
      },
    );
  }
}
