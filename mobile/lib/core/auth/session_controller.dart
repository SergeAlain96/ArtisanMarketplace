import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionController extends ChangeNotifier {
  static const _tokenKey = 'artisan_marketplace_token';
  static const _roleKey = 'artisan_marketplace_role';
  static const _nameKey = 'artisan_marketplace_name';
  static const _emailKey = 'artisan_marketplace_email';
  static const _userIdKey = 'artisan_marketplace_user_id';

  final FlutterSecureStorage _storage;

  SessionController({FlutterSecureStorage? storage}) : _storage = storage ?? const FlutterSecureStorage();

  bool _ready = false;
  String _token = '';
  String _role = '';
  String _name = '';
  String _email = '';
  String _userId = '';

  bool get isReady => _ready;
  bool get isAuthenticated => _token.isNotEmpty;
  String get token => _token;
  String get role => _role;
  String get name => _name;
  String get email => _email;
  String get userId => _userId;

  Future<void> restore() async {
    _token = (await _storage.read(key: _tokenKey)) ?? '';
    _role = (await _storage.read(key: _roleKey)) ?? '';
    _name = (await _storage.read(key: _nameKey)) ?? '';
    _email = (await _storage.read(key: _emailKey)) ?? '';
    _userId = (await _storage.read(key: _userIdKey)) ?? '';
    _ready = true;
    notifyListeners();
  }

  Future<void> setSession({
    required String token,
    required String role,
    required String name,
    required String email,
    required String userId,
  }) async {
    _token = token;
    _role = role;
    _name = name;
    _email = email;
    _userId = userId;

    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _roleKey, value: role);
    await _storage.write(key: _nameKey, value: name);
    await _storage.write(key: _emailKey, value: email);
    await _storage.write(key: _userIdKey, value: userId);

    notifyListeners();
  }

  Future<void> clearSession() async {
    _token = '';
    _role = '';
    _name = '';
    _email = '';
    _userId = '';

    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _roleKey);
    await _storage.delete(key: _nameKey);
    await _storage.delete(key: _emailKey);
    await _storage.delete(key: _userIdKey);

    notifyListeners();
  }
}
