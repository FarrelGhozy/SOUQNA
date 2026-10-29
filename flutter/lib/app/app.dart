import 'package:flutter/material.dart';
import '../shared/theme/app_theme.dart';
import 'bottom_nav.dart';

class SouqnaApp extends StatelessWidget {
  const SouqnaApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SOUQNA',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const BottomNav(),
    );
  }
}
