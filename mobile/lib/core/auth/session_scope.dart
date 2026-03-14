import 'package:flutter/widgets.dart';
import 'session_controller.dart';

class SessionScope extends InheritedNotifier<SessionController> {
  const SessionScope({
    super.key,
    required SessionController session,
    required Widget child,
  }) : super(notifier: session, child: child);

  static SessionController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<SessionScope>();
    assert(scope != null, 'SessionScope is missing in widget tree');
    return scope!.notifier!;
  }
}
