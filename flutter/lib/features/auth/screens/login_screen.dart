import 'package:flutter/material.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/souqna_logo.dart';

/// Portal Masuk Civitas Kampus — Acuan Biru UNIDA Gontor.
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
    setState(() {
      err = null;
      busy = true;
    });
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
        // Brand Header Kampus
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.unidaNavy, AppTheme.unidaBlue],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: AppTheme.unidaNavy.withOpacity(0.15),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SouqnaLogo(
                size: SouqnaLogoSize.md,
                isDark: true,
                subtext: 'UNIDA Gontor',
              ),
              const SizedBox(height: 14),
              const Text(
                'Masuk ke Akun Kampus',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Gunakan akun civitas akademika UNIDA Gontor untuk belanja atau berjualan.',
                style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 12),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Notice Pengalihan Guard
        if (widget.notice != null)
          Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.warningSoft,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.warning.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: AppTheme.warning, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    widget.notice!,
                    style: const TextStyle(color: AppTheme.warning, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),

        // Error Banner
        if (err != null)
          Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.dangerSoft,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.danger.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: AppTheme.danger, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    err!,
                    style: const TextStyle(color: AppTheme.danger, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),

        // Input Email
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
                const Text('Alamat Email Kampus', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                const SizedBox(height: 8),
                TextField(
                  controller: _email,
                  decoration: const InputDecoration(
                    hintText: 'nama@kampus.ac.id',
                    prefixIcon: Icon(Icons.alternate_email, size: 20, color: AppTheme.unidaBlue),
                  ),
                ),
                const SizedBox(height: 14),
                ElevatedButton(
                  onPressed: busy ? null : () => _go(() => _auth.loginWithEmail(_email.text)),
                  child: Text(busy ? 'Memproses...' : 'Masuk Sekarang'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Preset Peran Demo Cepat
        const Text(
          'Akun Demo Terdaftar (Uji Coba Peran)',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.unidaNavy),
        ),
        const SizedBox(height: 10),
        _buildRolePresetCard(
          role: 'buyer',
          name: 'Budi Santoso',
          email: 'budi@kampus.ac.id',
          roleLabel: 'Pembeli (Mahasiswa)',
          icon: Icons.school_outlined,
          color: AppTheme.unidaBlue,
        ),
        const SizedBox(height: 8),
        _buildRolePresetCard(
          role: 'merchant',
          name: 'Siti Aminah',
          email: 'siti@kampus.ac.id',
          roleLabel: 'Pemilik Toko (Merchant SOUQNA)',
          icon: Icons.storefront,
          color: AppTheme.unidaNavy,
        ),
        const SizedBox(height: 8),
        _buildRolePresetCard(
          role: 'admin',
          name: 'Administrator Kampus',
          email: 'admin@kampus.ac.id',
          roleLabel: 'Pengelola Sistem (Admin)',
          icon: Icons.admin_panel_settings_outlined,
          color: AppTheme.warning,
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildRolePresetCard({
    required String role,
    required String name,
    required String email,
    required String roleLabel,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppTheme.border),
      ),
      child: ListTile(
        onTap: busy ? null : () => _go(() => _auth.loginAs(role)),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
        subtitle: Text('$roleLabel\n$email', style: const TextStyle(fontSize: 12, color: AppTheme.muted)),
        isThreeLine: true,
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.muted),
      ),
    );
  }
}
