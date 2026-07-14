import 'package:flutter/material.dart';

import 'pages/exchange_page.dart';

void main() {
  runApp(const ErateApp());
}

class ErateApp extends StatelessWidget {
  const ErateApp({super.key});

  static const double _maxWidth = 480;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '汇率转换',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00A9A5),
          primary: const Color(0xFF00A9A5),
        ),
        scaffoldBackgroundColor: const Color(0xFFF6F7F8),
      ),
      builder: (context, child) => ColoredBox(
        color: const Color(0xFFE5E7EB),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: _maxWidth),
            child: child,
          ),
        ),
      ),
      home: const ExchangePage(),
    );
  }
}
