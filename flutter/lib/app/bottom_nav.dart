import 'package:flutter/material.dart';
import '../../core/auth/mock_auth.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/profile_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/catalog/screens/category_list_screen.dart';
import '../../features/catalog/screens/home_screen.dart';
import '../../features/orders/screens/orders_screen.dart';

// Bottom nav 5 tab. Tab personal (keranjang/pesanan/akun) wajib login —
// tanpa sesi tampilkan LoginScreen (guard). Merchant via akun (M5), admin
// disembunyikan (prioritas web).
class BottomNav extends StatefulWidget {
  const BottomNav({super.key});
  @override
  State<BottomNav> createState() => _BottomNavState();
}

class _BottomNavState extends State<BottomNav> {
  int i = 0;
  final _auth = MockAuth.instance;

  static const _titles = ['Beranda', 'Kategori', 'Keranjang', 'Pesanan', 'Akun'];
  static const _needsAuth = [false, false, true, true, true];

  @override
  void initState() {
    super.initState();
    _auth.ensureLoaded();
  }

  Widget _tab(int index) {
    if (_needsAuth[index] && _auth.session.value == null) {
      return LoginScreen(notice: 'Masuk dulu untuk buka ${_titles[index]}.');
    }
    switch (index) {
      case 0:
        return const HomeScreen();
      case 1:
        return const CategoryListScreen();
      case 2:
        return const CartScreen();
      case 3:
        return const OrdersScreen();
      case 4:
        return const ProfileScreen();
      default:
        return Center(child: Text('${_titles[index]} (dummy — M${index + 1})', style: const TextStyle(fontSize: 18)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: _auth.session,
      builder: (_, __, ___) => Scaffold(
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
      ),
    );
  }
}
