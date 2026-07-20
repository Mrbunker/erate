import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../data/currencies.dart';
import '../models/currency.dart';
import '../services/prefs_service.dart';
import '../services/rate_service.dart';
import '../widgets/currency_row.dart';
import '../widgets/keypad.dart';
import 'about_page.dart';

class ExchangePage extends StatefulWidget {
  const ExchangePage({super.key});

  @override
  State<ExchangePage> createState() => _ExchangePageState();
}

class _ExchangePageState extends State<ExchangePage> {
  final RateService _rateService = RateService();
  final PrefsService _prefsService = PrefsService();
  final FocusNode _keyFocus = FocusNode();

  final List<Currency> _selected = [
    kSupportedCurrencies[0],
    kSupportedCurrencies[1],
    kSupportedCurrencies[2],
  ];
  int _activeIndex = 0;
  String _input = '1';
  bool _pendingReplace = true;

  Map<String, double> _rates = Map.of(kFallbackRatesToCny);
  bool _loading = false;
  DateTime? _updatedAt;
  bool _fromCache = false;

  @override
  void initState() {
    super.initState();
    _restoreSelected();
    _refresh();
  }

  Future<void> _restoreSelected() async {
    final saved = await _prefsService.loadSelected();
    if (!mounted || saved == null) return;
    setState(() {
      _selected
        ..clear()
        ..addAll(saved);
      _activeIndex = 0;
    });
  }

  void _persistSelected() {
    _prefsService.saveSelected(_selected);
  }

  @override
  void dispose() {
    _keyFocus.dispose();
    super.dispose();
  }

  Future<void> _refresh({bool force = false}) async {
    setState(() => _loading = true);
    final snap = await _rateService.load(forceRefresh: force);
    if (!mounted) return;
    setState(() {
      _rates = snap.ratesToCny;
      _updatedAt = snap.updatedAt;
      _fromCache = snap.fromCache;
      _loading = false;
    });
    if (force && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(snap.fromCache ? '刷新失败，已使用缓存数据' : '汇率已更新'),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  double get _activeAmount => double.tryParse(_input) ?? 0;

  double _convert(Currency from, Currency to, double amount) {
    final fromRate = _rates[from.code];
    final toRate = _rates[to.code];
    if (fromRate == null || toRate == null || fromRate == 0) return 0;
    final cny = amount / fromRate;
    return cny * toRate;
  }

  String _format(double value, {bool isActive = false}) {
    if (isActive) return _input;
    if (value == 0) return '0';
    final abs = value.abs();
    final digits = abs >= 100 ? 2 : (abs >= 1 ? 4 : 6);
    var text = value.toStringAsFixed(digits);
    if (text.contains('.')) {
      text = text.replaceAll(RegExp(r'0+$'), '').replaceAll(RegExp(r'\.$'), '');
    }
    return text.isEmpty ? '0' : text;
  }

  void _onInput(String key) {
    setState(() {
      if (_pendingReplace) {
        _input = key == '.' ? '0.' : key;
        _pendingReplace = false;
        return;
      }
      if (key == '.') {
        if (!_input.contains('.')) _input = '$_input.';
        return;
      }
      if (_input == '0') {
        _input = key;
      } else if (_input.length < 12) {
        _input = '$_input$key';
      }
    });
  }

  void _onClear() => setState(() {
        _input = '0';
        _pendingReplace = false;
      });

  void _onBackspace() {
    setState(() {
      _pendingReplace = false;
      _input = _input.length <= 1 ? '0' : _input.substring(0, _input.length - 1);
    });
  }

  KeyEventResult _handleKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
      return KeyEventResult.ignored;
    }
    final ch = event.character;
    if (ch != null && RegExp(r'[0-9]').hasMatch(ch)) {
      _onInput(ch);
      return KeyEventResult.handled;
    }
    if (ch == '.') {
      _onInput('.');
      return KeyEventResult.handled;
    }
    if (event.logicalKey.keyLabel == 'Backspace') {
      _onBackspace();
      return KeyEventResult.handled;
    }
    if (event.logicalKey.keyLabel == 'Escape' ||
        event.logicalKey.keyLabel == 'Delete') {
      _onClear();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  void _switchActive(int index) {
    if (index == _activeIndex) return;
    setState(() {
      _activeIndex = index;
      _pendingReplace = true;
    });
  }

  Future<void> _pickCurrency(int index) async {
    final picked = await showModalBottomSheet<Currency>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (_) => _CurrencyPicker(
        selectedCodes: _selected.map((c) => c.code).toSet(),
        currentCode: _selected[index].code,
      ),
    );
    if (picked != null) {
      setState(() => _selected[index] = picked);
      _persistSelected();
    }
  }

  Future<void> _addRow() async {
    final picked = await showModalBottomSheet<Currency>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (_) => _CurrencyPicker(
        selectedCodes: _selected.map((c) => c.code).toSet(),
      ),
    );
    if (picked != null) {
      setState(() => _selected.add(picked));
      _persistSelected();
    }
  }

