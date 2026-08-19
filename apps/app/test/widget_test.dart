import 'package:flutter_test/flutter_test.dart';
import 'package:kurius/main.dart';

void main() {
  testWidgets('Kurius app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const KuriusApp());
    expect(find.byType(KuriusApp), findsOneWidget);
    await tester.pump(const Duration(seconds: 3));
  });
}
