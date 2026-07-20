import 'package:shared_preferences/shared_preferences.dart';

import '../data/currencies.dart';
import '../models/currency.dart';

class PrefsService {
  static const _selectedKey = 'selected_currencies_v1';

  Future<List<Currency>?> loadSelected() async {
    final prefs = await SharedPreferences.getInstance();
    final codes = prefs.getStringList(_selectedKey);
    if (codes == null) return null;
    final byCode = {for (final c in kSupportedCurrencies) c.code: c};
    final list = codes.map((c) => byCode[c]).whereType<Currency>().toList();
    return list.length >= 2 ? list : null;
  }

  Future<void> saveSelected(List<Currency> currencies) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _selectedKey,
      currencies.map((c) => c.code).toList(),
    );
  }
}
