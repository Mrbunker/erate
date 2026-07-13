import 'package:flutter_test/flutter_test.dart';

import 'package:erate/main.dart';

void main() {
  testWidgets('renders exchange page with default currencies', (tester) async {
    await tester.pumpWidget(const ErateApp());
    expect(find.text('汇率转换'), findsOneWidget);
    expect(find.textContaining('CNY'), findsOneWidget);
    expect(find.text('AC'), findsOneWidget);
  });
}
