import 'dart:async';
import 'package:flutter/material.dart';
import '../../../app/bottom_nav.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../shared/theme/app_theme.dart';

/// Splash Screen resmi SOUQNA — Acuan Biru UNIDA Gontor.
/// Mencegah layar blank hitam saat cold start di HP dan memuat sesi awal.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOut,
    );

    _scaleAnimation = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(
        parent: _animController,
        curve: Curves.easeOutCubic,
      ),
    );

    _animController.forward();
    _startAppInit();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _startAppInit() async {
    // Jalankan inisialisasi sesi mock & pre-cache asset secara paralel
    final authFuture = MockAuth.instance.ensureLoaded();
    final delayFuture = Future<void>.delayed(const Duration(milliseconds: 1200));

    await Future.wait([authFuture, delayFuture]);

    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder<void>(
        transitionDuration: const Duration(milliseconds: 400),
        pageBuilder: (_, __, ___) => const BottomNav(),
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.unidaNavy,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF0F3963), // UNIDA Navy sedikit terang di atas
              AppTheme.unidaNavy, // Kanonik #0B2A4A
              Color(0xFF071D34), // UNIDA Navy dark di bawah
            ],
            stops: [0.0, 0.55, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const Spacer(flex: 2),

              // Animasi Logo Tengah
              FadeTransition(
                opacity: _fadeAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Badge Logo SOUQNA
                      Container(
                        width: 128,
                        height: 128,
                        decoration: BoxDecoration(
                          color: const Color(0xFF071D34),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.unidaGold, width: 2.5),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.unidaGold.withValues(alpha: 0.25),
                              blurRadius: 24,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Image.asset(
                              'assets/images/logo-512.png',
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.storefront,
                                size: 56,
                                color: AppTheme.unidaGold,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Wordmark resmi
                      Image.asset(
                        'assets/images/logo-horizontal-white.png',
                        height: 38,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              'S',
                              style: TextStyle(
                                color: AppTheme.unidaGold,
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const Text(
                              'OUQNA',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppTheme.unidaGold,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 10),
                      // Tagline kampus
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppTheme.unidaGold.withValues(alpha: 0.4),
                            width: 1,
                          ),
                        ),
                        child: const Text(
                          'Pasar Kampus UNIDA Gontor',
                          style: TextStyle(
                            color: AppTheme.unidaGold,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const Spacer(flex: 2),

              // Indikator loading halus & info versi
              FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 32,
                      height: 32,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(AppTheme.unidaGold),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Universitas Darussalam Gontor',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.65),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'SOUQNA Mobile v0.1.0',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.35),
                        fontSize: 10,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
