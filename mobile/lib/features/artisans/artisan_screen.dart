import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/favorites/favorites_scope.dart';
import '../../core/widgets/main_navigation_bar.dart';
import '../../core/widgets/state_views.dart';
import 'artisan_detail_screen.dart';

class ArtisanScreen extends StatefulWidget {
  final String apiBaseUrl;

  const ArtisanScreen({super.key, required this.apiBaseUrl});

  @override
  State<ArtisanScreen> createState() => _ArtisanScreenState();
}

class _ArtisanScreenState extends State<ArtisanScreen> {
  late final ApiClient _api;
  final TextEditingController _searchController = TextEditingController();
  bool _loading = true;
  String _error = '';
  List<dynamic> _items = [];
  List<dynamic> _filteredItems = [];
  int _visibleCount = 10;

  @override
  void initState() {
    super.initState();
    _api = ApiClient(baseUrl: widget.apiBaseUrl);
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final response = await _api.getJson('/artisans');
      final data = response['data'] as Map<String, dynamic>?;
      final items = (data?['items'] as List<dynamic>?) ?? [];
      setState(() {
        _items = items;
        _filteredItems = items;
        _visibleCount = 10;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _applySearch(String value) {
    final query = value.trim().toLowerCase();
    final filtered = query.isEmpty
        ? _items
        : _items.where((raw) {
            final item = raw as Map<String, dynamic>;
            final name = (item['name'] ?? item['userId']?['name'] ?? '').toString().toLowerCase();
            final location = (item['location'] ?? '').toString().toLowerCase();
            final bio = (item['bio'] ?? '').toString().toLowerCase();
            return name.contains(query) || location.contains(query) || bio.contains(query);
          }).toList();

    setState(() {
      _filteredItems = filtered;
      _visibleCount = 10;
    });
  }

  void _showMore() {
    setState(() {
      _visibleCount += 10;
    });
  }

  @override
  Widget build(BuildContext context) {
    final favorites = FavoritesScope.of(context);
    final visibleItems = _filteredItems.take(_visibleCount).toList();
    final hasMore = _filteredItems.length > visibleItems.length;

    return Scaffold(
      appBar: AppBar(title: const Text('Artisans')),
      bottomNavigationBar: const MainNavigationBar(currentIndex: 1),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const LoadingListView(showToolbarStub: true)
            : _error.isNotEmpty
                ? ErrorStateView(
                    message: _error,
                    onRetry: _load,
                    title: 'Impossible de charger les artisans',
                  )
                : ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      TextField(
                        decoration: const InputDecoration(
                          labelText: 'Rechercher artisan (nom, lieu, bio)',
                          prefixIcon: Icon(Icons.search),
                        ),
                        controller: _searchController,
                        onChanged: _applySearch,
                      ),
                      const SizedBox(height: 10),
                      Text('${_filteredItems.length} résultat(s)'),
                      const SizedBox(height: 6),
                      if (_filteredItems.isEmpty)
                        const EmptyStateView(
                          message: 'Aucun artisan trouvé pour cette recherche.',
                          icon: Icons.storefront_outlined,
                        ),
                      ...visibleItems.map((raw) {
                        final item = raw as Map<String, dynamic>;
                        final artisanUser = (item['userId'] as Map<String, dynamic>?) ?? <String, dynamic>{};
                        final artisanId = (artisanUser['_id'] ?? '').toString();
                        final name = (item['name'] ?? item['userId']?['name'] ?? 'Artisan').toString();
                        final location = (item['location'] ?? 'Localisation non définie').toString();
                        final bio = (item['bio'] ?? 'Biographie non renseignée').toString();
                        final isFavorite = favorites.isArtisanFavorite(artisanId);

                        return Card(
                          child: ListTile(
                            title: Text(name),
                            subtitle: Text('$location\n$bio', maxLines: 2, overflow: TextOverflow.ellipsis),
                            isThreeLine: true,
                            trailing: IconButton(
                              tooltip: isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
                              onPressed: artisanId.isEmpty
                                  ? null
                                  : () => favorites.toggleArtisan({
                                        'id': artisanId,
                                        'name': name,
                                        'subtitle': location,
                                      }),
                              icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, color: Colors.redAccent),
                            ),
                            onTap: artisanId.isEmpty
                                ? null
                                : () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => ArtisanDetailScreen(
                                          apiBaseUrl: widget.apiBaseUrl,
                                          artisanId: artisanId,
                                          artisanName: name,
                                        ),
                                      ),
                                    );
                                  },
                          ),
                        );
                      }),
                      if (hasMore)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Center(
                            child: OutlinedButton(
                              onPressed: _showMore,
                              child: const Text('Afficher plus'),
                            ),
                          ),
                        ),
                    ],
                  ),
      ),
    );
  }
}
