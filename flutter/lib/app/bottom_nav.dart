import 'package:flutter/material.dart';
import '../../core/auth/mock_auth.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/profile_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/catalog/screens/category_list_screen.dart';
import '../../features/catalog/screens/home_screen.dart';
import '../../features/merchant/screens/merchant_dashboard_screen.dart';
import '../../features/merchant/screens/product_list_screen.dart';
import '../../features/merchant/screens/store_profile_screen.dart';
import '../../features/orders/screens/merchant_orders_screen.dart';
import '../../features/orders/screens/orders_screen.dart';

// Bottom nav dua mode. Pembeli: Beranda/Kategori/Keranjang/Pesanan/Akun.
// Penjual (hasStore + sellerMode): Ringkasan/Produk/Pesanan/Toko/Pasar.
// Tab personal wajib login — tanpa sesi tampilkan LoginScreen (guard).
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

  bool get _sellerMode {
    final s = _auth.session.value;
    return s != null && s.hasStore && _auth.sellerMode.value;
  }

  void _exitSeller() async {
    await _auth.setSellerMode(false);
    if (mounted) setState(() => i = 0);
  }

  Widget _tab(int index) {
    if (_sellerMode) {
      final s = _auth.session.value;
      if (s == null) return const LoginScreen(notice: 'Masuk dulu untuk buka panel toko.');
      switch (index) {
        case 0:
          return const MerchantDashboardScreen();
        case 1:
          return ProductListScreen(ownerId: s.id, storeId: s.storeId ?? '');
        case 2:
          return MerchantOrdersScreen(ownerId: s.id);
        case 3:
          return StoreProfileScreen(ownerId: s.id);
        case 4:
          // Tab Pasar: keluar mode penjual, tampilkan beranda pembeli.
          return const HomeScreen();
        default:
          return const HomeScreen();
      }
    }
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
    // ignore: deprecated_member_use — Listenable.merge untuk 2 ValueNotifier.
    return ListenableBuilder(
      listenable: Listenable.merge([_auth.session, _auth.sellerMode]),
      builder: (_, __) {
        final seller = _sellerMode;
        if (i > 4) i = 0;
        return Scaffold(
          appBar: AppBar(
            title: Text(seller ? 'SOUQNA Seller — Mode Toko' : 'SOUQNA — Pasar Kita'),
            actions: [
              if (seller)
                TextButton(
                  onPressed: _exitSeller,
                  child: const Text('Ke Pembeli', style: TextStyle(color: Colors.white)),
                ),
            ],
          ),
          body: _tab(i),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: i,
            type: BottomNavigationBarType.fixed,
            onTap: (v) async {
              if (seller && v == 4) {
                await _auth.setSellerMode(false);
              }
              setState(() => i = v == 4 && seller ? 0 : v);
            },
            items: seller
                ? const [
                    BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Ringkasan'),
                    BottomNavigationBarItem(icon: Icon(Icons.store), label: 'Produk'),
                    BottomNavigationBarItem(icon: Icon(Icons.receipt), label: 'Pesanan'),
                    BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Toko'),
                    BottomNavigationBarItem(icon: Icon(Icons.storefront), label: 'Pasar'),
                  ]
                : const [
                    BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Beranda'),
                    BottomNavigationBarItem(icon: Icon(Icons.category), label: 'Kategori'),
                    BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Keranjang'),
                    BottomNavigationBarItem(icon: Icon(Icons.receipt), label: 'Pesanan'),
                    BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Akun'),
                  ],
          ),
        );
      },
    );
  }
}
