import 'package:flutter/material.dart';

/// Tema resmi SOUQNA — Acuan Biru UNIDA Gontor (docs/design-system.md)
class AppTheme {
  AppTheme._();

  // Brand UNIDA Tokens
  static const Color unidaNavy = Color(0xFF0B2A4A);
  static const Color unidaNavyDark = Color(0xFF071D34);
  static const Color unidaBlue = Color(0xFF1E6091);
  static const Color unidaBlueHover = Color(0xFF164E77);
  static const Color unidaGold = Color(0xFFD4AF37);
  static const Color unidaGoldSoft = Color(0xFFFBF3D9);
  static const Color unidaBg = Color(0xFFF1F5F9);
  static const Color unidaText = Color(0xFF0F172A);

  // Brand Topbar Gradient (kiri agak muda ke kanan warna navy sekarang)
  static const LinearGradient topBarGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [unidaBlue, unidaBlueHover, unidaNavy],
    stops: [0.0, 0.40, 1.0],
  );

  static const BoxDecoration topBarDecoration = BoxDecoration(
    gradient: topBarGradient,
    border: Border(
      bottom: BorderSide(color: unidaGold, width: 2),
    ),
  );

  static Widget get topBarFlexibleSpace => Container(
    decoration: topBarDecoration,
  );

  // Semantics
  static const Color surface = Colors.white;
  static const Color surfaceMuted = Color(0xFFF8FAFC);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderStrong = Color(0xFFCBD5E1);
  static const Color muted = Color(0xFF64748B);
  static const Color success = Color(0xFF15803D);
  static const Color successSoft = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFB45309);
  static const Color warningSoft = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFB91C1C);
  static const Color dangerSoft = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF0369A1);
  static const Color infoSoft = Color(0xFFE0F2FE);

  static const ColorScheme colorScheme = ColorScheme.light(
    primary: unidaBlue,
    onPrimary: Colors.white,
    secondary: unidaGold,
    onSecondary: unidaNavy,
    surface: surface,
    onSurface: unidaText,
    error: danger,
    onError: Colors.white,
  );

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: unidaBg,
      fontFamily: 'Plus Jakarta Sans',
      appBarTheme: const AppBarTheme(
        backgroundColor: unidaNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.2,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: unidaNavy,
        selectedItemColor: unidaGold,
        unselectedItemColor: Color(0xCCFFFFFF),
        selectedLabelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
        unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: unidaNavy,
        indicatorColor: unidaGoldSoft,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: unidaGold, fontWeight: FontWeight.w700, fontSize: 12);
          }
          return const TextStyle(color: Color(0xCCFFFFFF), fontWeight: FontWeight.w500, fontSize: 11);
        }),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: border, width: 1),
          borderRadius: BorderRadius.circular(12),
        ),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: unidaBlue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: danger, width: 1),
        ),
        labelStyle: const TextStyle(color: muted, fontSize: 14),
        hintStyle: const TextStyle(color: muted, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: unidaBlue,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(44),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: unidaNavy,
          side: const BorderSide(color: borderStrong),
          minimumSize: const Size.fromHeight(44),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}
