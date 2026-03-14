import 'package:flutter/material.dart';
import '../../core/auth/session_scope.dart';
import '../../core/favorites/favorites_scope.dart';
import '../../core/widgets/main_navigation_bar.dart';

class HomeScreen extends StatelessWidget {
  final String apiBaseUrl;

  const HomeScreen({super.key, required this.apiBaseUrl});

  @override
  Widget build(BuildContext context) {
    final session = SessionScope.of(context);
    final favorites = FavoritesScope.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Artisan Marketplace'),
      ),
      bottomNavigationBar: const MainNavigationBar(currentIndex: 0),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: Theme.of(context).colorScheme.primaryContainer,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('MVP mobile opérationnel', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text('API: $apiBaseUrl', style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 8),
                  Text(
                    session.isAuthenticated
                        ? 'Session: ${session.role} (${session.email})'
                        : 'Session: non connectée',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _StatusChip(label: 'Artisans favoris: ${favorites.artisanItems.length}'),
                      _StatusChip(label: 'Produits favoris: ${favorites.productItems.length}'),
                      _StatusChip(label: session.isAuthenticated ? 'Rôle: ${session.role}' : 'Invité'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          FilledButton(
            onPressed: () => Navigator.pushNamed(context, '/artisans'),
            child: const Text('Voir les artisans'),
          ),
          const SizedBox(height: 8),
          FilledButton(
            onPressed: () => Navigator.pushNamed(context, '/products'),
            child: const Text('Voir les produits'),
          ),
          const SizedBox(height: 8),
          FilledButton.tonal(
            onPressed: () => Navigator.pushNamed(context, '/favorites'),
            child: const Text('Favoris'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () => Navigator.pushNamed(context, '/login'),
            child: const Text('Connexion'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () => Navigator.pushNamed(context, '/register'),
            child: const Text('Inscription'),
          ),
          const SizedBox(height: 8),
          FilledButton.tonal(
            onPressed: session.isAuthenticated && session.role == 'artisan'
                ? () => Navigator.pushNamed(context, '/dashboard/artisan')
                : null,
            child: const Text('Dashboard Artisan (protégé)'),
          ),
          const SizedBox(height: 8),
          FilledButton.tonal(
            onPressed: session.isAuthenticated && session.role == 'artisan'
                ? () => Navigator.pushNamed(context, '/artisan/profile')
                : null,
            child: const Text('Profil Artisan'),
          ),
          const SizedBox(height: 8),
          FilledButton.tonal(
            onPressed: session.isAuthenticated && session.role == 'admin'
                ? () => Navigator.pushNamed(context, '/dashboard/admin')
                : null,
            child: const Text('Dashboard Admin (protégé)'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: session.isAuthenticated
                ? () async {
                    await session.clearSession();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Session supprimée.')),
                      );
                    }
                  }
                : null,
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;

  const _StatusChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface.withOpacity(0.7),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: Theme.of(context).textTheme.bodySmall),
    );
  }
}
