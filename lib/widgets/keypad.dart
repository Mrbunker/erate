import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class Keypad extends StatelessWidget {
  const Keypad({
    super.key,
    required this.onInput,
    required this.onClear,
    required this.onBackspace,
  });

  final ValueChanged<String> onInput;
  final VoidCallback onClear;
  final VoidCallback onBackspace;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(kAppRadius * 2),
          topRight: Radius.circular(kAppRadius * 2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Material(
        color: scheme.surface,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(kAppRadius * 2),
          topRight: Radius.circular(kAppRadius * 2),
        ),
        clipBehavior: Clip.antiAlias,
        child: SizedBox(
          height: 320,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Column(
                    children: [
                      _buildNumRow(['7', '8', '9']),
                      _buildNumRow(['4', '5', '6']),
                      _buildNumRow(['1', '2', '3']),
                      _buildNumRow(['', '0', '.']),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
                    child: Column(
                      children: [
                        Expanded(
                          child: _SideKey(
                            label: 'AC',
                            color: scheme.primary,
                            onTap: onClear,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Expanded(
                          child: _SideKey(
                            icon: Icons.backspace_outlined,
                            color: scheme.primary,
                            onTap: onBackspace,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNumRow(List<String> keys) {
    return Expanded(
      child: Row(
        children: keys
            .map(
              (k) => Expanded(
                child: _NumKey(
                  label: k,
                  onTap: k.isEmpty ? null : () => onInput(k),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _NumKey extends StatelessWidget {
  const _NumKey({required this.label, this.onTap});

  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: kAppBorderRadius,
      child: Center(
        child: Text(
          label,
          style: TextStyle(
            fontSize: 32,
            color: Theme.of(context).colorScheme.onSurface,
            fontWeight: FontWeight.w300,
          ),
        ),
      ),
    );
  }
}

class _SideKey extends StatelessWidget {
  const _SideKey({
    this.label,
    this.icon,
    required this.color,
    required this.onTap,
  });

  final String? label;
  final IconData? icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: kAppBorderRadius,
      child: InkWell(
        borderRadius: kAppBorderRadius,
        onTap: onTap,
        child: Center(
          child: icon != null
              ? Icon(icon, color: color, size: 28)
              : Text(
                  label!,
                  style: TextStyle(
                    fontSize: 28,
                    color: color,
                    fontWeight: FontWeight.w500,
                  ),
                ),
        ),
      ),
    );
  }
}
