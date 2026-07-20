import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AboutPage extends StatefulWidget {
  const AboutPage({
    super.key,
    required this.updatedAt,
    required this.fromCache,
    required this.onRefresh,
  });

  final DateTime? updatedAt;
  final bool fromCache;
  final Future<void> Function() onRefresh;

  static const String _repoUrl = 'https://github.com/Mrbunker/erate';
  static const String _apiUrl = 'https://open.er-api.com/v6/latest/CNY';

  @override
  State<AboutPage> createState() => _AboutPageState();
}

class _AboutPageState extends State<AboutPage> {
  bool _refreshing = false;
  late DateTime? _updatedAt = widget.updatedAt;
  late bool _fromCache = widget.fromCache;

  String _formatTime(DateTime t) {
    String p(int v) => v.toString().padLeft(2, '0');
    return '${t.year}-${p(t.month)}-${p(t.day)} ${p(t.hour)}:${p(t.minute)}';
  }

  Future<void> _handleRefresh() async {
    setState(() => _refreshing = true);
    await widget.onRefresh();
    if (!mounted) return;
    setState(() {
      _refreshing = false;
      _updatedAt = DateTime.now();
      _fromCache = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('更多', style: TextStyle(fontSize: 16)),
        centerTitle: true,
        elevation: 0,
      ),
      body: ListView(
        children: [
          const _Section(title: '源码'),
          _CopyTile(
            icon: Icons.code,
            title: 'GitHub',
            subtitle: AboutPage._repoUrl,
            value: AboutPage._repoUrl,
            color: scheme.primary,
          ),
          const SizedBox(height: 12),
          const _Section(title: '汇率数据'),
          _CopyTile(
            icon: Icons.cloud_outlined,
            title: 'API 来源',
            subtitle: AboutPage._apiUrl,
            value: AboutPage._apiUrl,
            color: scheme.primary,
          ),
          ListTile(
            leading: Icon(Icons.update, color: scheme.primary),
            title: const Text('最后更新时间'),
            subtitle: Text(
              _updatedAt == null
                  ? '尚未获取'
                  : '${_formatTime(_updatedAt!)}${_fromCache ? '（缓存）' : ''}',
            ),
            trailing: _refreshing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : IconButton(
                    icon: const Icon(Icons.refresh),
                    tooltip: '刷新汇率',
                    onPressed: _handleRefresh,
                  ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _CopyTile extends StatelessWidget {
  const _CopyTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(title),
      subtitle: Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis),
      trailing: const Icon(Icons.copy, size: 18),
      onTap: () async {
        await Clipboard.setData(ClipboardData(text: value));
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('已复制到剪贴板'), duration: Duration(seconds: 1)),
        );
      },
    );
  }
}
