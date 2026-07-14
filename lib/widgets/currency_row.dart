import 'package:flutter/material.dart';

import '../models/currency.dart';

class CurrencyRow extends StatelessWidget {
  const CurrencyRow({
    super.key,
    required this.currency,
    required this.amountText,
    required this.isActive,
    required this.onTap,
    required this.onPickCurrency,
  });

  final Currency currency;
  final String amountText;
  final bool isActive;
  final VoidCallback onTap;
  final VoidCallback onPickCurrency;

  static const double _selectorWidth = 120;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final amountColor = isActive ? scheme.primary : scheme.onSurface;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        child: Row(
          children: [
            SizedBox(
              width: _selectorWidth,
              child: GestureDetector(
                onTap: onPickCurrency,
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${currency.name} ${currency.code}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 16, color: scheme.onSurface),
                      ),
                    ),
                    Icon(Icons.arrow_drop_down,
                        size: 20, color: scheme.onSurfaceVariant),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                amountText,
                textAlign: TextAlign.right,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 24,
                  color: amountColor,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
