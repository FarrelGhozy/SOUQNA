import 'package:flutter/material.dart';
import '../../../core/auth/mock_auth.dart';

// Register dummy: selalu buyer baru, tanpa pilihan role.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _auth = MockAuth.instance;
  final _name = TextEditingController();
  final _email = TextEditingController();
  String? err;
  bool busy = false;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Daftar (dummy)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const Text('Terbuka untuk siapa saja. Akun baru selalu pembeli.'),
        if (err != null) Text(err!, style: const TextStyle(color: Colors.red)),
        TextField(controller: _name, decoration: const InputDecoration(labelText: 'Nama lengkap')),
        TextField(controller: _email, decoration: const InputDecoration(labelText: 'email@kampus.ac.id')),
        const SizedBox(height: 8),
        ElevatedButton(
          onPressed: busy ? null : () async {
            setState(() { err = null; busy = true; });
            try {
              await _auth.register(_name.text, _email.text);
            } catch (e) {
              setState(() => err = e.toString().replaceFirst('Exception: ', ''));
            } finally {
              if (mounted) setState(() => busy = false);
            }
          },
          child: const Text('Daftar'),
        ),
      ],
    );
  }
}
