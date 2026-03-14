import 'package:flutter/material.dart';
import 'core/auth/session_controller.dart';
import 'core/auth/session_scope.dart';
import 'core/favorites/favorites_controller.dart';
import 'core/favorites/favorites_scope.dart';
import 'core/theme.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/role_guard.dart';
import 'features/auth/register_screen.dart';
import 'features/artisans/artisan_profile_screen.dart';
import 'features/artisans/artisan_screen.dart';
import 'features/dashboard/admin_dashboard_screen.dart';
import 'features/dashboard/artisan_dashboard_screen.dart';
import 'features/favorites/favorites_screen.dart';
import 'features/home/home_screen.dart';
import 'features/products/product_screen.dart';

class ArtisanMarketplaceApp extends StatefulWidget {
  final String apiBaseUrl;

  const ArtisanMarketplaceApp({super.key, required this.apiBaseUrl});

  @override
  State<ArtisanMarketplaceApp> createState() => _ArtisanMarketplaceAppState();
}

class _ArtisanMarketplaceAppState extends State<ArtisanMarketplaceApp> {
  late final SessionController _session;
  late final FavoritesController _favorites;

  @override
  void initState() {
    super.initState();
    _session = SessionController();
    _session.restore();
    _favorites = FavoritesController();
    _favorites.restore();
  }

  @override
  void dispose() {
    _favorites.dispose();
    _session.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SessionScope(
      session: _session,
      child: FavoritesScope(
        favorites: _favorites,
        child: MaterialApp(
          title: 'Artisan Marketplace',
          debugShowCheckedModeBanner: false,
          theme: buildLightTheme(),
          darkTheme: buildDarkTheme(),
          themeMode: ThemeMode.system,
          routes: {
            '/': (_) => HomeScreen(apiBaseUrl: widget.apiBaseUrl),
            '/artisans': (_) => ArtisanScreen(apiBaseUrl: widget.apiBaseUrl),
            '/products': (_) => ProductScreen(apiBaseUrl: widget.apiBaseUrl),
            '/favorites': (_) => FavoritesScreen(apiBaseUrl: widget.apiBaseUrl),
            '/login': (_) => LoginScreen(apiBaseUrl: widget.apiBaseUrl),
            '/register': (_) => RegisterScreen(apiBaseUrl: widget.apiBaseUrl),
            '/artisan/profile': (_) => RoleGuard(
                  requiredRole: 'artisan',
                  child: ArtisanProfileScreen(apiBaseUrl: widget.apiBaseUrl),
                ),
            '/dashboard/artisan': (_) => RoleGuard(
                  requiredRole: 'artisan',
                  child: ArtisanDashboardScreen(apiBaseUrl: widget.apiBaseUrl),
                ),
            '/dashboard/admin': (_) => RoleGuard(
                  requiredRole: 'admin',
                  child: AdminDashboardScreen(apiBaseUrl: widget.apiBaseUrl),
                ),
          },
          initialRoute: '/',
        ),
      ),
    );
  }
}
