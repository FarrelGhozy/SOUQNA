import 'package:flutter/material.dart';

// Bottom nav 5 tab sesuai docs/pages-ux.md. Isi list/grid dummy parity web.
class BottomNav extends StatefulWidget {
  const BottomNav({super.key});
  @override
  State<BottomNav> createState() => _BottomNavState();
}

class _BottomNavState extends State<BottomNav> {
  int i = 0;
  static const tabs = ['Beranda', 'Kategori', 'Keranjang', 'Pesanan', 'Akun'];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SOUQNA — Pasar Kita')),
      body: Center(child: Text('${tabs[i]} (dummy — mirror web)', style: const TextStyle(fontSize: 18))),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: i,
        type: BottomNavigationBarType.fixed,
        onTap: (v) => setState(() => i = v),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Beranda'),
          BottomNavigationBarItem(icon: Icon(Icons.category), label: 'Kategori'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Keranjang'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt), label: 'Pesanan'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Akun'),
        ],
      ),
    );
  }
}
