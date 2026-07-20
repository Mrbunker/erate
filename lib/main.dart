import 'package:flutter/material.dart';

import 'pages/exchange_page.dart';

void main() {
  runApp(const ErateApp());
}

class ErateApp extends StatelessWidget {
  const ErateApp({super.key});

  static const double _maxWidth = 480;
  static const Color _seed = Color(0xFF00A9A5);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '汇率转换',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: _seed, primary: _seed).copyWith(
          surface: Colors.white,
          surfaceContainerHighest: const Color(0xFFE5E7EB),
        ),
        scaffoldBackgroundColor: const Color(0xFFF6F7F8),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _seed,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0F1113),
      ),
      themeMode: ThemeMode.system,
      builder: (context, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return ColoredBox(
          color: isDark
              ? Theme.of(context).colorScheme.surfaceContainerHighest
              : const Color(0xFFE5E7EB),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: _maxWidth),
              child: child,
            ),
          ),
        );
      },
      home: const ExchangePage(),
    );
  }
}
