import 'package:flutter/material.dart';

import '../../core/favorites/favorites_scope.dart';
import '../../core/widgets/main_navigation_bar.dart';
import '../../core/widgets/state_views.dart';
import '../artisans/artisan_detail_screen.dart';

class FavoritesScreen extends StatelessWidget {
  final String apiBaseUrl;

  const FavoritesScreen({super.key, required this.apiBaseUrl});

  @override
  Widget build(BuildContext context) {
    final favorites = FavoritesScope.of(context);
    final artisanItems = favorites.artisanItems;
    final productItems = favorites.productItems;

    return Scaffold(
      appBar: AppBar(title: const Text('Favoris')),
      bottomNavigationBar: const MainNavigationBar(currentIndex: 3),
      body: !favorites.isReady
          ? const LoadingListView(itemCount: 4)
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text('Artisans favoris', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                if (artisanItems.isEmpty)
                  const EmptyStateView(
                    message: 'Aucun artisan favori pour le moment.',
                    icon: Icons.favorite_border,
                  ),
                ...artisanItems.map((artisan) {
                  final artisanId = (artisan['id'] ?? '').toString();
                  final name = (artisan['name'] ?? 'Artisan').toString();
                  final subtitle = (artisan['subtitle'] ?? '').toString();
                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.favorite, color: Colors.redAccent),
                      title: Text(name),
                      subtitle: Text(subtitle),
                      onTap: artisanId.isEmpty
                          ? null
                          : () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ArtisanDetailScreen(
                                    apiBaseUrl: apiBaseUrl,
                                    artisanId: artisanId,
                                    artisanName: name,
                                  ),
                                ),
                              );
                            },
                      trailing: IconButton(
                        tooltip: 'Retirer',
                        onPressed: () => favorites.toggleArtisan(artisan),
                        icon: const Icon(Icons.delete_outline),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 14),
                Text('Produits favoris', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                if (productItems.isEmpty)
                  const EmptyStateView(
                    message: 'Aucun produit favori pour le moment.',
                    icon: Icons.bookmark_border,
                  ),
                ...productItems.map((product) {
                  final name = (product['name'] ?? 'Produit').toString();
                  final subtitle = (product['subtitle'] ?? '').toString();
                  final price = (product['price'] ?? '').toString();
                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.bookmark, color: Colors.amber),
                      title: Text(name),
                      subtitle: Text(subtitle),
                      trailing: Wrap(
                        spacing: 2,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(price),
                          IconButton(
                            tooltip: 'Retirer',
                            onPressed: () => favorites.toggleProduct(product),
                            icon: const Icon(Icons.delete_outline),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
    );
  }
}
