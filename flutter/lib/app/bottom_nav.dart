import 'package:flutter/material.dart';
import '../../features/catalog/screens/home_screen.dart';
import '../../features/catalog/screens/search_screen.dart';

// Bottom nav 5 tab sesuai docs/pages-ux.md. Tab 0-1 sudah mirror web (M1).
class BottomNav extends StatefulWidget {
  const BottomNav({super.key});
  @override
  State<BottomNav> createState() => _BottomNavState();
}

class _BottomNavState extends State<BottomNav> {
  int i = 0;

  static const _titles = ['Beranda', 'Kategori', 'Keranjang', 'Pesanan', 'Akun'];

  Widget _tab(int index) {
    switch (index) {
      case 0:
        return const HomeScreen();
      case 1:
        return const SearchScreen();
      default:
        return Center(child: Text('${_titles[index]} (dummy — M${index + 1})', style: const TextStyle(fontSize: 18)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SOUQNA — Pasar Kita')),
      body: _tab(i),
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
