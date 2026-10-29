import 'package:flutter/material.dart';
import '../../../core/auth/mock_auth.dart';

// Login dummy: email apa saja + switch peran preset. Guard mengalihkan
// ke sini bila aksi personal dibuka tanpa login.
class LoginScreen extends StatefulWidget {
  final String? notice;
  const LoginScreen({super.key, this.notice});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _auth = MockAuth.instance;
  final _email = TextEditingController(text: 'budi@kampus.ac.id');
  String? err;
  bool busy = false;

  Future<void> _go(Future<void> Function() fn) async {
    setState(() { err = null; busy = true; });
    try {
      await fn();
    } catch (e) {
      setState(() => err = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Masuk (dummy)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        if (widget.notice != null) Text(widget.notice!, style: const TextStyle(color: Colors.orange)),
        if (err != null) Text(err!, style: const TextStyle(color: Colors.red)),
        TextField(controller: _email, decoration: const InputDecoration(labelText: 'email@kampus.ac.id')),
        const SizedBox(height: 8),
        ElevatedButton(
          onPressed: busy ? null : () => _go(() => _auth.loginWithEmail(_email.text)),
          child: const Text('Masuk'),
        ),
        const Divider(height: 32),
        const Text('Demo switch peran (akun preset):', style: TextStyle(color: Colors.grey)),
        Wrap(
          spacing: 8,
          children: ['buyer', 'merchant', 'admin'].map((r) => OutlinedButton(
            onPressed: busy ? null : () => _go(() => _auth.loginAs(r)),
            child: Text(r),
          )).toList(),
        ),
      ],
    );
  }
}
