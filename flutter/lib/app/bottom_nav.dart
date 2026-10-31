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
import '../shared/theme/app_theme.dart';
import '../shared/widgets/souqna_logo.dart';

/// Bottom navigation dua mode (Pembeli & Penjual) — Acuan Biru UNIDA Gontor.
/// Pembeli: Beranda/Kategori/Keranjang/Pesanan/Akun.
/// Penjual (hasStore + sellerMode): Ringkasan/Produk/Pesanan/Toko/Pasar.
class BottomNav extends StatefulWidget {
  const BottomNav({super.key});

  @override
  State<BottomNav> createState() => _BottomNavState();
}

class _BottomNavState extends State<BottomNav> {
  int i = 0;
  bool _wasSeller = false;
  final _auth = MockAuth.instance;

  static const _buyerTitles = [
    'SOUQNA — Pasar Kampus',
    'Kategori Produk',
    'Keranjang Belanja',
    'Pesanan Saya',
    'Profil & Pengaturan',
  ];

  static const _sellerTitles = [
    'SOUQNA Seller — Ringkasan',
    'SOUQNA Seller — Kelola Produk',
    'SOUQNA Seller — Pesanan Masuk',
    'SOUQNA Seller — Pengaturan Toko',
    'SOUQNA — Beranda Pasar',
  ];

  static const _needsAuth = [false, false, true, true, true];

  @override
  void initState() {
    super.initState();
    _auth.ensureLoaded();
    _wasSeller = _sellerMode;
  }

  bool get _sellerMode {
    final s = _auth.session.value;
    return s != null && s.hasStore && _auth.sellerMode.value;
  }

  void _exitSeller() async {
    await _auth.setSellerMode(false);
    if (mounted) {
      setState(() {
        i = 0;
        _wasSeller = false;
      });
    }
  }

  Widget _tab(int index, bool isSeller) {
    if (isSeller) {
      final s = _auth.session.value;
      if (s == null) {
        return const LoginScreen(notice: 'Masuk dulu untuk membuka panel toko.');
      }
      switch (index) {
        case 0:
          return const MerchantDashboardScreen(isEmbedded: true);
        case 1:
          return ProductListScreen(
            ownerId: s.id,
            storeId: s.storeId ?? '',
            isEmbedded: true,
          );
        case 2:
          return MerchantOrdersScreen(
            ownerId: s.id,
            isEmbedded: true,
          );
        case 3:
          return StoreProfileScreen(
            ownerId: s.id,
            isEmbedded: true,
          );
        case 4:
          return const HomeScreen();
        default:
          return const HomeScreen();
      }
    }

    if (_needsAuth[index] && _auth.session.value == null) {
      return LoginScreen(notice: 'Masuk dulu untuk membuka ${_buyerTitles[index]}.');
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
        return const HomeScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    // ignore: deprecated_member_use — Listenable.merge untuk 2 ValueNotifier.
    return ListenableBuilder(
      listenable: Listenable.merge([_auth.session, _auth.sellerMode]),
      builder: (_, __) {
        final seller = _sellerMode;

        // Reset indeks ke 0 ketika terjadi transisi antara mode pembeli dan penjual
        if (seller != _wasSeller) {
          i = 0;
          _wasSeller = seller;
        }

        if (i > 4) i = 0;

        final currentTitle = seller ? _sellerTitles[i] : _buyerTitles[i];

        return Scaffold(
          appBar: AppBar(
            toolbarHeight: 64,
            centerTitle: false,
            titleSpacing: 16,
            flexibleSpace: AppTheme.topBarFlexibleSpace,
            title: (!seller && i == 0)
                ? const SouqnaLogo(
                    size: SouqnaLogoSize.md,
                    isDark: true,
                    subtext: 'UNIDA Gontor',
                  )
                : Text(currentTitle),
            actions: [
              if (seller)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: TextButton.icon(
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.unidaGold,
                      backgroundColor: Colors.white.withOpacity(0.12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    ),
                    onPressed: _exitSeller,
                    icon: const Icon(Icons.storefront, size: 16, color: AppTheme.unidaGold),
                    label: const Text(
                      'Ke Pembeli',
                      style: TextStyle(color: AppTheme.unidaGold, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
            ],
          ),
          body: _tab(i, seller),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: i,
            type: BottomNavigationBarType.fixed,
            selectedItemColor: AppTheme.unidaGold,
            unselectedItemColor: Colors.white70,
            backgroundColor: AppTheme.unidaNavy,
            onTap: (v) async {
              if (seller && v == 4) {
                await _auth.setSellerMode(false);
                setState(() {
                  i = 0;
                  _wasSeller = false;
                });
                return;
              }
              setState(() => i = v);
            },
            items: seller
                ? const [
                    BottomNavigationBarItem(
                      icon: Icon(Icons.dashboard_outlined),
                      activeIcon: Icon(Icons.dashboard),
                      label: 'Ringkasan',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.inventory_2_outlined),
                      activeIcon: Icon(Icons.inventory_2),
                      label: 'Produk',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.receipt_long_outlined),
                      activeIcon: Icon(Icons.receipt_long),
                      label: 'Pesanan',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.settings_outlined),
                      activeIcon: Icon(Icons.settings),
                      label: 'Toko',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.storefront_outlined),
                      activeIcon: Icon(Icons.storefront),
                      label: 'Pasar',
                    ),
                  ]
                : const [
                    BottomNavigationBarItem(
                      icon: Icon(Icons.home_outlined),
                      activeIcon: Icon(Icons.home),
                      label: 'Beranda',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.category_outlined),
                      activeIcon: Icon(Icons.category),
                      label: 'Kategori',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.shopping_cart_outlined),
                      activeIcon: Icon(Icons.shopping_cart),
                      label: 'Keranjang',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.receipt_outlined),
                      activeIcon: Icon(Icons.receipt),
                      label: 'Pesanan',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.person_outline),
                      activeIcon: Icon(Icons.person),
                      label: 'Akun',
                    ),
                  ],
          ),
        );
      },
    );
  }
}
