import 'package:flutter/material.dart';
import 'bottom_nav.dart';

class SouqnaApp extends StatelessWidget {
  const SouqnaApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SOUQNA',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.green),
      home: const BottomNav(),
    );
  }
}
