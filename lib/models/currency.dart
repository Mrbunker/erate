class Currency {
  final String code;
  final String name;
  final String flag;

  const Currency({
    required this.code,
    required this.name,
    required this.flag,
  });

  String get label => '$flag  $name $code';
}
