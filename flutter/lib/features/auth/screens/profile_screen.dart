import 'package:flutter/material.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../shared/theme/app_theme.dart';
import '../../merchant/screens/become_merchant_screen.dart';
import '../../wishlist/screens/wishlist_screen.dart';
import '../../chat/screens/chat_list_screen.dart';

/// Profil Pengguna & Pengaturan Akun — Acuan Biru UNIDA Gontor.
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
        if (s == null) {
          return const Center(child: Text('Sesi berakhir. Silakan masuk kembali.'));
        }
        if (!_init) {
          _name.text = s.fullName;
          _phone.text = s.phone ?? '';
          _loc.text = s.defaultLocation ?? '';
          _init = true;
        }

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Header Kartu Pengguna
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppTheme.unidaNavy,
                    child: Text(
                      s.fullName.isNotEmpty ? s.fullName.substring(0, 1).toUpperCase() : 'U',
                      style: const TextStyle(color: AppTheme.unidaGold, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s.fullName,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          s.email,
                          style: const TextStyle(fontSize: 12, color: AppTheme.muted),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.unidaGoldSoft,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppTheme.unidaGold.withOpacity(0.4)),
                          ),
                          child: Text(
                            s.role.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.unidaNavy,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Card Panel Penjual (Seller Centre)
            if (s.hasStore)
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: const BorderSide(color: AppTheme.unidaGold, width: 1.5),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.unidaGoldSoft,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.storefront, color: AppTheme.unidaNavy, size: 20),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Panel Penjual (Seller Centre)',
                                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.unidaNavy),
                                ),
                                Text(
                                  'Toko ID: ${s.storeId} · Aktif',
                                  style: const TextStyle(fontSize: 11, color: AppTheme.muted),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Beralih ke mode penjual untuk mengelola katalog, menerima pesanan COD, dan mengatur operasional tokomu.',
                        style: TextStyle(fontSize: 12, color: AppTheme.muted, height: 1.35),
                      ),
                      const SizedBox(height: 14),
                      ValueListenableBuilder(
                        valueListenable: _auth.sellerMode,
                        builder: (_, seller, __) => seller
                            ? OutlinedButton.icon(
                                onPressed: () => _auth.setSellerMode(false),
                                icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                                label: const Text('Beralih ke Mode Pembeli'),
                              )
                            : ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.unidaNavy,
                                  foregroundColor: AppTheme.unidaGold,
                                ),
                                onPressed: () => _auth.setSellerMode(true),
                                icon: const Icon(Icons.dashboard_customize_outlined, size: 18),
                                label: const Text('Buka Mode Toko (Seller Centre)'),
                              ),
                      ),
                    ],
                  ),
                ),
              )
            else
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: const BorderSide(color: AppTheme.border),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.infoSoft,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.store, color: AppTheme.unidaBlue, size: 20),
                          ),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Text(
                              'Buka Toko di SOUQNA',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.unidaNavy),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Punya usaha makanan, percetakan skripsi, atau merchandise kampus? Daftarkan tokomu sekarang!',
                        style: TextStyle(fontSize: 12, color: AppTheme.muted),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context)
                            .push(MaterialPageRoute(builder: (_) => const BecomeMerchantScreen()))
                            .then((ok) {
                          if (ok == true && mounted) setState(() => _init = false);
                        }),
                        child: const Text('Daftar Menjadi Merchant'),
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 16),

            // Card Form Edit Profil
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: const BorderSide(color: AppTheme.border),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Informasi Akun',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
                    ),
                    const SizedBox(height: 12),
                    if (msg != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: AppTheme.successSoft, borderRadius: BorderRadius.circular(8)),
                        child: Text(msg!, style: const TextStyle(color: AppTheme.success, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    if (err != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: AppTheme.dangerSoft, borderRadius: BorderRadius.circular(8)),
                        child: Text(err!, style: const TextStyle(color: AppTheme.danger, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    TextField(
                      controller: _name,
                      decoration: const InputDecoration(
                        labelText: 'Nama Lengkap',
                        prefixIcon: Icon(Icons.person_outline, size: 20),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _phone,
                      decoration: const InputDecoration(
                        labelText: 'Nomor WhatsApp / HP',
                        prefixIcon: Icon(Icons.phone_outlined, size: 20),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _loc,
                      decoration: const InputDecoration(
                        labelText: 'Lokasi Default (Asrama / Fakultas)',
                        prefixIcon: Icon(Icons.place_outlined, size: 20),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: saving
                          ? null
                          : () async {
                              setState(() {
                                saving = true;
                                msg = null;
                                err = null;
                              });
                              try {
                                await _auth.updateProfile(
                                  fullName: _name.text,
                                  phone: _phone.text,
                                  defaultLocation: _loc.text,
                                );
                                setState(() => msg = 'Profil berhasil diperbarui.');
                              } catch (e) {
                                setState(() => err = e.toString().replaceFirst('Exception: ', ''));
                              } finally {
                                if (mounted) setState(() => saving = false);
                              }
                            },
                      child: Text(saving ? 'Menyimpan...' : 'Simpan Profil'),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Card Menu Aktivitas & Bantuan
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: const BorderSide(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.favorite_outline, color: AppTheme.unidaBlue),
                    title: const Text('Wishlist Saya', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.chevron_right, color: AppTheme.muted),
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WishlistScreen())),
                  ),
                  const Divider(height: 1, indent: 56),
                  ListTile(
                    leading: const Icon(Icons.chat_bubble_outline, color: AppTheme.unidaBlue),
                    title: const Text('Pesan & Chat Toko', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.chevron_right, color: AppTheme.muted),
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ChatListScreen())),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Tombol Logout
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.danger,
                side: const BorderSide(color: AppTheme.dangerSoft),
              ),
              onPressed: () => _auth.logout(),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Keluar dari Akun'),
            ),
            const SizedBox(height: 24),
          ],
        );
      },
    );
  }
}