  void _removeRow(int index) {
    if (_selected.length <= 2) return;
    setState(() {
      _selected.removeAt(index);
      if (_activeIndex >= _selected.length) _activeIndex = 0;
    });
    _persistSelected();
  }

  void _openAbout() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AboutPage(updatedAt: _updatedAt, fromCache: _fromCache),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final active = _selected[_activeIndex];
    return Focus(
      focusNode: _keyFocus,
      autofocus: true,
      onKeyEvent: _handleKey,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('汇率转换', style: TextStyle(fontSize: 16)),
          centerTitle: true,
          backgroundColor: theme.scaffoldBackgroundColor,
          elevation: 0,
          actions: [
            IconButton(
              icon: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.refresh),
              tooltip: '刷新汇率',
              onPressed: _loading ? null : () => _refresh(force: true),
            ),
            IconButton(
              icon: const Icon(Icons.add),
              tooltip: '添加币种',
              onPressed: _addRow,
            ),
            IconButton(
              icon: const Icon(Icons.more_horiz),
              tooltip: '关于',
              onPressed: _openAbout,
            ),
          ],
        ),
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: _selected.length,
                  itemBuilder: (context, index) {
                    final currency = _selected[index];
                    final isActive = index == _activeIndex;
                    final amount = isActive
                        ? _activeAmount
                        : _convert(active, currency, _activeAmount);
                    return Dismissible(
                      key: ValueKey('${currency.code}-$index'),
                      direction: _selected.length > 2
                          ? DismissDirection.endToStart
                          : DismissDirection.none,
                      background: Container(
                        color: scheme.errorContainer,
                        alignment: Alignment.centerRight,
                        padding: const EdgeInsets.only(right: 20),
                        child: Icon(Icons.delete, color: scheme.onErrorContainer),
                      ),
                      onDismissed: (_) => _removeRow(index),
                      child: CurrencyRow(
                        currency: currency,
                        amountText: _format(amount, isActive: isActive),
                        isActive: isActive,
                        onTap: () => _switchActive(index),
                        onPickCurrency: () => _pickCurrency(index),
                      ),
                    );
                  },
                ),
              ),
              Keypad(
                onInput: _onInput,
                onClear: _onClear,
                onBackspace: _onBackspace,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CurrencyPicker extends StatelessWidget {
  const _CurrencyPicker({required this.selectedCodes, this.currentCode});

  final Set<String> selectedCodes;
  final String? currentCode;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.6,
        child: ListView.separated(
          itemCount: kSupportedCurrencies.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final currency = kSupportedCurrencies[index];
            final disabled = selectedCodes.contains(currency.code) &&
                currency.code != currentCode;
            return ListTile(
              leading: Text(currency.flag, style: const TextStyle(fontSize: 24)),
              title: Text('${currency.name} ${currency.code}'),
              trailing: currency.code == currentCode
                  ? Icon(Icons.check, color: Theme.of(context).colorScheme.primary)
                  : null,
              enabled: !disabled,
              onTap: disabled ? null : () => Navigator.pop(context, currency),
            );
          },
        ),
      ),
    );
  }
}
