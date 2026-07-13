import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../data/currencies.dart';

class RateSnapshot {
  final Map<String, double> ratesToCny;
  final DateTime updatedAt;
  final bool fromCache;

  const RateSnapshot({
    required this.ratesToCny,
    required this.updatedAt,
    required this.fromCache,
  });
}

class RateService {
  static const _endpoint = 'https://open.er-api.com/v6/latest/CNY';
  static const _cacheKey = 'rates_cache_v1';
  static const _cacheTimeKey = 'rates_cache_time_v1';
  static const Duration refreshInterval = Duration(hours: 6);

  Future<RateSnapshot> load({bool forceRefresh = false}) async {
    final prefs = await SharedPreferences.getInstance();
    final cachedAtMs = prefs.getInt(_cacheTimeKey);
    final cachedJson = prefs.getString(_cacheKey);
    final now = DateTime.now();

    if (!forceRefresh && cachedAtMs != null && cachedJson != null) {
      final cachedAt = DateTime.fromMillisecondsSinceEpoch(cachedAtMs);
      if (now.difference(cachedAt) < refreshInterval) {
        return RateSnapshot(
          ratesToCny: _decode(cachedJson),
          updatedAt: cachedAt,
          fromCache: true,
        );
      }
    }

    try {
      final rates = await _fetchRemote();
      await prefs.setString(_cacheKey, jsonEncode(rates));
      await prefs.setInt(_cacheTimeKey, now.millisecondsSinceEpoch);
      return RateSnapshot(ratesToCny: rates, updatedAt: now, fromCache: false);
    } catch (_) {
      if (cachedJson != null && cachedAtMs != null) {
        return RateSnapshot(
          ratesToCny: _decode(cachedJson),
          updatedAt: DateTime.fromMillisecondsSinceEpoch(cachedAtMs),
          fromCache: true,
        );
      }
      return RateSnapshot(
        ratesToCny: Map.of(kFallbackRatesToCny),
        updatedAt: now,
        fromCache: true,
      );
    }
  }

  Future<Map<String, double>> _fetchRemote() async {
    final res = await http
        .get(Uri.parse(_endpoint))
        .timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) {
      throw Exception('rate api ${res.statusCode}');
    }
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (body['result'] != 'success') {
      throw Exception('rate api ${body['result']}');
    }
    final raw = body['rates'] as Map<String, dynamic>;
    final result = <String, double>{};
    for (final currency in kSupportedCurrencies) {
      final v = raw[currency.code];
      if (v is num) result[currency.code] = v.toDouble();
    }
    if (!result.containsKey('CNY')) result['CNY'] = 1.0;
    return result;
  }

  Map<String, double> _decode(String raw) {
    final map = jsonDecode(raw) as Map<String, dynamic>;
    return map.map((k, v) => MapEntry(k, (v as num).toDouble()));
  }
}
