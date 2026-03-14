import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class FavoritesController extends ChangeNotifier {
  static const _productsKey = 'artisan_marketplace_favorite_products';
  static const _artisansKey = 'artisan_marketplace_favorite_artisans';

  final FlutterSecureStorage _storage;

  FavoritesController({FlutterSecureStorage? storage}) : _storage = storage ?? const FlutterSecureStorage();

  bool _ready = false;
  Map<String, Map<String, dynamic>> _productFavorites = <String, Map<String, dynamic>>{};
  Map<String, Map<String, dynamic>> _artisanFavorites = <String, Map<String, dynamic>>{};

  bool get isReady => _ready;
  List<Map<String, dynamic>> get productItems => _productFavorites.values.toList();
  List<Map<String, dynamic>> get artisanItems => _artisanFavorites.values.toList();

  Future<void> restore() async {
    _productFavorites = _decode(await _storage.read(key: _productsKey));
    _artisanFavorites = _decode(await _storage.read(key: _artisansKey));
    _ready = true;
    notifyListeners();
  }

  bool isProductFavorite(String id) => _productFavorites.containsKey(id);
  bool isArtisanFavorite(String id) => _artisanFavorites.containsKey(id);

  Future<void> toggleProduct(Map<String, dynamic> item) async {
    final id = (item['id'] ?? '').toString();
    if (id.isEmpty) return;

    if (_productFavorites.containsKey(id)) {
      _productFavorites.remove(id);
    } else {
      _productFavorites[id] = Map<String, dynamic>.from(item);
    }

    await _persist();
  }

  Future<void> toggleArtisan(Map<String, dynamic> item) async {
    final id = (item['id'] ?? '').toString();
    if (id.isEmpty) return;

    if (_artisanFavorites.containsKey(id)) {
      _artisanFavorites.remove(id);
    } else {
      _artisanFavorites[id] = Map<String, dynamic>.from(item);
    }

    await _persist();
  }

  Map<String, Map<String, dynamic>> _decode(String? raw) {
    if (raw == null || raw.isEmpty) return <String, Map<String, dynamic>>{};

    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    return decoded.map((key, value) => MapEntry(key, Map<String, dynamic>.from(value as Map)));
  }

  Future<void> _persist() async {
    await _storage.write(key: _productsKey, value: jsonEncode(_productFavorites));
    await _storage.write(key: _artisansKey, value: jsonEncode(_artisanFavorites));
    notifyListeners();
  }
}
