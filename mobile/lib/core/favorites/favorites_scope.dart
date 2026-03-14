import 'package:flutter/widgets.dart';

import 'favorites_controller.dart';

class FavoritesScope extends InheritedNotifier<FavoritesController> {
  const FavoritesScope({
    super.key,
    required FavoritesController favorites,
    required Widget child,
  }) : super(notifier: favorites, child: child);

  static FavoritesController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<FavoritesScope>();
    assert(scope != null, 'FavoritesScope is missing in widget tree');
    return scope!.notifier!;
  }
}
